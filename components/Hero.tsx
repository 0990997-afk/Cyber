import Logo from "./Logo";

export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[92vh] w-full max-w-5xl flex-col items-center justify-center px-5 py-24 text-center">
      <div className="animate-rise">
        <Logo size="lg" tagline />
      </div>

      <p className="animate-rise mt-8 font-mono text-xs tracking-[0.4em] text-terracotta sm:text-sm">
        — АЛГОРИТМ ІЗ СМАКОМ —
      </p>

      <h1 className="animate-rise mt-6 max-w-3xl text-balance font-ui text-4xl font-extrabold leading-[1.08] tracking-tight text-parchment sm:text-6xl">
        Сфотографуйте вечерю.
        <br />
        <span className="text-copper-gradient">Ми підберемо ідеальне вино.</span>
      </h1>

      <p className="animate-rise mt-6 max-w-xl text-balance text-lg leading-relaxed text-ash">
        AI аналізує страву, її смаковий профіль та бюджет — і рекомендує найкращі
        вина за секунди. З поясненням людською мовою, без снобізму.
      </p>

      <div className="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#studio"
          className="rounded-xl bg-terracotta px-8 py-4 font-ui text-lg font-bold tracking-wide text-cellar transition-all hover:brightness-110 hover:shadow-[0_10px_36px_-8px_rgba(200,121,58,0.5)]"
        >
          📸 Спробувати зараз
        </a>
        <a
          href="#how"
          className="text-sm text-ash underline-offset-4 transition-colors hover:text-terracotta hover:underline"
        >
          Як це працює ↓
        </a>
      </div>
    </section>
  );
}
