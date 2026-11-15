# Portfolio delivery checklist

Current audit: 12 October 2026. This is the authoritative current checklist.
Older TASKS.md and QUALITY.md describe historical releases. Completion requires
source, rendered implementation and deployed result to agree.

**Current state:** PR [#49](https://github.com/shannonhecker/shannonhecker-protofolio-review/pull/49)
is open; latest pushed head `b82758c4923095e8c6d4680d843109e06ec2f273` failed
CI38193672253 in browser tests: 147 passed, one flaky motion check and one failed
AI-stage completion test (7.7 minutes). Build/check/API/links passed; Lighthouse
did not run. Trace review found repeated bridge-platform overshoots and returns
to checkpoint 47, not blocked geometry at the final reported tile 59.

Local test-driver fixes now brake at bridge waypoints through real keyboard
input, preserving engine behavior, time budget and completion assertion. Three
focused AI-stage repeats passed (18.2/18.3/18.4s). The motion test waits up to two
seconds for the existing <1px settled transform rather than assuming 900ms.
Final current-source check/build/149-test rerun is pending. The unchanged local
fourteen-run Lighthouse matrix passes, including sixteen responsive hero delivery
variants that retain original compositions and full-size originals. **Hold merge
until the fully checked correction is pushed and its exact-head CI is green.**
PM records evidence; root owns release. No external award validation is claimed.

Status terms: **Implemented, release pending** is verified local work, not live.
**Previously live, final recheck** needs the final review. **Open** requires work.
Figma completion is distinct from website deployment.

Current pending sequence:

1. **Image gate passed locally:** 108 current Figma roots classified, 146 website
   references resolved and 22 compositions restored. Four additional Deal panels
   were pixel-verified; the AI Figma gallery repair is complete. Evidence:
   `current-media-parity.json`; no actionable image mismatch remains.
2. **Website content gate passed locally:** fresh full eight-note reread and
   Home/utilities, FX/Fusion/Deal, AI/Winking source reconciliation are complete.
   `HOME-CONTENT-AUDIT.md`, `FX-FUSION-DEAL-CONTENT-REVIEW.md` and
   `AI-WINKING-CONTENT-REVIEW.md` record coverage and corrections.
   `REVOLUT-CHECKLIST.md` is reconciled for all five cases. Missing original
   research/outcome records remain explicit factual limits. Figma editable text
   and vector-lettering synchronization is complete in `figma-final-content-sync.json`.
3. Local sampled craft/scroll review complete in `UI-REVIEW.md`. All fourteen
   local Lighthouse results now pass: mobile 95–96, desktop 99–100, all other
   categories 100 and TBT 0. `local-release-performance.json` records every run,
   including final Winking/Deal mobile reruns after image-footprint refinements.
4. Final test-driver correction is validated in focused repeats; current-source
   check/build/full-suite rerun is pending, then exact-head commit/CI/preview,
   merge and production verification.

New image checkpoint: twenty-two fresh Figma composition assets were losslessly
packed with exact RGBA comparison, recorded in `figma-composition-encoding.json`.
Home Fusion reduced from 8.65MB to 2.75MB, Winking from 5.95MB to 3.22MB; the
5.52MB Deal home vector was unchanged at that initial packing checkpoint. The
subsequent native-scroll review is recorded in `UI-REVIEW.md`.
Forty responsive Home SVG variants now preserve vector geometry while resizing
embedded screenshot data; original full-resolution files remain available.
Deal vector optimization reduces bytes by approximately 40%. Fidelity evidence
is in `home-responsive-quality.json`, `home-responsive-delivery.json` and
`home-vector-optimization.json`. Sixteen additional hero delivery variants reduce
embedded-raster decoding on Fusion, Winking, Deal and uoaui.ai while retaining
full-resolution originals. The local fourteen-run matrix passes; the new exact
head must still pass the unchanged remote 95-point budget.

Manual bot-excluded links verified in Chrome on 12 October: App Store
`https://apps.apple.com/app/id6765767262` resolves to the Winking Star listing
(`https://apps.apple.com/us/app/winking-star/id6765767262`), displaying version
1.0.4. `https://www.linkedin.com/in/shannonhecker/` displays Shannon Hecker's
profile and the same public profile URL. This was read-only; temporary tabs closed.

## Current scope and owners

| Request | Current status | Evidence / remaining work |
|---|---|---|
| All current Figma pages match website assets and compositions | Verified locally; release pending | 108 current roots and 146 active references classified; 22 compositions restored, including three Fusion body compositions and the AI Figma gallery repair. `current-media-parity.json` records final dispositions. New assets still require final performance/release verification |
| Fresh full content scan after all image work | Website and Figma source audit complete; release pending | Fresh eight-file reread and all-page ownership audit completed after image parity, including graphic transcripts/alt, headings, roles, qualifiers and outcomes. Three content-review documents record corrections; private notes remain unpublished. Figma text/lettering sync completed in `figma-final-content-sync.json` |
| Revolut brief coverage on every product page | Current five-case matrix reconciled; factual gaps explicit | Current matrix covers every brief criterion on all five pages and distinguishes complete structures from missing research/impact evidence. No alpha is relabelled shipped; no estimate is relabelled measurement. Final craft and release checks remain separate |
| Fifteen website personas match supplied template | Implemented, release pending | Final build and 149-test pass at 7057e7a; no invented technical ratings or participant facts |
| Thirty Figma persona cards match template | Done in Figma | Final upload/manifest and visual review complete; original content retained |
| Distinct accent per persona; portrait background equals its panel accent | Implemented, release pending; Figma done | Fifteen cards × four widths and theme flips covered by six focused tests; desktop light/dark and phone light inspected. Figma recorded six FX dark/twenty-four light specimens, with both palettes documented; these specimens do not assert the website default theme |
| Graphics adapt to light/dark where possible | Implemented, final verification/release pending | All thirteen themed vectors and persona palettes implemented. Preserve original product screenshot colours; paired theme assets only where appropriate, no blanket inversion |
| Five distinct website journeys | Implemented, release pending | ProductJourney/FxOriginalJourney; source-specific structures and accessible narrative |
| Ten desktop/mobile Figma journey layouts | Done in Figma | Final manifests and gap adjustments complete |
| Detailed decision maps for every product | Implemented, release pending | 21 choices in decision-evidence.json and AuthoredDecisions; rationale, alternatives, evidence, tradeoffs and status; source-art corrections complete locally |
| Figma whole-page spacing/gaps after latest content sync | Current composition/gap pass done in Figma | Latest AI gallery repair completed without altering the raw original. `figma-final-spacing-audit.json` and image-parity dispositions document current scope |
| Earlier scoped interview voice review | Historical corrections implemented; fresh full review completed | FX TWAP/study, Fusion sign-up and Deal import/sixty wording corrections applied and Figma synced. The new full review is separately recorded in the three current content-audit documents |
| Deal original file and updated portfolio art | Implemented, release pending; Figma synced | Three unsupported alternative images hidden in web/Figma, written tradeoffs retained. Two smart-pricing PNGs replaced with exact original dialogs 1:24110 and 1:24564, labelled exploration; hashes and desktop/mobile review recorded |
| Full-size image zoom/readability | Implemented, final coverage/release pending | ProductCapture and Deal hero links added; Fusion phone original-image tap and native zoom manually verified. Remaining route coverage belongs to final review |
| Final whole-site UI/UX craft review | Current local sampled review complete; deployed check pending | All ten routes at 1440/390 inspected by PM; light/dark samples, section navigation and keyboard return checked. `UI-REVIEW.md` records exact scope and limits |
| Final actual scroll-performance review | Local scroll/image review complete with transient-paint limitation; remote performance pending | Current Home and case imagery reviewed during native scroll. One rapid Home paint was blank then resolved and did not repeat; no persistent blocker. See `UI-REVIEW.md`; no frame-rate certification |
| Final exact-head CI, merge and production verification | Browser-driver correction under final validation; release held | Sixteen responsive hero variants and fourteen local Lighthouse audits pass. b82758c failed AI bridge completion; focused corrected-driver repeats pass. Final full suite, next exact-head CI and preview/production evidence required |

## Shared UI and assets to recheck in the final review

These requests are implemented in prior releases or the current candidate. Do
not reopen settled direction; verify the final rendered and deployed states.

- All case content stays visible without accordions, including flow/data layers;
  keyboard and no-JavaScript reading remain usable.
- Consistent two-column case structure, nested rows, aligned Project status,
  compact labels and appropriate spacing at 1440/820/390/320px.
- Workflow rules above steps, arrows beside titles, separated journey phases
  without decorative vertical colour bars.
- Original product screens remain complete and readable, without unnecessary
  enlargement, blurry substitutions, duplicate shadows or unwanted caption bars.
- FX supplied data-layer SVG (source 305:336356), original journey artwork and
  decision loop retained; transparent surrounds and correct comparison framing.
- FX chart/compare/ticket composition uses real original vectors. Lower captures
  have clean edges; video has no extra top line; responsive screenshots keep padding.
- Home images, Fusion M3/M1 and Performance artwork, uoaui.ai art and persona
  graphics match current source mappings. Preserve original versus rebuild labels.
- Winking web/iOS screens and original art are integrated. Source inventory has
  339 files across weekly-superstar-tracker/ios/shared; local component captures
  use fictional Sample Family data and do not demonstrate backend synchronization.
- Mobile fullscreen game map fills usable space, has readable markers, supports
  swiping/tapping and returns to play correctly. Latest independent FX-phone and
  fullscreen-map visual checks passed; verify final deployed behavior too.

## Source-to-claim and graphic audit

For each material claim and graphic, record original source/node or revision,
current implementation, differences and correction or **unverified** status.
Figma shows design intent; a public rebuild does not prove historical production
behavior. Unknown research counts, outcomes and implementation rules stay unknown.

| Project | Required boundary | Current audit position |
|---|---|---|
| FX | Beta; NDA; public rebuild versus internal production | Source mappings and original vectors retained. Claim/graphic corrections implemented; no bank screens, clients or invented adoption metrics |
| Fusion | Original designs and shipped work versus public rebuild | Current screens and specialist-from-start chronology retained. Final claim check must keep Analytics distinct from Data Manager and avoid attributing sales to design |
| uoaui.ai | Private alpha; implemented generation/export versus intended review practice | Corrected art/text remove unsupported forced review gates and measured-time claims. Source corrections implemented; final rendered/deployed check pending |
| Winking Star | Actual web/iOS differences, sample versus real family data | WINKING-SOURCES.md records source revisions. First-use, offline/shared behavior and accessibility claims must be scoped to the evidenced platform |
| Deal Model | Original pricing/owner/approver evidence versus illustrative portfolio diagrams | Original inspected. Owner-written reasoning and actual iteration/rate states retained. Three unsupported alternative images hidden; two original smart-pricing dialogs restored as exploration. Source-art implementation block resolved locally; final deployed check pending |

Deal source nodes `1:19575` and `1:19659` support iteration creation and rate
validation; approver view `1:34619` supports comparison, comments and approval.
Unsupported 15%-Tier-B legal autorouting, missing-rate-card blocking and unmapped
column blocking were removed from local narrative. Journey return now refers to
TXN/SK rate review. Do not reintroduce these claims through old image lettering.

Decision coverage: 3 FX, 3 Fusion, 3 uoaui.ai, 6 Winking, 6 Deal. Each should
explain the problem, considered choices, evidence, rationale, consequences and
status. Scenario quotes/emotion curves are authored explorations, not participant
measurements. Original source art remains separate from newly readable explanations.

Audit documents: JOURNEY-RESEARCH.md, DECISION-AUDIT.md, VOICE-REVIEW.md,
WINKING-SOURCES.md and Figma sync/correction manifests. Their remaining factual
limits must survive the final review. Adjacent caveats alone do not verify a
contradictory graphic. Private prep is never published wholesale.

## Private voice-review sources

All eight files were confirmed present in `/Users/shannonhecker/Downloads/`.
The earlier scoped review and corrections are historical evidence, not completion
of the latest request. Shannon explicitly requires a **fresh full reread after
all image work**, cross-referenced against every page and conversation corrections.
The fresh full reread and website source-to-page reconciliation are complete after the explicit image-gate release. PM read all eight files in full; root and voice reviewer completed their assigned cases. Combined findings are recorded in the three content-audit documents and current Revolut matrix. Figma text sync is complete in `figma-final-content-sync.json`. Do not publish private interview content.

- lseg-round-5-sai-speaker-notes.md
- lseg-round-5-sai-potukuchi-prep.md
- lseg-round-4-speaker-notes.md
- lseg-round-4-frank-higgs-prep.md
- lseg-round-3-speaker-notes.md
- lseg-round-3-jamie-coulson-prep.md
- lseg-round-2-paul-moreira-prep.md
- lseg-round-2-spoken-script.md

Check first-person voice, actual contribution/collaboration, chronology,
shipped/beta/alpha status and measured versus estimated impact. No participant
counts or metrics are inferred from interview shorthand.

## Final queue: whole-site craft, then scrolling, then release

Latest explicit order: complete **all image/graphic parity work first**, then
perform the fresh full content scan of every page against all eight private notes
and conversation corrections. Both local website source gates are complete and recorded above. Figma copy
synchronization is complete. Proceed to the final craft/scroll/release review
below; earlier performance runs do not cover the new compositions.

Scope safeguards: verify both `/` and `/panel` after shared artwork changes,
not just one home entry point. Keep latest CV, LinkedIn and confirmed dates/status
consistent during the full content pass. Preserve existing optional game,
analytics/privacy, reduced-motion and keyboard behavior while changing shared
styles; their established regression coverage must stay green, without reopening
settled game direction or claiming new metrics.

After source-art/content and zoom changes, review as a designer, not only a test
runner. Iterate on concrete findings before closing delivery.

1. Inspect Home, Panel, FX, Fusion, uoaui.ai, Winking Star, Deal Model, Build,
   Privacy and 404. Check hierarchy, line lengths, spacing, alignment/navigation,
   project identity, useful media scale and transparent edges.
2. Review desktop/tablet/phone, light/dark, focus/keyboard, contrast, reduced
   motion, no-JavaScript content, links, full-size zoom and fullscreen map.
3. Review real desktop/mobile scrolling on every case. Record late images or
   blank media, lazy-load timing, decoding, SVG complexity, effects/shadows and
   animation behavior. Product-capture/hero trailing parallax was removed;
   text motion remains. Verify the result rather than assuming this resolves lag.
4. Verify the final exact commit with Astro check, production build, full browser
   suite, compiled API runtime, link checks and Lighthouse CI (95 minimum in every
   category on seven main routes × mobile/desktop). Manually check utility routes
   and bot-excluded App Store/LinkedIn links.
5. Record final PR/head, merge, deployment URL and production checks. PM does not
   merge. Mark overall completion only after source, implementation and live
   evidence agree, with any remaining factual limitations clearly documented.

Awwwards, Webby and FWA are the requested craft benchmark, not a certified award
or jury decision. Passing Lighthouse does not close visual or scroll review.

## Performance evidence and short release history

| Head / evidence | Result | Meaning |
|---|---|---|
| Main PR48 / 982ff55, CI38180336042 | FX mobile 84; LCP 4.43s; TBT 0; later routes not run | Historical failed gate |
| PR49 / 7d6c6bc, CI38182499828 | Build/check/API/browser/links passed; FX mobile 84, LCP 4.510s | Historical asset/persona checkpoint; superseded |
| PR49 / 2a2988d, CI38184120959 | All gates passed. Mobile 96–97, desktop 99–100; other categories 100 across 14 runs | Earlier verified candidate, not current persona revision |
| PR49 / 7057e7a, CI38185501523 | Local 149 tests / 58.9s and build passed | Historical persona checkpoint; superseded by 24be6c9 |
| PR49 / 24be6c9, CI38186411926 | All remote gates passed, preview ready | Superseded by latest local accent/theme/source-copy revisions; merge held |
| PR49 / d49eb90, CI38191526789 | Check 131 files: 0 errors / 0 warnings / 4 hints; build/API/149 tests/links passed. Fusion desktop performance 94, TBT 180ms, LCP 0.853s | Failed current budget; fix pending, no merge |

FX retains actual SVGs. Geometry compaction and load prioritization improved local
84 / LCP 4.5s to 95 / LCP 2.7s. Hero precision-three high-resolution mean channel difference
was below 0.005/255 at density 192; precision-eight data-layer output was pixel-identical.
Remote 2a2988d FX mobile scored 96. No rasterization, redrawing or lowered quality gate.

Diagnostics: `/private/tmp/fx-final-vectors-lh.json`,
`/private/tmp/portfolio-ci-pr49-38182499828/lh.json`,
`/private/tmp/pr49-2a2988d-ci.log`. Simulated LCP render-delay attribution differed
from the actual trace; unused SVG filter definitions were not active rendering
cost. Continue checking network/decode behavior for the separate scroll-lag report.


### d49eb90 performance evidence

| Route | Mobile performance | Desktop performance | Other categories |
|---|---:|---:|---|
| `/` | 95 | 99 | All 100 |
| `/panel` | 96 | 99 | All 100 |
| `/fx` | 95 | 100 | All 100 |
| `/fusion` | 95 | **94** | All 100 |
| `/winking-star` | Not run | Not run | Fail-fast stopped before route |
| `/deal-model` | Not run | Not run | Fail-fast stopped before route |
| `/uoaui` | Not run | Not run | Fail-fast stopped before route |

Fusion desktop's LCP is the discovery composition (74,536 transferred bytes,
99,572 uncompressed). Actual trace breakdown: TTFB 5.915ms, load delay 8.223ms,
load 28.636ms, render 367.333ms. Two long tasks are classified as Other, 154ms
and 230ms; script evaluation totals 12.8ms. The secondary performance composition
embeds a 4096×2392 raster and transfers 265,941 bytes. Native raster decode/paint
is a profiling hypothesis, not proven solely by the Other category. The targeted
fix retains the original vector wrapper and full-size original while delivering
appropriately sized embedded screenshot pixels.

Exact logs: `/private/tmp/pr49-d49eb90-ci.log`; failed report:
`/private/tmp/pr49-d49eb90-artifacts/lh.json`; extracted evidence:
`/private/tmp/pr49-d49eb90-evidence.json`. No complete fourteen-run performance
result exists for this head because the budget stops at the first failure.

### Fusion follow-up validation

Two raster-bearing Fusion hero SVGs now use six responsive delivery versions; their original full-size exports and vector wrappers remain unchanged. The configuration composition is pure vector and unchanged. Local check/build passed and 149 tests passed in 53.7s. Fusion desktop Lighthouse locally changed from 99 (LCP859ms/TBT 0) to100 (LCP 588ms/TBT 0); this local comparison does not certify the remote TBT regression. A fresh exact-head CI run remains required. Reports: `fusion-responsive-delivery.json`, `fusion-responsive-quality.json`; local Lighthouse JSON under `/private/tmp/fusion-{before,after}-responsive-lh.json`.


### Follow-up local performance findings after 5ec44ca

The Fusion-only correction is pushed as `5ec44caf0330d657f1a82e5fdbd26072ad0d3b32`
and CI38192705830 was cancelled by root before completion, superseded by
the broader responsive-hero correction. Local Fusion desktop measured 100 in all
categories, LCP 588ms and TBT 0; local build/check and 149 tests passed in 53.7s.
These do not close the remaining-route budget.

Root's additional local measurements found Winking mobile performance 88,
LCP 3.8s (hero approximately 289KB transferred), and Deal mobile performance 76,
LCP 7.1s (hero approximately 979KB transferred). Deal's hero embeds two rasters
of approximately 17 megapixels combined; it is not entirely native vector UI.
The asset owner subsequently implemented responsive embedded-raster derivatives
for those compositions, preserving the SVG wrappers and original full-resolution links.
AI measured mobile performance 92 / LCP 3.2s and desktop 100 locally; its
responsive hero correction is now included. Release remains held. Run all seven
routes at mobile and desktop locally without stopping at the first failure, then
push the fully checked candidate and run final exact-head CI. These local findings are recorded separately
from the exact-head CI scores above, not presented as completed remote results.


### Final local responsive-hero matrix

Sixteen hero delivery variants are implemented. All fourteen local production-build
audits now pass, with Winking and Deal mobile repeated after their final footprint
refinements; other results precede that image-only adjustment. Source:
`local-release-performance.json`. All accessibility, best-practices and SEO scores
are 100; all TBT measurements are 0. This is local evidence, not final CI or live
deployment verification.

| Route | Mobile performance | Desktop performance | Mobile LCP |
|---|---:|---:|---:|
| `/` | 96 | 99 | 2.630s |
| `/panel` | 96 | 100 | 2.630s |
| `/fx` | 95 | 100 | 2.705s |
| `/fusion` | 96 | 100 | 2.708s |
| `/winking-star` | 95 | 100 | 2.710s |
| `/deal-model` | 95 | 100 | 2.707s |
| `/uoaui` | 96 | 100 | 2.558s |

Final current-source browser validation passed all 149 tests in 53.6s:
`/private/tmp/portfolio-final-complete-tests.log`. The preceding 148/149 run caught
a reduced-motion test asserting before the asynchronous media event; the test now
polls for the same exact zero-motion state, with no product behavior change.
Build/check passed. Push and exact-head CI remain pending.


### b82758c browser failure and targeted correction

CI38193672253 passed source check, compiled API runtime, build and links (11s).
Browser results were 147 passed, one flaky scroll-motion check and one failed
world-7 AI completion check in 7.7 minutes; Lighthouse never ran. Both AI attempts
repeatedly fell at bridge platforms and respawned at checkpoint 47 (30/32 returns).
The final tile-59 state was grounded travel after respawn, not a blocking wall.
Trace evidence: `/private/tmp/pr49-b82758c-ci.log` and
`/private/tmp/pr49-b82758c-artifacts`.

The corrected test driver uses real keyboard braking at bridge waypoints; engine
physics, assistance, time budget and finish assertions are unchanged. Three
focused repeats passed in 18.2/18.3/18.4 seconds. The motion test now polls up to
two seconds for its unchanged <1px settled-transform requirement. Full validation
is running in `/private/tmp/portfolio-last-{check,build,tests}.log`. These focused
results do not yet close the full-suite or exact-head remote release gates.

Final test-driver validation: Astro check has 0 errors and 0 warnings; production build passed; all149 browser tests passed in53.3s after the AI landing-controller and bounded motion assertions. Evidence: `/private/tmp/portfolio-last-{check,build,tests}.log`. Application code and artwork are unchanged from the locally passing fourteen-route performance matrix. Next exact-head remote run and production verification remain required.
