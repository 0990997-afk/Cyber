export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* профіль голови */}
      <path
        d="M95 230 C80 225 72 211 70 193 C44 185 43 118 51 86 C60 48 98 29 130 38 C152 44 167 64 177 93 C181 106 186 113 192 122 C188 132 176 130 170 134 C176 142 174 149 169 153 C177 159 178 173 172 185 C161 199 142 198 133 208 C128 214 127 222 127 230"
        strokeWidth="7"
      />
      {/* чип-«мозок» */}
      <rect x="75" y="75" width="70" height="70" rx="13" strokeWidth="5" />
      {/* контакти */}
      <path
        d="M75 92H57 M75 110H57 M75 128H57 M92 75V57 M110 75V57 M128 75V57 M92 145V163 M110 145V163 M128 145V163 M145 92H163 M145 110H163 M145 128H163"
        strokeWidth="3.4"
      />
      <g fill="currentColor" stroke="none">
        {/* нейровузли */}
        <circle cx="52" cy="92" r="4.4" /><circle cx="52" cy="110" r="4.4" /><circle cx="52" cy="128" r="4.4" />
        <circle cx="92" cy="52" r="4.4" /><circle cx="110" cy="52" r="4.4" /><circle cx="128" cy="52" r="4.4" />
        <circle cx="92" cy="168" r="4.4" /><circle cx="110" cy="168" r="4.4" /><circle cx="128" cy="168" r="4.4" />
        <circle cx="168" cy="92" r="4.4" /><circle cx="168" cy="110" r="4.4" /><circle cx="168" cy="128" r="4.4" />
        {/* пляшка */}
        <path d="M101 90h7v12c6 2 7 8 7 14v20c0 4-3 6-6 6h-9c-3 0-6-2-6-6v-20c0-6 1-12 7-14z" />
        {/* келих */}
        <path d="M119 104h20c0 10-6 17-10 17s-10-7-10-17z" />
        <rect x="127" y="120" width="3" height="16" />
        <rect x="120" y="136" width="17" height="3.4" rx="1" />
      </g>
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
      <LogoMark className={`${lg ? "h-16 w-16" : "h-9 w-9"} text-parchment`} />
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
