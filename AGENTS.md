# For any coding agent working on this repo

Read `docs/HANDOFF.md` first: it has the rules, the decisions already made,
the content sources and the next steps.

Essentials:
- Shannon's words stay as they are. Add images, space and diagrams around them.
- Barclays is under NDA. No real screens, no client names. FX is "beta".
- No unmeasured metrics. Dates match `docs/HANDOFF.md`.
- First person, no em dashes, `uoaui.ai` lowercase.
- Branch per change, PR to `main`. Before pushing: `npm run build` and `npx playwright test`
  (set `PW_CHROMIUM_PATH` to a local Chromium if the default download is unavailable).
- Ask Shannon one question at a time.
