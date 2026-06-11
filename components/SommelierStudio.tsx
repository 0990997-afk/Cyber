"use client";

import { useEffect, useRef, useState } from "react";
import type { SommelierResult, Tier } from "@/lib/types";
import { TIER_ORDER, TIER_META } from "@/lib/types";
import TasteProfile from "./TasteProfile";
import WineCard from "./WineCard";

const QUICK = [
  "Рібай стейк",
  "Паста карбонара",
  "Суші",
  "Запечений лосось",
  "Сирна тарілка",
  "Шашлик",
  "Гостра азійська локшина",
  "Качка з апельсином",
];

const BUDGETS: { v: "any" | Tier; l: string }[] = [
  { v: "any", l: "Будь-який" },
  ...TIER_ORDER.map((t) => ({ v: t, l: TIER_META[t].label })),
];

const STEPS = [
  "Зчитую страву…",
  "Будую смаковий профіль…",
  "Звіряю з базою вин…",
  "Підбираю ідеальну пару…",
];

function fileToScaledDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 1280;
      let { width, height } = img;
      if (width > max || height > max) {
        const r = Math.min(max / width, max / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("read fail"));
    img.src = url;
  });
}

export default function SommelierStudio() {
  const [mode, setMode] = useState<"photo" | "manual">("photo");
  const [dish, setDish] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState<"any" | Tier>("any");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SommelierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 850);
    return () => clearInterval(id);
  }, [loading]);

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
    if (mode === "photo" && !image) {
      setError("Завантажте фото страви 🙂");
      return;
    }
    if (mode === "manual" && !dish.trim()) {
      setError("Опишіть, що буде на столі.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/somelye", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dish: mode === "manual" ? dish : "",
          occasion,
          budget,
          image: mode === "photo" ? image : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Щось пішло не так.");
      else {
        setResult(data as SommelierResult);
        setTimeout(
          () => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          80,
        );
      }
    } catch {
      setError("Немає звʼязку із сомельє. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="studio" className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ДЕМО</p>
        <h2 className="mt-3 font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Спитайте кібер-сомельє
        </h2>
        <p className="mt-4 text-ash">
          Сфотографуйте страву або опишіть вечерю — отримайте смаковий аналіз і три
          вина з поясненням.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-barrel/40 p-6 ring-copper sm:p-8">
        {/* перемикач режимів */}
        <div className="mx-auto flex w-full max-w-xs rounded-xl border border-line p-1 font-ui text-sm">
          {(["photo", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-4 py-2 font-semibold transition ${
                mode === m ? "bg-terracotta text-cellar" : "text-ash hover:text-parchment"
              }`}
            >
              {m === "photo" ? "📸 Фото страви" : "✍️ Ввести вручну"}
            </button>
          ))}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        {mode === "photo" ? (
          <div className="mt-6">
            {image ? (
              <div className="flex items-center gap-4 rounded-xl border border-line bg-cellar/50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Страва" className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="text-parchment">Фото готове</p>
                  <p className="text-xs text-ash">AI визначить страву та смаковий профіль.</p>
                </div>
                <button
                  onClick={() => {
                    setImage(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-xs text-ash hover:text-terracotta"
                >
                  Прибрати
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-cellar/30 px-4 py-10 text-center transition hover:border-terracotta/50"
              >
                <span className="text-4xl">📷</span>
                <span className="font-ui font-semibold text-parchment">
                  Сфотографувати або завантажити страву
                </span>
                <span className="text-xs text-ash">JPG / PNG · обробляється локально</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <label className="block text-sm text-ash">Що буде на столі?</label>
            <textarea
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder="Напр.: рібай стейк середньої прожарки на вечерю вдвох"
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-line bg-cellar/50 px-4 py-3 text-parchment placeholder:text-ash/50 focus:border-terracotta/60 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setDish(q)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ash transition hover:border-terracotta/50 hover:text-terracotta"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* привід + бюджет */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-ash">
              Привід <span className="text-ash/50">(необовʼязково)</span>
            </label>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Романтична вечеря, зустріч друзів…"
              className="mt-2 w-full rounded-xl border border-line bg-cellar/50 px-4 py-3 text-parchment placeholder:text-ash/50 focus:border-terracotta/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-ash">Бюджет</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.v}
                  onClick={() => setBudget(b.v)}
                  className={`rounded-full border px-3 py-2 text-xs transition ${
                    budget === b.v
                      ? "border-terracotta bg-terracotta/15 text-terracotta"
                      : "border-line text-ash hover:border-terracotta/40"
                  }`}
                >
                  {b.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={ask}
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-terracotta px-6 py-4 font-ui text-lg font-bold text-cellar transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Аналізую…" : "Підібрати вино"}
        </button>

        {error && <p className="mt-4 text-center text-sm text-terracotta">{error}</p>}
      </div>

      {/* екран аналізу */}
      {loading && (
        <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-line bg-barrel/40 p-6 ring-copper">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 animate-scan bg-gradient-to-b from-terracotta/25 to-transparent" />
            <p className="font-mono text-xs tracking-[0.2em] text-terracotta">AI ANALYSIS</p>
            <p className="mt-3 font-ui text-xl text-parchment">{STEPS[step]}</p>
            <div className="mt-4 flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-terracotta" : "bg-cellar"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* результат */}
      {result && (
        <div ref={resRef} className="mt-14 scroll-mt-24 space-y-8">
          <TasteProfile dish={result.dish} />
          <div>
            <p className="mb-4 text-center font-mono text-xs tracking-[0.25em] text-terracotta">
              ТРИ РЕКОМЕНДАЦІЇ
            </p>
            <div className="grid gap-5 lg:grid-cols-3">
              {result.recommendations.map((rec, i) => (
                <WineCard key={rec.wine.id} rec={rec} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
