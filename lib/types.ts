import type { Wine, WineTier } from "./wines";

export interface SommelierImage {
  mediaType: string; // напр. "image/jpeg"
  data: string; // base64 без префікса data:
}

export interface SommelierInput {
  dish: string;
  occasion?: string;
  budget: "any" | WineTier;
  image?: SommelierImage;
}

export interface Recommendation {
  wine: Wine;
  tier: WineTier;
  why: string;
  appetizer: string;
  matchScore: number;
}

export interface SommelierResult {
  intro: string;
  recognizedDish: string;
  recommendations: Recommendation[]; // завжди по порядку: budget, middle, premium
  engine: "claude" | "fallback";
}
