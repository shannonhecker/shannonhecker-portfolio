# Decision-map audit

12 October 2026. Implementation scope: `AuthoredDecisions.astro` and the new
`decision-evidence.json`. Existing source images are retained. No application
build, browser tests or Figma changes were run by this reviewer.

## What changed

The old diagrams mostly described product steps, not design decisions. The shared
component now begins with a linked index of the actual choices and a short account
of how they connect. Each of the 21 decisions has its own question, problem,
option implications, rationale, cost, evidence and delivery status. The original
chosen/alternative images remain visible without an accordion. The exact FX order
loop remains as clearly labelled product context, separate from design evidence.

The extra detail is data, not a replacement generic flowchart. Shared typography
and two-column option comparisons keep the section consistent, while the decision
questions and relationships are specific to the five products. The mobile layout
stacks the options and evidence in reading order. Native anchors work without JS.

| Project | Actual decisions | Evidence boundary |
|---|---|---|
| FX | Combined canvas; chart repricing; market-only studies | Desk observation and spec review are distinct from the code/vendor finding that reversed the study-source decision. Beta is not a shipped adoption result. |
| Fusion | Modular widgets; two configuration levels; shared entitled views | Weekly internal reviews and the limited two-client review are described without creating timed results or client-sales attribution. |
| uoaui.ai | Published components; system mapping; review before handover | Private-alpha implementation and Shannon’s practice are distinct from external validation. The UI does not claim the current product technically blocks export at each review stage. |
| Winking Star | Feedback; first open; payment; child identity; adult control; weekly continuity | Family observation is limited to the household. Native first-use and adult-control decisions are separated from web setup. No inferred retention or conversion result. |
| Deal Model | Shared record; alternatives in review; comparison; migration; approval; smart-pricing exploration | Original approval flow requires owner-written reasoning. Smart pricing is explicitly explored, not built. No claim of zero reopened decisions or feature-level spreadsheet elimination. |

## Source trail

- Existing authored choices and images: `src/data/authored-content.json`.
- FX evidence: `CaseFx.astro`, decision testing and rollout sections.
- Fusion evidence: `CaseFusion.astro`, internal review, tier removal and phase-two
  review sections. These align with the later supplied interview speaker notes.
- uoaui.ai evidence: `CaseAi.astro`, current private-alpha boundary and next
  validation question. The walkthrough alone demonstrates template editing and
  comparison; it is not proof of every generation/export claim.
- Winking evidence: `CaseWinking.astro`, source-backed updated screens and platform
  distinctions. Product source verification is owned by the parent audit.
- Deal evidence: `deal-content.json`, original file
  `MhZ5D5sh8DZgOTYdLXX8It` approval/publishing flow inspected by the parent agent,
  and the authored smart-pricing exploration status.
- Interview preparation is a private secondary context. It does not override
  current estimate qualifiers or prove a production feature exists.

Each decision record keeps a `source` field for maintainers. These references are
not printed as private file paths in the public page.

## Source-art corrections and remaining work

Fifteen corrected exact exports are recorded in
`docs/figma-decision-art-corrections.json`. Existing Figma text layers were edited
and exported at 4×; the diagrams were not redrawn. This resolves the stale Fusion
one-year forecast, AI official-only/strictest/two-day claims, optional Winking
sample route and unsupported general claims about children, subscription trust,
recognition and the gate. The matching obsolete public art notes are removed.

The AI chosen-review sketch was not replaced: it shows compare/tune tools and
handover, without stating that export is technically locked. The corrected
alternative now explicitly says direct export is available. Current decision
prose explains the optional review accurately.

Deal approval is being replaced with the two actual workflow roles, not a fake
chosen-versus-alternative pair. The owner-written reason and approver comparison
remain the authoritative behaviour. Other Deal exploration graphics may still
contain illustrative claims; smart-pricing sample figures remain explicitly
identified as an exploration rather than a model evaluation.

## Verification performed and still required

A static data check confirms 3 FX, 3 Fusion, 3 uoaui.ai, 6 Winking and 6 Deal
records, matching every original choice pair and using unique anchors per project.

Parent still needs Astro type/build checks and desktop/mobile visual review,
including contrast in both themes, image readability, keyboard navigation and
section anchors. Check the exact-source-art caveats before declaring the whole
content/graphic truth audit complete. This implementation is local, not a deployed
completion claim.

## Actual-source check, 12 October

Read-only clones inspected, no product code changed:

- `shannonhecker/desinghub` at `5f603e731556c0ec9908a4222c6399a6af765e5f`,
  local `/private/tmp/uoaui-source-audit`.
- `weekly-superstar-ios` at `8388f4d47ea5a027d921e586eccd064d83ac203c`,
  local `/private/tmp/weekly-superstar-ios-portfolio`.

The uoaui decision prose is now corrected to the implementation, rather than merely
calling its stronger original claims unverified:

- `src/app/api/chat/route.ts:249` calls Claude with canvas tools;
  `src/lib/chatSystem.ts:16` describes five systems and enumerates block types.
- `src/lib/componentApiRegistry.ts:1` explicitly documents native package mappings,
  generic markup for absent equivalents, and house-system CSS instead of a
  published uoaui component package. `src/lib/export/reactExporter.ts:189` takes
  the registry-first path with fallback. “Official only, never overridden” is false
  as a description of the whole implementation.
- `src/components/builder/ComponentRenderer.tsx:2071` renders real components when
  the system/type combination is covered and otherwise uses a fallback renderer.
- `src/lib/layoutRegistry.ts:1` maps per-system layouts. Fluent uses token-driven
  CSS because it has no native Grid/Stack component; the implementation is not a
  global strictest-rule algorithm.
- `src/components/builder/BuilderApp.tsx:417` opens export directly;
  `ExportPanel.tsx:31` generates React files without a compare/tune prerequisite.
  Only its live-DOM Figma export requires Preview. Mandatory compare/tune gates
  are false, and the first draft can be exported.
- `src/store/useBuilder.ts:1064` changes system/theme on the same canvas, while
  density is stored independently. Five-system switching is supported by source.

Winking findings applied to the owned decision records:

- `app/index.tsx:125` and `:142` offer Create Family and optional Try Sample Family.
  `lib/demoBoard.ts:6` plus `app/board/[boardId]/_layout.tsx:106` load the sample only
  on the demo route. Automatic Sample Family on first open is inaccurate.
- `lib/iap.ts:11` identifies the non-consumable lifetime product; the payment-model
  claim is supported, but no business outcome follows from that code.
- `components/ParentalGate.tsx:219` creates operands 6–9 and 5–9.
  `lib/gatePolicy.ts:1` distinguishes cached light actions from fresh destructive
  challenges in Kid Mode. A sample “3 + 4” image is not current source behaviour,
  and neither implementation nor sample proves a child cannot pass the gate.

These checks establish source behaviour at the revisions above. They do not prove
which revision is deployed on the public product domains. Root owns that final
runtime/source alignment check and corrections to CaseAi, CaseWinking, authored
content and the original graphics. The journey designer has been notified that
comparison/tuning is not an enforced sequence and Sample Family is optional.

## Original Deal validation check

The original stakeholder file `MhZ5D5sh8DZgOTYdLXX8It`, page `0:1`, was read
on 12 October 2026. `1:19575` contains iteration-creation success and failure
notifications. `1:19659` contains the empty iteration view, new iteration inputs,
and a warning when transaction and custody rate sources differ. `1:15618`
documents loading portfolio positions from existing source connections.

The site’s prior 15% Tier B threshold, automatic legal routing, and blocked
missing-rate-card examples were not established by these originals. The edge
section now summarizes the documented states and no longer calls its text cards
an exact redraw of a single pricing field. Owner-written proposal reasoning and
approver comparison/comments replace the unsupported generated-summary claim.

## Parent verification checkpoint

The revised journey/decision component build passed. The browser suite passed
149 tests in 57.1 seconds, including responsive overflow and accessibility.
Subsequent exact-art replacements still require the final build and browser run.
Desktop FX decision layout and mobile uoaui decision index were visually inspected.
The production release remains pending; this is not a live-site completion claim.

## Final source-art corrections, 12 October 2026

The three unsupported Deal alternative illustrations at decisions 2, 3 and 4 are hidden in the website and both Figma layouts. Their written alternatives remain; they are no longer illustrated with invented adoption numbers or events. The old assets remain in source history and hidden Figma archive layers.

Smart-pricing images now come from original dialogs `1:24110` and `1:24564` in `MhZ5D5sh8DZgOTYdLXX8It`, inside the source frames `1:24108` and `1:24561`. Labels and alt text describe the two explored interfaces rather than chosen/rejected product implementations. The 38-deal statement and new-starter performance claim are removed from this visible evidence. `figma-decision-art-corrections.json` records exact hashes and target fills.

A final source review also corrected:

- FX arrival mid is fixed; session TWAP evolves with market prices (`executionData.js:165–169,296–321`; `ExecutionPanel.jsx:1073` at ce8de50). The old frozen-TWAP/percentile-presets journey copy is replaced.
- FX study inputs are attributed to the specification; the current public rebuild has no study picker.
- Fusion retains external-client rollout but removes the uncorroborated signings claim.
- Deal template mapping remains; an unsupported import-blocking rule is removed. Composite persona copy no longer invents sixty separate spreadsheet copies.

Editable Figma text was synchronized. The visible original journey chart/approach excerpts contain none of these corrected clauses. Product screenshots retain source imagery and are not redrawn as inferred implementations.
