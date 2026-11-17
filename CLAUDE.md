# shannonhecker.com

Project-scoped instructions for Claude Code working in this repo. This is the public portfolio at https://shannonhecker.com. `docs/HANDOFF.md` has the current state and next steps.

## Clarify-first

Global rule applies: ask one clarifying question per turn, every request (including in auto mode), until nothing is left to ask. Escape phrases: `"just do it"` / `"go"` / `"ship it"`. Full checklist in `~/.claude/skills/clarify-first/SKILL.md`.

Walk the 8-category checklist on every request:

1. Which project / where
2. Scope: in/out
3. Stakeholders / audience
4. References / examples
5. Design / visual decisions
6. Technical approach
7. Constraints / risks _(weighted heavier)_
8. Success criteria

**Portfolio-specific things to always clarify before building:**

- **Which page?** Flagship case pages (`/fx`, `/fusion`, `/winking-star`, `/deal-model`, `/uoaui`) are `src/pages/*.astro` on the `CasePage` layout. Earlier projects are Markdown in `src/content/earlier/` on the `EarlierProject` layout. Ask which one, and whether the change should apply to one page or ripple across the set.
- **Page vs. shared shell?** Layouts (`src/layouts/`), components (`src/components/`) and styles are shared by every page. Clarify scope before editing them.
- **Public-facing, so:** every change is shipped work. Ask about tone and voice, and whether draft copy needs review before it goes to `main`, which deploys the live domain.
- **Design-system consistency:** tokens and components live in this repo (`src/styles`, `src/components`; `DESIGN.md` is an older description). If a change belongs at the token level, raise it before adding page-local CSS.
- **Recruiter experience:** many visitors are hiring managers. Ask about audience framing (design-lead? engineering-lead? founder?) before committing to voice and depth.

## What this repo is

An Astro project (static output, deployed on Vercel from `main`). The old static site is kept on the `legacy-static` branch and is only a source for imports and the redirect check.

| What | Where |
|---|---|
| Pages and routes | `src/pages/` (home, five flagship cases, `work`, `work/[slug]`, `writing`, `about`, `privacy`, `404`, `sitemap.xml.ts`) |
| Content collections | `src/content/earlier/` (ten earlier projects) and `src/content/writing/` (three articles); schema in `src/content.config.ts` |
| Layouts | `src/layouts/` (`Base`, `CasePage`, `EarlierProject`, `Article`, `UtilityPage`) |
| Components, styles, scripts | `src/components/`, `src/styles/`, `src/scripts/`, `src/lib/` |
| Game API (Vercel functions) | `api/game-run.ts`, `api/leaderboard.ts`, with `server/scoreboard.ts` (Redis over REST) |
| Chat API | `chat-server/` (the Ask Shannon server on Render, deployed separately from the site; root directory `chat-server`) |
| Redirects and headers | `vercel.json`, all old addresses permanent |
| Checks | `scripts/check-public.mjs`, `scripts/check-copy.mjs`, `scripts/check-redirects.mjs` (run after `npm run build`) |
| Screenshots for review | `node scripts/qa-shots.mjs` writes to `test-results/qa-shots/` |
| Tests | `tests/*.spec.ts` (Playwright, config in `playwright.config.ts`) |
| Voice | `VOICE.md` |

Import scripts (`scripts/import-*.mjs`) read the old pages with `git show legacy-static:<file>`.

## Standing rules

- **Never touch the private panel repo.** The private panel version of this site is frozen. Never edit it, commit to it or deploy from it. Never link this repo to its Vercel project. Never copy a `.vercel/` folder or `.env*` file from it.
- **No dashes.** No em dashes or en dashes in anything a visitor reads (body, headings, alt text, meta, JSON-LD). Plain British English, first person, `uoaui.ai` lowercase. `npm run check:copy` enforces it on the build.
- **Titles and dates are fixed.** J.P. Morgan: "User Experience Designer" Aug 2016 to Jan 2023, "Digital Product Designer VP" Feb 2023 to Sep 2025, internship June to September 2016. Barclays: "Lead Product Designer" from Sep 2025. Deal Model: 2022 to 2023. Never "Design engineer".
- **Figures on the earlier project pages stay exactly as written** (Shannon, 15 Nov 2026). Do not remove, soften or relabel them.
- **No real Barclays screens or client names.** FX is "beta". The words "Barclays" and "Front Office" do not appear anywhere on the stock dashboard page, including image file names, alt text and metadata.
- **Images keep their full proportions.** Never crop a screenshot.
- **Game:** no Nintendo characters, sprites, sounds, items or names. Change game code only when asked.
- **Canonical host is `https://shannonhecker.com`.** The string `shannonhecker-work` must not appear in `dist/` (`npm run check:public`).
- **Dark first.** A first visit opens in dark. A saved choice is honoured.
- **Outward-facing steps need Shannon's confirmation:** pushing, GitHub Pages changes, creating Vercel resources, DNS and Render changes. Ask one question at a time.
- **Every task ends green:** `npm run build`, the three checks and `npx playwright test`, then a commit. Open a PR to `main` only at go-live.
- Shannon's words stay as they are. Add images, space and diagrams around them.
- No unmeasured metrics.

## Quality bar

Awwwards, Webby and FWA winning level. Every UI change is checked in real screenshots at 390x844 and 1440x900, in dark and light (`node scripts/qa-shots.mjs`), and critiqued against design, usability, creativity, content, motion and performance. Fix and re-shoot until it holds up beside the flagship case pages. Do not call a UI change done before that. Lighthouse is 95 or more in every category, mobile and desktop (CI enforces it).

## Delegation

Builders run on Sonnet at `medium`. Reviews of risky work run on Opus at `high`. UI tasks load `frontend-design:frontend-design` and `ui-ux-pro-max:ui-ux-pro-max` and say which they used. Review passes load `web-design-guidelines` and `accesslint:accessibility-audit`.
