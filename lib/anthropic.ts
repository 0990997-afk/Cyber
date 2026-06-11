import Anthropic from "@anthropic-ai/sdk";

// Клієнт ініціалізується лише на сервері (API-route). Ключ ANTHROPIC_API_KEY
// ніколи не потрапляє у браузер. Якщо ключа немає — повертаємо null, і логіка
// сомельє перемикається на детермінований fallback із каталогу.

let cached: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cached = apiKey ? new Anthropic({ apiKey }) : null;
  return cached;
}

export const SOMMELIER_MODEL = "claude-opus-4-8";
