# For any coding agent working on this repo

This is the public portfolio at https://shannonhecker.com, an Astro project deployed on Vercel from `main`. Read `docs/HANDOFF.md` first: it has the current state and next steps. `CLAUDE.md` has the full rules and the file map. `VOICE.md` has the copy rules.

Layout in one breath: pages in `src/pages`, content collections in `src/content` (`earlier` and `writing`), layouts in `src/layouts`, game API in `api/` and `server/`, the Ask Shannon chat server in `chat-server/` (Render, deployed separately), redirects in `vercel.json`, checks in `scripts/check-*.mjs`, tests in `tests/`.

Essentials:
- Shannon's words stay as they are. Add images, space and diagrams around them.
- No real Barclays screens, no client names. FX is "beta". The stock dashboard page never says "Barclays" or "Front Office", even in file names, alt text or metadata.
- Titles and dates are fixed (see `CLAUDE.md`). Figures on the earlier project pages stay exactly as written.
- No unmeasured metrics. Never crop a screenshot. Dark first.
- First person, British English, no em dashes or en dashes, `uoaui.ai` lowercase.
- The private panel version of this site is frozen. Never edit it or deploy from it.
- Quality bar: Awwwards, Webby and FWA level. Check every UI change in screenshots at 390x844 and 1440x900, dark and light, before calling it done.
- Branch per change, PR to `main`. Before pushing: `npm run build`, `npm run check:public`, `npm run check:copy`, `npm run check:redirects` and `npx playwright test` (set `PW_CHROMIUM_PATH` to a local Chromium if the default download is unavailable).
- Pushing, Vercel, DNS, Render and GitHub Pages changes need Shannon's confirmation first.
- Ask Shannon one question at a time.
