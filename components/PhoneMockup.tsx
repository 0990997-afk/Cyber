import type { ReactNode } from "react";

export default function PhoneMockup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/19] w-full max-w-[230px] rounded-[2.2rem] border-[6px] border-parchment/90 bg-barrel p-2.5 shadow-[0_30px_60px_-24px_rgba(31,31,31,0.35)] ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-parchment/90" />
      <div className="h-full w-full overflow-hidden rounded-[1.6rem] bg-cellar-2">
        {children}
      </div>
    </div>
  );
}
