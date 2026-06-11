// Спільні типи КІБЕР-СОМЕЛЬЄ. Без імпортів server-only — безпечно для клієнта.

export type Tier = "budget" | "middle" | "premium";

export interface Wine {
  id: string;
  name: string; // виробник + назва + рік
  type: string; // напр. «червоне сухе»
  grape: string;
  country: string;
  region: string;
  year: number;
  priceEUR: number;
  tier: Tier;
  // Смаковий профіль вина (1–10)
  body: number;
  acidity: number;
  tannin: number; // 0 для білих/ігристих
  sweetness: number;
  pairings: string[]; // ключові гастро-категорії
}

// Смаковий профіль страви (0–10) — серце «екрана аналізу».
export interface DishAnalysis {
  name: string;
  fat: number; // жирність
  intensity: number; // інтенсивність смаку
  spice: number; // пряність
  acidity: number; // кислотність
  note: string; // короткий профіль людською мовою
}

export interface WineRec {
  tier: Tier;
  wine: Wine;
  match: number; // Cyber Match Score, 80–99
  why: string; // пояснення тоном друга
  servingTemp: string; // «16–17 °C»
  decant: string; // «відкрити за 20 хв» / «не потребує»
  snack: string; // закуска
}

export interface SommelierResult {
  dish: DishAnalysis;
  recommendations: WineRec[]; // порядок: budget, middle, premium
  engine: "claude" | "fallback";
}

export interface SommelierImage {
  mediaType: string;
  data: string; // base64 без префікса
}

export interface SommelierInput {
  dish: string;
  occasion?: string;
  budget: "any" | Tier;
  image?: SommelierImage;
}

export const TIER_META: Record<
  Tier,
  { label: string; medal: string; tagline: string }
> = {
  budget: { label: "Бюджетно", medal: "🥉", tagline: "Чесна якість без переплати" },
  middle: { label: "Золота середина", medal: "🥈", tagline: "Найкращий баланс смаку й ціни" },
  premium: { label: "Вибір сомельє", medal: "🥇", tagline: "Коли вечір має запам’ятатися" },
};

export const TIER_ORDER: Tier[] = ["budget", "middle", "premium"];
