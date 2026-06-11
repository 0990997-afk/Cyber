import PhoneMockup from "./PhoneMockup";

const STEPS = [
  {
    n: "01",
    icon: "📸",
    title: "Зробіть фото",
    text: "Сфотографуйте меню ресторану, винну карту або полицю в магазині.",
    screen: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <span className="text-4xl">📋</span>
        <p className="font-mono text-[10px] tracking-[0.2em] text-ash">СКАНУЮ МЕНЮ…</p>
        <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-line">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-ruby" />
        </div>
      </div>
    ),
  },
  {
    n: "02",
    icon: "🤖",
    title: "AI аналізує",
    text: "Cyber Sommelier розпізнає страви, вина, регіони, сорти винограду та ціни.",
    screen: (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        {["Стравa: рібай стейк", "Регіон: Ріоха", "Сорт: Темпранільйо", "Бюджет: €18–35"].map((t) => (
          <div key={t} className="rounded-lg bg-barrel px-3 py-2 font-mono text-[10px] text-parchment">
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "03",
    icon: "🍷",
    title: "Отримайте пораду",
    text: "Просте пояснення: яке вино, чому саме воно — і альтернативи.",
    screen: (
      <div className="flex h-full flex-col justify-center gap-3 p-4">
        <div className="rounded-2xl bg-ruby px-3 py-2.5 text-center font-ui text-sm font-bold text-cellar">
          Rioja Reserva 2020
        </div>
        <p className="text-center text-[11px] leading-relaxed text-ash">
          Стиглі таніни врівноважують жирність стейка — класична пара.
        </p>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ЯК ЦЕ ПРАЦЮЄ</p>
        <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Від фото до келиха — три кроки
        </h2>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
        {STEPS.map((s) => (
          <div key={s.n} className="animate-fade-up flex flex-col items-center text-center">
            <PhoneMockup>{s.screen}</PhoneMockup>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="font-mono text-sm text-gold">{s.n}</span>
            </div>
            <h3 className="mt-2 font-ui text-xl font-bold text-parchment">{s.title}</h3>
            <p className="mt-2 max-w-xs text-balance leading-relaxed text-ash">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
