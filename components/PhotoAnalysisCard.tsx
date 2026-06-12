import type { PhotoAnalysis } from "@/lib/types";

function confidenceLabel(c: number): { text: string; color: string } {
  if (c >= 0.75) return { text: "Висока впевненість", color: "text-ruby" };
  if (c >= 0.5) return { text: "Середня впевненість", color: "text-gold" };
  return { text: "Низька впевненість", color: "text-ash" };
}

export default function PhotoAnalysisCard({ photo }: { photo: PhotoAnalysis }) {
  const conf = confidenceLabel(photo.confidence);
  const pct = Math.round(photo.confidence * 100);

  return (
    <div className="animate-rise rounded-2xl border border-line bg-barrel/40 p-6 ring-copper sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-terracotta">ЩО НА ФОТО</p>
          <h3 className="mt-1 font-ui text-2xl font-bold text-parchment">Аналіз фото</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className={`font-mono text-sm font-bold ${conf.color}`}>{pct}%</p>
          <p className="font-mono text-[10px] tracking-[0.15em] text-ash">{conf.text.toUpperCase()}</p>
        </div>
      </div>

      <p className="mt-4 leading-relaxed text-parchment/90">{photo.detectedDish}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-cellar/50 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.12em] text-ash">КУХНЯ</div>
          <div className="mt-0.5 text-sm capitalize text-parchment">{photo.cuisineStyle}</div>
        </div>
        <div className="rounded-lg bg-cellar/50 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.12em] text-ash">СПОСІБ ПРИГОТУВАННЯ</div>
          <div className="mt-0.5 text-sm capitalize text-parchment">{photo.cookingMethod}</div>
        </div>
      </div>

      {photo.ingredients.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] tracking-[0.12em] text-ash">ІНГРЕДІЄНТИ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {photo.ingredients.map((ing) => (
              <span
                key={ing}
                className="rounded-full border border-line px-3 py-1 text-xs text-parchment"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
