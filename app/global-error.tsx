"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="uk">
      <body className="cellar-bg flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-terracotta">КРИТИЧНА ПОМИЛКА</p>
        <h1 className="mt-4 font-ui text-3xl font-extrabold text-parchment sm:text-4xl">
          Cyber Sommelier зараз недоступний
        </h1>
        <p className="mt-3 max-w-md text-ash">
          Спробуйте оновити сторінку через кілька секунд.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="mt-8 rounded-xl bg-ruby px-6 py-3 font-ui font-bold text-cellar transition hover:brightness-110"
        >
          Спробувати ще раз
        </button>
      </body>
    </html>
  );
}
