# Design Spec — Winking Star case study

**File:** `project-winkingstar.html`
**Date:** 2026-05-17
**Author:** Shannon Hecker (via brainstorming flow)
**Status:** Draft for review

---

## 1. Goal

Add a Winking Star case study to `shannonhecker.com` to close the portfolio gap on native mobile. The existing thirteen case studies are web-heavy: TripUp is the only mobile entry and it's an unbuilt design challenge. Winking Star is the first **shipped** native mobile product on the portfolio.

Framing: **mobile-first.** "I shipped a native iOS app (iPhone + iPad responsive) + companion web app." The web is the companion; the iOS app is the headline. iPad responsiveness across all five tabs is a real craft point and should be visible in screenshots and copy, not buried.

## 2. Audience

Hiring managers for design-engineering / mobile roles. Recruiter-30s-scan register, not peer deep-dive. Same tone as `project-ausos.html`.

## 3. Honesty constraints

- **App status:** Say "shipped to iOS and web". Do **not** specify "App Store", "TestFlight", or "in review" — the channel state changes and the page would lie.
- **Vocabulary lock.** Use the current product vocab on every visible string:
  - `superstar` not `kid`
  - `activity` not `task`
  - `star` not `sticker`
  - `pet pal` / `pet pals` not `pet`
  - `grown-up` not `parent` or `parent controls`
- **No real superstar names in screenshots.** Any image showing a child's name (`Nathan`, etc.) must be scrubbed before publication.
- **No COPPA / Firestore rules deep-dive.** Out of scope for this recruiter-friendly cut.
- **No v1.1 roadmap section.** Show what's live, not what's planned.
- **No em-dashes in display copy** (portfolio-wide rule, `VOICE.md`).

## 4. Page structure (8 sections)

Modelled on `project-ausos.html`. Same shell, same CSS classes, same `proj-about-layout` two-column structure. Section weights map to recruiter-scan priority.

| # | Section | Weight | Notes |
|---|---|---|---|
| 1 | Project Overview | ███ | What it is, who it's for, what's live |
| 2 | My Role | ███ | Solo design + RN/Expo build + Firebase + ASC submission |
| 3 | Design Thinking Process | ██ | 5-phase arc, validated with real families (interview transcripts in `weekly-superstar-research/`) |
| 4 | Brand Identity | ██ | Earthy palette swatches + doodle direction + pet-pals art grid |
| 5 | Cross-platform: iOS + Web | ██ | Shared Firestore + shared tokens; native iOS for haptics + sticker-sheet scan + universal links |
| 6 | Decisions (3) | ██ | See §6 |
| 7 | Outcomes | ███ | Numbers grid |
| 8 | Tags | █ | Chip strip |

## 5. Hero

- **Format:** Looped MP4, light only (Winking Star is a light-mode-only product — iOS forces `userInterfaceStyle: light`).
- **Content:** Composite of 4–6 fresh `/private/tmp/winkingstar-*.png` simulator captures cross-faded with subtle Ken Burns motion, ~10s loop, in iPhone frame.
- **Cover bg:** `#F8F1E4` (earthy cream) in light theme; `#F7F5EF` (splash bg) in dark theme. Override `html[data-theme="dark"] .proj-cover` background to keep the warm tone — the video stays light because the product is light.
- **Aspect:** `16/7` to match other case studies.
- **Fallback poster:** First-frame still as `assets/winkingstar-poster.webp` for slow connections + preload.

Built as a **parallel asset workstream** post-spec-approval using Remotion (path B from the brainstorm). macOS 12 workaround applies — see `reference_remotion_macos12.md`.

## 6. Decisions to surface (exactly 3)

Each follows the `project-ausos.html` "Decision N. Title / Options considered / What I chose / Why" pattern.

### Decision 1. Native iOS, not just responsive web
- **Options:** PWA only; responsive web wrapped in WebView; native React Native / Expo build.
- **Chose:** native RN/Expo.
- **Why:** haptics, push notifications, universal links to `winkingstar.com`, App Store distribution, and real mobile gestures all needed a real native runtime. PWA would have shipped the same screens but felt like a web page on iOS.

### Decision 2. Pet pals are a random surprise; themes are chosen
- **Options:** let superstars pick their pet pal; let them pick both; randomise both.
- **Chose:** themes are picked by the grown-up per superstar; pet pals appear as a surprise after a weekly milestone.
- **Why:** two different design jobs. Themes are personalisation — the superstar should see themself in the page chrome every day. Pet pals are dopamine — surprise drives the moment, and freedom of choice would have killed the reveal.

### Decision 3. Physical sticker sheet → digital sync
- **Options:** digital-only stars; printable reward sheet, no sync; printable sheet with camera scan-back.
- **Chose:** printable activity sheet with camera scan that mirrors stars back to the chart.
- **Why:** families wanted both the physical reward of putting a sticker on the fridge and the digital memory in the app. Scanning closes the loop without making the grown-up double-track.

## 7. Outcomes (numbers grid)

Four tiles in a row, same component as `proj-outcomes` on the ausōs page.

| Number | Label |
|---|---|
| `3` | Form factors shipped (iPhone, iPad, Web) |
| `8` | Weeks design + build |
| `19` | EAS production builds |
| `10+` | Themes + pet-pal pairs designed |

> **Note for review:** numbers are placeholders pulled from memory. User must verify before publish.

## 8. Tags (chip strip)

`Mobile · iOS · iPad · React Native · Expo · Firebase · Family Product · Side Project · Design Engineering`

## 9. Brand identity section — what to show

### Palette swatches (4 circles, same layout as ausōs brand-identity block)

| Swatch | Hex | Label |
|---|---|---|
| `cream` | `#F8F1E4` | Card surface |
| `sage` | `#9DAC85` | Panel tint |
| `terracotta` | `#AE5525` | Accent + CTA fill (AA retuned 2026-04-29) |
| `cocoa` | `#5A3A2E` | Body + primary CTA label |

### Two image grids

- **Doodle direction grid** (2 columns):
  - `winkingstar-doodle-map.webp` (lifted from `weekly-superstar-ios/assets/ui-icons/illustrations/doodle-map.png`)
  - `winkingstar-doodle-treasure.webp` (lifted from `doodle-treasure-box.png`)

- **Pet pals grid** (4 thumbnails, ~10 pet-pal illustrations rotated): bear · fox · unicorn · deer · elephant · robot · rocket · penguin (lifted from `assets/graphics/*.png`).

### Copy
> The Winking Star brand sits in a warm, earthy palette — cream, sage, terracotta, cocoa — with hand-drawn doodle illustrations replacing flat icons across the headers and tab bar. Contrast was retuned for WCAG AA in April after an accessibility sweep flagged the original terracotta and divider tokens.

## 10. Cross-platform section — what to show

A three-up form-factor grid:
- iPhone capture (`winkingstar-final-home.png`)
- iPad capture (`winkingstar-treasure-ipad.png`)
- Web/laptop capture (from `winkingstar.com` — needs fresh grab)

Stacked horizontally on desktop, stacked vertically on mobile. Caption notes the iPad responsive sweep was a full pass across the five-tab IA, not just a stretched iPhone layout.

### Copy
> One Firebase project, one token system, three form factors. The web app at winkingstar.com and the iOS app at `com.winkingstar.app` share the same Firestore data, the same earthy palette, and the same Nunito typography. The iOS app runs natively on iPhone and iPad, with a responsive sweep across Home, Activity, Treasure, Progress, and More so the layout reads as designed-for-iPad, not stretched-iPhone. The iOS app adds custom haptics, push notifications, sticker-sheet scanning, and universal links. The web app stays where a grown-up's laptop and a TV-cast view live.

## 11. Screenshot shortlist (4–6 to embed in body)

All from `/private/tmp/`, fresh May 13–17. Scrub any names visible.

1. `winkingstar-final-home.png` — multi-superstar overview (May 15)
2. `winkingstar-progress-installed.png` — Progress tab adventure map (May 15)
3. `winkingstar-copy-pet-iphone.png` — Pet-pal moment, latest copy (May 14)
4. `winkingstar-demo-board.png` — Demo board (try-before-signin) (May 13)
5. `winkingstar-treasure-ipad.png` — Treasure tab on iPad (May 14)
6. `winkingstar-landing-art-after.png` — Latest landing-art treatment (May 17)

## 12. Meta + SEO + JSON-LD

Mirror `project-ausos.html` structure.

- **Title:** `Winking Star · Native iOS + iPad + Web habit tracker for families · Shannon Hecker`
- **Description (≤160 chars):** _"Winking Star: a habit tracker for families, shipped on iPhone, iPad and web. Solo design and build. Earthy brand, doodle illustrations, sticker-sheet scan."_
- **OG:** same `og:image` system as ausōs — generate `assets/winkingstar-card.webp` from hero still.
- **Canonical:** `https://shannonhecker.com/project-winkingstar.html`
- **JSON-LD:** `@type: CreativeWork`, datePublished `2026-05-17`, author Shannon Hecker; plus `BreadcrumbList` Home → Work → Winking Star.

## 13. Work-grid card (`work.html`)

Insert as **position 02/14**, displacing existing 02–13 by one. Match `bc-6` width (same as ausōs).

```html
<article class="pcard-article"><a href="project-winkingstar.html" class="pcard">
  <div class="pcard-img">
    <img src="assets/winkingstar-card.webp" alt="Winking Star iOS app" width="1200" height="720" loading="lazy" decoding="async" />
  </div>
  <div class="pcard-body">
    <div class="pcard-meta"><span class="pcard-num">02 / 14</span>…</div>
    <div class="pcard-title">Winking Star</div>
    <p class="pcard-desc">Family habit tracker shipped on iPhone, iPad and web. Native React Native app with iPad-responsive sweep, custom haptics, doodle illustrations, and a sticker-sheet camera scan.</p>
    <div class="pcard-tags"><span class="chip chip-default">Mobile</span><span class="chip chip-default">iOS</span><span class="chip chip-default">iPad</span><span class="chip chip-default">Side Project</span></div>
  </div>
</a></article>
```

Also update `work-hero-sub`: change "Thirteen projects" → "Fourteen projects" (and the meta description).

## 14. Files to create / modify

### Create
- `project-winkingstar.html` (≈700 lines, modelled on `project-ausos.html`)
- `assets/winkingstar-card.webp` (1200×720 cover for work-grid + OG)
- `assets/winkingstar-poster.webp` (hero video poster)
- `assets/winkingstar-hero.mp4` (Remotion-built composite, light only)
- `assets/winkingstar-palette-*.webp` (optional — swatches can be inline divs)
- `assets/winkingstar-doodle-{map,treasure}.webp` (from iOS repo `ui-icons/illustrations/`)
- `assets/winkingstar-petpals-{bear,fox,unicorn,deer,elephant,robot}.webp` (from iOS repo `assets/graphics/`)
- `assets/winkingstar-shot-{home,progress,pet,demo,treasure,landing}.webp` (from `/private/tmp/`, scrubbed)

### Modify
- `work.html` — insert card at position 02; bump all later `pcard-num` from `0N / 13` → `0N+1 / 14`; update `work-hero-sub` count.
- `sitemap.xml` — add `<url>` for `project-winkingstar.html` at priority `0.8`; bump `lastmod` on touched pages.
- `index.html` — grep `project-ausos\|project-barclays` to confirm whether a featured-work strip exists on the homepage; if it does, insert Winking Star into the first or second slot to match the work.html ordering.
- Project-nav `proj-next` block — update `project-ausos.html` (currently links Next → Barclays); now Next should go to Winking Star → Barclays.

### NOT modifying
- `assets/portfolio.css` — reusing existing classes.
- `VOICE.md` — already covers the no-em-dash rule.
- `CLAUDE.md` — already current.
- `sh-tokens` repo — no new tokens needed.

## 15. Asset prep workflow (Remotion video — parallel workstream)

1. Pick 4 hero frames from `/private/tmp/`: home, activity, pet-pal moment, treasure.
2. Scrub names in Photoshop or via a simple text-mask overlay.
3. Build Remotion composition `WinkingstarHero` at 1080×472 (matches 16/7):
   - iPhone frame PNG behind each shot
   - 2.5s per shot, 0.4s cross-fade
   - Subtle 1.02× zoom over each shot (Ken Burns)
   - Output: `winkingstar-hero.mp4`, H.264, 30fps, ~2MB target
4. Render with macOS 12 workaround: `npx remotion render --binaries-directory=./bin`.
5. Generate poster: first frame as `winkingstar-poster.webp`.
6. Generate work-grid card image: export first frame of hero MP4 at 1200×720, convert PNG → `winkingstar-card.webp` via Squoosh.

## 16. Acceptance criteria

- [ ] `project-winkingstar.html` validates as HTML5 (no console errors)
- [ ] All recruiter-visible vocab matches the lock: superstar / activity / star / pet pals / grown-up
- [ ] Zero em-dashes (`—`) or en-dashes (`–`) in display copy
- [ ] Zero real superstar names visible in any embedded image
- [ ] Page renders correctly in both light and dark themes (dark = cream-bg override on hero, body content readable)
- [ ] Lighthouse accessibility ≥ 95 (existing case studies sit at 95–100)
- [ ] WCAG AA contrast on every text/bg pair (verify with `accesslint:contrast-checker`)
- [ ] Hero MP4 ≤ 4 MB, autoplay works in Safari + Chrome
- [ ] Card slot 02/14 inserted on `work.html`, other cards renumbered, count text updated
- [ ] Sitemap updated, lastmod current
- [ ] Page header / footer / nav match other project pages exactly

## 17. Out of scope (explicitly)

- Dark-mode variants of the app screenshots (product is light only)
- Server-side rendering or build tooling changes
- New CSS file or design tokens
- COPPA / Firestore rules narrative
- v1.1 roadmap section
- App Store / TestFlight specific copy
- Android-specific narrative
- App Store screenshot strip (separate work, lives in `weekly-superstar-ios/docs/app-store.md`)
- New writing post (this is a case study, not an essay)

## 18. Implementation phases (preview)

To be detailed in the implementation plan after spec approval. Rough sequence:

1. **Phase 0 — Asset prep** (parallel): scrub screenshots; build Remotion hero; export card image.
2. **Phase 1 — Page scaffold**: clone `project-ausos.html` → `project-winkingstar.html`; swap meta + JSON-LD + breadcrumbs + project-nav.
3. **Phase 2 — Content fill**: copy in overview + role + decisions + outcomes per this spec.
4. **Phase 3 — Brand + screenshot grids**: swatches, doodle grid, pet-pals grid, screenshot inline grid.
5. **Phase 4 — Work-grid insert**: `work.html` edits + sitemap.
6. **Phase 5 — Pre-ship verification**: vocab check, em-dash grep, contrast pass, Lighthouse, preview on Vercel/local.
7. **Phase 6 — PR**: branch `feat/winkingstar-case-study`, `gh pr create`, await explicit go before merge.
