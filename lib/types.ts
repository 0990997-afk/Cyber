// Спільні типи КІБЕР-СОМЕЛЬЄ 2.0. Без server-only — безпечно для клієнта.

export type Tier = "budget" | "middle" | "premium";

export interface Wine {
  id: string;
  name: string;
  type: string;
  grape: string;
  country: string;
  region: string;
  year: number;
  priceEUR: number;
  tier: Tier;
  body: number;
  acidity: number;
  tannin: number;
  sweetness: number;
  pairings: string[];
}

// 7-вимірний смаковий профіль страви (0–10).
export interface DishAnalysis {
  name: string;
  fat: number; // жирність
  acidity: number; // кислотність
  sweetness: number; // солодкість
  salt: number; // солоність
  intensity: number; // інтенсивність
  spice: number; // пряність
  minerality: number; // мінеральність
  note: string;
}

// Рекомендація — пласка (підтримує і локальні, і знайдені у вебі вина).
export interface WineRec {
  tier: Tier;
  name: string;
  type: string;
  grape?: string;
  region?: string;
  country?: string;
  price: string; // напр. «€18»
  match: number; // Cyber Match Score 80–99
  why: string;
  servingTemp: string;
  decant: string;
  snack: string;
  alternative?: string; // альтернативне вино/стиль, якщо це не підходить
}

// Структурований аналіз фото страви (AI vision).
export interface PhotoAnalysis {
  detectedDish: string; // людський опис того, що AI бачить на фото
  confidence: number; // 0..1 — впевненість розпізнавання
  ingredients: string[];
  cuisineStyle: string;
  cookingMethod: string;
}

export interface SommelierResult {
  dish: DishAnalysis;
  photo?: PhotoAnalysis; // присутній лише якщо фото реально проаналізовано AI vision
  pairingReasoning?: string; // чому ці параметри страви важливі для підбору вина
  recommendations: WineRec[];
  finalPick?: { tier: Tier; reason: string }; // "Найкращий вибір на сьогодні"
  honestNote?: string; // чесний вердикт, якщо вино — не найкраща пара
  avoid?: string; // чого уникати при виборі вина до цієї страви
  sources: string[]; // звідки дані (веб-пошук / локальна база)
  engine: "claude" | "claude+web" | "fallback";
  demo?: boolean; // true — це демо-підбір без реального AI-аналізу фото
}

export interface SommelierImage {
  mediaType: string;
  data: string;
}

export interface SommelierInput {
  dish: string;
  occasion?: string;
  budget: "any" | Tier;
  image?: SommelierImage;
}

export const TASTE_METRICS: { key: keyof DishAnalysis; label: string }[] = [
  { key: "fat", label: "Жирність" },
  { key: "intensity", label: "Інтенсивність" },
  { key: "acidity", label: "Кислотність" },
  { key: "spice", label: "Пряність" },
  { key: "sweetness", label: "Солодкість" },
  { key: "salt", label: "Солоність" },
  { key: "minerality", label: "Мінеральність" },
];

export const TIER_META: Record<
  Tier,
  { label: string; medal: string; tagline: string }
> = {
  budget: { label: "Бюджетно", medal: "🥉", tagline: "Чесна якість без переплати" },
  middle: { label: "Золота середина", medal: "🥈", tagline: "Найкращий баланс смаку й ціни" },
  premium: { label: "Вибір сомельє", medal: "🥇", tagline: "Коли вечір має запам’ятатися" },
};

export const TIER_ORDER: Tier[] = ["budget", "middle", "premium"];
