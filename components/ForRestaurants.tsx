const POINTS = [
  { icon: "📱", text: "AI-сомельє за QR-кодом прямо на столі" },
  { icon: "🤝", text: "Кращий досвід для гостей без зусиль персоналу" },
  { icon: "📈", text: "Більше продажів вина за рахунок впевнених рекомендацій" },
  { icon: "🍷", text: "Менше навантаження на офіціантів і сомельє" },
];

export default function ForRestaurants() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
      <div className="grid items-center gap-12 overflow-hidden rounded-3xl border border-line bg-linear-to-br from-ruby/5 via-barrel to-gold/10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ДЛЯ РЕСТОРАНІВ</p>
          <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
            Додайте AI-сомельє у свій заклад
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="text-xl">{p.icon}</span>
                <span className="leading-relaxed text-ash">{p.text}</span>
              </li>
            ))}
          </ul>
          <a
            href="#studio"
            className="mt-9 inline-flex rounded-xl bg-parchment px-7 py-3.5 font-ui text-base font-bold text-cellar transition-all hover:brightness-110"
          >
            Дізнатись більше
          </a>
        </div>

        <div className="flex justify-center">
          <div className="animate-fade-up relative flex aspect-square w-full max-w-xs items-center justify-center rounded-3xl border border-line bg-barrel shadow-[0_24px_60px_-24px_rgba(31,31,31,0.25)]">
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="grid h-28 w-28 grid-cols-5 grid-rows-5 gap-1 rounded-xl bg-parchment p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span
                    key={i}
                    className={`rounded-[2px] ${
                      [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24, 6, 8, 12, 16, 18].includes(i)
                        ? "bg-cellar"
                        : "bg-parchment"
                    }`}
                  />
                ))}
              </div>
              <p className="font-ui text-sm font-bold text-parchment">Скануйте — і келих сомельє у вас в кишені</p>
              <p className="text-xs text-ash">QR-код на кожному столі</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
