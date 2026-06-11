const POINTS = [
  {
    icon: "🍷",
    title: "Сотні етикеток",
    text: "Полиця лякає. Без підказки людина бере найдешевше або вже знайоме — і ніколи не куштує краще.",
  },
  {
    icon: "🗣️",
    title: "Сомельє не масштабується",
    text: "Жива консультація — це чудово, але один експерт не стоїть біля кожного гостя. А в онлайні його взагалі немає.",
  },
  {
    icon: "📉",
    title: "Магазин втрачає на чеку",
    text: "Ніхто не пояснив різницю — і дорожча пляшка лишається на полиці. Невпевненість коштує грошей.",
  },
];

export default function Problem() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
          Знайома ситуація
        </p>
        <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">
          Перед полицею з вином легко розгубитися
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-line bg-bg-soft/50 p-6"
          >
            <div className="text-3xl">{p.icon}</div>
            <h3 className="mt-4 font-display text-2xl text-cream">{p.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{p.text}</p>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center font-display text-2xl leading-snug text-cream">
        «Тераса» продає не етикетку, а{" "}
        <span className="text-gold-gradient">впевненість</span>. І робить це
        цілодобово.
      </p>
    </section>
  );
}
