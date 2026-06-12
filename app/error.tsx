"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-terracotta">ЩОСЬ ПІШЛО НЕ ТАК</p>
      <h1 className="mt-4 font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
        Сторінка тимчасово недоступна
      </h1>
      <p className="mt-3 max-w-md text-ash">
        Сомельє на хвилинку відійшов. Спробуйте оновити сторінку.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-8 rounded-xl bg-ruby px-6 py-3 font-ui font-bold text-cellar transition hover:brightness-110"
      >
        Спробувати ще раз
      </button>
    </div>
  );
}
