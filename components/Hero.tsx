export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
      {/* келих-мотив */}
      <svg
        viewBox="0 0 48 64"
        className="mb-8 h-14 w-auto text-gold animate-rise"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 6h24c0 12-5 20-12 20S12 18 12 6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M16 9h16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path
          d="M24 26v24M16 56h16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="16" r="3" fill="currentColor" opacity="0.7" />
      </svg>

      <p className="animate-rise font-display text-xs uppercase tracking-[0.5em] text-gold sm:text-sm">
        Винотека
      </p>
      <h1 className="animate-rise mt-3 font-display text-6xl tracking-[0.18em] text-cream sm:text-8xl">
        ТЕРАСА
      </h1>

      <p className="animate-rise mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted sm:text-xl">
        Сотні етикеток. Нуль розуміння, що брати. У «Терасі» вас зустрічає
        <span className="text-cream"> AI-сомельє</span>: опишіть вечерю — і
        отримайте вино, на яке наважитесь із задоволенням.
      </p>

      <div className="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#somelye"
          className="rounded-xl bg-gold px-8 py-4 font-display text-lg font-semibold tracking-wide text-bg transition-all hover:bg-gold-soft hover:shadow-[0_8px_30px_rgba(201,162,75,0.35)]"
        >
          Спитайте сомельє
        </a>
        <a
          href="#somelye"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          Дивись, що до твоєї вечері за 15 секунд ↓
        </a>
      </div>
    </section>
  );
}
