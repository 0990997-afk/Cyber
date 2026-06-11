import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Тераса — винотека з AI-сомельє",
  description:
    "Не знаєте, що взяти? Опишіть вечерю або сфотографуйте страву — AI-сомельє «Тераси» підбере 2–3 вина і по-людськи пояснить чому.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      className={`${playfair.variable} ${manrope.variable} h-full`}
    >
      <body className="terasa-bg flex min-h-full flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
