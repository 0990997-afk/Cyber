export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-ruby via-[#6c1730] to-terracotta" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background:radial-gradient(80%_60%_at_50%_0%,rgba(215,181,109,0.5),transparent)]" />
      <span className="animate-float absolute left-[10%] top-[18%] hidden text-6xl opacity-20 sm:block">🍷</span>
      <span className="animate-float-slow absolute right-[12%] bottom-[16%] hidden text-7xl opacity-15 sm:block">🥂</span>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-24 text-center sm:py-32">
        <p className="animate-fade-up font-mono text-xs tracking-[0.4em] text-cellar/70">
          CYBER SOMMELIER
        </p>
        <h2 className="animate-fade-up mt-4 text-balance font-ui text-4xl font-extrabold leading-[1.1] text-cellar sm:text-5xl">
          Ваш сомельє завжди поруч
        </h2>
        <p className="animate-fade-up mt-5 max-w-xl text-balance text-lg leading-relaxed text-cellar/80">
          Зробіть кожну пляшку вдалим вибором — де б ви не були.
        </p>
        <a
          href="#studio"
          className="animate-fade-up mt-9 rounded-xl bg-cellar px-9 py-4 font-ui text-lg font-bold text-ruby shadow-[0_18px_44px_-16px_rgba(0,0,0,0.35)] transition-all hover:brightness-105"
        >
          Почати безкоштовно
        </a>
      </div>
    </section>
  );
}
