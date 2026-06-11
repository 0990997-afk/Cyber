"use client";

import { useRef, useState } from "react";
import type { SommelierResult } from "@/lib/types";
import { TIER_ORDER, TIER_META } from "@/lib/wines";
import WineCard from "./WineCard";

const QUICK_DISHES = [
  "Стейк рібай",
  "Паста карбонара",
  "Суші та роли",
  "Запечена риба",
  "Сирна тарілка",
  "Шашлик",
  "Качка з апельсином",
  "Гостра азійська локшина",
];

const BUDGETS: { value: "any" | (typeof TIER_ORDER)[number]; label: string }[] =
  [
    { value: "any", label: "Будь-який" },
    ...TIER_ORDER.map((t) => ({ value: t, label: TIER_META[t].label })),
  ];

// Зменшуємо фото у браузері: швидше, дешевше, у межах ліміту. Vision Claude
// чудово працює і на ~1280px.
function fileToScaledDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1280;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas недоступний"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Не вдалося прочитати фото"));
    img.src = url;
  });
}

export default function SommelierStudio() {
  const [dish, setDish] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]["value"]>("any");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SommelierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await fileToScaledDataUrl(file));
      setError(null);
    } catch {
      setError("Не вдалося обробити фото. Спробуйте інше.");
    }
  }

  async function ask() {
    if (!dish.trim() && !image) {
      setError("Опишіть страву або завантажте фото 🙂");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/somelye", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish, occasion, budget, image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Щось пішло не так. Спробуйте ще раз.");
      } else {
        setResult(data as SommelierResult);
        setTimeout(
          () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          80,
        );
      }
    } catch {
      setError("Немає зв’язку із сомельє. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="somelye" className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
          AI-сомельє
        </p>
        <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">
          Не знаєте, що взяти?
        </h2>
        <p className="mt-4 text-muted">
          Опишіть вечерю та привід — або просто сфотографуйте страву. За кілька
          секунд отримаєте три варіанти з поясненням людською мовою.
        </p>
      </div>

      {/* Форма */}
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-bg-soft/60 p-6 backdrop-blur-sm sm:p-8">
        <label className="block text-sm text-muted">Що буде на столі?</label>
        <textarea
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          placeholder="Напр.: стейк рібай середньої прожарки на вечерю вдвох"
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-line bg-bg/60 px-4 py-3 text-cream placeholder:text-muted/50 focus:border-gold/60 focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_DISHES.map((d) => (
            <button
              key={d}
              onClick={() => setDish(d)}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-gold/50 hover:text-gold"
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-muted">
              Привід{" "}
              <span className="text-muted/50">(необов’язково)</span>
            </label>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Романтична вечеря, зустріч друзів…"
              className="mt-2 w-full rounded-xl border border-line bg-bg/60 px-4 py-3 text-cream placeholder:text-muted/50 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted">Бюджет</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBudget(b.value)}
                  className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                    budget === b.value
                      ? "border-gold bg-gold/15 text-gold-soft"
                      : "border-line text-muted hover:border-gold/40"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Фото */}
        <div className="mt-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          {image ? (
            <div className="flex items-center gap-4 rounded-xl border border-line bg-bg/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Фото страви"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-sm">
                <p className="text-cream">Фото додано</p>
                <p className="text-xs text-muted">
                  Сомельє визначить страву та підбере пару.
                </p>
              </div>
              <button
                onClick={() => {
                  setImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-xs text-muted hover:text-gold"
              >
                Прибрати
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg/40 px-4 py-3 text-sm text-muted transition-colors hover:border-gold/50 hover:text-gold"
            >
              <span className="text-gold">📷</span> Сфотографувати або завантажити
              страву
            </button>
          )}
        </div>

        <button
          onClick={ask}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gold px-6 py-4 font-display text-lg font-semibold tracking-wide text-bg transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Сомельє обирає…" : "Спитати сомельє"}
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-gold-soft">{error}</p>
        )}
      </div>

      {/* Стан очікування */}
      {loading && (
        <div className="mx-auto mt-8 max-w-md text-center">
          <p className="animate-glow font-display text-xl text-gold">
            Дегустуємо варіанти під вашу страву…
          </p>
        </div>
      )}

      {/* Результати */}
      {result && (
        <div ref={resultsRef} className="mt-14 scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            {result.recognizedDish && (
              <span className="mb-3 inline-block rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold-soft">
                На фото: {result.recognizedDish}
              </span>
            )}
            <p className="font-display text-2xl leading-snug text-cream">
              {result.intro}
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {result.recommendations.map((rec, i) => (
              <WineCard key={rec.wine.id} rec={rec} index={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
