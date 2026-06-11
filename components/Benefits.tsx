const BENEFITS = [
  {
    icon: "✨",
    title: "Впевненість",
    text: "Обирайте вино так, ніби ви — досвідчений сомельє.",
  },
  {
    icon: "⚡",
    title: "Швидкість",
    text: "Отримуйте персональну рекомендацію за лічені секунди.",
  },
  {
    icon: "🌍",
    title: "Відкриття",
    text: "Досліджуйте нові сорти та регіони без страху помилитися.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-cellar-2/60 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ПЕРЕВАГИ</p>
          <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
            Менше сумнівів. Більше задоволення.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="animate-fade-up text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-barrel text-3xl ring-1 ring-line">
                {b.icon}
              </span>
              <h3 className="mt-5 font-ui text-xl font-bold text-parchment">{b.title}</h3>
              <p className="mt-2 text-balance leading-relaxed text-ash">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
