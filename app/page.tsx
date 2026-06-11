import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import SommelierStudio from "@/components/SommelierStudio";
import FunnelSection from "@/components/FunnelSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl tracking-[0.22em] text-cream">
            ТЕРАСА
          </span>
          <a
            href="#somelye"
            className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
          >
            Спитати сомельє
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <div className="hairline mx-auto max-w-5xl" />
        <Problem />
        <SommelierStudio />
        <div className="hairline mx-auto max-w-5xl" />
        <FunnelSection />
      </main>

      <Footer />
    </>
  );
}
