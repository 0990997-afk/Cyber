"use client";

import { useEffect, useState } from "react";
import type { DishAnalysis } from "@/lib/types";

const METRICS: { key: keyof DishAnalysis; label: string }[] = [
  { key: "fat", label: "Жирність" },
  { key: "intensity", label: "Інтенсивність" },
  { key: "spice", label: "Пряність" },
  { key: "acidity", label: "Кислотність" },
];

export default function TasteProfile({ dish }: { dish: DishAnalysis }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="animate-rise rounded-2xl border border-line bg-barrel/40 p-6 ring-copper sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-terracotta">
            СМАКОВИЙ ПРОФІЛЬ
          </p>
          <h3 className="mt-1 font-ui text-2xl font-bold capitalize text-parchment">
            {dish.name}
          </h3>
        </div>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-ash">
          AI ANALYSIS
        </span>
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {METRICS.map((m, i) => {
          const v = dish[m.key] as number;
          return (
            <div key={m.key}>
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-ash">{m.label}</span>
                <span className="text-parchment">{v}/10</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cellar">
                <div
                  className="h-full rounded-full bg-linear-to-r from-gold to-terracotta transition-[width] duration-700 ease-out"
                  style={{ width: grown ? `${v * 10}%` : "0%", transitionDelay: `${i * 110}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {dish.note && (
        <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-ash">
          {dish.note}
        </p>
      )}
    </div>
  );
}
