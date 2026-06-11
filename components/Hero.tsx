import HeroChat from "./HeroChat";

export default function Hero() {
  return (
    <section className="hero-cinematic relative overflow-hidden">
      {/* Кінематографічний фон-плейсхолдер (заміна відео-циклу) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-ruby/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-terracotta/15 blur-3xl" />
        <span className="animate-float absolute right-[8%] top-[18%] hidden text-6xl opacity-70 sm:block lg:text-7xl">
          🍷
        </span>
        <span className="animate-float-slow absolute left-[6%] bottom-[14%] hidden text-5xl opacity-50 sm:block lg:text-6xl">
          🥂
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-5 py-16 sm:py-24 lg:flex-row lg:items-center lg:gap-16 lg:py-32">
        <div className="flex-1 text-center lg:text-left">
          <p className="animate-fade-up font-mono text-xs tracking-[0.4em] text-terracotta">
            CYBER SOMMELIER · AI-СОМЕЛЬЄ
          </p>

          <h1 className="animate-fade-up mt-5 text-balance font-ui text-4xl font-extrabold leading-[1.08] tracking-tight text-parchment sm:text-6xl lg:text-7xl">
            Ваш персональний{" "}
            <span className="text-ruby-gradient font-accent italic">AI-сомельє</span>
          </h1>

          <p className="animate-fade-up mt-6 text-balance text-lg leading-relaxed text-ash sm:text-xl">
            Обирайте ідеальне вино для будь-якої нагоди за лічені секунди.
          </p>
          <p className="animate-fade-up mt-3 max-w-xl text-balance leading-relaxed text-ash lg:mx-0">
            Сфотографуйте меню, винну полицю — або просто скажіть, що готуєте на
            вечерю. Cyber Sommelier зробить решту.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#studio"
              className="rounded-xl bg-ruby px-8 py-4 font-ui text-lg font-bold tracking-wide text-cellar shadow-[0_14px_36px_-12px_rgba(139,30,63,0.45)] transition-all hover:brightness-110"
            >
              Спробувати безкоштовно
            </a>
            <a
              href="#demo"
              className="flex items-center gap-2 rounded-xl border border-line px-8 py-4 font-ui text-lg font-semibold text-parchment transition-colors hover:border-ruby/40 hover:text-ruby"
            >
              ▶ Дивитись демо
            </a>
          </div>
        </div>

        {/* Чат-перевʼю — миттєво показує AI-сомельє у дії, особливо на мобільних */}
        <div className="flex w-full flex-1 justify-center lg:justify-end">
          <HeroChat />
        </div>
      </div>
    </section>
  );
}
