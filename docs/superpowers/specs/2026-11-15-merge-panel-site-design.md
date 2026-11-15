# Merge the Revolut panel site into shannonhecker.com

Design, 15 November 2026. Status: revised after two independent reviews
(Opus builder check, Fable review) and Shannon's answers to the questions
they raised. Awaiting her approval.

## Intent

Shannon has two portfolio sites that drift apart. The Revolut panel site
(`~/shannonhecker-protofolio-review`, live at
https://shannonhecker-work.vercel.app/panel) has the newest case writing, the
"Working Order" mini game and the pixel avatar cursor. shannonhecker.com (this
repo) is the public site, with more projects, Writing, About and the Ask
Shannon chat, but older case content and an older look.

She wants one public site at shannonhecker.com that looks like the panel site
and carries its game, cursor and case content, without losing what the public
site has.

## Decisions Shannon made (15 Nov 2026)

1. **Look:** the panel site's design becomes shannonhecker.com.
2. **Projects:** all 15 stay. The 5 panel cases lead; the 10 other public
   projects are rebuilt in the panel style.
3. **Carry over:** Writing (index plus 3 articles), About me, Ask Shannon
   chat, dark mode.
4. **Hosting:** shannonhecker.com moves from GitHub Pages to Vercel.
5. **Panel link:** stays live, frozen and untouched.
6. **Content:** nothing new. The panel site is the latest. Where the two
   sites disagree, the panel site wins.
7. **Work layout:** the home page shows the game and the 5 panel cases, with
   a "More work" link to a Work page that lists all 15 (Selected 5, then
   Earlier work 10).

## Goals

- shannonhecker.com serves the panel design, the game with a working
  leaderboard, the avatar cursor, 15 project pages, Writing, About, privacy,
  404 and the Ask Shannon chat.
- Every old public URL still lands somewhere sensible.
- The site is public and indexable (the panel site is hidden from search;
  this one is not).
- Light and dark both look finished on every page.

## Non-goals

- No new content, no new projects, no copy rewrite beyond what the rules
  below require.
- No change to the panel repo, its Vercel project or its scoreboard data.
- No redesign of the game.
- No change to how the Ask Shannon server works or to its admin dashboard.
  Its built-in facts are in scope (see Ask Shannon chat).

## Anti-goals

- Anything that changes what the Revolut panel sees at the panel link.
- Claims that contradict the panel site or LinkedIn.
- The Revolut hero line, or any "for the panel" framing, on the public site.
- A public site that is still marked noindex after go-live.

## Constraints

- **This repo lives in iCloud and most files are not downloaded.** The
  `assets/` folder shows as "dataless". Download before reading
  (`brctl download <path>`), or read from git (`git show HEAD:assets/x`).
  Pushes can stall; retry with `GIT_TERMINAL_PROMPT=0`.
- **Voice (`VOICE.md`):** no em dashes or en dashes anywhere a visitor reads,
  British English, the block list of AI cliches. Panel rules also apply:
  first person, `uoaui.ai` lowercase.
- **Facts:** titles and dates match LinkedIn. J.P. Morgan "User Experience
  Designer" Aug 2016 to Jan 2023, "Digital Product Designer VP" Feb 2023 to
  Sep 2025, internship June to September 2016. Barclays "Lead Product
  Designer" from Sep 2025. Deal Model 2022 to 2023. No unmeasured metrics.
  Never present simulated or household research as real user research.
- **Barclays NDA:** no real Barclays screens or client names. FX is "beta".
- **Game:** no Nintendo characters, sprites, sounds, items or names.
- **Workflow:** branch, PR to `main`, `npm run build` and
  `npx playwright test` green before pushing. Ask Shannon one question at a
  time.
- **Build outside iCloud.** Work in a normal clone of this repo (for example
  `~/shannonhecker-site`), not the iCloud folder. iCloud creates duplicate
  files such as `about 2.astro`, which Astro would publish as pages.
- **Copy cleanly.** Bring the panel code across with `git archive` of its
  `main`, so `.vercel/`, `.env.local`, `node_modules`, `dist` and test output
  never come along. The panel's `.vercel/project.json` names the panel's
  Vercel project; copying it would deploy over the panel link.
- **Size:** the panel site carries about 216 MB of images (`public` 86 MB,
  `src/assets` 130 MB). They come across with the code.

## Approaches considered

- **A. Copy the panel code into this repo and build on it. Chosen (Claude's
  call; Shannon left the how to Claude).** The panel repo is never touched,
  so decision 5 is guaranteed. This repo keeps its name, history and domain.
  Cost: two codebases share a design, and a later fix to the game has to be
  made twice if the panel site should get it too. Acceptable because the
  panel site is meant to stay frozen.
- **B. One codebase, two deployments** with a flag for panel versus public.
  Less duplication, but every public change would redeploy the panel link.
  Works against decision 5.
- **C. Port the game, cursor and content into today's static HTML.** Works
  against decision 1: the panel look would have to be rebuilt by hand.

## The design

### Code base

On a branch of this repo, replace the static HTML site with a copy of the
panel site's Astro project (source, public files, tests, config). The old
pages stay readable in git history and serve as the content source for the
pages below. Stray duplicates (`index 2.html`, `index 3.html`,
`project-data-solution 2.html`) and the unused Vite and React shell are
removed.

### Pages and addresses

| Page | Address | Source |
|---|---|---|
| Home | `/` | Panel home, without the Revolut line |
| FX, Fusion, Deal Model, Winking Star, uoaui.ai | `/fx`, `/fusion`, `/deal-model`, `/winking-star`, `/uoaui` | Panel site, unchanged |
| Work | `/work` | New. Selected (5), Earlier work (10) |
| 10 earlier projects | `/work/<slug>` | Today's public pages, restyled |
| Writing index and 3 articles | `/writing`, `/writing/<slug>` | Today's public pages, restyled |
| About | `/about` | Today's public page, restyled |
| Privacy, 404, build log | `/privacy`, 404, `/build` | Panel site; privacy text merged with the public one |

There is no `/panel` page on the public site. `/panel` redirects to `/`.

The 10 earlier projects and their slugs: `algo-center`, `stock-dashboard` (was `barclays-data-viz`),
`complex-assets`, `corporate-action`, `data-solution`, `design-system`,
`dps-brand`, `research`, `tripup`, `ui-toolkit`. Order on the Work page
follows today's `work.html`.

Old addresses redirect permanently:

- `/project-analytics.html` to `/fusion`, `/project-deal-model.html` to
  `/deal-model`, `/project-uoaui.html` and `/project-ausos.html` to `/uoaui`,
  `/project-winkingstar.html` to `/winking-star`.
- `/project-<slug>.html` to `/work/<slug>` for the 10 earlier projects.
- `/work.html`, `/about.html`, `/writing.html`, `/privacy.html`,
  `/writing-<slug>.html` to their new addresses.
- `/assets/CV_ShannonH.pdf` keeps working at the same address.

### Earlier project pages

One shared, simple template in the panel style: title, one-line summary,
role and dates, the page's existing images at full proportion (never
cropped), and its existing words. No game art, decision maps or diagrams;
those belong to the 5 panel cases. Words move across as they are, with only
these edits: dashes replaced per `VOICE.md`, and any title, date or claim
that contradicts the panel site or LinkedIn corrected to match.

### Home and navigation

Home is the panel home: hero ("I design tools where mistakes cost money."),
the 5 cases, the game section, How I work, footer. A "More work" link after
the 5 cases goes to `/work`.

Navigation: Work, Writing, About, the theme switch and Contact. The brand
link goes to `/`. The five per-case links in today's panel navigation move
to the Work page so the bar stays short.

### Game and leaderboard

The game comes across unchanged with its server functions
(`api/game-run.ts`, `api/leaderboard.ts`, `server/scoreboard.ts`). The public
site gets its own scoreboard so the panel's scores are never read or
written. That takes three things: a new Vercel project (never the panel's
`shannonhecker-work` project), a new Redis store with its own
`KV_REST_API_URL` and `KV_REST_API_TOKEN` (the token also signs runs; there
is no separate secret), and a changed key prefix in
`server/scoreboard.ts` (today `portfolio:v1:<env>`, the same as the panel's)
so the two can never mix even if a token is reused by mistake.
If the store is missing, the game still plays and the board shows its
existing "resting" message.

### Avatar cursor

Comes across unchanged (`src/scripts/avatar-cursor.ts`, its styles and
sprites, its on/off switch in the footer). It keeps its rules: only on
devices with a mouse, off when reduced motion is set, the normal cursor
returns over text fields, video, canvas and the game. The 5 cases keep their
own outfits; every other page uses the default outfit.

### Dark mode

The panel site already has a light and dark switch that every panel page
supports, so the carry-over is: make the new templates (Work, earlier
projects, Writing, About, chat) use the same colour tokens, and check each
in both themes. Both sites open in dark for a first-time visitor today and
the merged site keeps that; the switch remembers a choice.

### Ask Shannon chat

The chat server stays on its host (`https://ask-shannon-api.onrender.com`),
which already accepts requests from shannonhecker.com. The widget
(`assets/ask-shannon.js` and `.css`) is rebuilt as a component in the panel
style and both themes, on Home only, as today. Every feature it has today is
listed and kept, including speech-to-text.

- The server's built-in facts are corrected to match the site and LinkedIn
  (`api/server.js` near lines 296 to 320 still says "Senior Product
  Designer", "Vice President, Product Design (2019 to 2025)", "13 case
  studies" and quotes percentages). Pending Shannon's answer below.
- The chat server's folder moves from `api/` to `chat-server/` so it does not
  collide with the game's `api/` functions. Its host builds from the `api`
  folder (`api/render.yaml`), so this is sequenced: Shannon changes the root
  folder in the Render dashboard at the same moment the change merges, and
  the chat is checked straight after.
- The server only accepts shannonhecker.com and localhost, so the chat is
  tested locally before go-live and on the live domain after. Preview links
  are not expected to reach it.

### Made public, not copied as is

The copied code is set up for a private share. Each of these changes:

- Site address in `astro.config.mjs` becomes https://shannonhecker.com, which
  drives canonical and share links.
- The noindex meta tag in `src/layouts/Base.astro` and the `X-Robots-Tag`
  header in `vercel.json` are removed.
- Analytics in `src/scripts/analytics.ts` only fires on the panel hostname;
  it is switched to shannonhecker.com.
- The HTTPS header drops `includeSubDomains; preload`. The live site sends
  no such header today and other subdomains may exist.
- The permissions header allows the microphone for this site, which the
  chat's speech-to-text needs. The security policy allows the chat server.
- `/build` is not published. It renders the panel's build log, which is
  about the Revolut interview.
- All 37 `/panel` references in the tests, and the navigation and footer
  links, are updated. The build must contain no `shannonhecker-work` string.
- En dashes in panel text that visitors read (for example
  `src/components/GameBox.astro`) are replaced.
- `VOICE.md` is updated where the merged site changes a rule it sets, such
  as the canonical title line, once Shannon signs off the hero.

### Search and sharing

Remove the noindex header and meta tags, restore `sitemap.xml` and an open
`robots.txt`, keep per-page titles, descriptions and share images, and keep
the structured data the public site has today. Analytics keeps the public
site's measurement ID with the panel site's consent banner.

### Go-live

GitHub Pages publishes this repo's `main` directly, so merging the new code
before the domain moves would take shannonhecker.com down. The order is:

1. Push a `legacy-static` branch at today's `main` and point GitHub Pages at
   it. The live site is now independent of `main`. Confirm it still serves.
2. Build on a branch in a new Vercel project; review on its preview link.
3. Shannon reviews the preview on desktop and phone, light and dark.
4. On her OK: merge to `main`, Vercel deploys it, add shannonhecker.com to
   the new Vercel project, and she changes the DNS (Claude supplies the
   exact records). The Render root-folder step happens here.
5. Check the live domain, then turn off GitHub Pages.
6. Rollback: point DNS back at GitHub Pages, which still serves
   `legacy-static`.

## Checks before calling it done

- Build and the full Playwright suite pass, with tests updated for the new
  pages and for the removed `/panel` page.
- Every old address in today's `sitemap.xml`, plus `/index.html` and
  `/project-ausos.html`, returns a redirect to a live page.
- Every canonical and share link is on shannonhecker.com; no
  `shannonhecker-work` string in the build; the Vercel project ID differs
  from the panel's.
- The CI Lighthouse gate covers the new page types and no longer skips the
  crawlable check.
- Phone-sized and desktop screenshots of every template in light and dark,
  reviewed, with no cropped images.
- No em or en dashes in visitor-facing text; no noindex anywhere.
- Game plays, a score saves to the public board, the panel board is
  unchanged.
- Chat answers a question locally before go-live and on the live domain
  after, and its answers match the site's titles and dates.
- The panel link renders the same before and after.

## Left to the builder

- The exact visual design of the Work page rows, the earlier-project
  template, the Writing article template and the chat widget, within the
  panel site's existing tokens and components.
- How earlier-project content is stored (Astro content collection or data
  files).
- Whether chat on a Vercel preview link needs a temporary allowed origin or
  is tested through a local proxy.
- Order of work and how it splits into PRs.

## Calls Claude made (check these)

- Approach A, a copy in this repo.
- Earlier projects at `/work/<slug>`; no `/panel` page on the public site.
- Navigation shortened to Work, Writing, About.
- The public site gets its own leaderboard, starting empty.
- The chat server stays on Render.

## Order of work

1. Content sign-offs with Shannon (done, see the decisions below).
2. Clean copy into a clone outside iCloud; new Vercel project and store.
3. Make it public: addresses, search, analytics, headers, redirects.
4. New templates: Work, earlier projects, Writing, About.
5. Chat widget and chat facts.
6. Rehearsed go-live.

## Content decisions Shannon made after the reviews (15 Nov 2026)

1. **Figures on the earlier project pages stay as written.** She reviewed
   every number claim in context (Corporate Action 40% and 60%, Complex
   Assets 3x and 95%, Research 4x and +35%, Algo Center 60%, Design System
   100%, and the screen and component counts) and said they are OK. Do not
   remove, soften or relabel them.
2. **Personal details.** Remove from the public site: the "Published under
   my legal name" line on the Winking Star case
   (`src/components/CaseWinking.astro`), and the two "I had a baby" entries
   (2018, 2021) in `src/lib/game-timeline.ts`. Keep: the Barclays and
   J.P. Morgan logos on the game map.
3. **Chat facts are corrected** to match the site and LinkedIn. The changed
   lines are shown to Shannon before they go live.
4. **Hero is the panel hero**, word for word, without the Revolut line:
   "I design tools where mistakes cost money." and the panel intro paragraph.
   `VOICE.md`'s canonical title line is updated to match.
5. **Analytics asks first and keeps both.** The panel's consent banner gates
   Google Analytics and Microsoft Clarity; neither loads before a visitor
   agrees. The privacy page and the security policy cover both.
6. **The hidden "seeking a job" search note is removed.** Other structured
   data carries over: person, and per-page project, breadcrumb and article
   data.
7. **The Barclays data visualisation page stays without the Barclays name.**
   Retitled as a stock dashboard design task, with no mention of Barclays or
   Front Office in text, image names, alt text or metadata. Its slug is
   `stock-dashboard`; `/project-barclays-data-viz.html` redirects there. The
   changed lines are shown to Shannon before go-live.
