"use client";

import { useEffect, useState } from "react";
import PhoneMockup from "./PhoneMockup";

type Bubble =
  | { from: "user"; kind: "photo"; text: string }
  | { from: "ai"; kind: "typing" }
  | { from: "ai"; kind: "text"; text: string }
  | { from: "ai"; kind: "wine"; name: string; text: string };

const SCRIPT: Bubble[] = [
  { from: "user", kind: "photo", text: "📷 Фото меню" },
  { from: "ai", kind: "typing" },
  { from: "ai", kind: "text", text: "Бачу «Рібай стейк на грилі» — соковито й насичено." },
  { from: "ai", kind: "typing" },
  {
    from: "ai",
    kind: "wine",
    name: "Rioja Reserva 2020",
    text: "Стиглі таніни розрізають жирність м’яса, а нотки ванілі від витримки в дубі підкреслюють смак грилю.",
  },
];

const STEP_DELAY = 1400;

export default function ProductDemo() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= SCRIPT.length) {
      const reset = setTimeout(() => setVisible(0), STEP_DELAY * 2);
      return () => clearTimeout(reset);
    }
    const id = setTimeout(() => setVisible((v) => v + 1), STEP_DELAY);
    return () => clearTimeout(id);
  }, [visible]);

  const shown = SCRIPT.slice(0, visible);

  return (
    <section id="demo" className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ЖИВЕ ДЕМО</p>
          <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
            Сфотографуйте меню — отримайте відповідь за секунди
          </h2>
          <p className="mt-4 text-balance leading-relaxed text-ash">
            Cyber Sommelier розпізнає страву, аналізує винну карту та одразу
            пояснює, чому саме це вино — найкращий вибір до вашої вечері.
          </p>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <PhoneMockup className="max-w-[280px]">
            <div className="flex h-full flex-col gap-2.5 overflow-hidden p-3.5">
              <div className="border-b border-line pb-2 text-center">
                <p className="font-ui text-xs font-bold text-parchment">Cyber Sommelier</p>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-2.5">
                {shown.map((b, i) => (
                  <div
                    key={i}
                    className={`animate-fade-up flex ${b.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {b.kind === "typing" ? (
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-barrel px-3 py-2.5">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-ash"
                            style={{ animationDelay: `${d * 0.15}s` }}
                          />
                        ))}
                      </div>
                    ) : b.kind === "wine" ? (
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-ruby px-3 py-2.5">
                        <p className="font-ui text-sm font-bold text-cellar">{b.name}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-cellar/85">{b.text}</p>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-[11px] leading-relaxed ${
                          b.from === "user"
                            ? "rounded-br-sm bg-terracotta text-cellar"
                            : "rounded-bl-sm bg-barrel text-parchment"
                        }`}
                      >
                        {b.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
