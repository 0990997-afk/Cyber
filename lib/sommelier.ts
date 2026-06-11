import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SOMMELIER_MODEL } from "./anthropic";
import {
  WINES,
  getWineById,
  analyzeDishLocally,
  candidatesByTier,
  matchScore,
  honestNoteFor,
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

// ───────────────── Пул кандидатів (локальна база) ─────────────────

function diversePool(perTier: number): Wine[] {
  const pool: Wine[] = [];
  for (const tier of TIER_ORDER) {
    const seen = new Set<string>();
    for (const w of WINES.filter((x) => x.tier === tier)) {
      if (seen.has(w.grape)) continue;
      seen.add(w.grape);
      pool.push(w);
      if (seen.size >= perTier) break;
    }
  }
  return pool;
}

function candidatePool(input: SommelierInput): Wine[] {
  if (input.dish.trim()) {
    const dish = analyzeDishLocally(input.dish);
    const byTier = candidatesByTier(dish, 7);
    return TIER_ORDER.flatMap((t) => byTier[t]);
  }
  return diversePool(7);
}

function describeWine(w: Wine): string {
  return `${w.id} | ${w.name} | ${w.type} | ${w.grape} | ${w.region}, ${w.country} | €${w.priceEUR} | рівень:${w.tier} | тіло:${w.body} кисл:${w.acidity} танін:${w.tannin} солод:${w.sweetness}`;
}

// ───────────────── Промпт ─────────────────

function systemRules(web: boolean): string {
  return `Ти — КІБЕР-СОМЕЛЬЄ, AI-агент-сомельє з характером. Гасло: «Алгоритм із смаком».
Гість описує або фотографує страву — ти аналізуєш смак і радиш рівно 3 вина: по одному на рівень (budget, middle, premium).

${web
      ? `ДОСТУП ДО ЗОВНІШНЬОГО СВІТУ: у тебе є інструмент web_search. ОБОВʼЯЗКОВО скористайся ним, щоб знайти РЕАЛЬНІ дані — відгуки, оцінки, типові ціни в євро та перевірені гастрономічні пари для конкретних вин. Спирайся на реальні джерела, а не лише на свою памʼять. Можеш рекомендувати будь-яке реальне вино, доступне в Україні чи Європі, навіть якщо його немає у списку кандидатів.`
      : `Обирай зі списку кандидатів, який дам у запиті (за id), або з відомих тобі реальних вин.`}

ГОЛОС БРЕНДУ:
- Пояснюй ПРИЧИНУ пари конкретно й по-людськи: «кислотність розрізає жир», «таніни врівноважують жирність», «мінеральність підкреслює морепродукти». Це суть, а не снобізм.
- Тепло, дотепно, коротко — як друг, що розбирається, але не випендрюється.
- ЗАБОРОНЕНО: маркетингові слова (інноваційний, унікальний, революційний), канцелярит, порожні штампи.
- Українською.

ЧЕСНИЙ СОМЕЛЬЄ: якщо вино — НЕ найкраща пара (фастфуд, піца, дуже гостре, надсолодке), чесно скажи це у полі honest_note і запропонуй кращу альтернативу (пиво, кола, саке). Винні варіанти все одно дай — найкращі з можливих. Якщо вино доречне — honest_note порожній рядок.

АНАЛІЗ СТРАВИ (dish): назва + оцінки 0–10: fat (жирність), acidity (кислотність), sweetness (солодкість), salt (солоність), intensity (інтенсивність), spice (пряність), minerality (мінеральність). note — рядок про профіль.

ВИНА: для кожного — tier; wine_id (якщо з мого списку, інакше пропусти); name (виробник+назва+рік); type; grape; region; country; price (у форматі «€18»); match (Cyber Match Score 80–99, чесний, у трьох різний); why (1–2 речення таск-логіки); serving_temp; decant; snack.

ФОРМАТ — поверни ЛИШЕ валідний JSON, без markdown:
{
  "dish": {"name":"","fat":0,"acidity":0,"sweetness":0,"salt":0,"intensity":0,"spice":0,"minerality":0,"note":""},
  "honest_note": "",
  "recommendations": [
    {"tier":"budget","wine_id":"","name":"","type":"","grape":"","region":"","country":"","price":"€0","match":0,"why":"","serving_temp":"","decant":"","snack":""}
  ]
}`;
}

function buildUserContent(
  input: SommelierInput,
  pool: Wine[],
  web: boolean,
): string | Anthropic.ContentBlockParam[] {
  const lines: string[] = [];
  if (input.image) lines.push("На фото — страва гостя. Визнач, що це, і проаналізуй смак.");
  if (input.dish.trim()) lines.push(`Страва: ${input.dish.trim()}`);
  if (input.occasion?.trim()) lines.push(`Привід: ${input.occasion.trim()}`);
  if (input.budget !== "any") {
    lines.push(`Гість орієнтується на рівень «${TIER_META[input.budget].label}», але дай по одному на кожен рівень.`);
  }
  lines.push(`\n${web ? "ОРІЄНТИРИ з нашої бази (можеш замінити кращими з вебу):" : "КАНДИДАТИ (обирай за id):"}`);
  lines.push(pool.map(describeWine).join("\n"));
  lines.push("\nДай аналіз страви (7 показників) і 3 вина — по одному на budget, middle, premium.");
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

// ───────────────── Виклик агента ─────────────────

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

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function callAgent(
  client: Anthropic,
  input: SommelierInput,
  pool: Wine[],
  opts: { web: boolean; thinking: boolean },
): Promise<SommelierResult> {
  const messages: unknown[] = [
    { role: "user", content: buildUserContent(input, pool, opts.web) },
  ];
  const baseReq: Record<string, unknown> = {
    model: SOMMELIER_MODEL,
    max_tokens: 4500,
    system: [{ type: "text", text: systemRules(opts.web), cache_control: { type: "ephemeral" } }],
  };
  if (opts.web) baseReq.tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }];
  if (opts.thinking) {
    baseReq.thinking = { type: "adaptive" };
    baseReq.output_config = { effort: "medium" };
  }

  let message = (await client.messages.create({
    ...baseReq,
    messages,
  } as unknown as Anthropic.MessageCreateParamsNonStreaming)) as Anthropic.Message;

  // Сервер-тул може повертати pause_turn — продовжуємо цикл.
  let guard = 0;
  while (message.stop_reason === "pause_turn" && guard < 4) {
    guard++;
    messages.push({ role: "assistant", content: message.content });
    message = (await client.messages.create({
      ...baseReq,
      messages,
    } as unknown as Anthropic.MessageCreateParamsNonStreaming)) as Anthropic.Message;
  }

  return parseResult(textOf(message), input, opts.web);
}

function parseResult(text: string, input: SommelierInput, web: boolean): SommelierResult {
  const parsed = extractJson(text) as {
    dish?: Partial<Record<keyof DishAnalysis, unknown>>;
    honest_note?: string;
    recommendations?: Array<Record<string, unknown>>;
  };

  const dish: DishAnalysis = {
    name: String(parsed.dish?.name ?? "").trim() || input.dish.trim() || "вечеря",
    fat: clamp(parsed.dish?.fat, 0, 10, 5),
    acidity: clamp(parsed.dish?.acidity, 0, 10, 4),
    sweetness: clamp(parsed.dish?.sweetness, 0, 10, 2),
    salt: clamp(parsed.dish?.salt, 0, 10, 4),
    intensity: clamp(parsed.dish?.intensity, 0, 10, 5),
    spice: clamp(parsed.dish?.spice, 0, 10, 3),
    minerality: clamp(parsed.dish?.minerality, 0, 10, 4),
    note: String(parsed.dish?.note ?? "").trim() || analyzeDishLocally(input.dish).note,
  };

  const used = new Set<string>();
  const recs: WineRec[] = [];
  for (const r of parsed.recommendations ?? []) {
    const localWine = typeof r.wine_id === "string" ? getWineById(r.wine_id) : undefined;
    const name = (localWine?.name ?? String(r.name ?? "")).trim();
    if (!name || used.has(name)) continue;
    used.add(name);
    const tier = (localWine?.tier ?? (r.tier as WineRec["tier"])) || "middle";
    recs.push({
      tier,
      name,
      type: (localWine?.type ?? String(r.type ?? "вино")).trim(),
      grape: localWine?.grape ?? (r.grape ? String(r.grape) : undefined),
      region: localWine?.region ?? (r.region ? String(r.region) : undefined),
      country: localWine?.country ?? (r.country ? String(r.country) : undefined),
      price: localWine ? `€${localWine.priceEUR}` : String(r.price ?? "—"),
      match: clamp(r.match, 80, 99, localWine ? matchScore(localWine, dish) : 88),
      why: String(r.why ?? "").trim() || (localWine ? fallbackWhy(localWine, dish) : "Гарна пара до вашої страви."),
      servingTemp: String(r.serving_temp ?? "").trim() || (localWine ? servingTemp(localWine) : typeServing(String(r.type ?? ""))),
      decant: String(r.decant ?? "").trim() || (localWine ? decantHint(localWine) : "за смаком"),
      snack: String(r.snack ?? "").trim() || (localWine ? snackFor(localWine) : "сир або оливки"),
    });
  }

  if (recs.length === 0) throw new Error("Жодної валідної рекомендації");

  const honest = String(parsed.honest_note ?? "").trim() || honestNoteFor(input.dish);
  return {
    dish,
    recommendations: assembleTiers(recs, dish),
    honestNote: honest || undefined,
    sources: web
      ? ["веб-пошук: відгуки, оцінки, ціни", "власна база (~300 вин)"]
      : ["підбір Claude", "власна база (~300 вин)"],
    engine: web ? "claude+web" : "claude",
  };
}

export async function runSommelier(input: SommelierInput): Promise<SommelierResult> {
  const client = getAnthropic();
  const pool = candidatePool(input);
  if (!client) return fallbackResult(input);

  const attempts: (() => Promise<SommelierResult>)[] = [
    () => callAgent(client, input, pool, { web: true, thinking: true }),
    () => callAgent(client, input, pool, { web: false, thinking: true }),
    () => callAgent(client, input, pool, { web: false, thinking: false }),
  ];
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (e) {
      console.warn("[sommelier] спроба не вдалась:", e);
    }
  }
  return fallbackResult(input);
}

// ───────────────── Збирання / fallback ─────────────────

function assembleTiers(recs: WineRec[], dish: DishAnalysis): WineRec[] {
  const byTier = candidatesByTier(dish, 1);
  const usedNames = new Set(recs.map((r) => r.name));
  return TIER_ORDER.map((tier) => {
    const existing = recs.find((r) => r.tier === tier);
    if (existing) return existing;
    const wine = (byTier[tier] ?? [])[0] ?? WINES.find((w) => w.tier === tier)!;
    if (usedNames.has(wine.name)) {
      const alt = WINES.filter((w) => w.tier === tier && !usedNames.has(w.name))[0];
      if (alt) {
        usedNames.add(alt.name);
        return makeRec(alt, dish);
      }
    }
    usedNames.add(wine.name);
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
  return {
    dish,
    recommendations,
    honestNote: honestNoteFor(input.dish),
    sources: ["власна база (~300 вин)"],
    engine: "fallback",
  };
}

function makeRec(wine: Wine, dish: DishAnalysis): WineRec {
  return {
    tier: wine.tier,
    name: wine.name,
    type: wine.type,
    grape: wine.grape,
    region: wine.region,
    country: wine.country,
    price: `€${wine.priceEUR}`,
    match: matchScore(wine, dish),
    why: fallbackWhy(wine, dish),
    servingTemp: servingTemp(wine),
    decant: decantHint(wine),
    snack: snackFor(wine),
  };
}

// ───────────────── Подача / закуска / пояснення ─────────────────

function servingTemp(w: Wine): string {
  if (w.type.includes("ігристе")) return "6–8 °C";
  if (w.type.includes("десертне")) return "8–10 °C";
  if (w.tannin === 0) return w.body >= 7 ? "10–12 °C" : "8–10 °C";
  return w.body <= 5 ? "13–15 °C" : "16–18 °C";
}

function typeServing(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("ігрист") || t.includes("шампан")) return "6–8 °C";
  if (t.includes("червон")) return "16–18 °C";
  return "8–10 °C";
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
  if (dish.minerality >= 6 && w.acidity >= 7)
    return `Мінеральність страви підхоплює свіже кисле ${w.grape} — морська чистота смаку без важкості.`;
  if (dish.intensity >= 7)
    return `Страва насичена — повнотіле ${w.grape} тримає її смак і не губиться поруч.`;
  return `${w.grape} збалансоване й гнучке — підтримує смак страви, не перебиваючи його.`;
}
