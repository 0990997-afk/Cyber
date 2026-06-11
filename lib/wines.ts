// Каталог винотеки «Тераса».
// AI-сомельє рекомендує вина ВИКЛЮЧНО з цього каталогу (grounding) —
// це робить підбір «продаваним»: за кожною рекомендацією стоїть конкретна
// пляшка з ціною. Той самий каталог використовує детермінований fallback,
// якщо живий Claude недоступний.

export type WineColor = "червоне" | "біле" | "розе" | "ігристе" | "оранж";
export type WineTier = "budget" | "middle" | "premium";
export type WineBody = "легке" | "середнє" | "повне";
export type WineSweetness =
  | "сухе"
  | "напівсухе"
  | "напівсолодке"
  | "брют";

export interface Wine {
  id: string;
  name: string;
  color: WineColor;
  grape: string;
  country: string;
  region: string;
  priceUAH: number;
  tier: WineTier;
  body: WineBody;
  sweetness: WineSweetness;
  abv: number;
  tasteNotes: string[];
  /** Ключові гастро-пари — і для показу, і для скорингу у fallback. */
  pairings: string[];
}

export const TIER_META: Record<
  WineTier,
  { label: string; tagline: string; range: string }
> = {
  budget: {
    label: "Бюджетно",
    tagline: "Впевнений вибір без переплати",
    range: "180–350 ₴",
  },
  middle: {
    label: "Золота середина",
    tagline: "Найкраще співвідношення смаку й ціни",
    range: "350–850 ₴",
  },
  premium: {
    label: "Здивувати гостей",
    tagline: "Коли вечір має запам’ятатися",
    range: "850–3000 ₴",
  },
};

export const TIER_ORDER: WineTier[] = ["budget", "middle", "premium"];

export const WINES: Wine[] = [
  // ───────────────── BUDGET (180–350 ₴) ─────────────────
  {
    id: "prosecco-terra",
    name: "Terra Prosecco DOC",
    color: "ігристе",
    grape: "Glera",
    country: "Італія",
    region: "Венето",
    priceUAH: 329,
    tier: "budget",
    body: "легке",
    sweetness: "брют",
    abv: 11,
    tasteNotes: ["зелене яблуко", "груша", "біла квітка"],
    pairings: ["аперитив", "легкі закуски", "суші", "салат", "морепродукти"],
  },
  {
    id: "pinot-grigio-veneto",
    name: "Pinot Grigio delle Venezie",
    color: "біле",
    grape: "Pinot Grigio",
    country: "Італія",
    region: "Венето",
    priceUAH: 249,
    tier: "budget",
    body: "легке",
    sweetness: "сухе",
    abv: 12,
    tasteNotes: ["цитрус", "груша", "мінеральність"],
    pairings: ["риба", "морепродукти", "паста", "салат", "курка"],
  },
  {
    id: "sauvignon-chile",
    name: "Reserva Sauvignon Blanc",
    color: "біле",
    grape: "Sauvignon Blanc",
    country: "Чилі",
    region: "Долина Касабланка",
    priceUAH: 279,
    tier: "budget",
    body: "легке",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["аґрус", "лайм", "свіжа трава"],
    pairings: ["риба", "козячий сир", "салат", "овочі", "морепродукти"],
  },
  {
    id: "cab-sauv-chile",
    name: "Reserva Cabernet Sauvignon",
    color: "червоне",
    grape: "Cabernet Sauvignon",
    country: "Чилі",
    region: "Майпо",
    priceUAH: 289,
    tier: "budget",
    body: "повне",
    sweetness: "сухе",
    abv: 13.5,
    tasteNotes: ["чорна смородина", "слива", "какао"],
    pairings: ["стейк", "бургер", "гриль", "тверді сири", "м'ясо"],
  },
  {
    id: "merlot-terra",
    name: "Terra Merlot",
    color: "червоне",
    grape: "Merlot",
    country: "Чилі",
    region: "Центральна долина",
    priceUAH: 259,
    tier: "budget",
    body: "середнє",
    sweetness: "сухе",
    abv: 13,
    tasteNotes: ["слива", "вишня", "ваніль"],
    pairings: ["курка", "свинина", "паста", "піца", "м'ясо"],
  },
  {
    id: "rkatsiteli",
    name: "Ркацителі Кахеті",
    color: "біле",
    grape: "Rkatsiteli",
    country: "Грузія",
    region: "Кахеті",
    priceUAH: 239,
    tier: "budget",
    body: "середнє",
    sweetness: "сухе",
    abv: 12,
    tasteNotes: ["айва", "яблуко", "польові квіти"],
    pairings: ["курка", "овочі", "сир", "хачапурі", "грузинська кухня"],
  },
  {
    id: "telti-kuruk",
    name: "Тельті-Курук",
    color: "біле",
    grape: "Telti-Kuruk",
    country: "Україна",
    region: "Одещина",
    priceUAH: 299,
    tier: "budget",
    body: "легке",
    sweetness: "сухе",
    abv: 12,
    tasteNotes: ["цитрус", "груша", "морський бриз"],
    pairings: ["риба", "устриці", "морепродукти", "салат"],
  },
  {
    id: "zweigelt",
    name: "Zweigelt",
    color: "червоне",
    grape: "Zweigelt",
    country: "Австрія",
    region: "Бургенланд",
    priceUAH: 319,
    tier: "budget",
    body: "легке",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["вишня", "малина", "спеції"],
    pairings: ["ковбаски", "курка", "паста", "гриль", "піца"],
  },
  {
    id: "rose-provence-budget",
    name: "Rosé di Provenza",
    color: "розе",
    grape: "Grenache / Cinsault",
    country: "Франція",
    region: "Прованс",
    priceUAH: 339,
    tier: "budget",
    body: "легке",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["полуниця", "персик", "грейпфрут"],
    pairings: ["салат", "риба", "сир", "аперитив", "овочі"],
  },

  // ───────────────── MIDDLE (350–850 ₴) ─────────────────
  {
    id: "chianti-classico",
    name: "Chianti Classico DOCG",
    color: "червоне",
    grape: "Sangiovese",
    country: "Італія",
    region: "Тоскана",
    priceUAH: 590,
    tier: "middle",
    body: "середнє",
    sweetness: "сухе",
    abv: 13.5,
    tasteNotes: ["вишня", "сушені трави", "шкіра"],
    pairings: ["паста", "піца", "томатний соус", "стейк", "м'ясо"],
  },
  {
    id: "rioja-crianza",
    name: "Rioja Crianza",
    color: "червоне",
    grape: "Tempranillo",
    country: "Іспанія",
    region: "Ріоха",
    priceUAH: 520,
    tier: "middle",
    body: "середнє",
    sweetness: "сухе",
    abv: 14,
    tasteNotes: ["червоні ягоди", "ваніль", "тютюн"],
    pairings: ["ягня", "тапас", "хамон", "гриль", "м'ясо"],
  },
  {
    id: "malbec-mendoza",
    name: "Malbec Mendoza",
    color: "червоне",
    grape: "Malbec",
    country: "Аргентина",
    region: "Мендоса",
    priceUAH: 560,
    tier: "middle",
    body: "повне",
    sweetness: "сухе",
    abv: 14,
    tasteNotes: ["ожина", "слива", "темний шоколад"],
    pairings: ["стейк", "ребра", "гриль", "бургер", "м'ясо"],
  },
  {
    id: "cdr-syrah",
    name: "Côtes du Rhône",
    color: "червоне",
    grape: "Syrah / Grenache",
    country: "Франція",
    region: "Долина Рони",
    priceUAH: 480,
    tier: "middle",
    body: "повне",
    sweetness: "сухе",
    abv: 14,
    tasteNotes: ["чорний перець", "ожина", "прованські трави"],
    pairings: ["качка", "ягня", "дичина", "гриль", "м'ясо"],
  },
  {
    id: "chablis",
    name: "Chablis",
    color: "біле",
    grape: "Chardonnay",
    country: "Франція",
    region: "Бургундія",
    priceUAH: 790,
    tier: "middle",
    body: "середнє",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["лимон", "устрична мінеральність", "біла квітка"],
    pairings: ["устриці", "риба", "морепродукти", "курка"],
  },
  {
    id: "riesling-mosel",
    name: "Riesling Kabinett",
    color: "біле",
    grape: "Riesling",
    country: "Німеччина",
    region: "Мозель",
    priceUAH: 610,
    tier: "middle",
    body: "легке",
    sweetness: "напівсухе",
    abv: 9.5,
    tasteNotes: ["персик", "лайм", "мінеральність"],
    pairings: ["азійська кухня", "гостре", "свинина", "тайська кухня", "качка"],
  },
  {
    id: "albarino",
    name: "Albariño Rías Baixas",
    color: "біле",
    grape: "Albariño",
    country: "Іспанія",
    region: "Галісія",
    priceUAH: 540,
    tier: "middle",
    body: "середнє",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["персик", "цедра", "солоність"],
    pairings: ["морепродукти", "риба", "паелья", "устриці"],
  },
  {
    id: "saperavi",
    name: "Сапераві Кахеті",
    color: "червоне",
    grape: "Saperavi",
    country: "Грузія",
    region: "Кахеті",
    priceUAH: 450,
    tier: "middle",
    body: "повне",
    sweetness: "сухе",
    abv: 13.5,
    tasteNotes: ["чорнослив", "ожина", "спеції"],
    pairings: ["шашлик", "ягня", "хінкалі", "гриль", "м'ясо"],
  },
  {
    id: "orange-georgia",
    name: "Бурштинове кахетинське (квеврі)",
    color: "оранж",
    grape: "Rkatsiteli",
    country: "Грузія",
    region: "Кахеті",
    priceUAH: 620,
    tier: "middle",
    body: "повне",
    sweetness: "сухе",
    abv: 12.5,
    tasteNotes: ["сушений абрикос", "чай", "горіх", "танінність"],
    pairings: ["пряні страви", "сир", "ковбаси", "грузинська кухня", "гостре"],
  },

  // ───────────────── PREMIUM (850–3000 ₴) ─────────────────
  {
    id: "barolo",
    name: "Barolo DOCG",
    color: "червоне",
    grape: "Nebbiolo",
    country: "Італія",
    region: "П’ємонт",
    priceUAH: 2200,
    tier: "premium",
    body: "повне",
    sweetness: "сухе",
    abv: 14.5,
    tasteNotes: ["троянда", "дьоготь", "вишня", "трюфель"],
    pairings: ["дичина", "трюфель", "витримані сири", "ягня", "м'ясо"],
  },
  {
    id: "brunello",
    name: "Brunello di Montalcino",
    color: "червоне",
    grape: "Sangiovese Grosso",
    country: "Італія",
    region: "Тоскана",
    priceUAH: 1980,
    tier: "premium",
    body: "повне",
    sweetness: "сухе",
    abv: 14.5,
    tasteNotes: ["вишня", "шкіра", "тютюн", "спеції"],
    pairings: ["стейк", "дичина", "ягня", "трюфель", "м'ясо"],
  },
  {
    id: "chateauneuf",
    name: "Châteauneuf-du-Pape",
    color: "червоне",
    grape: "Grenache blend",
    country: "Франція",
    region: "Долина Рони",
    priceUAH: 1750,
    tier: "premium",
    body: "повне",
    sweetness: "сухе",
    abv: 15,
    tasteNotes: ["спеції", "ожина", "прованські трави", "тютюн"],
    pairings: ["дичина", "качка", "ягня", "тушковане м'ясо", "м'ясо"],
  },
  {
    id: "bordeaux-cru",
    name: "Saint-Émilion Grand Cru",
    color: "червоне",
    grape: "Merlot / Cabernet Franc",
    country: "Франція",
    region: "Бордо",
    priceUAH: 1650,
    tier: "premium",
    body: "повне",
    sweetness: "сухе",
    abv: 14,
    tasteNotes: ["чорна смородина", "кедр", "графіт"],
    pairings: ["стейк", "ягня", "качка", "витримані сири", "м'ясо"],
  },
  {
    id: "burgundy-pinot",
    name: "Bourgogne Pinot Noir",
    color: "червоне",
    grape: "Pinot Noir",
    country: "Франція",
    region: "Бургундія",
    priceUAH: 1200,
    tier: "premium",
    body: "середнє",
    sweetness: "сухе",
    abv: 13,
    tasteNotes: ["малина", "лісові гриби", "підлісок"],
    pairings: ["качка", "курка", "лосось", "гриби", "риба"],
  },
  {
    id: "champagne-brut",
    name: "Champagne Brut",
    color: "ігристе",
    grape: "Chardonnay / Pinot Noir",
    country: "Франція",
    region: "Шампань",
    priceUAH: 1890,
    tier: "premium",
    body: "легке",
    sweetness: "брют",
    abv: 12,
    tasteNotes: ["бріош", "цитрус", "мигдаль", "мінеральність"],
    pairings: ["устриці", "ікра", "аперитив", "святковий стіл", "морепродукти"],
  },
  {
    id: "amarone",
    name: "Amarone della Valpolicella",
    color: "червоне",
    grape: "Corvina blend",
    country: "Італія",
    region: "Венето",
    priceUAH: 1700,
    tier: "premium",
    body: "повне",
    sweetness: "напівсухе",
    abv: 15.5,
    tasteNotes: ["сушена вишня", "інжир", "шоколад"],
    pairings: ["витримані сири", "дичина", "тушковане м'ясо", "різото", "м'ясо"],
  },
  {
    id: "saperavi-reserve",
    name: "Сапераві Резерв",
    color: "червоне",
    grape: "Saperavi",
    country: "Грузія",
    region: "Кахеті (дубова витримка)",
    priceUAH: 980,
    tier: "premium",
    body: "повне",
    sweetness: "сухе",
    abv: 14,
    tasteNotes: ["чорна смородина", "спеції", "дуб", "ожина"],
    pairings: ["шашлик", "ягня", "стейк", "дичина", "м'ясо"],
  },
];

// ───────────────────────── Хелпери ─────────────────────────

export function getWineById(id: string): Wine | undefined {
  return WINES.find((w) => w.id === id);
}

export function winesByTier(tier: WineTier): Wine[] {
  return WINES.filter((w) => w.tier === tier);
}

export function formatPrice(uah: number): string {
  return `${uah.toLocaleString("uk-UA")} ₴`;
}

/** Колір акценту картки за типом вина (узгоджено з палітрою «Вечірня тераса»). */
export function colorAccent(color: WineColor): string {
  switch (color) {
    case "червоне":
      return "#7E1F2B";
    case "біле":
      return "#D8C896";
    case "розе":
      return "#C77B86";
    case "ігристе":
      return "#E4D29A";
    case "оранж":
      return "#C98A3C";
  }
}

// ──────────────────── Fallback-підбір ────────────────────
// Детермінований підбір за ключовими словами страви. Працює без мережі/ключа,
// щоб демо на сцені ніколи не падало. Живий Claude дає тонші пояснення.

type DishProfile = {
  preferColors: WineColor[];
  keywords: string[];
  appetizer: string;
};

const DISH_PROFILES: { match: string[]; profile: DishProfile }[] = [
  {
    match: ["стейк", "ростбіф", "ребра", "бургер", "м'ясо", "мясо", "яловичина", "steak", "beef", "телятина"],
    profile: {
      preferColors: ["червоне"],
      keywords: ["стейк", "гриль", "м'ясо", "бургер"],
      appetizer: "Брускета з ростбіфом, руколою та пармезаном",
    },
  },
  {
    match: ["шашлик", "гриль", "барбекю", "bbq", "мангал", "ковбаски", "купати"],
    profile: {
      preferColors: ["червоне"],
      keywords: ["шашлик", "гриль", "м'ясо"],
      appetizer: "Тарілка копчених ковбасок із гірчицею",
    },
  },
  {
    match: ["качка", "ягня", "баранина", "дичина", "оленина", "качине", "duck", "lamb"],
    profile: {
      preferColors: ["червоне"],
      keywords: ["качка", "ягня", "дичина"],
      appetizer: "Паштет із качиної печінки на тості",
    },
  },
  {
    match: ["курка", "курятина", "індичка", "птиця", "chicken"],
    profile: {
      preferColors: ["біле", "червоне"],
      keywords: ["курка", "птиця"],
      appetizer: "Курячі рулетики з вершковим сиром",
    },
  },
  {
    match: ["риба", "лосось", "тунець", "форель", "дорадо", "сібас", "fish", "salmon"],
    profile: {
      preferColors: ["біле", "ігристе", "розе"],
      keywords: ["риба", "морепродукти"],
      appetizer: "Севіче з дорадо та лаймом",
    },
  },
  {
    match: ["устриці", "креветки", "мідії", "морепродукти", "паелья", "seafood", "oyster", "shrimp"],
    profile: {
      preferColors: ["біле", "ігристе"],
      keywords: ["морепродукти", "устриці", "риба"],
      appetizer: "Устриці з лимоном та чорним перцем",
    },
  },
  {
    match: ["суші", "роли", "sushi", "сашимі"],
    profile: {
      preferColors: ["ігристе", "біле"],
      keywords: ["суші", "морепродукти"],
      appetizer: "Едамаме з морською сіллю",
    },
  },
  {
    match: ["паста", "піца", "лазанья", "ризото", "різото", "болоньєзе", "карбонара", "pasta", "pizza", "томат"],
    profile: {
      preferColors: ["червоне"],
      keywords: ["паста", "піца", "томатний соус"],
      appetizer: "Брускета з томатами та базиліком",
    },
  },
  {
    match: ["сир", "сирна", "пармезан", "камамбер", "cheese", "бри"],
    profile: {
      preferColors: ["червоне", "оранж", "ігристе"],
      keywords: ["сир", "витримані сири"],
      appetizer: "Сирна тарілка з медом та волоськими горіхами",
    },
  },
  {
    match: ["гостре", "тайс", "азій", "карі", "том ям", "spicy", "thai", "wok", "вок"],
    profile: {
      preferColors: ["біле", "оранж"],
      keywords: ["гостре", "азійська кухня", "тайська кухня"],
      appetizer: "Спрінг-роли з солодким чилі",
    },
  },
  {
    match: ["десерт", "торт", "шоколад", "тірамісу", "ягоди", "dessert", "cake"],
    profile: {
      preferColors: ["ігристе", "розе"],
      keywords: ["аперитив", "сир"],
      appetizer: "Тарт із сезонними ягодами",
    },
  },
  {
    match: ["салат", "овоч", "вегетар", "веган", "брускета", "salad", "veggie"],
    profile: {
      preferColors: ["біле", "розе", "ігристе"],
      keywords: ["салат", "овочі", "сир"],
      appetizer: "Печені овочі з фетою та оливковою олією",
    },
  },
  {
    match: ["хачапурі", "хінкалі", "грузин", "лобіо"],
    profile: {
      preferColors: ["оранж", "червоне", "біле"],
      keywords: ["грузинська кухня", "сир", "м'ясо"],
      appetizer: "Пхалі з горіховою пастою",
    },
  },
];

const DEFAULT_PROFILE: DishProfile = {
  preferColors: ["червоне", "біле"],
  keywords: ["аперитив"],
  appetizer: "Асорті сирів та оливок",
};

function profileForDish(dish: string): DishProfile {
  const d = dish.toLowerCase();
  for (const { match, profile } of DISH_PROFILES) {
    if (match.some((m) => d.includes(m))) return profile;
  }
  return DEFAULT_PROFILE;
}

function scoreWine(wine: Wine, profile: DishProfile): number {
  let score = 0;
  const colorRank = profile.preferColors.indexOf(wine.color);
  if (colorRank === 0) score += 6;
  else if (colorRank > 0) score += 4 - colorRank;
  for (const kw of profile.keywords) {
    if (wine.pairings.some((p) => p.includes(kw) || kw.includes(p))) score += 3;
  }
  return score;
}

export interface RawRecommendation {
  wineId: string;
  tier: WineTier;
  why: string;
  appetizer: string;
  matchScore: number;
}

/** Підбирає по одному вину на кожен ціновий рівень. */
export function fallbackRecommend(dish: string): RawRecommendation[] {
  const profile = profileForDish(dish);
  const dishLabel = dish.trim() || "вашу вечерю";

  return TIER_ORDER.map((tier) => {
    const ranked = winesByTier(tier)
      .map((w) => ({ w, s: scoreWine(w, profile) }))
      .sort((a, b) => b.s - a.s);
    const best = ranked[0].w;
    const why = buildFallbackWhy(best, dishLabel);
    return {
      wineId: best.id,
      tier,
      why,
      appetizer: profile.appetizer,
      matchScore: Math.min(95, 70 + ranked[0].s),
    };
  });
}

function buildFallbackWhy(wine: Wine, dishLabel: string): string {
  const notes = wine.tasteNotes.slice(0, 2).join(" і ");
  const bodyPhrase =
    wine.body === "повне"
      ? "повнотіле, тримає смак"
      : wine.body === "середнє"
        ? "збалансоване, не перебиває смак"
        : "легке та свіже";
  return `${wine.name} — ${bodyPhrase}, з нотами ${notes}. Така структура гарно лягає під «${dishLabel}»: смаки підсилюють одне одного, а не сперечаються.`;
}
