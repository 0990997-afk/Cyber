import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SOMMELIER_MODEL } from "./anthropic";
import {
  WINES,
  TIER_ORDER,
  TIER_META,
  getWineById,
  fallbackRecommend,
  type RawRecommendation,
  type Wine,
} from "./wines";
import type { SommelierInput, SommelierResult } from "./types";

export type {
  SommelierImage,
  SommelierInput,
  Recommendation,
  SommelierResult,
} from "./types";

// ──────────────────── Промпт сомельє ────────────────────

function catalogForPrompt(): string {
  return WINES.map((w) =>
    [
      w.id,
      w.name,
      w.color,
      w.grape,
      `${w.region}, ${w.country}`,
      `${w.priceUAH}₴`,
      `рівень:${w.tier}`,
      `тіло:${w.body}`,
      w.sweetness,
      `смак: ${w.tasteNotes.join(", ")}`,
      `пара: ${w.pairings.join(", ")}`,
    ].join(" | "),
  ).join("\n");
}

const SYSTEM_RULES = `Ти — головний сомельє винотеки «Тераса». Ти теплий, упевнений і говориш ЛЮДСЬКОЮ мовою, без снобізму й винного жаргону. Твоя місія — щоб людина, яка «нічого не розуміє у вині», вийшла з упевненою (і часто дорожчою) покупкою.

ПРАВИЛА:
1. Рекомендуй вина ВИКЛЮЧНО з каталогу нижче. Використовуй точні "id" вин.
2. Завжди пропонуй РІВНО 3 вина — по одному на кожен ціновий рівень: budget, middle, premium. Це дає гостю відчути діапазон і спокійно обрати дорожче.
3. Пояснюй ПРИЧИНУ пари смаків конкретно. Не «червоне до м'яса», а чому саме ця структура/кислотність/танін пасує до страви. 2–3 речення, тепло, простими словами.
4. До кожного вина додай коротку ідею закуски (1 фраза).
5. Якщо є фото страви — спершу визнач, що це, і запиши у recognized_dish. Без фото recognized_dish = "".
6. Уся відповідь — українською.

ФОРМАТ ВІДПОВІДІ — поверни ЛИШЕ валідний JSON (без markdown, без пояснень навколо):
{
  "intro": "1–2 теплі речення, що задають тон",
  "recognized_dish": "що на фото, або порожній рядок",
  "recommendations": [
    {
      "wine_id": "точний id з каталогу",
      "tier": "budget | middle | premium",
      "why": "2–3 речення: чому саме це вино пасує до страви",
      "appetizer": "коротка ідея закуски під це вино",
      "match_score": 0-100
    }
  ]
}`;

function buildSystem(): Anthropic.TextBlockParam[] {
  return [
    {
      type: "text",
      text: `${SYSTEM_RULES}\n\nКАТАЛОГ ВИНОТЕКИ «ТЕРАСА» (id | назва | колір | сорт | регіон | ціна | рівень | тіло | солодкість | смак | пара):\n${catalogForPrompt()}`,
      // Каталог стабільний → кешуємо префікс між запитами (дешевше і трохи швидше).
      cache_control: { type: "ephemeral" },
    },
  ];
}

function buildUserContent(
  input: SommelierInput,
): string | Anthropic.ContentBlockParam[] {
  const lines: string[] = [];
  if (input.image) {
    lines.push(
      "На фото — страва гостя. Визнач, що це, заповни recognized_dish і підбери пару.",
    );
  }
  if (input.dish.trim()) lines.push(`Страва / опис: ${input.dish.trim()}`);
  if (input.occasion?.trim()) lines.push(`Привід: ${input.occasion.trim()}`);
  if (input.budget !== "any") {
    lines.push(
      `Орієнтир гостя за бюджетом: «${TIER_META[input.budget].label}» (${TIER_META[input.budget].range}). Все одно дай по одному варіанту на кожен рівень.`,
    );
  }
  lines.push(
    "Підбери рівно 3 вина — по одному на budget, middle і premium — і поясни кожен вибір.",
  );
  const text = lines.join("\n");

  if (!input.image) return text;
  return [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: input.image.mediaType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
        data: input.image.data,
      },
    },
    { type: "text", text },
  ];
}

// ──────────────────── Виклик Claude ────────────────────

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Claude не повернув JSON");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function callClaudeOnce(
  client: Anthropic,
  input: SommelierInput,
  rich: boolean,
): Promise<{ intro: string; recognizedDish: string; raw: RawRecommendation[] }> {
  const base = {
    model: SOMMELIER_MODEL,
    max_tokens: 4000,
    system: buildSystem(),
    messages: [{ role: "user", content: buildUserContent(input) }],
  };
  // «rich» додає adaptive thinking + effort (краща якість). Якщо версія API/SDK
  // їх не приймає — пробуємо мінімальний запит лише з базовими полями.
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
    intro?: string;
    recognized_dish?: string;
    recommendations?: Array<{
      wine_id?: string;
      why?: string;
      appetizer?: string;
      match_score?: number;
    }>;
  };

  const raw: RawRecommendation[] = (parsed.recommendations ?? [])
    .filter((r) => r.wine_id && getWineById(r.wine_id))
    .map((r) => ({
      wineId: r.wine_id as string,
      tier: (getWineById(r.wine_id as string) as Wine).tier,
      why: (r.why ?? "").trim(),
      appetizer: (r.appetizer ?? "").trim(),
      matchScore: clampScore(r.match_score),
    }));

  if (raw.length === 0) throw new Error("Жодної валідної рекомендації");

  return {
    intro: (parsed.intro ?? "").trim(),
    recognizedDish: (parsed.recognized_dish ?? "").trim(),
    raw,
  };
}

export async function runSommelier(
  input: SommelierInput,
): Promise<SommelierResult> {
  const client = getAnthropic();
  if (!client) return fallbackResult(input);

  try {
    let out;
    try {
      out = await callClaudeOnce(client, input, true);
    } catch (e) {
      console.warn("[sommelier] rich-запит не вдався, пробую мінімальний:", e);
      out = await callClaudeOnce(client, input, false);
    }
    return assemble(
      out.raw,
      out.intro || defaultIntro(input),
      out.recognizedDish,
      "claude",
      input.dish,
    );
  } catch (err) {
    console.error("[sommelier] Claude недоступний — fallback:", err);
    return fallbackResult(input);
  }
}

// ──────────────────── Складання результату ────────────────────
// Гарантуємо рівно 3 рекомендації (по одній на рівень, у порядку budget→premium).
// Якщо Claude щось пропустив — добиваємо детермінованим підбором.

function assemble(
  raw: RawRecommendation[],
  intro: string,
  recognizedDish: string,
  engine: "claude" | "fallback",
  dish: string,
): SommelierResult {
  const fb = fallbackRecommend(dish || recognizedDish || "");
  const usedIds = new Set<string>();

  const recommendations = TIER_ORDER.map((tier) => {
    let pick =
      raw.find((r) => {
        const w = getWineById(r.wineId);
        return w && w.tier === tier && !usedIds.has(r.wineId);
      }) ?? fb.find((r) => r.tier === tier)!;

    if (usedIds.has(pick.wineId)) {
      pick = fb.find((r) => r.tier === tier && !usedIds.has(r.wineId)) ?? pick;
    }
    usedIds.add(pick.wineId);

    const wine = getWineById(pick.wineId) as Wine;
    return {
      wine,
      tier,
      why: pick.why || fallbackWhy(wine, dish || recognizedDish),
      appetizer: pick.appetizer || "Тарілка сирів та оливок",
      matchScore: clampScore(pick.matchScore),
    };
  });

  return { intro, recognizedDish, recommendations, engine };
}

function fallbackResult(input: SommelierInput): SommelierResult {
  const raw = fallbackRecommend(input.dish || input.occasion || "");
  return assemble(raw, defaultIntro(input), "", "fallback", input.dish);
}

// ──────────────────── Дрібниці ────────────────────

function clampScore(v: unknown): number {
  const n = typeof v === "number" ? v : 85;
  return Math.max(60, Math.min(99, Math.round(n)));
}

function defaultIntro(input: SommelierInput): string {
  const subject = input.dish.trim() || input.occasion?.trim();
  if (subject) {
    return `Чудовий вибір — «${subject}». Ось три варіанти на різний настрій і бюджет: від впевненого щодня до пляшки, що запам’ятається.`;
  }
  return "Розкажіть, що буде на столі, — і я підберу вино, від якого вечір стане кращим.";
}

function fallbackWhy(wine: Wine, dish: string): string {
  const notes = wine.tasteNotes.slice(0, 2).join(" і ");
  const label = dish.trim() || "вашу страву";
  return `${wine.name} з нотами ${notes} підкреслює «${label}», не перебиваючи смак — смаки працюють у парі.`;
}
