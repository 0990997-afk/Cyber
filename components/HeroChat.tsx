"use client";

import { useEffect, useState } from "react";

const PROMPT = "Що ви плануєте сьогодні пити? 🍷";

const SUGGESTIONS = ["Романтична вечеря", "Стейк на гриль", "Подарунок другу"];

export default function HeroChat() {
  const [typed, setTyped] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(PROMPT.slice(0, i));
      if (i >= PROMPT.length) {
        clearInterval(id);
        setTimeout(() => setShowSuggestions(true), 300);
      }
    }, 45);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="animate-fade-up w-full max-w-sm rounded-3xl border border-line bg-barrel/90 p-4 shadow-[0_24px_60px_-24px_rgba(31,31,31,0.25)] backdrop-blur-sm sm:p-5">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ruby/10 text-base">
          🍷
        </span>
        <div className="leading-tight">
          <p className="font-ui text-sm font-bold text-parchment">Cyber Sommelier</p>
          <p className="flex items-center gap-1 font-mono text-[10px] tracking-[0.15em] text-ash">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            ОНЛАЙН
          </p>
        </div>
      </div>

      <div className="mt-4 min-h-[48px] rounded-2xl rounded-tl-sm bg-cellar-2 px-4 py-3 text-left">
        <p className="text-sm leading-relaxed text-parchment">
          {typed}
          {typed.length < PROMPT.length && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-ruby align-middle" />
          )}
        </p>
      </div>

      {showSuggestions && (
        <div className="animate-fade-up mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <a
              key={s}
              href="#studio"
              className="rounded-full border border-line bg-barrel px-3 py-1.5 text-xs text-ash transition-colors hover:border-ruby/40 hover:text-ruby"
            >
              {s}
            </a>
          ))}
        </div>
      )}

      <a
        href="#studio"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-ruby px-4 py-3 font-ui text-sm font-bold text-cellar transition-all hover:brightness-110"
      >
        Почати розмову →
      </a>
    </div>
  );
}
