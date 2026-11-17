# Visits, game play and the scoreboard

## Private reporting

Google Analytics account 39719067 / property 530565049, existing “Portfolio site”
web stream. Measurement ID `G-795LXWTYWM` is public configuration, not a secret.
Reports: https://analytics.google.com/analytics/web/#/a39719067p530565049/reports/reportinghub

Only the production hostname `shannonhecker-work.vercel.app` sends events. Local
and Vercel preview builds do not. Basic consent: no Google script or request until
opt-in; ad storage, ad user data, personalization and Google Signals stay off.
Footer settings allow refusal/revocation. Choice lasts six months. A visitor
count is a count of consenting browser users, not an exact count of people.

- `page_view`: page path and title, no query/hash; referrer origin only.
- `portfolio_scroll`: 25/50/75/90% once per page, `percent_scrolled`, `page_path`.
- `game_start`: Press to play.
- `level_start`: every stage attempt including restarts, `level_name` (1–8), `stage` (0–7).
- `level_end`: stage completion, `level_name`, `stage`, `success`, `collected`, `hits`, `active_seconds`.
- `game_exit`: Exit button / overlay Escape, current stage. Native browser fullscreen exit alone may not report this event.
- `post_score`: deliberate successful sharing, `score`, `level`. No nickname or run receipt.

Use Realtime to check new events; Reports → Engagement → Events for event counts.
Event-scoped dimensions **Game stage** (`stage`) and **Reading depth**
(`percent_scrolled`) were created and visibly verified in Admin → Custom
definitions on 10 October 2026. Standard page reports cover page paths. Optional
custom metrics `active_seconds`, `collected`, `hits` are not yet registered.
Google's standard `level_name` supports the recommended level events. Reporting
starts at deployment and depends on consent, blockers and normal reporting delay.

## Public scoreboard

Upstash free plan, London, `portfolio-game`, connected to `shannonhecker-work`.
Paid auto-upgrade and production pack disabled at provisioning. API credentials
stay in Vercel environment variables and ignored `.env.local`.

Node API functions `/api/game-run` and `/api/leaderboard` use Redis REST. Signed
run receipts bind stage, environment and start time, expire after two hours;
submissions validate collectible limits and elapsed time, then compute scores on
the server: max(100, 100 + 25 × pickups − 10 × hits). These are per-stage runs,
not unique people or whole-game totals. Browser gameplay remains client reported;
basic bounds are not a cheat-proof simulation or competitive ranking guarantee.

A Redis Lua transaction consumes each receipt and inserts once atomically, so a
lost-response retry does not duplicate a result. Keep 100 entries per stage,
show top ten. Public response fields are nickname and score only. Optional names
allow 20 letters/numbers/spaces/hyphens/underscores and render through textContent.
No leaderboard submission happens automatically. Outages do not stop play.

Write requests require same-origin JSON and are limited to 120/hour by a daily
keyed address digest (one-hour expiry). Preview/development and production keys
are separate; no raw addresses or visitor counters are stored in this database.
The first-party game run request is functional storage, independent of Analytics.

## Verification

- 94 local tests pass, including receipt tampering/expiry/environment replay,
  impossible scores, cross-origin rejection, consent refusal/revocation and
  production-host tag loading with query strings removed.
- Real provisioned Redis check: two concurrent submissions stored one preview
  result; only nickname/score were returned. The isolated test result was removed.
- Build: nine routes. Astro check: 88 files, zero diagnostics.
- Local visual/performance checks passed. Deployment verification is tracked separately in TASKS/QUALITY; do not infer live status from this document.

Official implementation references:
https://developers.google.com/tag-platform/security/guides/consent
https://vercel.com/docs/functions/runtimes/node-js
https://upstash.com/docs/redis/features/restapi

The deployed preview API was verified on `e0fa8aa`: run receipt, score write,
public read and repeat submission succeeded; the isolated test entry was removed.
See PR #25 for final CI and production verification.
