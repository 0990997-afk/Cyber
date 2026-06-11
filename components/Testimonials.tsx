const TESTIMONIALS = [
  {
    quote:
      "Раніше я завжди губилася у винній карті й брала навмання. Тепер просто фотографую — і знаю, що буде смачно.",
    name: "Олена К.",
    role: "Гостя ресторану",
    avatar: "О",
  },
  {
    quote:
      "За 10 секунд отримав пораду, яка б зайняла 10 хвилин розмови з сомельє. І пояснення — людською мовою.",
    name: "Дмитро П.",
    role: "Любитель вина",
    avatar: "Д",
  },
  {
    quote:
      "Встановили QR-коди на столи — гості стали впевненіше обирати вино, а середній чек з напоїв помітно виріс.",
    name: "Марія С.",
    role: "Власниця ресторану",
    avatar: "М",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ВІДГУКИ</p>
        <h2 className="mt-3 text-balance font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Просто. Впевнено. Смачно.
        </h2>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="animate-fade-up flex flex-col rounded-3xl border border-line bg-barrel p-7 shadow-[0_18px_44px_-28px_rgba(31,31,31,0.3)]"
          >
            <span className="font-accent text-4xl italic text-gold">“</span>
            <blockquote className="mt-2 flex-1 text-balance leading-relaxed text-parchment">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby/10 font-ui font-bold text-ruby">
                {t.avatar}
              </span>
              <div>
                <p className="font-ui text-sm font-bold text-parchment">{t.name}</p>
                <p className="text-xs text-ash">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
