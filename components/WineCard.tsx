"use client";

import { useState } from "react";
import type { Recommendation } from "@/lib/types";
import { formatPrice, colorAccent, TIER_META } from "@/lib/wines";

function Bottle({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 64 168"
      className="h-32 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    >
      {/* шийка */}
      <rect x="27" y="6" width="10" height="34" rx="3" fill="#1c060d" />
      <rect x="26" y="6" width="12" height="9" rx="3" fill={accent} />
      {/* тіло */}
      <path
        d="M22 40c0-3 2-5 5-6 3-1 5-3 5-6v0c0 3 2 5 5 6 3 1 5 3 5 6v110c0 6-4 10-10 10h0c-6 0-10-4-10-10V40z"
        fill="#1c060d"
        stroke="rgba(201,162,75,0.35)"
        strokeWidth="1"
      />
      {/* вино всередині */}
      <path
        d="M24 92c0 0 0 56 0 56 0 5 3 8 8 8s8-3 8-8c0 0 0-56 0-56z"
        fill={accent}
        opacity="0.85"
      />
      {/* етикетка */}
      <rect
        x="23"
        y="104"
        width="18"
        height="34"
        rx="2"
        fill="#f5efe6"
        opacity="0.92"
      />
      <rect x="26" y="110" width="12" height="2" rx="1" fill="#7e1f2b" />
      <rect x="26" y="116" width="12" height="1.5" rx="0.75" fill="#2a0a14" opacity="0.5" />
      <rect x="26" y="120" width="9" height="1.5" rx="0.75" fill="#2a0a14" opacity="0.5" />
    </svg>
  );
}

export default function WineCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  const [reserved, setReserved] = useState(false);
  const { wine, why, appetizer, matchScore, tier } = rec;
  const accent = colorAccent(wine.color);
  const meta = TIER_META[tier];

  return (
    <article
      className="animate-rise group relative flex flex-col rounded-2xl border border-line bg-bg-soft/70 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-bg-elevated/70"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* рівень + збіг */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-gold">
            {meta.label}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{meta.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-gold-soft">
          Збіг {matchScore}%
        </span>
      </div>

      <div className="mt-5 flex items-end gap-4">
        <Bottle accent={accent} />
        <div className="min-w-0 flex-1 pb-1">
          <h3 className="font-display text-2xl leading-tight text-cream">
            {wine.name}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {wine.grape} · {wine.region}
          </p>
          <p className="mt-3 font-display text-3xl text-gold-gradient">
            {formatPrice(wine.priceUAH)}
          </p>
        </div>
      </div>

      <div className="my-5 hairline" />

      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gold/80">
            Чому саме це
          </p>
          <p className="leading-relaxed text-cream/90">{why}</p>
        </div>
        <div className="flex gap-2 rounded-xl bg-bg/50 p-3">
          <span className="mt-0.5 text-gold">◆</span>
          <p className="leading-relaxed text-muted">
            <span className="text-cream/80">До вина: </span>
            {appetizer}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setReserved(true)}
          className="flex-1 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-soft"
        >
          {reserved ? "✓ Заброньовано" : "Купити"}
        </button>
        <button
          onClick={() => setReserved(true)}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:border-gold/50 hover:text-gold"
        >
          Забронювати
        </button>
      </div>
      {reserved && (
        <p className="mt-3 text-center text-xs text-gold-soft">
          Відкладено для вас у «Терасі» — заберіть зручного дня.
        </p>
      )}
    </article>
  );
}
