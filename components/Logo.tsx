export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      {/* чип */}
      <rect x="7" y="7" width="50" height="50" rx="13" stroke="currentColor" strokeWidth="1.5" />
      {/* контакти-доріжки */}
      <path d="M7 22h-4M7 32h-4M7 42h-4M61 22h4M61 32h4M61 42h4M22 7v-4M32 7v-4M42 7v-4M22 61v4M32 61v4M42 61v4"
        stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      {/* келих */}
      <path d="M25 19h14c0 7-3.2 11.5-7 11.5S25 26 25 19Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 30.5V44M26.5 44h11" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="24" r="2.4" fill="currentColor" />
      {/* нейровузли */}
      <circle cx="18" cy="44" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="46" cy="44" r="1.8" fill="currentColor" opacity="0.7" />
      <path d="M19.6 44H26.5M37.5 44h6.9" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
    </svg>
  );
}

export default function Logo({
  size = "sm",
  tagline = false,
}: {
  size?: "sm" | "lg";
  tagline?: boolean;
}) {
  const lg = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={`${lg ? "h-16 w-16" : "h-9 w-9"} text-terracotta`} />
      <div className="leading-none">
        <div
          className={`font-ui font-extrabold tracking-[0.1em] text-parchment ${lg ? "text-3xl sm:text-4xl" : "text-lg"}`}
        >
          КІБЕР<span className="text-terracotta">-</span>
          <span className="font-accent font-medium italic text-terracotta">
            сомельє
          </span>
        </div>
        {tagline && (
          <div
            className={`font-mono tracking-[0.28em] text-ash ${lg ? "mt-2 text-[11px]" : "mt-1 text-[9px]"}`}
          >
            AI-DRIVEN WINE EXPERTISE
          </div>
        )}
      </div>
    </div>
  );
}
