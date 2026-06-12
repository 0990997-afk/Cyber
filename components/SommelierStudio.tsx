"use client";

import { useEffect, useRef, useState } from "react";
import type { SommelierResult, Tier } from "@/lib/types";
import { TIER_ORDER, TIER_META } from "@/lib/types";
import TasteProfile from "./TasteProfile";
import WineCard from "./WineCard";
import PhotoAnalysisCard from "./PhotoAnalysisCard";

const QUICK = [
  "Рібай стейк",
  "Паста карбонара",
  "Суші",
  "Запечений лосось",
  "Сирна тарілка",
  "Піца пепероні",
  "Гостра азійська локшина",
  "Качка з апельсином",
];

const BUDGETS: { v: "any" | Tier; l: string }[] = [
  { v: "any", l: "Будь-який" },
  ...TIER_ORDER.map((t) => ({ v: t, l: TIER_META[t].label })),
];

const STEPS_PHOTO = [
  "AI аналізує фото…",
  "Визначає страву та інгредієнти…",
  "Будує смаковий профіль…",
  "Шукає реальні дані та ціни…",
  "Підбирає вино…",
];
const STEPS_TEXT = [
  "Читає опис страви…",
  "Будує смаковий профіль…",
  "Шукає реальні дані та ціни…",
  "Підбирає вино…",
];

// ── Web Speech (без any) ──────────────────────────────
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
function getRecognition(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

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
  const [voiceOk, setVoiceOk] = useState(false);
  const [ttsOk, setTtsOk] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [usedPhoto, setUsedPhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRec | null>(null);

  const steps = mode === "photo" ? STEPS_PHOTO : STEPS_TEXT;

  useEffect(() => {
    const id = setTimeout(() => {
      setVoiceOk(!!getRecognition());
      setTtsOk(typeof window !== "undefined" && "speechSynthesis" in window);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const arr = mode === "photo" ? STEPS_PHOTO : STEPS_TEXT;
    const resetId = setTimeout(() => setStep(0), 0);
    const id = setInterval(() => setStep((s) => (s + 1) % arr.length), 1100);
    return () => {
      clearTimeout(resetId);
      clearInterval(id);
    };
  }, [loading, mode]);

  function toggleVoice() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.lang = "uk-UA";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setDish(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function speak() {
    if (!result || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const parts: string[] = [`Аналіз страви: ${result.dish.name}.`];
      if (result.honestNote) parts.push(result.honestNote);
      for (const r of result.recommendations) {
        parts.push(`${TIER_META[r.tier].label}: ${r.name}, ${r.price}. ${r.why}`);
      }
      const u = new SpeechSynthesisUtterance(parts.join(" "));
      u.lang = "uk-UA";
      u.rate = 1;
      const v = window.speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith("uk"));
      if (v) u.voice = v;
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }

  function stopSpeak() {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ігноруємо
    }
    setSpeaking(false);
  }

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
    stopSpeak();
    setLoading(true);
    setError(null);
    setResult(null);
    setUsedPhoto(mode === "photo");
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
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">СПРОБУЙТЕ ЗАРАЗ</p>
        <h2 className="mt-3 font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Запитайте Cyber Sommelier
        </h2>
        <p className="mt-4 text-ash">
          Сфотографуйте, опишіть або скажіть голосом — отримаєте смаковий аналіз і
          три вина з поясненням. Агент звіряється з реальними даними.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            "🤖 AI-рекомендації вин",
            "📷 Аналіз фото страви",
            "⚡ Результат за секунди",
            "🇺🇦 Українською",
          ].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-line bg-barrel/60 px-3 py-1.5 font-mono text-[11px] tracking-[0.05em] text-ash"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-barrel/40 p-6 ring-copper sm:p-8">
        <div className="mx-auto flex w-full max-w-xs rounded-xl border border-line p-1 font-ui text-sm">
          {(["photo", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-4 py-2 font-semibold transition ${
                mode === m ? "bg-terracotta text-cellar" : "text-ash hover:text-parchment"
              }`}
            >
              {m === "photo" ? "📸 Фото" : "✍️ Текст / 🎙 Голос"}
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
                  <p className="text-xs text-ash">Vision AI визначить страву та профіль.</p>
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
                  Завантажте фото страви, меню або винної полиці
                </span>
                <span className="text-xs text-ash">JPG, PNG, WEBP або GIF · до 5 МБ</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm text-ash">Що буде на столі?</label>
              {voiceOk && (
                <button
                  onClick={toggleVoice}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                    listening
                      ? "border-terracotta bg-terracotta/15 text-terracotta"
                      : "border-line text-ash hover:border-terracotta/50 hover:text-terracotta"
                  }`}
                >
                  <span className={listening ? "animate-blink" : ""}>🎙</span>
                  {listening ? "Слухаю…" : "Сказати голосом"}
                </button>
              )}
            </div>
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

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-ash">
              Привід <span className="text-ash/50">(необовʼязково)</span>
            </label>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Нас четверо, хочу здивувати гостей…"
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
          className="mt-7 w-full rounded-xl bg-ruby px-6 py-4 font-ui text-lg font-bold text-cellar transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Аналізую…" : "Підібрати вино"}
        </button>

        {error && <p className="mt-4 text-center text-sm text-terracotta">{error}</p>}
      </div>

      {loading && (
        <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-line bg-barrel/40 p-6 ring-copper">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 animate-scan bg-linear-to-b from-terracotta/25 to-transparent" />
            <p className="font-mono text-xs tracking-[0.2em] text-terracotta">AI AGENT</p>
            <p className="mt-3 font-ui text-xl text-parchment">{steps[step % steps.length]}</p>
            <div className="mt-4 flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-terracotta" : "bg-cellar"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div ref={resRef} className="mt-14 scroll-mt-24 space-y-8">
          {result.demo && (
            <div className="flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-5">
              <span className="text-xl">🧪</span>
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-gold">ДЕМО-РЕЖИМ</p>
                <p className="mt-1 leading-relaxed text-parchment/90">
                  {usedPhoto
                    ? "Демо-рекомендація без AI-аналізу фото — підбір зроблено за локальним каталогом, без виклику Vision AI."
                    : "Демо-рекомендація — підбір зроблено за локальним каталогом, без звернення до AI."}
                </p>
              </div>
            </div>
          )}

          {result.photo && <PhotoAnalysisCard photo={result.photo} />}

          <TasteProfile dish={result.dish} />

          {result.honestNote && (
            <div className="flex gap-3 rounded-2xl border border-ruby/40 bg-ruby/10 p-5">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-terracotta">
                  ЧЕСНО ВІД СОМЕЛЬЄ
                </p>
                <p className="mt-1 leading-relaxed text-parchment/90">{result.honestNote}</p>
              </div>
            </div>
          )}

          <div>
            <div className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
              <p className="font-mono text-xs tracking-[0.25em] text-terracotta">
                ТРИ РЕКОМЕНДАЦІЇ
              </p>
              {ttsOk && (
                <button
                  onClick={speaking ? stopSpeak : speak}
                  className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-parchment transition hover:border-terracotta/50 hover:text-terracotta"
                >
                  {speaking ? "⏹ Зупинити" : "🔊 Прослухати рекомендацію"}
                </button>
              )}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {result.recommendations.map((rec, i) => (
                <WineCard key={rec.name + i} rec={rec} index={i} />
              ))}
            </div>
            {result.sources?.length > 0 && (
              <p className="mt-6 text-center font-mono text-[11px] tracking-[0.15em] text-ash/70">
                ДЖЕРЕЛА: {result.sources.join(" · ")}
              </p>
            )}
          </div>

          {result.avoid && (
            <div className="flex gap-3 rounded-2xl border border-line bg-cellar/40 p-5">
              <span className="text-xl">🚫</span>
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-terracotta">
                  ЧОГО УНИКАТИ
                </p>
                <p className="mt-1 leading-relaxed text-parchment/90">{result.avoid}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
