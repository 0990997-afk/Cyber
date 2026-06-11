@AGENTS.md

# КІБЕР-СОМЕЛЬЄ — project notes for AI assistants

## What this is
A Ukrainian-language Next.js demo app for a fictional wine bar **«Тераса»**: an
AI sommelier that recommends 3 wines (budget / middle / premium) for a dish the
guest describes or photographs, with human-sounding explanations of the pairing.

## Stack
- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
- `@anthropic-ai/sdk` for the Claude integration
- Deployed on Vercel

⚠️ **Next.js 16 has breaking changes vs. older versions you may know from
training.** Before touching App Router conventions, routing, config, or
fonts/metadata APIs, check `node_modules/next/dist/docs/` for the current
behavior — don't assume Next 13/14 patterns apply.

## Running locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
- If `ANTHROPIC_API_KEY` is not set in `.env.local`, the app runs in
  deterministic **fallback mode** (`engine: "fallback"`) using only the local
  wine catalog — no network calls. This keeps demos working without a key.
- Node may not be on PATH globally; if missing, it's at `~/.local/node/bin`.

## Architecture
```
app/
  layout.tsx            root layout, fonts (Manrope/JetBrains Mono/Playfair), metadata
  page.tsx              landing page composition (Header, Hero, HowItWorks, SommelierStudio, Footer)
  globals.css           Tailwind v4 theme tokens (@theme), color palette, animations
  api/somelye/route.ts  POST endpoint: validates input → runSommelier() → JSON
lib/
  types.ts              shared types (Wine, DishAnalysis, WineRec, SommelierInput/Result) — no "server-only", safe for client
  anthropic.ts          Anthropic client factory (server-only); returns null if no API key → triggers fallback
  sommelier.ts          core logic: prompt building, Claude calls (with web search + thinking), JSON parsing/validation, fallback assembly
  wines.ts              ~300-wine catalog generated deterministically from grape archetypes; dish analysis heuristics, pairing/match scoring
components/
  Hero, HowItWorks, SommelierStudio, WineCard, TasteProfile, Footer, Logo
docs/                    pitch.md, reels-script.md, funnel-map.md (marketing materials, not code)
```

## Key conventions
- **All UI text and code comments are in Ukrainian.** Keep new user-facing
  copy and existing comment style in Ukrainian unless told otherwise.
- **Server/client boundary**: `lib/anthropic.ts` and `lib/sommelier.ts` import
  `"server-only"` and must never be imported from client components.
  `lib/types.ts` and `lib/wines.ts` have no server-only data and are safe
  everywhere.
- **`ANTHROPIC_API_KEY`** lives only on the server (read in `lib/anthropic.ts`);
  never expose it to the browser.
- **Model**: `SOMMELIER_MODEL` in `lib/anthropic.ts` is `claude-opus-4-8`. Don't
  hardcode model names elsewhere — import this constant.
- **Resilience pattern in `runSommelier`**: tries Claude with web search +
  thinking → Claude without web search → Claude without thinking → local
  deterministic fallback. Each step degrades gracefully; never let the API
  route throw past `route.ts`'s try/catch.
- **Wine catalog (`lib/wines.ts`)** is generated, not hand-curated — derived
  from `ARCHETYPES` (grape profiles) × regions × quality tiers × years. Tier
  (`budget`/`middle`/`premium`) is computed from price via `tierForPrice`.
  Don't hand-edit individual wine entries; adjust archetypes/regions instead.
- **Image input**: `app/api/somelye/route.ts` validates data URLs — only
  jpeg/png/webp/gif, max 5 MB. Keep these checks if modifying image handling.
- **Styling**: Tailwind v4 with custom theme tokens defined in `app/globals.css`
  via `@theme` (e.g. `cellar`, `barrel`, `terracotta`, `ruby`, `gold`, `parchment`,
  `ash`, `line`). Use these semantic color names rather than raw hex/Tailwind
  defaults to stay consistent with the warm "wine cellar / parchment" look.

## Linting / type-checking
- `npm run lint` uses `eslint-config-next` (core-web-vitals + typescript) via
  flat config (`eslint.config.mjs`).
- `tsconfig.json` is `strict: true` with `@/*` path alias to repo root.
