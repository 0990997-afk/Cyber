# Тераса — винотека з AI-сомельє 🍷

AI-сомельє для вигаданої винотеки **«Тераса»**. Гість описує вечерю/привід/бюджет —
або **фотографує страву** — а сомельє радить **2–3 конкретні вина з каталогу** і
по-людськи пояснює, чому саме вони. Мета: перетворити «я нічого не розумію у вині»
на впевнену, ще й дорожчу покупку.

> Ката №2 «AI-сомельє» · категорія: AI-агенти для вертикалей.

## Що всередині
- **Лендинг** у стилі «Вечірня тераса» (преміум-dark, Playfair Display + Manrope).
- **AI-сомельє** (`/api/somelye`): Claude **Opus 4.8** міркує про пару їжа+вино й
  обирає **виключно з каталогу** магазина → 3 цінові рівні з поясненням і закускою.
- **Мультимодальність:** фото страви → Claude vision впізнає блюдо → підбирає пару.
- **Надійний fallback:** без ключа/мережі працює детермінований підбір із каталогу,
  тож демо на сцені не падає (`engine: "fallback"` у відповіді).
- **Маркетинг-матеріали** в [`docs/`](docs/): [пітч](docs/pitch.md),
  [reels-сценарій](docs/reels-script.md), [funnel map](docs/funnel-map.md).

## Стек
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk`.
Деплой — Vercel.

## Локальний запуск
```bash
npm install
# Живий Claude (необов'язково — без ключа працює fallback):
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev      # http://localhost:3000
```
> Якщо у вас немає глобального Node, він стоїть локально в `~/.local/node/bin`
> (додайте в PATH: `export PATH="$HOME/.local/node/bin:$PATH"`).

## Змінні середовища
| Змінна | Призначення |
|---|---|
| `ANTHROPIC_API_KEY` | Ключ Anthropic (console.anthropic.com). **Не задано → fallback-режим.** Ключ лишається лише на сервері, у браузер не потрапляє. |

## Архітектура
```
app/
  page.tsx              лендинг (Hero · Problem · SommelierStudio · Funnel · Footer)
  api/somelye/route.ts  POST: вхід → Claude або fallback → JSON
lib/
  wines.ts              каталог (~27 вин, 3 рівні) + детермінований fallback-підбір
  sommelier.ts          промпт + виклик Claude Opus 4.8 (vision) + збирання 3 рівнів
  anthropic.ts          клієнт (ключ лише на сервері)
components/             Hero · Problem · SommelierStudio · WineCard · FunnelSection · Footer
docs/                   пітч · reels · funnel
```

## Деплой на Vercel
1. `git push` у GitHub-репозиторій.
2. Імпортувати проєкт у Vercel (framework визначиться як Next.js автоматично).
3. Додати env-змінну **`ANTHROPIC_API_KEY`** (Production).
4. Deploy → жива адреса для демо.

## Скоуп
Рекомендація + пояснення. Кнопки «Купити/Забронювати» — демо без реального кошика й оплати.
18+ · помірне споживання.
