const STEPS = [
  {
    n: "01",
    title: "Розгублений покупець",
    text: "Не знає, що взяти до вечері.",
  },
  {
    n: "02",
    title: "Опис вечері чи фото",
    text: "Пара слів або знімок страви.",
  },
  {
    n: "03",
    title: "3 варіанти з поясненням",
    text: "Бюджетно · золота середина · здивувати.",
  },
  {
    n: "04",
    title: "Купити / забронювати",
    text: "Обирає впевнено, часто дорожче.",
  },
  {
    n: "05",
    title: "Продаж і повернення",
    text: "Вищий чек і гість, що повертається.",
  },
];

export default function FunnelSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
          Як це продає
        </p>
        <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">
          Від «нічого не розумію» до впевненої покупки
        </h2>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className="relative rounded-2xl border border-line bg-bg-soft/50 p-5"
          >
            <span className="font-display text-3xl text-gold-gradient">
              {s.n}
            </span>
            <h3 className="mt-2 font-display text-xl text-cream">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
            {i < STEPS.length - 1 && (
              <span className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-gold/60 lg:block">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
