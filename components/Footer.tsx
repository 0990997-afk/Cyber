export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-2xl tracking-[0.18em] text-cream">
            ТЕРАСА
          </p>
          <p className="mt-1 text-sm text-muted">
            Винотека з AI-сомельє · продаємо впевненість, а не етикетку
          </p>
        </div>
        <div className="text-xs text-muted/70">
          <p>Прототип · хакатон AI-агентів</p>
          <p className="mt-1">18+ · Помірне споживання — частина смаку</p>
        </div>
      </div>
    </footer>
  );
}
