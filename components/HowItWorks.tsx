const STEPS = [
  {
    n: "01",
    icon: "📸",
    title: "Сфотографуйте страву",
    text: "Наведіть камеру на тарілку — або просто опишіть, що буде на столі.",
  },
  {
    n: "02",
    icon: "🧠",
    title: "AI аналізує смак",
    text: "Жирність, інтенсивність, пряність, кислотність — алгоритм будує смаковий профіль страви.",
  },
  {
    n: "03",
    icon: "🍷",
    title: "Отримайте ідеальну пару",
    text: "Три вина на різний бюджет із Cyber Match Score, поясненням і порадою з подачі.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">
          ЯК ЦЕ ПРАЦЮЄ
        </p>
        <h2 className="mt-3 font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Від фото до бокала — три кроки
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-line bg-barrel/40 p-6 ring-copper"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{s.icon}</span>
              <span className="font-mono text-2xl text-gold">{s.n}</span>
            </div>
            <h3 className="mt-5 font-ui text-xl font-bold text-parchment">
              {s.title}
            </h3>
            <p className="mt-2 leading-relaxed text-ash">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
