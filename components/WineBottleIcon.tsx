import type { WineColor } from "@/lib/types";

// Іконка-силует пляшки — показується, коли для сорту вина ще не заповнено
// реальне фото етикетки (ARCHETYPE_IMAGES у lib/wines.ts). Колір силуету
// підказує тип вина, без претензії на конкретну етикетку.
const COLOR_CLASS: Record<WineColor, string> = {
  red: "text-ruby",
  white: "text-gold/70",
  rose: "text-terracotta/70",
  sparkling: "text-gold",
  orange: "text-terracotta",
  dessert: "text-gold/80",
};

export default function WineBottleIcon({ color }: { color?: WineColor }) {
  const colorClass = COLOR_CLASS[color ?? "red"];
  return (
    <div className={`mt-4 flex h-40 w-full items-center justify-center rounded-xl bg-cellar/50 ${colorClass}`}>
      <svg viewBox="0 0 48 80" className="h-24 w-auto" fill="currentColor" aria-hidden="true">
        <path d="M20 0h8v14c4 4 6 8 6 14v44a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V28c0-6 2-10 6-14V0Z" />
        <rect x="18" y="0" width="12" height="6" fillOpacity="0.6" />
      </svg>
    </div>
  );
}
