# Merge Panel Site into shannonhecker.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** shannonhecker.com serves the Revolut panel site's design, game, avatar cursor and case content, plus the public site's 10 earlier projects, Writing, About and Ask Shannon chat, on Vercel, with the panel link untouched.

**Architecture:** A clean copy of the panel site's Astro project replaces the static HTML in the `shannonhecker/shannonhecker-portfolio` repo, on a branch, in a clone outside iCloud. Public-site content is imported from git history into Astro content collections and rendered by new templates built on the panel's tokens. It deploys to a new Vercel project with its own scoreboard store; the live static site is parked on a `legacy-static` branch until the DNS switch.

**Tech Stack:** Astro 7 (static output), TypeScript, Playwright with axe, Vercel functions (`api/*.ts`), Upstash Redis via Vercel, GSAP and Lenis as already used. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-15-merge-panel-site-design.md`. Read it first; this plan argues from it.

**Paths used below**

- `PANEL` = `~/shannonhecker-protofolio-review` (read-only source; never edit, commit or deploy from it)
- `ICLOUD` = `~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/shannonhecker-portfolio` (do not build here)
- `SITE` = `~/shannonhecker-site` (fresh clone of `shannonhecker/shannonhecker-portfolio`; all work happens here)
- Branch: `feat/merge-panel-site`. Legacy content is read with `git show legacy-static:<path>`.

## Global Constraints

- Never edit, commit to, or deploy from `PANEL`. Never link `SITE` to the Vercel project `shannonhecker-work`. No `.vercel/` or `.env*` file is ever copied from `PANEL`.
- No em dashes or en dashes in any text a visitor reads (body, headings, alt text, meta, JSON-LD). British English. First person. `uoaui.ai` lowercase.
- Titles and dates: J.P. Morgan "User Experience Designer" Aug 2016 to Jan 2023, "Digital Product Designer VP" Feb 2023 to Sep 2025, internship June to September 2016; Barclays "Lead Product Designer" from Sep 2025; Deal Model 2022 to 2023.
- Figures on the earlier project pages stay exactly as written (Shannon, 15 Nov 2026). Do not remove, soften or relabel them.
- No real Barclays screens or client names; FX is "beta". The words "Barclays" and "Front Office" do not appear anywhere on the stock dashboard page, including image file names, alt text and metadata.
- Images keep their full proportions; never crop a screenshot.
- Game: no Nintendo characters, sprites, sounds, items or names. Game code changes only where this plan says.
- Canonical host is `https://shannonhecker.com`. The string `shannonhecker-work` must not appear in `dist/`.
- First visit opens in dark; a saved choice is honoured.
- Every task ends with `npm run build` and `npx playwright test` green, then a commit. PR to `main` only at Task 14.
- Pushing, changing GitHub Pages, creating Vercel resources, DNS and Render changes are outward-facing: confirm with Shannon at the step that says so. Ask her one question at a time.
- Delegation: builders on Sonnet at `medium`; Tasks 2, 9, 10, 13 and 14 reviewed on Opus at `high`. UI tasks (4 to 7, 10) load `frontend-design:frontend-design` and `ui-ux-pro-max:ui-ux-pro-max` and say which they used; Task 12 loads `web-design-guidelines` and `accesslint:accessibility-audit`.

## Review Focus

1. **Old link with extras.** A visitor opens `/index.html`, `/project-tripup.html?utm_source=x` or `/about.html#contact`. They land on the matching live page, not a 404. Test in Task 8.
2. **Returning visitor who chose light on the old site.** The old site saved `localStorage.theme = "light"`; the panel code reads `portfolio-theme`. They still get light. Test in Task 2.
3. **Chat server asleep or unreachable.** The Render server cold-starts or is down. The widget shows a plain "try again" message, the page stays usable, and nothing throws. Test in Task 10.
4. **Visitor says no to analytics.** No request to `googletagmanager.com`, `google-analytics.com` or `clarity.ms` is made, before or after the choice, and the game and chat still work. Test in Task 9.
5. **Scoreboard store missing or down.** The game still plays and the board shows its "resting" message. Test in Task 2 (the existing `scoreboard.spec.ts` case is kept and must still pass with no KV variables set).

---

### Task 0: Park the live site and open the workspace

**Files:** none in the repo. Creates `SITE`.

- [ ] **Step 1:** Clone outside iCloud: `GIT_TERMINAL_PROMPT=0 git clone https://github.com/shannonhecker/shannonhecker-portfolio.git ~/shannonhecker-site`. Expected: `git -C ~/shannonhecker-site log -1 --oneline` shows `e600af0` or later.
- [ ] **Step 2 (confirm with Shannon before pushing):** `git branch legacy-static origin/main && git push origin legacy-static`. Expected: branch exists on GitHub at the same commit as `main`.
- [ ] **Step 3 (Shannon, in GitHub: Settings, Pages, Branch):** switch the Pages source from `main` to `legacy-static`, folder `/`. Custom domain stays `shannonhecker.com`.
- [ ] **Step 4:** Verify the live site is unchanged: `curl -sI https://shannonhecker.com/ | head -1` returns `200`, and `curl -s https://shannonhecker.com/ | grep -c "Design engineer"` is at least 1.
- [ ] **Step 5:** `git checkout -b feat/merge-panel-site`. Copy the spec and this plan from `ICLOUD/docs/superpowers/` into `SITE/docs/superpowers/` and commit: `docs: design and plan for merging the panel site`.

### Task 1: Clean copy of the panel code

**Files:**
- Delete: every root `*.html`, `assets/` (after Step 2), `src/App.jsx`, `src/main.jsx`, `vite.config.js`, `serve-static.js`, `dist/`, `output/`, `CNAME`, `.nojekyll`, `sitemap.xml`, `robots.txt`, root `package.json` and `package-lock.json`
- Move: `api/` to `chat-server/` (`git mv`; contains `server.js`, `render.yaml`, `vercel.json`, `package.json`)
- Create: everything from `PANEL` `main` via `git archive`
- Keep: `VOICE.md`, `DESIGN.md`, `CLAUDE.md`, `docs/`, `motion/`, `content/`

**Interfaces:**
- Produces: an Astro project at the root of `SITE` that builds and passes the panel's own test suite unchanged. `legacy-static` is the only source of old content from here on.

- [ ] **Step 1:** `git mv api chat-server`, then delete the files listed above.
- [ ] **Step 2:** Bring the panel code across with tracked files only: `git -C ~/shannonhecker-protofolio-review archive main | tar -x -C ~/shannonhecker-site`. Then remove `BUILD.md`, `docs/HANDOFF.md`, `docs/TASKS.md` and `prototype/BRIEF.md` if the archive brought them (they describe the Revolut share), keeping `AGENTS.md`.
- [ ] **Step 3:** Verify nothing private came along: `ls -a ~/shannonhecker-site | grep -E "^\.vercel$|^\.env"` prints nothing.
- [ ] **Step 4:** Merge `.gitignore`: the panel's entries plus the public repo's iCloud duplicate patterns, plus `* [0-9].astro`, `* [0-9].ts`, `* [0-9].md`, `chat-server/node_modules/`, `chat-server/.env`.
- [ ] **Step 5:** Restore the CV at its old address: `mkdir -p public/assets && git show legacy-static:assets/CV_ShannonH.pdf > public/assets/CV_ShannonH.pdf`.
- [ ] **Step 6:** `npm ci && npm run build && npx playwright test`. Expected: the build writes `dist/`, and the suite passes as it does in `PANEL` (record the pass count in the commit message).
- [ ] **Step 7:** Commit: `chore: replace static site with a clean copy of the panel Astro project`.

### Task 2: Make it public

**Files:**
- Modify: `astro.config.mjs` (`site`), `src/layouts/Base.astro` (robots meta, canonical, theme init, preload paths, JSON-LD), `vercel.json` (headers), `public/robots.txt`, `src/scripts/analytics.ts` (hostname), `server/scoreboard.ts` (`namespace()`), `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/CaseContents.astro`, `src/layouts/CasePage.astro`, `src/scripts/motion.ts`, `src/pages/404.astro`, `src/components/Hero.astro` (drop the `panel` prop and line), `src/components/Page.astro`
- Delete: `src/pages/panel.astro`, `src/pages/build.astro`
- Create: `src/pages/sitemap.xml.ts`, `scripts/check-public.mjs`, `tests/public-site.spec.ts`
- Modify tests: all 37 `/panel` references across `tests/*.spec.ts` become `/`

**Interfaces:**
- Produces: `namespace(): string` returning `` `shannonhecker-com:v1:${production|preview}` ``; `npm run check:public` (script entry in `package.json`) which fails on any rule below; the sitemap endpoint lists every page in `dist`.

- [ ] **Step 1: Write `tests/public-site.spec.ts`** with these tests:
  - `every page is indexable`: for `/`, `/fx`, `/fusion`, `/deal-model`, `/winking-star`, `/uoaui`, `/privacy`: no `meta[name=robots]` containing `noindex`; `link[rel=canonical]` href starts with `https://shannonhecker.com`; `meta[property="og:url"]` and `og:image` start with `https://shannonhecker.com`.
  - `no panel page`: `GET /panel` and `GET /build` return 404 from the preview server.
  - `hero has no panel line`: `/` contains "I design tools where mistakes cost money." and does not contain "Revolut".
  - `old theme choice is honoured`: with `localStorage.theme = "light"` and no `portfolio-theme`, `/` loads with `html[data-theme=light]`; with neither key, `html[data-theme=dark]`.
  - `sitemap lists the home page`: `GET /sitemap.xml` is 200 and contains `<loc>https://shannonhecker.com/</loc>`.
- [ ] **Step 2: Write `scripts/check-public.mjs`**: walks `dist/`, fails if any file contains `shannonhecker-work`, `noindex`, or `Revolut`; fails if `vercel.json` contains `X-Robots-Tag`, `includeSubDomains` or `preload`. Add `"check:public": "node scripts/check-public.mjs"`.
- [ ] **Step 3:** Run both. Expected: FAIL (noindex present, `/panel` exists).
- [ ] **Step 4: Implement.** Values the spec pins:
  - `site: 'https://shannonhecker.com'`.
  - `Base.astro`: remove the robots meta and the `noindex` prop; canonical is always the page's own path; preload lists use `/` only; theme init reads `portfolio-theme`, and if absent falls back to the legacy `theme` key (`light` or `dark`), else `dark`.
  - `vercel.json`: delete the `X-Robots-Tag` header; `Strict-Transport-Security` becomes `max-age=63072000`.
  - `public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://shannonhecker.com/sitemap.xml`.
  - `analytics.ts`: `live` is true for `shannonhecker.com` and `www.shannonhecker.com`.
  - `Nav.astro`: brand link `/`; links are `Work` (`/work`), `Writing` (`/writing`), `About` (`/about`); theme switch and Contact unchanged. `CasePage.astro` play link becomes `/?level=N#adventure`.
  - `Footer.astro`: remove the "Full portfolio, shannonhecker.com" link.
- [ ] **Step 5:** Replace `/panel` with `/` in every spec file; delete assertions that exist only to prove the page is noindex.
- [ ] **Step 6:** `npm run build && npm run check:public && npx playwright test`. Expected: PASS, including `scoreboard.spec.ts` with no KV variables set.
- [ ] **Step 7:** Commit: `feat: make the copied site public (addresses, search, headers, own scoreboard prefix)`.

### Task 3: Remove private-share details and dashes

**Files:**
- Modify: `src/components/CaseWinking.astro:35` (delete the "App Store publisher" span), `src/lib/game-timeline.ts` (delete the 2018 and 2021 "I had a baby" entries), `src/components/GameBox.astro:19,43` and any other visitor text with `–` or `—`
- Create: `scripts/check-copy.mjs`
- Test: `tests/public-site.spec.ts` (extend)

**Interfaces:**
- Produces: `npm run check:copy`, which strips tags, scripts and styles from every `dist/**/*.html` and fails on `—` or `–`, listing file and surrounding text. Later content tasks rely on it.

- [ ] **Step 1:** Add tests: `/winking-star` does not contain "legal name" or "Yu-Hsuan"; the game timeline on `/` does not contain "I had a baby".
- [ ] **Step 2:** Write `scripts/check-copy.mjs` and its `package.json` entry. Year ranges in `game-timeline.ts` such as `2015–2016` become `2015 to 2016`.
- [ ] **Step 3:** Run. Expected: FAIL on the three items.
- [ ] **Step 4:** Make the edits. The Barclays and J.P. Morgan map marks in `src/game/map.ts` stay.
- [ ] **Step 5:** `npm run build && npm run check:copy && npx playwright test`. Expected: PASS. Update any timeline test that counted entries.
- [ ] **Step 6:** Commit: `fix: remove private-share details and dashes from public copy`.

### Task 4: Earlier projects, content and template

**Files:**
- Create: `scripts/import-legacy.mjs`, `src/content.config.ts`, `src/content/earlier/<slug>.md` (10), `src/assets/earlier/<slug>/*` (images), `src/layouts/EarlierProject.astro`, `src/pages/work/[slug].astro`, `src/lib/earlier.ts`, `src/styles/earlier.css`
- Test: `tests/earlier-projects.spec.ts`

**Interfaces:**
- Produces:
  - Collection `earlier` with schema `{ title: string, summary: string, role: string, dates: string, order: number, legacy: string, outcomes: {value: string, label: string}[], tags: string[], cover: image, coverAlt: string }` and a Markdown body holding the page's sections and inline images in original order.
  - `src/lib/earlier.ts`: `export const EARLIER_SLUGS: readonly string[]` in this order: `stock-dashboard`, `tripup`, `design-system`, `data-solution`, `ui-toolkit`, `corporate-action`, `complex-assets`, `research`, `algo-center`, `dps-brand`; `export async function earlierProjects(): Promise<CollectionEntry<'earlier'>[]>` sorted by `order`.
  - `legacy` holds the old file name, for example `project-tripup.html`; `stock-dashboard`'s is `project-barclays-data-viz.html`. Task 8 reads it.

- [ ] **Step 1: Write `tests/earlier-projects.spec.ts`:**
  - For each slug: `GET /work/<slug>` is 200; one `h1`; every `img` has non-empty `alt` and `naturalWidth > 0`; no image has `object-fit: cover`; axe reports no serious or critical violations in dark and light.
  - Figures preserved: `/work/corporate-action` contains "40%" and "60%"; `/work/complex-assets` contains "3x" and "95%"; `/work/research` contains "4x" and "+35%"; `/work/algo-center` contains "60%"; `/work/design-system` contains "16+" and "100%".
  - `/work/stock-dashboard`: page text, every `img[src]`, every `alt`, `title` and JSON-LD contain neither "Barclays" nor "Front Office" (case-insensitive).
  - JSON-LD on `/work/tripup` includes `CreativeWork` and `BreadcrumbList` whose last item URL is `https://shannonhecker.com/work/tripup`.
- [ ] **Step 2:** Run. Expected: FAIL (404).
- [ ] **Step 3: Write `scripts/import-legacy.mjs`.** For each slug it reads `git show legacy-static:<legacy>`, takes the title, lead, role and dates, Outcomes tiles (value and label pairs), tags, and the `main` body's headings, paragraphs, lists and figures in order, writes the Markdown file, and extracts each referenced image with `git show legacy-static:assets/<file>` into `src/assets/earlier/<slug>/`. It replaces `—` and `–` per `VOICE.md` (period, colon or comma, chosen per sentence and reviewed by hand in Step 5) and changes nothing else. For `stock-dashboard` it renames image files to drop "barclays". The script is a one-off and stays in the repo for the record.
- [ ] **Step 4: Build the template.** `EarlierProject.astro` wraps `Base`, `Nav`, `Footer` and renders: eyebrow "Earlier work", `h1`, summary, a role and dates line, the Outcomes tiles, the cover at full proportion, the body, tags, and a next-project row reusing `CaseRowLink`. It uses only existing tokens (`--bg`, `--bg-2`, `--fg`, `--fg-2`, `--hair`, `--radius`, `--display`, `--body`) so both themes work. No game art, decision maps or diagrams.
- [ ] **Step 5: Hand review of the 10 Markdown files** against their legacy pages: words unchanged apart from dashes; titles and dates checked against Global Constraints. `stock-dashboard.md` is retitled "Stock dashboard design task" with the lead "Stock performance dashboard design task. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts." Save its before and after lines to `docs/superpowers/review/stock-dashboard-changes.md` for Shannon (Task 13).
- [ ] **Step 6:** `npm run build && npm run check:copy && npx playwright test tests/earlier-projects.spec.ts`. Expected: PASS.
- [ ] **Step 7:** Commit: `feat: ten earlier projects in the panel style`.

### Task 5: Work page, home link

**Files:**
- Create: `src/pages/work.astro`
- Modify: `src/components/Work.astro` (add the link after the five rows)
- Test: `tests/work-page.spec.ts`

**Interfaces:**
- Consumes: `CASES` from `src/lib/cases.ts`; `earlierProjects()` from Task 4.

- [ ] **Step 1: Write the tests:** `/work` has an `h1` "Work", a "Selected" section with exactly 5 links in `CASES` order and an "Earlier work" section with exactly 10 links in `EARLIER_SLUGS` order; every link resolves 200. `/` has a link with text "More work" to `/work` directly after the fifth case row, and still shows exactly 5 case rows. The nav "Work" link has `aria-current="page"` on `/work`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build `/work`: Selected rows reuse `CaseRowLink` with artwork; Earlier rows are compact (title, one-line summary, dates). Page title "Work · Shannon Hecker".
- [ ] **Step 4:** Run build and tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: Work page listing all fifteen projects`.

### Task 6: Writing

**Files:**
- Create: `src/content/writing/the-design-system-is-the-contract.md`, `trust-surfaces-in-ai.md`, `when-everyone-can-ship.md`; `src/layouts/Article.astro`; `src/pages/writing/index.astro`; `src/pages/writing/[slug].astro`
- Modify: `src/content.config.ts`, `scripts/import-legacy.mjs` (add a `writing` mode)
- Test: `tests/writing.spec.ts`

**Interfaces:**
- Produces: collection `writing` with schema `{ title: string, description: string, published: date, legacy: string }`. `legacy` is `writing-<slug>.html`.

- [ ] **Step 1: Write the tests:** `/writing` lists exactly 3 articles, newest first, each linking to `/writing/<slug>`; each article has one `h1`, a visible published date, JSON-LD `Article` with `headline` equal to the title, `author.name` "Shannon Hecker" and `mainEntityOfPage` on `https://shannonhecker.com/writing/<slug>`; reading measure of body paragraphs is at most 75ch; axe clean in both themes.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Import the three articles and the index intro from `legacy-static` (words unchanged apart from dashes; publish dates from the legacy JSON-LD). Build the index and `Article.astro` on existing tokens.
- [ ] **Step 4:** Build, `check:copy`, tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: Writing index and three articles`.

### Task 7: About

**Files:**
- Create: `src/pages/about.astro`, `src/assets/about/*` (photo from `legacy-static:assets/photo.webp`)
- Modify: `scripts/import-legacy.mjs` (an `about` mode that prints the page's sections for hand placement)
- Test: `tests/about.spec.ts`

- [ ] **Step 1: Write the tests:** `/about` has `h1` "About me"; contains "Lead Product Designer", "User Experience Designer", "Digital Product Designer VP"; does not contain "Senior Product Designer", "Vice President, Product Design" or "Design engineer at Barclays"; the CV link points to `/assets/CV_ShannonH.pdf` and returns 200 with `content-type` `application/pdf`; the photo has alt text; axe clean in both themes.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build the page from the legacy About's sections in their order (intro, career experience, education, contact), words unchanged apart from dashes and the title corrections above. The opening line follows the panel hero's intro paragraph rather than the old "Design engineer" title.
- [ ] **Step 4:** Build, `check:copy`, tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: About page`.

### Task 8: Redirects

**Files:**
- Modify: `vercel.json` (`redirects`, all `permanent: true`)
- Create: `scripts/check-redirects.mjs`
- Test: run by `npm run check:redirects`

**Interfaces:**
- Consumes: `legacy` fields from Tasks 4 and 6.
- Produces: `node scripts/check-redirects.mjs` (checks `vercel.json` against `dist/`) and `node scripts/check-redirects.mjs --live <origin>` (requests each legacy path on a live host and asserts a 308 whose target returns 200). Task 14 uses the live mode.

- [ ] **Step 1: Write `scripts/check-redirects.mjs`.** It builds the list of legacy paths from `git show legacy-static:sitemap.xml` plus `/index.html`, `/project-ausos.html`, `/404.html`, `/panel`, `/build`; for each, finds the matching `vercel.json` redirect and asserts the destination has a file in `dist/`. It also asserts no destination is itself a redirect source, and that `/assets/CV_ShannonH.pdf` exists in `dist/` and is not redirected. Query strings and hashes survive Vercel redirects by default, so sources are written without them.
- [ ] **Step 2:** Run. Expected: FAIL (no rules yet).
- [ ] **Step 3:** Add the rules:
  - `/index.html` to `/`; `/work.html` to `/work`; `/about.html` to `/about`; `/writing.html` to `/writing`; `/privacy.html` to `/privacy`; `/panel` and `/build` to `/`.
  - `/project-analytics.html` to `/fusion`; `/project-deal-model.html` to `/deal-model`; `/project-uoaui.html` and `/project-ausos.html` to `/uoaui`; `/project-winkingstar.html` to `/winking-star`.
  - One rule per earlier project from its `legacy` name to `/work/<slug>`, including `/project-barclays-data-viz.html` to `/work/stock-dashboard`.
  - `/writing-<slug>.html` to `/writing/<slug>` for the three articles.
- [ ] **Step 4:** `npm run build && npm run check:redirects`. Expected: PASS, every legacy path listed with its destination.
- [ ] **Step 5:** Commit: `feat: permanent redirects from every old address`.

### Task 9: Analytics consent with Clarity

**Files:**
- Modify: `src/scripts/analytics.ts`, `src/components/AnalyticsConsent.astro` (copy), `src/pages/privacy.astro`, `vercel.json` (CSP)
- Test: `tests/analytics-consent.spec.ts`

**Interfaces:**
- Produces: `enable()` loads Google Analytics `G-795LXWTYWM` and Microsoft Clarity project `w42m2jben0`; nothing loads before a "yes". `track()` signature unchanged.

- [ ] **Step 1: Write the tests** (hostname gate bypassed with a `?analytics-test=1` flag honoured only on `localhost`):
  - `nothing before a choice`: load `/`, wait for idle, assert zero requests matched `googletagmanager.com|google-analytics.com|clarity.ms`.
  - `no means no`: click "No thanks", navigate to `/fx` and `/work`, still zero matching requests; the banner stays hidden; the game opens and the chat form is usable.
  - `yes loads both`: click "Allow analytics"; requests to `googletagmanager.com/gtag/js?id=G-795LXWTYWM` and `clarity.ms/tag/w42m2jben0` are made (routes fulfilled with empty bodies).
  - `privacy page names both`: `/privacy` contains "Google Analytics" and "Microsoft Clarity".
- [ ] **Step 2:** Run. Expected: FAIL on the Clarity assertions.
- [ ] **Step 3:** Implement. Banner copy: "I use Google Analytics and Microsoft Clarity to see visits, reading and game play. Off unless you allow it. Nicknames are never sent to either." CSP additions: `script-src` and `connect-src` gain `https://www.clarity.ms https://*.clarity.ms`; `img-src` gains `https://*.clarity.ms https://c.bing.com`. Merge the legacy privacy page's wording on retention and contact into `privacy.astro`.
- [ ] **Step 4:** Build and tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: consent-gated Google Analytics and Clarity`.

### Task 10: Ask Shannon widget

**Files:**
- Create: `src/components/AskShannon.astro`, `src/scripts/ask-shannon.ts`, `src/styles/ask-shannon.css`
- Modify: `src/components/Page.astro` (mount after `HowIWork`), `vercel.json` (CSP `connect-src` gains `https://ask-shannon-api.onrender.com`; `Permissions-Policy` `microphone=(self)`), `src/scripts/avatar-cursor.ts` (`nativeTarget` already covers `textarea`; add `.ask-shannon` so the native cursor shows over the whole widget)
- Test: `tests/ask-shannon.spec.ts`

**Interfaces:**
- Consumes: `POST https://ask-shannon-api.onrender.com/api/chat`, request and streamed response exactly as `legacy-static:assets/ask-shannon.js` sends and reads them. Port that protocol; do not redesign it.
- Produces: a section with id `ask` on `/` only.

- [ ] **Step 1: Write the tests** (the API route is mocked in Playwright):
  - `streams an answer`: type a question, submit; the user bubble appears, then an AI bubble that grows across two streamed chunks and ends without the `streaming` class; `#ask-messages` has `role="log"` and `aria-live="polite"`.
  - `suggestion chips`: chips render, clicking one sends it and rotates to the next set.
  - `server asleep`: the route aborts; the widget shows "I couldn't reach the chat just now. Try again in a moment." in the log, the send button is enabled again, and no uncaught page error is recorded.
  - `server slow`: the route delays 4 seconds; a visible waiting state appears within 500 ms.
  - `limits`: the textarea has `maxlength="1000"`; Enter sends, Shift+Enter adds a line.
  - `mic button`: hidden when `SpeechRecognition` is absent; present with `aria-label="Speech to text"` when defined.
  - `only on home`: `/about` and `/work` have no `#ask`.
  - `both themes`: axe clean in dark and light.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Port `legacy-static:assets/ask-shannon.js` (493 lines) to `ask-shannon.ts`, keeping every feature: streaming, follow-scroll button, rotating suggestion sets, speech-to-text, the disclaimer line. Restyle on the panel tokens: hairline borders, `--radius`, no gradients, no glow.
- [ ] **Step 4:** Build and tests. Expected: PASS. Then a manual local check against the real server: `npx astro preview --port 3000` (an origin the server allows) and ask one question.
- [ ] **Step 5:** Commit: `feat: Ask Shannon chat in the panel style`.

### Task 11: Correct the chat's facts

**Files:**
- Modify: `chat-server/server.js` (system prompt, near the lines that were 290 to 322 under `api/`), `chat-server/render.yaml` (`rootDir: chat-server`)
- Create: `docs/superpowers/review/chat-facts-changes.md` (before and after, for Shannon)

- [ ] **Step 1:** Edit the prompt to these facts, changing nothing else in the file:
  - Barclays: "Lead Product Designer (September 2025 to present)".
  - J.P. Morgan: "User Experience Designer (August 2016 to January 2023)", "Digital Product Designer VP (February 2023 to September 2025)", internship June to September 2016. Remove "Vice President, Product Design (2019 to 2025)".
  - "KEY PROJECTS (15 on the portfolio)", adding FX execution analytics (Barclays, 2025 to now, in beta) and Winking Star, and renaming "Barclays Data Visualisation" to "Stock dashboard design task" with no Barclays mention.
  - Deal Model: 2022 to 2023, UI lead, "two hours to 20 minutes" stated as Shannon's estimate.
  - Project addresses point to the new paths (`/fx`, `/work/tripup` and so on).
- [ ] **Step 2:** `node --check chat-server/server.js`. Expected: no output.
- [ ] **Step 3:** `grep -nE "Senior Product Designer|Vice President, Product Design|13 case studies|Barclays Data" chat-server/server.js`. Expected: no matches.
- [ ] **Step 4:** Write the before and after file. Commit: `fix: bring Ask Shannon's facts in line with the site and LinkedIn`.

### Task 12: Both themes, every template, on a phone

**Files:**
- Modify: `tests/appearance.spec.ts`, `tests/site.spec.ts` (page lists)
- Create: `scripts/qa-shots.mjs`, output in `test-results/qa-shots/`

- [ ] **Step 1:** Add `/work`, `/work/tripup`, `/work/stock-dashboard`, `/writing`, `/writing/trust-surfaces-in-ai`, `/about` to the page lists the appearance and site specs loop over (theme switch works, no horizontal scroll at 390 px, headings inside bounds, nav menu opens on a phone).
- [ ] **Step 2:** `scripts/qa-shots.mjs` takes full-page screenshots of `/`, `/fx`, those six pages and the open chat at 390x844 and 1440x900, in dark and light (28 or more images).
- [ ] **Step 3:** Run `web-design-guidelines` and `accesslint:accessibility-audit` over the new templates; fix what they find; re-run.
- [ ] **Step 4:** Look at every screenshot. Fix anything cropped, clipped, low-contrast or off-grid. Re-shoot.
- [ ] **Step 5:** Full suite green. Commit: `test: new templates covered in both themes and at phone size`.

### Task 13: CI, docs, preview for Shannon

**Files:**
- Modify: `.github/workflows/ci.yml`, `VOICE.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`
- Create: `docs/HANDOFF.md` (public-site version)

- [ ] **Step 1:** CI: Lighthouse paths become `/ /fx /fusion /winking-star /deal-model /uoaui /work /work/tripup /writing /about`; remove `--skip-audits=is-crawlable`; add steps for `check:public`, `check:copy`, `check:redirects`; remove the `^https://shannonhecker\.com` lychee exclusion.
- [ ] **Step 2:** `VOICE.md`: the canonical title line becomes the panel hero ("I design tools where mistakes cost money." and its intro), dated 15 Nov 2026. `CLAUDE.md` and `AGENTS.md`: describe the Astro layout (`src/pages`, content collections, `chat-server/`), keep the one-question rule, and state the Global Constraints above. `docs/HANDOFF.md`: what this site is, the rules, and that the panel repo is frozen.
- [ ] **Step 3 (confirm with Shannon before creating):** create a new Vercel project named `shannonhecker-com` from `shannonhecker/shannonhecker-portfolio`, add a new Upstash Redis store to it (`KV_REST_API_URL`, `KV_REST_API_TOKEN` for production and preview), push the branch. Verify the project ID differs from the one in `PANEL/.vercel/project.json`.
- [ ] **Step 4:** On the preview link: play a stage and save a score, confirm it appears on the preview board, and confirm the panel board at `shannonhecker-work.vercel.app` is unchanged (compare the top ten before and after).
- [ ] **Step 5:** Hand Shannon, one at a time: the preview link with the Task 12 screenshots; `stock-dashboard-changes.md`; `chat-facts-changes.md`. Apply her changes, re-run the suite.
- [ ] **Step 6:** Commit: `chore: CI, docs and handoff for the public site`.

### Task 14: Go-live

No code. Each step is confirmed with Shannon before it is done.

- [ ] **Step 1:** Record the rollback facts in `docs/HANDOFF.md`: current DNS records for `shannonhecker.com` and `www` (`dig +short shannonhecker.com A`, `dig +short www.shannonhecker.com CNAME`), and that Pages serves `legacy-static`.
- [ ] **Step 2:** Capture the panel link for comparison: screenshot `https://shannonhecker-work.vercel.app/panel` (desktop and phone) and save its response headers.
- [ ] **Step 3:** Open the PR, wait for CI green, merge to `main`. The live site is unaffected (Pages serves `legacy-static`). If the chat host auto-deploys from `main`, its build will fail here because `api/` is gone; a failed build leaves the last good deploy running, so the chat stays up. Not verified: check the Render dashboard's branch and auto-deploy setting with Shannon before merging, and do Step 4 straight after.
- [ ] **Step 4 (Shannon, Render dashboard):** set the chat service's root directory to `chat-server` and redeploy. Check `curl -s -o /dev/null -w "%{http_code}" -X OPTIONS https://ask-shannon-api.onrender.com/api/chat -H "Origin: https://shannonhecker.com"` returns 204 or 200, and the old site's chat still answers.
- [ ] **Step 5:** Add `shannonhecker.com` and `www.shannonhecker.com` to the `shannonhecker-com` Vercel project. Give Shannon the exact DNS records Vercel shows; she changes them at her registrar.
- [ ] **Step 6:** When DNS has moved: `curl -sI https://shannonhecker.com/ | grep -i server` shows Vercel; run `scripts/check-redirects.mjs` in a live mode (`--live https://shannonhecker.com`) asserting each legacy path returns 308 to a 200 page; load `/` on a phone and a desktop in both themes; save a score; ask the chat one question and check its answer gives the Barclays and J.P. Morgan titles from Global Constraints.
- [ ] **Step 7:** Compare the panel link with Step 2's screenshots and headers. Expected: identical.
- [ ] **Step 8:** Turn off GitHub Pages for the repo. Keep the `legacy-static` branch.
- [ ] **Step 9:** Submit `https://shannonhecker.com/sitemap.xml` in Google Search Console (Shannon).
- [ ] **Rollback, if any check in Step 6 fails:** restore the DNS records from Step 1; Pages still serves `legacy-static`; set the Render root directory back to `api` on a redeploy of `legacy-static`.
