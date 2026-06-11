const SCENARIOS = [
  {
    icon: "🍽️",
    title: "У ресторані",
    text: "Оберіть ідеальне вино з довжелезної винної карти — без зайвих питань офіціанту.",
    gradient: "from-ruby/15 via-terracotta/10 to-transparent",
  },
  {
    icon: "🛒",
    title: "У магазині",
    text: "Знайдіть найкращу пляшку у вашому бюджеті прямо біля полиці.",
    gradient: "from-gold/20 via-terracotta/10 to-transparent",
  },
  {
    icon: "🕯️",
    title: "Романтична вечеря",
    text: "Справте враження, навіть якщо ніколи не розбиралися у вині.",
    gradient: "from-terracotta/15 via-ruby/10 to-transparent",
  },
  {
    icon: "🎁",
    title: "Вибір подарунка",
    text: "Підберіть ідеальне вино у подарунок — на будь-яку нагоду й бюджет.",
    gradient: "from-gold/20 via-ruby/10 to-transparent",
  },
];

export default function Scenarios() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">СЦЕНАРІЇ З ЖИТТЯ</p>
        <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          На кожен випадок є правильне вино
        </h2>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <div
            key={s.title}
            className={`animate-fade-up group relative overflow-hidden rounded-3xl border border-line bg-linear-to-br p-8 transition-transform duration-300 hover:-translate-y-1 ${s.gradient}`}
          >
            <span className="text-4xl">{s.icon}</span>
            <h3 className="mt-5 font-ui text-2xl font-bold text-parchment">{s.title}</h3>
            <p className="mt-2 max-w-sm text-balance leading-relaxed text-ash">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
