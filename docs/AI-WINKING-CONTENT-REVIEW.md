# AI and Winking content reconciliation

12 October 2026. Scope: current CaseAi and CaseWinking headings/body/flows/media
labels, their authored personas/journeys/decision records, decision evidence,
ProductJourney's project branches, WinkingScreens, CoParent, BrandSystem and the
interactive Winking demo text. Relevant AI passages were searched across all eight
supplied private interview files; Winking's product behaviour comes from source,
not interview preparation. No private interview strategy or long quotes are copied.

## Corrections applied

| Surface | Correction | Evidence |
|---|---|---|
| CaseAi flow and outcome | Review is Shannon's practice, not an enforced export sequence; component choice includes explicit fallbacks. Removed ambiguous first/third-person sentence in architecture layer. | desinghub `5f603e7`, `src/components/builder/BuilderApp.tsx:417`, `ExportPanel.tsx:31`, `src/lib/componentApiRegistry.ts`, `src/lib/export/reactExporter.ts:189`. Interview rounds 2, 4 and 5 consistently distinguish model drafting from designer judgement. |
| AI journey participants | Developer inspection is the intended handover, not a claimed external test. | Current private-alpha outcome explicitly says no external test yet. |
| CaseWinking loop and interactive demo | Removed fixed seven-day growth and current-four-stage claims. Four-stage demo labelled simplified, growth tied to stars. Reset and completion messages corrected too. Unticking is not demo-only. | iOS `8388f4d`, `components/MysteryPet.tsx:128`; shared `fb7e63fc8dfc2f7c8a01b43a9c8cd65ed711ea92`, `src/themes.ts:105–118`: stages 0–6, goal 60, thresholds by fraction. iOS `ActivityGrid.tsx:257–278` writes check-on and check-off states. |
| Winking original weekly decision artwork | Original four-stage sketch preserved and explicitly distinguished from six current growth steps after the egg. | Same source paths; exact original art remains the user's artwork. |
| Winking journey backstage | Treasure is threshold-driven, not an automatic end-of-day event. Both Calm Mode and Reduce Motion suppress confetti. Missing a day does not deduct stars; correcting a check can. | iOS `lib/treasures.ts:91–127`, `components/ActivityGrid.tsx`; existing accessibility source audit. |
| Winking next checks | Removed blanket claim that pet labels are untranslated. Next work is small-screen readability and native-language review. | iOS `lib/petNamesI18n.ts:1–8` identifies translated species/stage strings and native review pending; `MysteryPet.tsx` consumes localized pet names. This does not certify every family label. |
| Winking recognition claims | Brand copy now describes the intended picture/name cue rather than a general research finding about children. Persona celebration allows quieter options. Journey's opening no longer asserts a market-wide competitor finding. | Household observation is the available case evidence, not a controlled study or competitor census. |
| Stored AI/Winking graphic transcripts | Applied already-approved exact Figma text corrections from `figma-decision-art-corrections.json` to matching transcript strings. | Current corrected source exports were independently compared in `current-media-parity.json`. No graphic redrawn. |

## Evidence retained and limits

- AI generation uses the canvas catalogue/tools, registry mapping and explicit
  fallbacks. Five-system switching and direct React export are source-backed.
  Walkthrough caption describes template editing and comparison only; it does
  not stand in as proof of all generation/export features.
- The interview AI story supports rebuilding a colleague's generated screen in
  existing components and showing both. No timing metric or completed deployment
  is added from conflicting versions of that account.
- Winking Sample Family stays optional and iPhone-specific. Household observation,
  composite roles and fictional journey feelings are labelled as such. Original
  journey's short daily-loop timing is a scenario/design target, not a measured
  completion result. Current body no longer presents ten seconds as a result.
- Existing source checks support lifetime unlock, adult gate/Kid Mode, shared-board
  sync, local-day rollover and accessibility controls. These establish source
  behaviour at the audited revision, not deployed parity on every device.
- Current version/release/language claims are retained from the approved portfolio
  and source audit; this pass does not independently certify App Store release
  history. No adoption, conversion or retention result is added.
- Brand implementation tokens remain tied to `docs/BRAND-SOURCES.md`; AI motion
  values rechecked at `src/data/uoaui/tokens.ts:20–49`, native spacing at
  `lib/tokens.ts:28`. Personal naming/illustration authorship remains the author's
  supplied account.

## Verification boundary

JSON files parse successfully. This is a scoped content edit, not a new product
implementation or deployment. Parent owns the final Astro/build/browser checks.
Remaining historical art is explicitly identified rather than silently edited to
look like the current implementation. No award-quality certification is claimed.
