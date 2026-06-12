import "server-only";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, SOMMELIER_MODEL } from "./anthropic";
import {
  WINES,
  getWineById,
  analyzeDishLocally,
  candidatesByTier,
  matchScore,
  honestNoteFor,
  alternativeFor,
  avoidFor,
  pairingReasoningFor,
  finalPickFor,
} from "./wines";
import { TIER_ORDER, TIER_META } from "./types";
import type {
  Wine,
  DishAnalysis,
  WineRec,
  PhotoAnalysis,
  SommelierInput,
  SommelierResult,
} from "./types";

export type { SommelierInput, SommelierResult } from "./types";

// Загальний бюджет часу на весь runSommelier() — лишає ~10s запасу під
// maxDuration маршруту (60s) для серіалізації відповіді та накладних витрат.
const ROUTE_BUDGET_MS = 50_000;
// Мінімальний залишок бюджету, з яким варто починати ще одну спробу.
const MIN_ATTEMPT_MS = 8_000;
// Максимальний таймаут одного виклику Claude, навіть якщо бюджету лишилось більше.
const MAX_CALL_TIMEOUT_MS = 22_000;
// Мінімальний залишок часу, щоб продовжити цикл pause_turn ще одним викликом.
const MIN_PAUSE_TURN_MS = 5_000;

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

function systemRules(web: boolean, hasImage: boolean): string {
  return `Ти — КІБЕР-СОМЕЛЬЄ (Cyber Sommelier), AI-агент-сомельє з характером. Гасло: «Алгоритм із смаком».
Гість описує або фотографує страву — ти аналізуєш смак і радиш рівно 3 вина: по одному на рівень (budget, middle, premium).

${web
      ? `ДОСТУП ДО ЗОВНІШНЬОГО СВІТУ: у тебе є інструмент web_search. ОБОВʼЯЗКОВО скористайся ним, щоб знайти РЕАЛЬНІ дані — відгуки, оцінки, типові ціни в євро та перевірені гастрономічні пари для конкретних вин. Спирайся на реальні джерела, а не лише на свою памʼять. Можеш рекомендувати будь-яке реальне вино, доступне в Україні чи Європі, навіть якщо його немає у списку кандидатів. Якщо ти не впевнений, що страва на фото — це саме те, на що схоже, або це маловідома регіональна страва, ОБОВ'ЯЗКОВО пошукай у вебі, щоб уточнити.`
      : `Обирай зі списку кандидатів, який дам у запиті (за id), або з відомих тобі реальних вин.`}

${hasImage
      ? `АНАЛІЗ ФОТО: На зображенні — страва гостя. Уважно роздивись її та заповни поле "photo":
- detected_dish: 2–4 речення українською людською мовою — повноцінний опис того, що ти бачиш: (1) яка це страва або категорія страви; (2) видимі інгредієнти, спосіб приготування (гриль/смаження/запікання/сире тощо), соус або текстура, якщо їх видно; (3) ОБОВ'ЯЗКОВО чітко познач, що є фактом (видно на фото), а що — твоє припущення (напр. «Це виглядає як...», «Ймовірно, всередині...», «Не видно, але типово для такої страви...»). Пиши як сомельє, що щиро описує гостю, що бачить на тарілці, а не як підпис до фото.
- confidence: число 0..1 — ЧЕСНА оцінка впевненості в розпізнаванні. Якщо фото нечітке, страва незвична або погано видно — став низьке значення (0.3–0.6) і чесно опиши невпевненість у detected_dish.
- ingredients: масив 3–7 ключових інгредієнтів/компонентів, які ти бачиш або припускаєш.
- cuisine_style: кухня/стиль (напр. «українська», «італійська», «азійська», «грузинська»).
- cooking_method: спосіб приготування (напр. «гриль», «смаження», «запікання», «сире/тартар», «варіння»).
Якщо на фото не страва, а щось інше (вино, меню, полиця) — опиши це в detected_dish і постав низьку confidence.`
      : `Якщо фото немає — НЕ додавай поле "photo" у відповідь взагалі (або залиш його null).`}

ГОЛОС БРЕНДУ:
- Пояснюй ПРИЧИНУ пари конкретно й по-людськи: «кислотність розрізає жир», «таніни врівноважують жирність», «мінеральність підкреслює морепродукти». Це суть, а не снобізм.
- Тепло, дотепно, коротко — як друг, що розбирається, але не випендрюється.
- ЗАБОРОНЕНО: маркетингові слова (інноваційний, унікальний, революційний), канцелярит, порожні штампи.
- Українською.

ПРИНЦИПИ ПІДБОРУ ВИНА (керуйся ними при виборі й поясненні):
- Кислотність вина ≥ кислотність/жирність страви — інакше вино здасться «плоским».
- Таніни люблять білок і жир (червоне мʼясо, витримані сири) — і конфліктують із гострим та морепродуктами.
- Солодкість вина ≥ солодкість страви — сухе вино на тлі солодкого здається кислим і гірким.
- Інтенсивність/тіло вина приблизно відповідає інтенсивності страви — делікатну страву не можна «перекричати» потужним вином, і навпаки.
- Регіональна логіка («що росте поруч — пасує разом») — гарний тай-брейкер між кількома підходящими варіантами.
- Не обирай 3 вина з одного й того ж сорту винограду — дай розмаїття стилів між рівнями.

ЧЕСНИЙ СОМЕЛЬЄ: якщо вино — НЕ найкраща пара (фастфуд, піца, дуже гостре, надсолодке), чесно скажи це у полі honest_note і запропонуй кращу альтернативу (пиво, кола, саке). Винні варіанти все одно дай — найкращі з можливих. Якщо вино доречне — honest_note порожній рядок.

ЧОГО УНИКАТИ: у полі "avoid" дай ОДНЕ речення українською — якого стилю/типу вина варто уникати до цієї страви і чому (напр. «Уникайте дуже танінних червоних — вони підсилять відчуття гостроти.»).

АНАЛІЗ СТРАВИ (dish): назва + оцінки 0–10: fat (жирність), acidity (кислотність), sweetness (солодкість), salt (солоність), intensity (інтенсивність), spice (пряність), minerality (мінеральність). note — рядок про профіль (1 речення, конкретне, без води).

ЛОГІКА ПІДБОРУ (pairing_reasoning): у 2–4 реченнях українською поясни гостю, ЧОМУ саме такий профіль страви (жирність, кислотність, солодкість, солоність, текстура/інтенсивність, гострота) визначає підбір вина — конкретно для ЦІЄЇ страви, з прив'язкою до принципів підбору вище. Це має звучати як пояснення сомельє, а не як перелік цифр.

ВИНА: для кожного — tier; wine_id (якщо з мого списку, інакше пропусти); name (виробник+назва+рік, або стиль/категорія, якщо точної пляшки немає); type; grape; region; country; price (у форматі «€18»); match (Cyber Match Score 80–99 — ЧЕСНА оцінка, не ставити всім трьом 95+; якщо пара компромісна — став 80–87 і поясни компроміс); why (${
    hasImage
      ? "1–2 речення: НАЗВИ конкретний механізм пари — що саме в страві й вині взаємодіє, за принципами вище — а не загальні фрази на кшталт «гарно поєднується»"
      : "2–4 речення, розгорнуто: (1) НАЗВИ конкретний механізм смакової взаємодії зі стравою за принципами вище — що саме резонує чи балансує; (2) звʼяжи вибір із приводом/контекстом застілля, якщо гість його вказав; (3) скажи, для якого гостя чи настрою ця пляшка — кому вона сподобається найбільше. Без загальних фраз на кшталт «гарно поєднується» — лише конкретика"
  }); serving_temp; decant; snack; alternative — 1 речення про альтернативне вино/стиль для гостя, який хоче інший підхід.

ФІНАЛЬНИЙ ВИБІР (final_pick): обери ОДНЕ з трьох вин — те, яке найкраще пасує сьогодні — і вкажи його tier та reason (1–2 речення українською у стилі «Найкращий вибір на сьогодні: ... — тому що ...», з конкретним аргументом, чому саме воно, а не інші два).

ФОРМАТ — поверни ЛИШЕ валідний JSON, без markdown:
{
  ${hasImage ? `"photo": {"detected_dish":"","confidence":0.0,"ingredients":["",""],"cuisine_style":"","cooking_method":""},\n  ` : ""}"dish": {"name":"","fat":0,"acidity":0,"sweetness":0,"salt":0,"intensity":0,"spice":0,"minerality":0,"note":""},
  "pairing_reasoning": "",
  "honest_note": "",
  "avoid": "",
  "recommendations": [
    {"tier":"budget","wine_id":"","name":"","type":"","grape":"","region":"","country":"","price":"€0","match":0,"why":"","serving_temp":"","decant":"","snack":"","alternative":""}
  ],
  "final_pick": {"tier":"", "reason":""}
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

// ───────────────── Валідація відповіді AI ─────────────────

const photoSchema = z
  .object({
    detected_dish: z.string().optional(),
    confidence: z.number().optional(),
    ingredients: z.array(z.string()).optional(),
    cuisine_style: z.string().optional(),
    cooking_method: z.string().optional(),
  })
  .nullable()
  .optional();

const dishSchema = z
  .object({
    name: z.string().optional(),
    fat: z.number().optional(),
    acidity: z.number().optional(),
    sweetness: z.number().optional(),
    salt: z.number().optional(),
    intensity: z.number().optional(),
    spice: z.number().optional(),
    minerality: z.number().optional(),
    note: z.string().optional(),
  })
  .optional();

const recSchema = z.object({
  tier: z.string().optional(),
  wine_id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  grape: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  price: z.string().optional(),
  match: z.number().optional(),
  why: z.string().optional(),
  serving_temp: z.string().optional(),
  decant: z.string().optional(),
  snack: z.string().optional(),
  alternative: z.string().optional(),
});

const finalPickSchema = z
  .object({
    tier: z.string().optional(),
    reason: z.string().optional(),
  })
  .nullable()
  .optional();

const aiResultSchema = z.object({
  photo: photoSchema,
  dish: dishSchema,
  pairing_reasoning: z.string().optional(),
  honest_note: z.string().optional(),
  avoid: z.string().optional(),
  recommendations: z.array(recSchema).optional(),
  final_pick: finalPickSchema,
});

type AiResult = z.infer<typeof aiResultSchema>;

// ───────────────── Виклик агента ─────────────────

function extractJson(text: string): unknown {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1 || e < s) throw new Error("Немає JSON у відповіді AI");
  return JSON.parse(text.slice(s, e + 1));
}

function clamp(v: unknown, lo: number, hi: number, def: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : def;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function clamp01(v: unknown, def: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : def;
  return Math.round(Math.max(0, Math.min(1, n)) * 100) / 100;
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
  opts: { web: boolean; thinking: boolean; deadline: number; label: string; timeoutMs?: number },
): Promise<SommelierResult> {
  const messages: unknown[] = [
    { role: "user", content: buildUserContent(input, pool, opts.web) },
  ];
  const baseReq: Record<string, unknown> = {
    model: SOMMELIER_MODEL,
    max_tokens: 4500,
    system: [{ type: "text", text: systemRules(opts.web, !!input.image), cache_control: { type: "ephemeral" } }],
  };
  if (opts.web) baseReq.tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }];
  if (opts.thinking) {
    baseReq.thinking = { type: "adaptive" };
    baseReq.output_config = { effort: "medium" };
  }

  const callTimeout = Math.min(opts.deadline - Date.now(), opts.timeoutMs ?? MAX_CALL_TIMEOUT_MS);
  let t0 = Date.now();
  console.log(`[sommelier] -> Claude запит (${opts.label}), timeout=${callTimeout}ms`);
  let message = (await client.messages.create(
    { ...baseReq, messages } as unknown as Anthropic.MessageCreateParamsNonStreaming,
    { timeout: callTimeout, maxRetries: 0 },
  )) as Anthropic.Message;
  console.log(`[sommelier] <- Claude відповів (${opts.label}) за ${Date.now() - t0}ms, stop_reason=${message.stop_reason}`);

  // Сервер-тул може повертати pause_turn — продовжуємо цикл, поки лишається бюджет.
  let guard = 0;
  while (message.stop_reason === "pause_turn" && guard < 4) {
    const remaining = opts.deadline - Date.now();
    if (remaining < MIN_PAUSE_TURN_MS) {
      console.warn(`[sommelier] (${opts.label}) бюджет часу вичерпано на pause_turn ${guard + 1}, залишок=${remaining}ms`);
      throw new Error("Бюджет часу вичерпано під час pause_turn");
    }
    guard++;
    messages.push({ role: "assistant", content: message.content });
    const turnTimeout = Math.min(remaining, opts.timeoutMs ?? MAX_CALL_TIMEOUT_MS);
    t0 = Date.now();
    console.log(`[sommelier] -> Claude запит (${opts.label}, pause_turn ${guard}), timeout=${turnTimeout}ms`);
    message = (await client.messages.create(
      { ...baseReq, messages } as unknown as Anthropic.MessageCreateParamsNonStreaming,
      { timeout: turnTimeout, maxRetries: 0 },
    )) as Anthropic.Message;
    console.log(`[sommelier] <- Claude відповів (${opts.label}, pause_turn ${guard}) за ${Date.now() - t0}ms, stop_reason=${message.stop_reason}`);
  }

  return parseResult(textOf(message), input, opts.web);
}

function buildPhoto(parsed: AiResult["photo"], hasImage: boolean): PhotoAnalysis | undefined {
  if (!hasImage || !parsed) return undefined;
  const detectedDish = String(parsed.detected_dish ?? "").trim();
  if (!detectedDish) return undefined;
  const ingredients = (parsed.ingredients ?? [])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 8);
  return {
    detectedDish,
    confidence: clamp01(parsed.confidence, 0.7),
    ingredients,
    cuisineStyle: String(parsed.cuisine_style ?? "").trim() || "невизначена",
    cookingMethod: String(parsed.cooking_method ?? "").trim() || "невизначений",
  };
}

function parseResult(text: string, input: SommelierInput, web: boolean): SommelierResult {
  const json = extractJson(text);
  const validated = aiResultSchema.safeParse(json);
  if (!validated.success) throw new Error(`Невалідна структура відповіді AI: ${validated.error.message}`);
  const parsed = validated.data;

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
      alternative: String(r.alternative ?? "").trim() || (localWine ? alternativeFor(localWine, dish) : undefined),
      color: localWine?.color,
      imageUrl: localWine?.imageUrl,
    });
  }

  if (recs.length === 0) throw new Error("Жодної валідної рекомендації");

  const honest = String(parsed.honest_note ?? "").trim() || honestNoteFor(input.dish);
  const recommendations = assembleTiers(recs, dish);

  const aiFinalTier = String(parsed.final_pick?.tier ?? "").trim();
  const aiFinalReason = String(parsed.final_pick?.reason ?? "").trim();
  const finalPick =
    aiFinalReason && TIER_ORDER.includes(aiFinalTier as never)
      ? { tier: aiFinalTier as (typeof TIER_ORDER)[number], reason: aiFinalReason }
      : finalPickFor(recommendations, dish);

  return {
    dish,
    photo: buildPhoto(parsed.photo, !!input.image),
    pairingReasoning: String(parsed.pairing_reasoning ?? "").trim() || pairingReasoningFor(dish),
    recommendations,
    finalPick,
    honestNote: honest || undefined,
    avoid: String(parsed.avoid ?? "").trim() || avoidFor(dish),
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

  const deadline = Date.now() + ROUTE_BUDGET_MS;
  // Для запитів із фото пропускаємо web-пошук: швидкий Claude Vision +
  // структуроване міркування сомельє важливіші за веб-контекст і мають
  // вписатись у бюджет часу маршруту.
  const attempts: { web: boolean; thinking: boolean; label: string; timeoutMs?: number }[] = input.image
    ? [
        // thinking-режим занадто повільний для vision у межах ROUTE_BUDGET_MS —
        // лишаємо одну спробу з більшим таймаутом, щоб встигнути в maxDuration маршруту.
        { web: false, thinking: false, label: "vision-plain", timeoutMs: 45_000 },
      ]
    : [
        { web: true, thinking: true, label: "web+thinking" },
        { web: false, thinking: true, label: "thinking" },
        { web: false, thinking: false, label: "plain" },
      ];
  for (const opts of attempts) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      console.warn(`[sommelier] недостатньо часу для спроби "${opts.label}" (залишок=${remaining}ms) — переходимо на fallback`);
      break;
    }
    try {
      return await callAgent(client, input, pool, { ...opts, deadline });
    } catch (e) {
      console.warn(`[sommelier] спроба "${opts.label}" не вдалась:`, e instanceof Error ? e.message : e);
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
    pairingReasoning: pairingReasoningFor(dish),
    recommendations,
    finalPick: finalPickFor(recommendations, dish),
    honestNote: honestNoteFor(input.dish),
    avoid: avoidFor(dish),
    sources: ["власна база (~300 вин)"],
    engine: "fallback",
    demo: true,
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
    alternative: alternativeFor(wine, dish),
    color: wine.color,
    imageUrl: wine.imageUrl,
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
