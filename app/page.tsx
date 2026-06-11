import Logo from "@/components/Logo";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SommelierStudio from "@/components/SommelierStudio";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-cellar/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <a
            href="#studio"
            className="rounded-lg border border-terracotta/40 px-4 py-2 text-sm text-terracotta transition-colors hover:bg-terracotta/10"
          >
            Спробувати
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <div className="hairline mx-auto max-w-5xl" />
        <HowItWorks />
        <SommelierStudio />
      </main>

      <Footer />
    </>
  );
}
