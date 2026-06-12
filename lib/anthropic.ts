import Anthropic from "@anthropic-ai/sdk";

// Клієнт ініціалізується лише на сервері (API-route). Ключ ANTHROPIC_API_KEY
// ніколи не потрапляє у браузер. Якщо ключа немає — повертаємо null, і логіка
// сомельє перемикається на детермінований fallback із каталогу.

let cached: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // maxRetries: 0 — наш власний resilience-ланцюг (lib/sommelier.ts) вже
  // перебирає кілька конфігурацій запиту; SDK-ретраї лише множили б час
  // очікування й могли перевищити maxDuration маршруту (60s).
  cached = apiKey ? new Anthropic({ apiKey, maxRetries: 0 }) : null;
  return cached;
}

export const SOMMELIER_MODEL = "claude-sonnet-4-6";
