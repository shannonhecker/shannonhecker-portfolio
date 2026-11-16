# Handoff: shannonhecker.com (public site)

Written 16 Nov 2026 on branch `feat/merge-panel-site`.

## What this site is

Shannon Hecker's public portfolio at https://shannonhecker.com. An Astro project with static output, to deploy on Vercel from `main`. It has five flagship case pages (`/fx`, `/fusion`, `/winking-star`, `/deal-model`, `/uoaui`), ten earlier projects at `/work/<slug>`, a Work index, Writing (three articles), About, Privacy, a small game with a scoreboard, and an "Ask Shannon" chat.

It replaces the old static HTML site on GitHub Pages. The Astro code was copied from a private panel version of the site, then made public and extended with the earlier projects, Writing, About and the chat. The old site is kept on the `legacy-static` branch.

Design and plan: `docs/superpowers/specs/2026-11-15-merge-panel-site-design.md` and `docs/superpowers/plans/2026-11-15-merge-panel-site.md`.

## Rules

Full list in `CLAUDE.md` (standing rules and quality bar). In short:

- The private panel repo is frozen. Never edit it, commit to it or deploy from it. Never link this repo to its Vercel project.
- No em dashes or en dashes in visitor-facing text. British English. `uoaui.ai` lowercase.
- Titles and dates are fixed. Figures on the earlier project pages stay exactly as written.
- No real Barclays screens or client names. FX is "beta". The stock dashboard page never says "Barclays" or "Front Office".
- Images are never cropped. Dark first. No Nintendo assets in the game.
- Canonical host `https://shannonhecker.com`; `shannonhecker-work` must not appear in `dist/`.
- Quality bar: Awwwards, Webby and FWA level. UI changes are checked in real screenshots at 390x844 and 1440x900, dark and light.
- Pushing, Vercel, DNS, Render and GitHub Pages changes need Shannon's confirmation, one question at a time.

## Current state (16 Nov 2026)

Tasks 0 to 12 of the plan are built on `feat/merge-panel-site`. Nothing has been pushed. The live site is still the old static site, served by GitHub Pages.

Review notes for Shannon are in `docs/superpowers/review/` (`about-changes.md`, `chat-facts-changes.md`, `role-titles.md`, `stock-dashboard-changes.md`, `writing-changes.md`).

## What remains

Each step needs Shannon's confirmation before it is done.

Task 13, steps 3 to 5:

1. Create a Vercel project named `shannonhecker-com` from `shannonhecker/shannonhecker-portfolio`. Add a new Upstash Redis store to it (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, production and preview). Push the branch. Check the project ID differs from the private panel project's.
2. On the preview link: play a stage, save a score, see it on the preview board, and check the panel scoreboard is unchanged.
3. Shannon reviews the preview, the QA screenshots and `docs/superpowers/review/*.md`, one at a time. Apply her changes and re-run the suite.

Task 14, go-live:

1. Record the current DNS records in the table below.
2. Capture the panel link for comparison (screenshots and response headers).
3. Open the PR, wait for CI green, merge to `main`. Pages keeps serving `legacy-static`, so the live site is unaffected. Check the Render branch and auto-deploy setting before merging, because `api/` moved to `chat-server/`.
4. Shannon, in the Render dashboard: set the chat service root directory to `chat-server` and redeploy. Check `curl -s -o /dev/null -w "%{http_code}" -X OPTIONS https://ask-shannon-api.onrender.com/api/chat -H "Origin: https://shannonhecker.com"` returns 204 or 200.
5. Add `shannonhecker.com` and `www.shannonhecker.com` to the Vercel project. Shannon changes the DNS records at her registrar.
6. When DNS has moved: confirm the server header says Vercel; run `node scripts/check-redirects.mjs --live https://shannonhecker.com`; load `/` on phone and desktop in both themes; save a score; ask the chat one question and check it gives the Barclays and J.P. Morgan titles.
7. Compare the panel link with the step 2 capture. It must be identical.
8. Turn off GitHub Pages. Keep the `legacy-static` branch.
9. Submit `https://shannonhecker.com/sitemap.xml` in Google Search Console (Shannon).

## DNS records

Current records, read with `dig` on 16 Nov 2026 before any change. Name servers: `ns61.domaincontrol.com`, `ns62.domaincontrol.com`. The site answers with `server: GitHub.com`.

| Host | Type | Value | Recorded on |
|---|---|---|---|
| `shannonhecker.com` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | 16 Nov 2026 |
| `shannonhecker.com` | AAAA | none | 16 Nov 2026 |
| `www.shannonhecker.com` | CNAME | `shannonhecker.github.io.` | 16 Nov 2026 |
| New value for `shannonhecker.com` (from Vercel) | TODO at go-live | TODO | TODO |
| New value for `www.shannonhecker.com` (from Vercel) | TODO at go-live | TODO | TODO |

TTLs are not recorded here. Note them at the registrar before changing anything.

## Vercel state (16 Nov 2026)

- Project `shannonhecker-com` (`prj_UyPtGLXXmNmTciKvCpEXsFV0Z53I`) is linked to this repo. Every push to a branch builds a preview. Preview for this branch: `https://shannonhecker-com-git-feat-merge-panel-site-shannon-h.vercel.app` (Vercel login needed).
- Scoreboard store: Upstash for Redis `shannonhecker-com-scores` (`store_zork1PFR8fDHgjoi`), free plan, region `iad1`, connected for production and preview. On the preview `GET /api/leaderboard?stage=1` returns `{"entries":[]}`.
- Not yet done: play a stage on the preview and save a score (plan Task 13 step 4).
- The chat cannot answer on the preview host. The chat server accepts only `shannonhecker.com` and `localhost:3000`.
- Found on 16 Nov, not caused by any change in this repo as far as can be told: the private panel version's own store (`portfolio-game`, `store_YSB6X3y2bA5GJZcj`) shows as "Uninstalled" in Vercel, and its scoreboard answers "Scoreboard is resting" on every stage. Its pages still load. No snapshot of that board was taken before the new store was created, so it is not known when it stopped. The owner decides whether to restore it. Do not change the panel project from here.

## Rollback

If any check in go-live step 6 fails:

1. Restore the DNS records recorded in the table above.
2. GitHub Pages still serves `legacy-static`, so the old site comes back as DNS settles.
3. Set the Render root directory back to `api` and redeploy `legacy-static`, so the chat matches the old site.

Do not turn off Pages (step 8) until every step 6 check has passed.

## Useful commands

```sh
npm run build && npm run check:public && npm run check:copy && npm run check:redirects
npx playwright test
node scripts/qa-shots.mjs
```

`check:redirects` needs a local `legacy-static` branch (`git fetch origin legacy-static:legacy-static`). CI does this.

## Owner review done (16 Nov 2026, evening)

Shannon went through all five notes in `docs/superpowers/review/`; each file ends with her decisions. In short:

- Stock dashboard: goes live with its two images as they are (the eagle and "Barclays" row stay in the pictures).
- Chat (`chat-server/server.js`): "product designer"; notice period and office days removed; uoaui.ai answered from the `/uoaui` page only; "I design to WCAG 2.1 AA"; "just outside London", never the town; model stays `claude-sonnet-4-6` for go-live.
- About: town replaced; figures read "In design, ten of them in fintech" and "The standard I design to"; heading "Now"; no full stops on section headings; second opening paragraph trimmed; education second entry "Ling Tung University, Taiwan, BA Digital Media Arts & Management"; "Reeborn Information Co., Ltd."; no internship line; "I lead design" and "Sole designer on FX" both stay.
- Writing and role labels: stand as built.

Preview scoreboard: one test score ("Preview test", 140, stage 0) saved through the API and read back; a real browser play is still worth doing. Suite: 826 tests, build and three checks green. These commits are local until Shannon OKs a push. Still needed from her, not blocking: sharper screenshots and portrait. Next: push, then Task 14 go-live, one confirmed step at a time.

## Go-live, steps 1 and 2 (16 Nov 2026)

- Rollback facts re-checked: A records `185.199.108.153`, `.109`, `.110`, `.111`; `www` CNAME `shannonhecker.github.io.`; Pages serves `legacy-static`.
- Panel link captured for the later comparison: headers and two screenshots (1440 and 390 wide) in `.golive/` in the working folder. That folder is kept out of git on purpose, because the panel site is private.
- Review commits pushed (`fafdbf9`); the preview rebuilt and carries the changes.
