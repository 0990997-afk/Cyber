// Локальна база вин КІБЕР-СОМЕЛЬЄ.
// Генерується детерміновано з архетипів сортів — ~300 позицій із повним
// смаковим профілем (body/acidity/tannin/sweetness), €-ціною та рівнем.
// Підбір вина відбувається ВИКЛЮЧНО по цій базі (без зовнішніх API).

import type { Tier, Wine, DishAnalysis } from "./types";
import { TIER_ORDER } from "./types";

interface Archetype {
  grape: string;
  typeLabel: string;
  color: "red" | "white" | "rose" | "sparkling" | "orange" | "dessert";
  body: number;
  acidity: number;
  tannin: number;
  sweetness: number;
  basePrice: number; // €, базова «класична» ціна
  regions: { country: string; region: string; mult: number }[];
  pairings: string[];
}

const ARCHETYPES: Archetype[] = [
  // ── Червоні
  { grape: "Cabernet Sauvignon", typeLabel: "червоне сухе", color: "red", body: 9, acidity: 6, tannin: 9, sweetness: 1, basePrice: 14,
    regions: [{ country: "Франція", region: "Бордо", mult: 1.6 }, { country: "Чилі", region: "Майпо", mult: 0.8 }, { country: "США", region: "Напа", mult: 2.0 }],
    pairings: ["стейк", "м'ясо", "гриль", "бургер", "тверді сири"] },
  { grape: "Merlot", typeLabel: "червоне сухе", color: "red", body: 7, acidity: 5, tannin: 6, sweetness: 1, basePrice: 11,
    regions: [{ country: "Франція", region: "Бордо", mult: 1.4 }, { country: "Чилі", region: "Центральна долина", mult: 0.7 }, { country: "Італія", region: "Тоскана", mult: 1.0 }],
    pairings: ["свинина", "курка", "паста", "піца", "м'ясо"] },
  { grape: "Malbec", typeLabel: "червоне сухе", color: "red", body: 8, acidity: 6, tannin: 7, sweetness: 1, basePrice: 13,
    regions: [{ country: "Аргентина", region: "Мендоса", mult: 1.0 }, { country: "Франція", region: "Каор", mult: 1.2 }],
    pairings: ["стейк", "ребра", "гриль", "бургер", "м'ясо"] },
  { grape: "Syrah", typeLabel: "червоне сухе", color: "red", body: 8, acidity: 6, tannin: 8, sweetness: 1, basePrice: 13,
    regions: [{ country: "Франція", region: "Долина Рони", mult: 1.5 }, { country: "Австралія", region: "Баросса", mult: 1.1 }],
    pairings: ["качка", "ягня", "дичина", "гриль", "м'ясо"] },
  { grape: "Pinot Noir", typeLabel: "червоне сухе", color: "red", body: 5, acidity: 7, tannin: 4, sweetness: 1, basePrice: 18,
    regions: [{ country: "Франція", region: "Бургундія", mult: 2.2 }, { country: "Німеччина", region: "Баден", mult: 1.2 }, { country: "Нова Зеландія", region: "Отаго", mult: 1.6 }],
    pairings: ["качка", "лосось", "гриби", "курка", "риба"] },
  { grape: "Sangiovese", typeLabel: "червоне сухе", color: "red", body: 7, acidity: 8, tannin: 7, sweetness: 1, basePrice: 13,
    regions: [{ country: "Італія", region: "Тоскана", mult: 1.4 }],
    pairings: ["паста", "піца", "томатний соус", "стейк", "м'ясо"] },
  { grape: "Tempranillo", typeLabel: "червоне сухе", color: "red", body: 7, acidity: 6, tannin: 6, sweetness: 1, basePrice: 12,
    regions: [{ country: "Іспанія", region: "Ріоха", mult: 1.2 }, { country: "Іспанія", region: "Рібера-дель-Дуеро", mult: 1.5 }],
    pairings: ["ягня", "тапас", "хамон", "гриль", "м'ясо"] },
  { grape: "Grenache", typeLabel: "червоне сухе", color: "red", body: 7, acidity: 5, tannin: 5, sweetness: 2, basePrice: 12,
    regions: [{ country: "Франція", region: "Долина Рони", mult: 1.6 }, { country: "Іспанія", region: "Кампо-де-Борха", mult: 0.8 }],
    pairings: ["гриль", "ковбаски", "ягня", "тушковане м'ясо", "м'ясо"] },
  { grape: "Nebbiolo", typeLabel: "червоне сухе", color: "red", body: 8, acidity: 8, tannin: 9, sweetness: 1, basePrice: 28,
    regions: [{ country: "Італія", region: "П’ємонт", mult: 1.8 }],
    pairings: ["дичина", "трюфель", "витримані сири", "ягня", "м'ясо"] },
  { grape: "Saperavi", typeLabel: "червоне сухе", color: "red", body: 8, acidity: 7, tannin: 7, sweetness: 1, basePrice: 11,
    regions: [{ country: "Грузія", region: "Кахеті", mult: 1.0 }],
    pairings: ["шашлик", "ягня", "хінкалі", "гриль", "м'ясо"] },
  { grape: "Zinfandel", typeLabel: "червоне сухе", color: "red", body: 8, acidity: 5, tannin: 6, sweetness: 2, basePrice: 14,
    regions: [{ country: "США", region: "Каліфорнія", mult: 1.3 }],
    pairings: ["бургер", "ребра", "барбекю", "гриль", "м'ясо"] },
  // ── Білі
  { grape: "Sauvignon Blanc", typeLabel: "біле сухе", color: "white", body: 4, acidity: 9, tannin: 0, sweetness: 1, basePrice: 11,
    regions: [{ country: "Франція", region: "Луара", mult: 1.4 }, { country: "Нова Зеландія", region: "Мальборо", mult: 1.2 }, { country: "Чилі", region: "Касабланка", mult: 0.7 }],
    pairings: ["риба", "морепродукти", "салат", "козячий сир", "овочі"] },
  { grape: "Chardonnay", typeLabel: "біле сухе", color: "white", body: 7, acidity: 6, tannin: 0, sweetness: 1, basePrice: 14,
    regions: [{ country: "Франція", region: "Бургундія", mult: 2.0 }, { country: "Австралія", region: "Маргарет-Рівер", mult: 1.1 }, { country: "США", region: "Каліфорнія", mult: 1.3 }],
    pairings: ["курка", "риба", "морепродукти", "паста", "вершкові соуси"] },
  { grape: "Riesling", typeLabel: "біле напівсухе", color: "white", body: 4, acidity: 9, tannin: 0, sweetness: 4, basePrice: 13,
    regions: [{ country: "Німеччина", region: "Мозель", mult: 1.3 }, { country: "Австрія", region: "Вахау", mult: 1.4 }],
    pairings: ["азійська кухня", "гостре", "свинина", "тайська кухня", "качка"] },
  { grape: "Pinot Grigio", typeLabel: "біле сухе", color: "white", body: 4, acidity: 7, tannin: 0, sweetness: 1, basePrice: 9,
    regions: [{ country: "Італія", region: "Венето", mult: 1.0 }],
    pairings: ["риба", "морепродукти", "паста", "салат", "курка"] },
  { grape: "Albariño", typeLabel: "біле сухе", color: "white", body: 5, acidity: 8, tannin: 0, sweetness: 1, basePrice: 13,
    regions: [{ country: "Іспанія", region: "Ріас-Байшас", mult: 1.2 }],
    pairings: ["морепродукти", "риба", "устриці", "паелья"] },
  { grape: "Gewürztraminer", typeLabel: "біле напівсухе", color: "white", body: 6, acidity: 5, tannin: 0, sweetness: 4, basePrice: 14,
    regions: [{ country: "Франція", region: "Ельзас", mult: 1.3 }],
    pairings: ["азійська кухня", "гостре", "пряні страви", "качка", "сир"] },
  { grape: "Grüner Veltliner", typeLabel: "біле сухе", color: "white", body: 5, acidity: 8, tannin: 0, sweetness: 1, basePrice: 12,
    regions: [{ country: "Австрія", region: "Вайнфіртель", mult: 1.1 }],
    pairings: ["овочі", "риба", "шніцель", "салат", "курка"] },
  // ── Рожеве / ігристе / оранж / десертне
  { grape: "Grenache / Cinsault", typeLabel: "рожеве сухе", color: "rose", body: 4, acidity: 7, tannin: 1, sweetness: 1, basePrice: 12,
    regions: [{ country: "Франція", region: "Прованс", mult: 1.4 }],
    pairings: ["салат", "риба", "сир", "аперитив", "овочі"] },
  { grape: "Glera", typeLabel: "ігристе брют", color: "sparkling", body: 3, acidity: 8, tannin: 0, sweetness: 2, basePrice: 11,
    regions: [{ country: "Італія", region: "Венето", mult: 1.1 }],
    pairings: ["аперитив", "суші", "морепродукти", "салат", "легкі закуски"] },
  { grape: "Chardonnay / Pinot Noir", typeLabel: "ігристе брют", color: "sparkling", body: 4, acidity: 8, tannin: 0, sweetness: 1, basePrice: 30,
    regions: [{ country: "Франція", region: "Шампань", mult: 1.8 }, { country: "Іспанія", region: "Пенедес", mult: 0.6 }],
    pairings: ["устриці", "ікра", "аперитив", "морепродукти", "святковий стіл"] },
  { grape: "Rkatsiteli", typeLabel: "оранжеве", color: "orange", body: 7, acidity: 6, tannin: 4, sweetness: 1, basePrice: 14,
    regions: [{ country: "Грузія", region: "Кахеті", mult: 1.0 }],
    pairings: ["пряні страви", "сир", "ковбаси", "грузинська кухня", "гостре"] },
  { grape: "Sémillon", typeLabel: "десертне", color: "dessert", body: 7, acidity: 6, tannin: 0, sweetness: 9, basePrice: 22,
    regions: [{ country: "Франція", region: "Сотерн", mult: 1.6 }],
    pairings: ["десерт", "фуа-гра", "блакитний сир", "фрукти"] },
];

const HOUSES = [
  "Castello", "Domaine", "Bodega", "Tenuta", "Weingut", "Château", "Quinta",
  "Finca", "Cantina", "Mas", "Clos", "Vinho", "Hill", "Stone", "Old Cellar",
];
const QUALITIES: { suffix: string; mult: number; dBody: number }[] = [
  { suffix: "", mult: 0.6, dBody: -1 },
  { suffix: "Reserva", mult: 1.0, dBody: 0 },
  { suffix: "Gran Reserva", mult: 2.1, dBody: 1 },
];
const YEARS = [2019, 2020, 2021, 2022];

function clampN(n: number, lo = 1, hi = 10): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function tierForPrice(eur: number): Tier {
  if (eur < 10) return "budget";
  if (eur <= 25) return "middle";
  return "premium";
}

function buildCatalog(): Wine[] {
  const out: Wine[] = [];
  let i = 0;
  for (const a of ARCHETYPES) {
    for (const r of a.regions) {
      for (const q of QUALITIES) {
        // два роки на комбінацію → більше варіативності
        for (const y of [YEARS[i % YEARS.length], YEARS[(i + 2) % YEARS.length]]) {
          const house = HOUSES[i % HOUSES.length];
          const price = Math.max(
            5,
            Math.round(a.basePrice * r.mult * q.mult + ((i * 7) % 5) - 2),
          );
          const grapeShort = a.grape.split(" ")[0];
          const name = [house, grapeShort, q.suffix, y].filter(Boolean).join(" ");
          out.push({
            id: `w${i}`,
            name,
            type: a.typeLabel,
            grape: a.grape,
            country: r.country,
            region: r.region,
            year: y,
            priceEUR: price,
            tier: tierForPrice(price),
            body: clampN(a.body + q.dBody),
            acidity: clampN(a.acidity),
            tannin: clampN(a.tannin, 0, 10),
            sweetness: clampN(a.sweetness, 0, 10),
            pairings: a.pairings,
          });
          i++;
        }
      }
    }
  }
  return out;
}

export const WINES: Wine[] = buildCatalog();

export function getWineById(id: string): Wine | undefined {
  return WINES.find((w) => w.id === id);
}

export function formatPriceEUR(eur: number): string {
  return `€${eur}`;
}

// ───────────────── Профіль страви (fallback) ─────────────────

interface DishTemplate {
  match: string[];
  fat: number;
  intensity: number;
  spice: number;
  acidity: number;
  note: string;
}

const DISH_TEMPLATES: DishTemplate[] = [
  { match: ["стейк", "рібай", "ростбіф", "яловичина", "beef", "steak", "телятина"], fat: 8, intensity: 9, spice: 3, acidity: 2, note: "Жирне насичене м’ясо — потрібне щільне вино з танінами." },
  { match: ["шашлик", "гриль", "барбекю", "bbq", "ребра", "ковбаски"], fat: 7, intensity: 8, spice: 4, acidity: 3, note: "Дим і жир гриля люблять тепле повнотіле червоне." },
  { match: ["качка", "ягня", "баранина", "дичина", "duck", "lamb"], fat: 7, intensity: 8, spice: 4, acidity: 4, note: "Темне м’ясо з характером — до нього структурне червоне." },
  { match: ["курка", "індичка", "птиця", "chicken"], fat: 4, intensity: 5, spice: 3, acidity: 4, note: "Ніжна птиця — гнучка пара, біле або легке червоне." },
  { match: ["лосось", "тунець", "форель", "salmon", "стейк з риби"], fat: 5, intensity: 5, spice: 2, acidity: 5, note: "Жирніша риба тримає і насичене біле, і легке червоне." },
  { match: ["риба", "дорадо", "сібас", "fish", "тріска"], fat: 3, intensity: 4, spice: 2, acidity: 5, note: "Делікатна риба — свіже біле з кислотністю." },
  { match: ["устриці", "креветки", "мідії", "морепродукти", "seafood", "паелья"], fat: 3, intensity: 4, spice: 2, acidity: 7, note: "Морепродукти кличуть гостре кисле біле чи ігристе." },
  { match: ["суші", "роли", "sushi", "сашимі"], fat: 3, intensity: 4, spice: 3, acidity: 5, note: "Суші — баланс кислотності й мінеральності, ігристе чи біле." },
  { match: ["паста", "піца", "болоньєзе", "томат", "лазанья", "pasta", "pizza"], fat: 5, intensity: 6, spice: 3, acidity: 6, note: "Томатний соус кислотний — потрібне червоне з живою кислотністю." },
  { match: ["карбонара", "вершков", "різото", "ризото", "альфредо"], fat: 7, intensity: 6, spice: 2, acidity: 4, note: "Вершкова текстура — до неї тілисте біле або легке червоне." },
  { match: ["сир", "сирна", "пармезан", "камамбер", "cheese", "бри"], fat: 8, intensity: 7, spice: 2, acidity: 4, note: "Сир жирний і солоний — широка пара від ігристого до витриманого." },
  { match: ["гостре", "тайс", "азій", "карі", "том ям", "spicy", "wok", "вок"], fat: 4, intensity: 7, spice: 9, acidity: 5, note: "Гостре гасять напівсухим ароматним білим, а не танінами." },
  { match: ["десерт", "торт", "шоколад", "тірамісу", "ягоди", "dessert", "cake"], fat: 6, intensity: 6, spice: 2, acidity: 3, note: "Солодке має зустріти ще солодше — десертне вино." },
  { match: ["салат", "овоч", "вегетар", "веган", "salad"], fat: 2, intensity: 3, spice: 2, acidity: 6, note: "Легка зелень — свіже кисле біле чи рожеве." },
  { match: ["хачапурі", "хінкалі", "грузин", "лобіо"], fat: 7, intensity: 7, spice: 4, acidity: 4, note: "Грузинська кухня — у пару проситься оранж чи Сапераві." },
];

const DEFAULT_DISH: DishTemplate = {
  match: [],
  fat: 5,
  intensity: 5,
  spice: 3,
  acidity: 4,
  note: "Збалансована страва — підійде універсальне вино.",
};

export function analyzeDishLocally(dish: string): DishAnalysis {
  const d = dish.toLowerCase();
  const t = DISH_TEMPLATES.find((x) => x.match.some((m) => d.includes(m))) ?? DEFAULT_DISH;
  return {
    name: dish.trim() || "вечеря",
    fat: t.fat,
    intensity: t.intensity,
    spice: t.spice,
    acidity: t.acidity,
    note: t.note,
  };
}

// ───────────────── Логіка пар їжа↔вино ─────────────────

/** Афінність вина до смакового профілю страви (більше = краще). */
export function pairingScore(wine: Wine, dish: DishAnalysis): number {
  let s = 0;
  // Тіло вина ~ інтенсивність страви
  s += 10 - Math.abs(dish.intensity - wine.body);
  // Жирність гасять таніни (червоне) або кислотність (біле)
  const cut = Math.max(wine.tannin, wine.acidity);
  s += 10 - Math.abs(dish.fat - cut);
  // Кислотність страви ↔ кислотність вина
  s += 10 - Math.abs(dish.acidity - wine.acidity);
  // Пряність: гостре любить солодкість і не любить таніни
  if (dish.spice >= 5) {
    s += wine.sweetness >= 3 ? 6 : 0;
    s += 6 - Math.min(6, wine.tannin);
  } else {
    s += 4;
  }
  return s;
}

export function matchScore(wine: Wine, dish: DishAnalysis): number {
  const raw = pairingScore(wine, dish); // приблизно 10..40
  return Math.max(80, Math.min(99, Math.round(60 + raw)));
}

/** Топ-кандидати по кожному рівню — для передачі в Claude або для fallback. */
export function candidatesByTier(
  dish: DishAnalysis,
  perTier: number,
): Record<Tier, Wine[]> {
  const result = {} as Record<Tier, Wine[]>;
  for (const tier of TIER_ORDER) {
    result[tier] = WINES.filter((w) => w.tier === tier)
      .map((w) => ({ w, s: pairingScore(w, dish) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, perTier)
      .map((x) => x.w);
  }
  return result;
}
