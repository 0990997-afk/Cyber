"use client";

import { useState } from "react";
import type { WineRec } from "@/lib/types";
import { TIER_META } from "@/lib/types";

function MatchGauge({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} stroke="rgba(200,121,58,0.16)" strokeWidth="5" fill="none" />
        <circle
          cx="32"
          cy="32"
          r={r}
          className="text-terracotta"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold leading-none text-parchment">{value}</span>
        <span className="mt-0.5 font-mono text-[8px] tracking-[0.15em] text-ash">MATCH</span>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cellar/50 px-3 py-2">
      <div className="font-mono text-[10px] tracking-[0.12em] text-ash">{label}</div>
      <div className="mt-0.5 text-sm text-parchment">{value}</div>
    </div>
  );
}

export default function WineCard({ rec, index }: { rec: WineRec; index: number }) {
  const [copied, setCopied] = useState(false);
  const [reserved, setReserved] = useState(false);
  const { name, type, region, country, price, why, match, servingTemp, decant, snack, tier } = rec;
  const meta = TIER_META[tier];
  const sub = [type, [region, country].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

  async function copy() {
    const text = `${name} · ${type} · ${price} · Cyber Match ${match}% — ${why}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // Не падаємо через помилку буфера обміну.
    }
  }

  return (
    <article
      className="animate-rise flex flex-col rounded-2xl border border-line bg-barrel/45 p-6 ring-copper transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/40"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-terracotta">
            {meta.medal} {meta.label.toUpperCase()}
          </p>
          <p className="mt-1 text-[11px] text-ash">{meta.tagline}</p>
        </div>
        <MatchGauge value={match} />
      </div>

      <h3 className="mt-5 font-ui text-xl font-bold leading-tight text-parchment">{name}</h3>
      <p className="mt-1 font-mono text-xs text-ash">{sub}</p>
      <p className="mt-3 font-mono text-2xl font-bold text-copper-gradient">{price}</p>

      <p className="mt-4 flex-1 leading-relaxed text-parchment/90">{why}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Detail label="ПОДАЧА" value={servingTemp} />
        <Detail label="ДЕКАНТ" value={decant} />
        <Detail label="ЗАКУСКА" value={snack} />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setReserved(true)}
          className="flex-1 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-bold text-cellar transition hover:brightness-110"
        >
          {reserved ? "✓ Заброньовано" : "Купити"}
        </button>
        <button
          onClick={copy}
          className="rounded-xl border border-line px-4 py-2.5 text-sm text-parchment transition hover:border-terracotta/50 hover:text-terracotta"
          aria-label="Скопіювати"
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
    </article>
  );
}
