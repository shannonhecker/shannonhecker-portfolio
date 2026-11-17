# shannonhecker.com

Shannon Hecker's public portfolio: five flagship case pages, ten earlier projects, Writing, About and an "Ask Shannon" chat. It is an Astro project with static output. The old static HTML site lives on the `legacy-static` branch.

## Run

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serves dist/ on http://localhost:4321
```

## Test

```sh
npm run build
npx playwright test          # set PW_CHROMIUM_PATH to a local Chromium if needed
npm run check:public         # nothing from the private panel version leaks into dist/
npm run check:copy           # no em dashes or en dashes in built pages
npm run check:redirects      # vercel.json matches every old address (reads the legacy-static branch)
node scripts/qa-shots.mjs    # screenshots at 390x844 and 1440x900, dark and light, in test-results/qa-shots/
```

`npx astro check` runs the type check. CI runs all of this plus a Lighthouse budget (95 or more) and a link check.

## Where content lives

| What | Where |
|---|---|
| Flagship case pages | `src/pages/fx.astro`, `fusion.astro`, `winking-star.astro`, `deal-model.astro`, `uoaui.astro` |
| Ten earlier projects | `src/content/earlier/*.md`, shown at `/work/<slug>` |
| Writing | `src/content/writing/*.md`, shown at `/writing/<slug>` |
| About, Work, Privacy | `src/pages/about.astro`, `work.astro`, `privacy.astro` |
| Layouts and components | `src/layouts/`, `src/components/` |
| Copy rules | `VOICE.md` |

## Deploy

Vercel builds from `main`. Pull requests get preview URLs. Redirects from every old address are in `vercel.json`. The `legacy-static` branch holds the old static site and is kept for reference and for the redirect check. `docs/HANDOFF.md` says where go-live stands.

## Chat server

The Ask Shannon chat API is in `chat-server/`. It runs on Render, deployed separately from the site, with the service root directory set to `chat-server`. The game scoreboard runs as Vercel functions in `api/` and needs a Redis store (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). Without it the game still plays and the board shows a "resting" message.

## Before each release

Open the LinkedIn and App Store links by hand. CI skips them because they block bots.
