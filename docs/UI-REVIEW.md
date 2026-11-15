# Independent UI review · 12 October 2026

Reviewed local `http://127.0.0.1:4341` through CUA Chrome using the frontend-design skill. This is a focused visual checkpoint, not an award or exhaustive accessibility certification. Root changed the persona template during this review; findings below refer to the new template.

## Defects

### P1 · Deal Model hero disappeared on desktop — corrected and verified

`src/components/CaseDeal.astro:43`: the absolutely positioned hero figures had a parent with automatic inline margins, no explicit width and no in-flow content. At a 1440 × 960 viewport the parent and both loaded images measured **0 × 0**; the right half of the hero was empty. The mobile grid declaration was also overridden by a later `display:block!important` base declaration.

Reported to root, who added width:100% and moved the base display rule before the mobile override. Rechecked in CUA: desktop hero **801.6 × 612.3**, both original screenshots visible; mobile **350px** container, computed `display:grid`, **24px** gap, no document-level horizontal overflow.

Proof: `/private/tmp/portfolio-ui-review/deal-hero-fixed-desktop.jpg`, `/private/tmp/portfolio-ui-review/deal-hero-fixed-mobile.jpg`.

### P2 · Dense product screenshots have no direct full-size interaction

`src/components/ProductCapture.astro:15` renders a plain image in a figure. The Fusion and uoaui product screenshots become approximately 350px wide on a phone, so their fine interface text cannot be read. Deal hero figures in `src/components/CaseDeal.astro:20` and `:21` similarly render plain `Pic` images. These images have no tap target to open the exact source, unlike the decision-option artwork.

Suggested correction: make the image itself an accessible full-size link or a zoom target. Keep the removed metadata/caption toolbar absent. Do not upscale, redraw or add a frame. Browser pinch zoom exists, but an explicit image target is more discoverable and avoids zooming the entire long case page.

### P3 · uoaui hero introduces the product below a large decorative avatar

At 1440px the laptop avatar occupies most of the narrow left content column between metadata and the explanatory paragraph. The actual product explanation starts near the bottom of the first viewport, while the screenshot has no nearby short introduction. This is weaker than the other case heroes, where the problem is immediately legible. Consider placing the introductory paragraph before the avatar or reducing that avatar to a secondary identity accent. Source: `src/components/CaseAi.astro` hero avatar placement. This is a hierarchy improvement, not a rendering failure.

## New persona-template checkpoint

Desktop visual checks: Fusion, uoaui, Winking Star, Deal Model and FX. Cards at roughly 983px content width remain legible, with portrait heads visible, readable two-column goals/pain points, and a coherent context/response distinction. No blocker found in the shared new template. Phone visual checks include Fusion, uoaui, Winking Star and Deal Model; the identity row and single-column content fit the 350px content area. FX phone section was inspected, but its first full card was not captured cleanly before handoff; finish that specific check in the parent verification pass.

Evidence: `/private/tmp/portfolio-ui-review/fusion-persona-desktop.jpg`, `ai-persona-desktop.jpg`, `ai-persona-mobile.jpg`, `winking-persona-mobile.jpg`, `deal-persona-mobile.jpg`, `fx-persona-desktop.jpg` in the same directory. Some early viewport captures were scaled incorrectly by the browser screenshot tool; do not use the earlier Winking desktop or FX mobile capture as final proof. Resetting viewport, observing it, then applying the requested size produced accurate captures.

## Requested layout checks

- FX desktop full-flow section retains the left section label/right content alignment; screenshots fit the content column without document overflow at 1440px.
- Flow rules are above each item: computed border-top 2px, border-bottom 0px. Desktop arrows are on the title pseudo-element with top:0; the old item-center pseudo-element has content:none. Mobile uses downward connecting arrows.
- No `details` elements in inspected FX, Fusion and Deal pages. Section navigation is a jump menu, not hidden case content.
- The Fusion journey introduction and scenario copy are readable in stacked mobile layout. Project-specific journey and decision implementations were previously source reviewed, but this pass did not visually inspect every branch of every long page.
- Home hero was inspected at the normal desktop viewport. Final mobile-home/game and every-page full scroll still belong to the parent release verification; do not mark them complete on this report alone.

No app code was edited by this review. Root applied the Deal fix after receiving the independently observed defect.

## Final portrait and game checkpoint · 12 October, after alpha cutouts

The final shared card uses white identity, portrait and content areas with one accent hue. CUA inspection confirms the former opaque rectangles are absent on the Deal owner, approver and legal reviewer portraits. The FX phone card is legible with the portrait contained and its complete identity visible. New proof is in `/private/tmp/portfolio-final-review/`: `deal-persona-desktop.jpg`, `deal-legal-product-desktop.jpg`, `deal-persona-phone.jpg`, `fx-persona-phone.jpg`.

The apparent FX phone gap before personas is partly the original diagram's retained height: its convergence node lies outside the initial horizontal window. Measured spacing from the figure bottom to the persona section is 80px (persona margin 48px plus preceding layout gap). This is not a collapsed persona or missing image. Source: `CaseFx.astro:192` preserves a minimum 900px-wide original diagram inside horizontal scrolling. A smaller 48px inter-section separation could tighten the mobile rhythm, but cropping or shrinking the diagram would lose readable source detail.

### Full-screen phone map

Opened Start adventure at a 390 × 844 viewport and used the horizontal pan. The map occupies a roughly 356 × 538 window; the canvas renders at approximately 956 × 538 from its 480 × 270 pixel-art coordinate space. Labels and stage icons are readable and the map pans to London/other worlds. It is not the small letterboxed map described in the earlier user report. Exit full screen returns to the page. Evidence: `game-map-phone.jpg`. Rules are in `src/styles/type-rhythm.css:94–108`; this review exercised portrait emulation, not a physical iPhone/Safari.

### Scroll-lag audit: no proven timing regression

Normal CUA scrolling and navigation completed without stuck content during these checks. Static screenshots and automation round-trip duration cannot establish frame pacing, so this is not a 60fps certification. Source inspection confirms native scrolling with passive/rAF-coalesced chrome updates (`src/scripts/motion.ts:115`), no Lenis wheel interception, and game map rendering stops when hidden/offscreen (`src/game/main.ts:245–255,850–868`).

Two plausible profiling targets remain if physical-device lag persists: `motion.ts:33–38` measures all unrevealed `.rv.pre,.split.pre` elements each scroll update; `scroll-effects.ts:46–48` animates clip paths on individual heading words with scrub smoothing. They are hypotheses, not measured root causes. Do not remove motion or claim a performance fix solely from this source review.

For the user's narrower complaint that the **images feel laggy**, a targeted change is justified without claiming a frame-rate diagnosis: remove only the product-capture and project-hero scroll tweens in `scroll-effects.ts:56–63`. Their `scrub:.7` deliberately makes screenshots catch up after native scrolling, and `scale:.975` resamples fine UI text during that motion. Keeping screenshots stationary would remove that designed trailing sensation while retaining the text motion. This is an interaction-quality recommendation; no measured CPU/GPU performance gain is asserted.

## Evidence follow-up, 12 October

- ProductCapture raster/vector images and both Deal hero screens now link to their original asset, with a keyboard focus ring and descriptive new-tab label. No caption bars were added.
- Manual browser check at 390×844: tapping Fusion's discovery screenshot opens the 1465×1125 original in a new tab; tapping again displays native-size detail and allows scrolling. Proof: `/private/tmp/portfolio-evidence-review/fusion-original-zoom-phone.png`.
- Source review corrections: fixed arrival/evolving TWAP wording; FX study picker attributed to specification; removed unverified Fusion signings and Deal import-blocking statements.
- Three unsupported Deal alternative illustrations are no longer rendered. Their written alternatives remain. Two smart-pricing panels now use exact original Figma dialog exports, labelled explorations rather than implemented recommendations.

## Independent final visual follow-up, 12 October

Reviewed current local `http://127.0.0.1:4341` in Chrome through the browser skill/runtime at 1440×960 and 390×844. This is viewport emulation, not physical-device certification. No new material visual defect found in this follow-up.

- **Deal decisions:** both original smart-pricing dialog exports display intact; exploration status and supporting rationale are readable. At desktop the two captions naturally follow images with different aspect ratios; mobile stacks without collision or viewport overflow. The comparison decision's written-only alternative has no empty image placeholder. Dense source-screen labels require the provided full-size link. Proof: `/private/tmp/portfolio-final-review/deal-smart-pricing-desktop.jpg` and `deal-smart-pricing-phone.jpg`.
- **AI hero after portrait removal:** desktop and phone now lead directly with the product evidence, while retaining title, role, private-alpha status and introduction. Phone has no horizontal overflow. Proof: `/private/tmp/portfolio-final-review/ai-hero-desktop.jpg` and `ai-hero-phone.jpg`.
- **Home `/`:** inspected desktop hero, all five work cards, method grid and shared footer; inspected all five work cards, method stack and footer at phone width. Visible images load, text wraps, and the document has no horizontal overflow. The game was covered in the preceding checkpoint. `/panel` shares these components and was covered previously; it was not separately repeated in this follow-up.
- **Utility routes:** confirmed route files for `/404`, `/build`, and `/privacy`. Error-page heading and return link fit desktop and phone. Privacy content and shared footer are readable at both widths. Build-log introduction and headings fit both widths; a DOM geometry check across its content found no horizontal overflow at phone width. The roughly 44,000px desktop build log was not visually read entry by entry.

No awards outcome, exhaustive accessibility certification, or measured performance result is claimed. This review adds route coverage to the prior case-page, persona, map and full-size-image checks; the automated suite remains a separate verification owned by the parent agent.

## Full-case scroll pass · 12 October, latest persona spacing

Scrolled all five case routes (`/fx`, `/fusion`, `/uoaui`, `/winking-star`, `/deal-model`) to the footer in Chrome at 1440×1000 and 390×844 using the browser skill/runtime. Sampled viewport screenshots and visible-image loading state during the scroll; evidence log: `/private/tmp/portfolio-scroll-review.json`, screenshots `/private/tmp/review-{route}-{desktop,phone}-{step}.png`. This is a sampled craft review, not a frame-rate benchmark or a claim that every pixel was inspected.

The initial rapid FX pass exposed the section opacity reveal and temporary lazy-image blanks. Parent removed the case-section opacity reveal. Repeated FX desktop and all five phone passes with 500ms dwell found **zero visible unloaded images and zero document horizontal overflow**. Original journey graphics retain internal horizontal scrolling on phones, keeping their source labels readable. Fine product UI labels still require the provided original-size image link. Sampled personas, journey graphics, decision copy and source dialogs displayed without collisions or clipped card text. PM received the browser after viewport reset.

Earlier desktop Winking sampling encountered one image still loading at entry; the subsequent phone pass loaded all visible images at each sample. Page height changed during lazy content activation on several long pages; this pass does not establish a CLS score. The report verifies presentation/loading behavior, **not that current Figma source images match every website asset**; the renewed asset audit is tracked separately after the user's latest report.

### Current composition checkpoint, 12 October

The nineteen current Figma composition exports were inspected locally at 1440px and 390px. The uoaui builder/UI Kit retain their authored padded backgrounds, Deal retains its exact overlap, and Winking retains the staggered three-phone hero. The lower Winking iPhone sequence uses the exact full composition on desktop and separate authored phone frames on mobile, keeping Launch, Home, Activity and Progress in order. Home now selects the authored desktop/mobile crop without an additional CSS crop. Mobile FX/Fusion home images and Winking Launch/Home detail were visually checked in Chrome. Thirty focused layout, appearance and evidence tests pass. This is an image implementation checkpoint, not the final whole-site or scroll-performance sign-off.


## Final PM browser craft and scroll review · 12 October

Reviewed all ten local routes in Chrome through CUA at 1440×1000 and 390×844:
`/`, `/panel`, `/fx`, `/fusion`, `/winking-star`, `/deal-model`, `/uoaui`,
`/privacy`, `/build`, `/404`. Viewport overrides were reset and the review tab
closed afterward. This was a sampled visual/interaction pass on the current dev
build, not a physical-phone test or exhaustive inspection of every long-page pixel.

- Home and Panel: both hero/eyebrow variants fit; five project tiles retain the
  current original compositions. New responsive SVG candidates render on desktop
  and phone. Number/title/arrow and secondary copy remain aligned. No horizontal
  document overflow in the sampled Home geometry checks.
- FX: light desktop introduction, dark research/data diagram/personas/journey,
  dark phone introduction and persona jump inspected. Source artwork is intact;
  card names, role copy, one-accent panels and narrow layouts remain readable.
- Fusion: dark phone introduction/constraints, dark desktop design section and
  successive full product screens inspected. Original/rebuild qualifier stays
  visible. Scrolling through performance/risk screens showed complete images.
- Winking: light desktop introduction/personas/product board and light phone
  introduction/stacked flow inspected. Portrait colour equals response-panel
  colour; complete phone compositions remain intact.
- Deal: light phone introduction/decision links and desktop product-gallery and
  validation section inspected. Source-screen pairs and text summaries are
  distinguishable. Dense original screen details remain available via full-size
  links rather than enlarged or rewritten content.
- uoaui.ai: light desktop introduction, dark flow/current product screens and
  dark phone introduction/journey inspected. No missing media or clipped main
  copy found in these samples. Native Escape closes Sections; section links
  settle on their targets. A locator-generated Escape observation did not
  reproduce with native keyboard input and is not classified as a defect.
- Utilities: Privacy, Build and 404 inspected at both widths in dark mode.
  Heading/body/link wrapping is readable; Build and Privacy geometry checks
  show no document overflow. Keyboard Enter on the 404 return link reaches
  `/panel`. The archive clarification is visible on Build.

### Current-image loading observations

The first Home check occurred while responsive derivatives were being written
and showed blank tiles. After the asset owner confirmed completion, both desktop
and phone displayed all new compositions. During one rapid two-page phone-width
scroll, a single screenshot showed a blank content paint with navigation/cursor
still visible; the next observation displayed the Winking/Deal/AI rows normally.
DOM rows were visible at opacity 1. Repeated normal one-page and two-page scrolling
showed the images, and the desktop gallery repeat also rendered correctly. No
persistent blank, failed image or reproducible reading blocker was found.

This cannot establish the cause or duration of that transient paint, nor certify
60fps. Local automation screenshots and viewport emulation are not an on-device
trace. Current case image groups sampled through native scrolling had no blank
frames in the observed captures. Root's final build/browser suite and remote
performance budget remain separate gates for the exact release candidate.

No app code changes were needed from this craft pass. The requested award
standard is a review benchmark; this report claims no jury/award certification.
