import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SOMMELIER_MODEL } from "./anthropic";
import {
  WINES,
  getWineById,
  analyzeDishLocally,
  candidatesByTier,
  matchScore,
} from "./wines";
import { TIER_ORDER, TIER_META } from "./types";
import type {
  Wine,
  DishAnalysis,
  WineRec,
  SommelierInput,
  SommelierResult,
} from "./types";

export type { SommelierInput, SommelierResult } from "./types";

// ───────────────── Пул кандидатів (із локальної бази) ─────────────────

function diversePool(perTier: number): Wine[] {
  const pool: Wine[] = [];
  for (const tier of TIER_ORDER) {
    const seenGrapes = new Set<string>();
    for (const w of WINES.filter((x) => x.tier === tier)) {
      if (seenGrapes.has(w.grape)) continue;
      seenGrapes.add(w.grape);
      pool.push(w);
      if (seenGrapes.size >= perTier) break;
    }
  }
  return pool;
}

function candidatePool(input: SommelierInput): Wine[] {
  // Текст → локальний підбір під профіль страви. Фото → широкий різноманітний пул.
  if (input.dish.trim()) {
    const dish = analyzeDishLocally(input.dish);
    const byTier = candidatesByTier(dish, 7);
    return TIER_ORDER.flatMap((t) => byTier[t]);
  }
  return diversePool(7);
}

function describeWine(w: Wine): string {
  return `${w.id} | ${w.name} | ${w.type} | ${w.grape} | ${w.region}, ${w.country} | €${w.priceEUR} | рівень:${w.tier} | тіло:${w.body} кислотність:${w.acidity} таніни:${w.tannin} солодкість:${w.sweetness} | пара: ${w.pairings.join(", ")}`;
}

// ───────────────── Промпт ─────────────────

const SYSTEM_RULES = `Ти — КІБЕР-СОМЕЛЬЄ, AI-сомельє з характером. Гасло: «Алгоритм із смаком».
Гість описує або фотографує страву — ти аналізуєш її смак і радиш рівно 3 вина: по одному на кожен ціновий рівень (budget, middle, premium). Обираєш ВИКЛЮЧНО зі списку кандидатів, який дам у запиті (за полем id).

ГОЛОС БРЕНДУ:
- Пояснюй ПРИЧИНУ пари конкретно й по-людськи: «кислотність розрізає жир», «таніни врівноважують жирність рібаю», «тіло вина тримає насичений смак». Це суть, а не снобізм.
- Тепло, дотепно, коротко — як друг, що розбирається, але не випендрюється.
- ЗАБОРОНЕНО: маркетингові слова (інноваційний, унікальний, революційний), канцелярит, порожні штампи без сенсу, лекції.
- Українською.

АНАЛІЗ СТРАВИ (поле dish): дай назву страви та оціни 0–10: жирність (fat), інтенсивність смаку (intensity), пряність (spice), кислотність (acidity). note — один рядок про смаковий профіль.

ВИНА: для кожного — wine_id зі списку, match (Cyber Match Score, чесний % збігу 80–99, у трьох різний), why (1–2 речення таск-логіки пари), serving_temp (напр. «16–18 °C»), decant («відкрити за 20–30 хв» або «не потребує»), snack (закуска під вино).

ФОРМАТ — поверни ЛИШЕ валідний JSON, без markdown:
{
  "dish": {"name": "...", "fat": 0, "intensity": 0, "spice": 0, "acidity": 0, "note": "..."},
  "recommendations": [
    {"tier": "budget|middle|premium", "wine_id": "...", "match": 0, "why": "...", "serving_temp": "...", "decant": "...", "snack": "..."}
  ]
}`;

function buildSystem(): Anthropic.TextBlockParam[] {
  return [{ type: "text", text: SYSTEM_RULES, cache_control: { type: "ephemeral" } }];
}

function buildUserContent(
  input: SommelierInput,
  pool: Wine[],
): string | Anthropic.ContentBlockParam[] {
  const lines: string[] = [];
  if (input.image) lines.push("На фото — страва гостя. Визнач, що це, і проаналізуй смак.");
  if (input.dish.trim()) lines.push(`Страва: ${input.dish.trim()}`);
  if (input.occasion?.trim()) lines.push(`Привід: ${input.occasion.trim()}`);
  if (input.budget !== "any") {
    lines.push(`Гість орієнтується на рівень «${TIER_META[input.budget].label}», але дай по одному на кожен рівень.`);
  }
  lines.push("\nКАНДИДАТИ (обирай лише звідси, за id):");
  lines.push(pool.map(describeWine).join("\n"));
  lines.push("\nДай аналіз страви та 3 вина — по одному на budget, middle, premium.");
  const text = lines.join("\n");

  if (!input.image) return text;
  return [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: input.image.mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: input.image.data,
      },
    },
    { type: "text", text },
  ];
}

// ───────────────── Виклик Claude ─────────────────

function extractJson(text: string): unknown {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1 || e < s) throw new Error("Немає JSON");
  return JSON.parse(text.slice(s, e + 1));
}

function clamp(v: unknown, lo: number, hi: number, def: number): number {
  const n = typeof v === "number" ? v : def;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

async function callClaudeOnce(
  client: Anthropic,
  input: SommelierInput,
  pool: Wine[],
  rich: boolean,
): Promise<SommelierResult> {
  const base = {
    model: SOMMELIER_MODEL,
    max_tokens: 4000,
    system: buildSystem(),
    messages: [{ role: "user", content: buildUserContent(input, pool) }],
  };
  const request = rich
    ? { ...base, thinking: { type: "adaptive" }, output_config: { effort: "medium" } }
    : base;

  const message = (await client.messages.create(
    request as unknown as Anthropic.MessageCreateParamsNonStreaming,
  )) as Anthropic.Message;

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = extractJson(text) as {
    dish?: Partial<DishAnalysis>;
    recommendations?: Array<{
      tier?: string;
      wine_id?: string;
      match?: number;
      why?: string;
      serving_temp?: string;
      decant?: string;
      snack?: string;
    }>;
  };

  const dish: DishAnalysis = {
    name: (parsed.dish?.name ?? "").toString().trim() || input.dish.trim() || "вечеря",
    fat: clamp(parsed.dish?.fat, 0, 10, 5),
    intensity: clamp(parsed.dish?.intensity, 0, 10, 5),
    spice: clamp(parsed.dish?.spice, 0, 10, 3),
    acidity: clamp(parsed.dish?.acidity, 0, 10, 4),
    note: (parsed.dish?.note ?? "").toString().trim() || analyzeDishLocally(input.dish).note,
  };

  const poolIds = new Set(pool.map((w) => w.id));
  const used = new Set<string>();
  const recs: WineRec[] = [];
  for (const r of parsed.recommendations ?? []) {
    const wine = r.wine_id ? getWineById(r.wine_id) : undefined;
    if (!wine || !poolIds.has(wine.id) || used.has(wine.id)) continue;
    used.add(wine.id);
    recs.push({
      tier: wine.tier,
      wine,
      match: clamp(r.match, 80, 99, matchScore(wine, dish)),
      why: (r.why ?? "").trim() || fallbackWhy(wine, dish),
      servingTemp: (r.serving_temp ?? "").trim() || servingTemp(wine),
      decant: (r.decant ?? "").trim() || decantHint(wine),
      snack: (r.snack ?? "").trim() || snackFor(wine),
    });
  }

  if (recs.length === 0) throw new Error("Жодної валідної рекомендації");
  return { dish, recommendations: assembleTiers(recs, dish), engine: "claude" };
}

export async function runSommelier(input: SommelierInput): Promise<SommelierResult> {
  const client = getAnthropic();
  const pool = candidatePool(input);
  if (!client) return fallbackResult(input);
  try {
    try {
      return await callClaudeOnce(client, input, pool, true);
    } catch (e) {
      console.warn("[sommelier] rich fail, minimal retry:", e);
      return await callClaudeOnce(client, input, pool, false);
    }
  } catch (err) {
    console.error("[sommelier] Claude недоступний — fallback:", err);
    return fallbackResult(input);
  }
}

// ───────────────── Збирання 3 рівнів (гарантовано) ─────────────────

function assembleTiers(recs: WineRec[], dish: DishAnalysis): WineRec[] {
  const byTier = candidatesByTier(dish, 1);
  const used = new Set(recs.map((r) => r.wine.id));
  return TIER_ORDER.map((tier) => {
    const existing = recs.find((r) => r.tier === tier);
    if (existing) return existing;
    // добиваємо локально, якщо Claude пропустив рівень
    const fill = (byTier[tier] ?? []).find((w) => !used.has(w.id)) ?? byTier[tier]?.[0];
    const wine = fill ?? WINES.find((w) => w.tier === tier)!;
    used.add(wine.id);
    return makeRec(wine, dish);
  });
}

function fallbackResult(input: SommelierInput): SommelierResult {
  const dish = analyzeDishLocally(input.dish || input.occasion || "");
  const byTier = candidatesByTier(dish, 1);
  const recommendations = TIER_ORDER.map((tier) => {
    const wine = (byTier[tier] ?? [])[0] ?? WINES.find((w) => w.tier === tier)!;
    return makeRec(wine, dish);
  });
  return { dish, recommendations, engine: "fallback" };
}

function makeRec(wine: Wine, dish: DishAnalysis): WineRec {
  return {
    tier: wine.tier,
    wine,
    match: matchScore(wine, dish),
    why: fallbackWhy(wine, dish),
    servingTemp: servingTemp(wine),
    decant: decantHint(wine),
    snack: snackFor(wine),
  };
}

// ───────────────── Подача / закуска / пояснення (локально) ─────────────────

function servingTemp(w: Wine): string {
  if (w.type.includes("ігристе")) return "6–8 °C";
  if (w.type.includes("десертне")) return "8–10 °C";
  if (w.tannin === 0) return w.body >= 7 ? "10–12 °C" : "8–10 °C"; // білі/рожеві/оранж
  return w.body <= 5 ? "13–15 °C" : "16–18 °C"; // червоні
}

function decantHint(w: Wine): string {
  return w.tannin >= 7 ? "відкрити за 20–30 хв до подачі" : "не потребує";
}

function snackFor(w: Wine): string {
  if (w.type.includes("ігристе")) return "солоні крекери або твердий сир";
  if (w.type.includes("десертне")) return "блакитний сир чи горіхи";
  if (w.tannin === 0) return "оливки, біла риба чи козячий сир";
  return "тонко нарізаний хамон або витриманий сир";
}

function fallbackWhy(w: Wine, dish: DishAnalysis): string {
  if (dish.spice >= 6 && w.sweetness >= 3)
    return `Страва гостра, а легка солодкість ${w.grape} приглушує пекучість — не гасить смак, а робить його приємнішим.`;
  if (dish.fat >= 6 && w.tannin >= 6)
    return `Жир важкий, а таніни ${w.grape} його розрізають — після кожного шматка смак знову свіжий.`;
  if (dish.fat >= 6 && w.acidity >= 7)
    return `Кислотність ${w.grape} розрізає жир страви, тож смак лишається легким до останнього шматка.`;
  if (dish.intensity >= 7)
    return `Страва насичена — повнотіле ${w.grape} тримає її смак і не губиться поруч.`;
  return `${w.grape} збалансоване й гнучке — підтримує смак страви, не перебиваючи його.`;
}
