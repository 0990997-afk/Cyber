# Production deployment checklist (Vercel)

This is the step-by-step for taking `claude/claude-md-docs-cmr24m` (or
`main` once merged) live on Vercel and producing the public production URL.

## 1. Pre-flight (already done in this branch)

- [x] `npm run lint` — clean
- [x] `npm run typecheck` — clean
- [x] `npm run build` — succeeds
- [x] `@vercel/analytics` and `@vercel/speed-insights` wired into
      `app/layout.tsx` (zero-config on Vercel)
- [x] Error boundaries (`app/error.tsx`, `app/global-error.tsx`) in place
- [x] SEO metadata + Open Graph/Twitter tags in `app/layout.tsx`

## 2. Import the project into Vercel

1. Go to the Vercel dashboard → **Add New… → Project**.
2. Import the `0990997-afk/cyber` GitHub repository.
3. Select the branch to deploy (`claude/claude-md-docs-cmr24m` for a preview,
   or `main` for the production domain — merge first if you want `main` to
   be the production source).
4. Framework preset: **Next.js** (auto-detected). Build command
   `next build`, output handled automatically.

## 3. Environment variables (Project Settings → Environment Variables)

| Variable | Environments | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Production + Preview | **Required for live Claude Vision/recommendations.** Without it the app runs correctly in fallback/demo mode (UI shows a demo badge). |

Do **not** set `OPENAI_API_KEY`, `TAVILY_API_KEY`, `SERPAPI_API_KEY`, or
`PERPLEXITY_API_KEY` — they are reserved/unused in this MVP (see
`README.md`).

## 4. Deploy

Click **Deploy**. Vercel will build and assign a `*.vercel.app` URL
(Preview) and, if this is the production branch, the project's production
domain.

## 5. Post-deploy verification (run against the live URL)

- [ ] Load the homepage — confirm landing page renders, fonts load, no
      console errors.
- [ ] Open browser dev tools → Network — confirm `/api/somelye` responds
      `200` for a text-only request.
- [ ] **Claude Vision check**: upload a real food photo in the studio. With
      `ANTHROPIC_API_KEY` set, confirm the response has
      `"engine": "claude"` or `"claude+web"` (not `"fallback"`), and that
      `photo.detectedDish` accurately describes the uploaded image.
- [ ] **Fallback check**: temporarily unset `ANTHROPIC_API_KEY` (or test on
      a preview without it) — confirm `engine: "fallback"`, `demo: true`,
      and the UI shows the demo banner.
- [ ] **Error states**: upload an unsupported file type and an oversized
      file — confirm clear Ukrainian error messages, no 500s.
- [ ] **OG preview**: share the production URL link in a chat app (e.g.
      Telegram/Slack) or use a social-preview debugger to confirm the
      Open Graph title/description render.
- [ ] **Mobile pass**: open the production URL on a real phone — check the
      sticky CTA bar, photo upload (camera), and result cards.
- [ ] **Analytics**: in the Vercel dashboard, open the project's
      **Analytics** and **Speed Insights** tabs — confirm page views and
      Web Vitals start appearing after a few visits (data can take a few
      minutes to show up).
- [ ] **Error monitoring**: trigger an error path (e.g. malformed request)
      and check **Vercel → Project → Logs** for the corresponding
      `console.error` entries from `app/api/somelye/route.ts` /
      `app/error.tsx`.

## 6. 30-photo Vision test

See `docs/vision-test-checklist.md` for the structured test plan to run
once the production URL with a live `ANTHROPIC_API_KEY` is available.
