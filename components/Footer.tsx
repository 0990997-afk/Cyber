import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="font-mono text-[11px] tracking-[0.2em] text-ash">
            — АЛГОРИТМ ІЗ СМАКОМ —
          </p>
        </div>
        <div className="font-mono text-[11px] leading-relaxed text-ash/70">
          <p>Прототип · хакатон AI-агентів</p>
          <p className="mt-1">18+ · Помірне споживання — частина смаку</p>
        </div>
      </div>
    </footer>
  );
}
