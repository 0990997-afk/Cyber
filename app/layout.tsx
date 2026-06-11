import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cyber Sommelier — ваш персональний AI-сомельє",
  description:
    "Сфотографуйте меню, винну полицю — або просто опишіть вечерю. Cyber Sommelier миттєво підбере ідеальне вино з поясненням людською мовою.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      className={`${manrope.variable} ${jetbrains.variable} ${playfair.variable} h-full`}
    >
      <body className="cellar-bg flex min-h-full flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
