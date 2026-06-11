import Logo from "@/components/Logo";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Scenarios from "@/components/Scenarios";
import ProductDemo from "@/components/ProductDemo";
import SommelierStudio from "@/components/SommelierStudio";
import Benefits from "@/components/Benefits";
import ForRestaurants from "@/components/ForRestaurants";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-cellar/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <a
            href="#studio"
            className="rounded-lg border border-ruby/30 px-4 py-2 text-sm font-semibold text-ruby transition-colors hover:bg-ruby/10"
          >
            Спробувати
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <div className="hairline mx-auto max-w-5xl" />
        <HowItWorks />
        <Scenarios />
        <ProductDemo />
        <SommelierStudio />
        <Benefits />
        <ForRestaurants />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
