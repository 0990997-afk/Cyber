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

const TITLE = "Cyber Sommelier — AI Sommelier & Wine Pairing Assistant";
const DESCRIPTION =
  "Сфотографуйте страву — Cyber Sommelier миттєво розпізнає її та підбере ідеальне вино з поясненням людською мовою. AI-сомельє: від фото страви до рекомендації вина.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI Sommelier",
    "Wine Pairing Assistant",
    "Food Photo to Wine Recommendation",
    "AI-сомельє",
    "підбір вина",
    "вино до страви",
  ],
  applicationName: "Cyber Sommelier",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Cyber Sommelier",
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
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
