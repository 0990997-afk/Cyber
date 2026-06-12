# Cyber Sommelier — Public MVP Release

First public release of **Cyber Sommelier**, an AI Sommelier & Wine Pairing
Assistant: describe a dish (text or voice) or upload a food photo, and get a
structured taste analysis plus three wine recommendations (budget / middle /
premium) with human-sounding explanations.

## Highlights

- **AI Sommelier core**: Claude (`claude-opus-4-8`) analyzes the dish and
  recommends 3 wines per request, each with a match score, serving
  temperature, decanting advice, food pairing snack, and an alternative
  suggestion.
- **Food Photo to Wine Recommendation**: upload a photo of a dish (or menu /
  wine shelf) — Claude Vision identifies the dish, ingredients, cuisine
  style, and cooking method, with an honest confidence score.
- **Honest sommelier**: every result includes a "what to avoid" tip
  (`avoid`), and an honest note (`honestNote`) when wine isn't the best
  pairing for the dish.
- **Resilient pipeline**: Claude with web search + reasoning → Claude with
  reasoning only → Claude plain → local deterministic fallback (~300-wine
  catalog). Every step degrades gracefully — the app never shows a raw error.
- **Honest demo mode**: when no `ANTHROPIC_API_KEY` is configured (or all AI
  attempts fail), the UI clearly labels results as a demo recommendation
  (with a distinct message when a photo couldn't actually be analyzed).
- **Production-ready landing page**: redesigned in a premium "wine cellar"
  light aesthetic, mobile-first, with an AI chat-style sommelier studio,
  scenarios, product demo, benefits, B2B section for restaurants, and
  testimonials.
- **Trust elements**: visible badges in the studio communicate what the
  product actually does — AI-powered recommendations, real photo analysis,
  fast results, Ukrainian interface.
- **SEO**: page metadata, Open Graph and Twitter card tags, targeting "AI
  Sommelier", "Wine Pairing Assistant", and "Food Photo to Wine
  Recommendation".
- **Analytics**: `@vercel/analytics` and `@vercel/speed-insights` wired into
  the root layout — zero-config page view + Web Vitals tracking once deployed
  on Vercel (no-op locally and on other hosts).
- **Error monitoring**: `app/error.tsx` and `app/global-error.tsx` provide
  Ukrainian-language fallback UIs with retry, and log uncaught
  errors/exceptions to the console (captured in Vercel function/runtime logs).
- **Mobile conversion**: persistent mobile-only "Підібрати вино зараз" CTA bar
  (`components/MobileCTA.tsx`) keeps the primary action one tap away while
  scrolling the landing page.

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No (recommended for production) | Enables Claude-powered vision analysis, dish reasoning, and web-search-enriched recommendations. **Without it, the app runs in deterministic fallback/demo mode** using only the local wine catalog — no network calls, and the UI labels results as demo. |

The following variables are documented as **reserved extension points only**
and are **not** read by the app in this MVP: `OPENAI_API_KEY`,
`TAVILY_API_KEY`, `SERPAPI_API_KEY`, `PERPLEXITY_API_KEY`. See `README.md`
for details.

## Local verification checklist

```bash
npm run lint        # eslint — clean, no warnings
npm run typecheck    # tsc --noEmit — clean
npm run build         # next build — production build succeeds
```

Manually verified flows:
- Text-only dish description → recommendations (fallback mode, no API key).
- Food photo upload → demo banner with "without AI photo analysis" notice
  (fallback mode).
- Unsupported image format → clear Ukrainian error.
- Oversized image (>5MB) → clear Ukrainian error.
- Malformed request body → clear Ukrainian error.
- Mobile layout (390px viewport) — studio, trust badges, result cards.

## Deployment (Vercel)

1. Push this repository to GitHub (already done for this branch).
2. Import the project into Vercel — framework is auto-detected as Next.js.
3. Add the `ANTHROPIC_API_KEY` environment variable in the Vercel project
   settings (Production + Preview) to enable live AI recommendations.
   Without it, the deployed app runs correctly in fallback/demo mode.
4. Deploy. `app/api/somelye/route.ts` runs on the Node.js runtime
   (`runtime = "nodejs"`) with a 60-second max duration, sufficient for the
   Claude resilience chain (each attempt capped at 25s).

## Known risks / follow-ups

- No automated test suite yet — verification relies on lint, typecheck,
  build, and manual flow testing.
- Wine catalog is generated/deterministic, not sourced from a live
  inventory — pricing and availability are illustrative.
- "Купити" / "Забронювати" buttons are demo-only (no real cart or payment
  integration).
- Hero/section media are placeholders pending real photography/video assets.

## Next milestone (suggested)

Wire up real-world data for restaurant wine lists / inventory (per-venue
catalog instead of the generic ~300-wine catalog), and add basic analytics
to measure which dish→wine pairings get the most engagement — both are
prerequisites before pitching individual restaurants as B2B customers.

## v1.0 production launch — status

- **Production deployment**: this branch is build/lint/typecheck-clean and
  ready to import into Vercel. Creating the live deployment and a public URL
  requires access to a Vercel account/project connected to this GitHub
  repository, which this session does not have. Follow
  `docs/deploy-checklist.md` for the full step-by-step (Vercel dashboard →
  Import Project → select this repo/branch → set `ANTHROPIC_API_KEY` →
  Deploy → post-deploy verification).
- **Claude Vision in production**: the vision pipeline (`lib/sommelier.ts`)
  is implemented and was validated against the fallback path in this
  environment (no `ANTHROPIC_API_KEY` available here). Once deployed with a
  real key, verify by uploading a food photo and confirming `engine` is
  `"claude"`/`"claude+web"` and `photo.detectedDish` reflects the actual
  image (see `docs/deploy-checklist.md`, step 5).
- **30-photo real-world test set**: not run in this session — no internet
  access to source real food photos and no Anthropic API key to call Vision.
  A structured test plan covering cuisine variety, edge cases (blurry/low
  light, non-food images, multi-dish plates), and regional dishes is ready
  at `docs/vision-test-checklist.md` — run it post-deploy against the live
  URL.
