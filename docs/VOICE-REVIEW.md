# Voice and claim review

Reviewed 11 October 2026 against the eight private LSEG preparation files listed
in DELIVERY-CHECKLIST.md, the five current case components, authored-content.json,
deal-content.json, and the home components. This is an editorial review, not
verification of the original product implementations or their historical metrics.
No private interview strategy, interviewer details or full scripts are copied here.

The voice is strongest when Shannon names the job, her decision, the people she
worked with, and what changed. Most of the existing case copy already does this.
Keep that directness. Avoid replacing it with design vocabulary or an awards pitch.

## Corrections to apply

Line numbers refer to the reviewed working tree and may move with subsequent edits.

| Priority | Location | Finding and recommended change |
|---|---|---|
| High | `src/components/CaseAi.astro:60` | “Prompt to production screen” contradicts the explicit private-alpha and inspectable-export boundary. Use **“From a prompt to a screen a developer can inspect.”** This describes the demonstrated endpoint without implying production readiness. |
| High | `src/components/CaseAi.astro:109` | “Two weeks instead of months” is not supported by the supplied accounts of the Barclays generated-screen story. They describe an existing-component rebuild being faster; the notes themselves vary between still in build and delivered in the same window. Use **“I rebuilt it in our own components and showed both. The existing components made it faster to build and kept it consistent with the platform.”** Do not borrow the separate Data Manager two-week grid estimate for this story. |
| High | `src/data/deal-content.json:6` | “UI lead, one of two designers” conflicts with the team line and the detailed role description: two UX designers, a junior designer and Shannon. Use **“Role · UI lead”**; retain the fuller team breakdown separately. This avoids inventing a total or a reporting relationship. |
| Medium | `src/components/CaseFx.astro:83` | Heading says “fixed it first”; the paragraph says features shipped first, with the foundation phased in later. Use **“I found the problem underneath the theme.”** Keep the paragraph's specific chronology rather than importing the more compressed interview opening. |
| Medium | `src/data/deal-content.json:73` | “The upload template came out of the BA and me” obscures the user-session origin explicitly credited at line 61 and in the interview account. Use **“The upload-template idea came from a user session. I worked it through with the BA.”** This preserves both discovery and contribution. |
| Medium | `src/components/CaseFusion.astro:116` | “Would have drifted ... within a year” gives a precise counterfactual with no supporting estimate in these sources. Use **“I kept Fusion on Salt so it could follow the firm's updates, and contributed missing patterns back.”** The actual layer/upstream decision is stronger than a speculative deadline. |
| Medium | `src/components/CaseAi.astro:29` | “Practice, not a shipped product” undersells a working private alpha, while repeating the status in the same heading. Use **“Case five · Solo · Private alpha”**. Keep the honest adoption limits in the outcome section. |
| Medium | `src/components/Work.astro:10` | “Every case runs the same beats” is page scaffolding, not a reason to read, and reinforces the sameness Shannon wants removed. Suggested replacement: **“Trading, analytics, deal pricing and the products I build myself. These are the decisions I made, the alternatives I tried and what happened next.”** Keep shared navigation without promising identical stories. |
| Medium | `src/components/CaseWinking.astro:61` | “I read what works ... beat any checklist” turns personal exploration into a universal research conclusion. Interview notes provide no Winking research evidence. Suggested scoped wording: **“I built it for my own two kids and watched them use it each evening. I explored big icons, stickers and celebration moments to give them a reason to look at the board.”** Keep stronger findings only where the project source supports them. |
| Low | `src/components/Hero.astro:13` | “Lead design for FX ...” reads as a clipped résumé fragment inside a personal introduction. Use **“I lead design for FX and MarketsOne at Barclays. Before that, I was VP of Product Design at J.P. Morgan. I build what I design.”** |
| Low | `src/lib/cases.ts:27` | Winking index says only App Store while the revised case prominently covers web and iOS. Use **“Solo · live on web and iOS. A shared routine board for families. Designed, built and shipped by me.”** Keep version detail on the case so the index does not become another stale release reference. |

These are proposed edits, not claims that application files have been changed.

## Important distinctions to preserve

- **Current portfolio evidence wins over older interview shorthand.** Deal Model's
  two-hours-to-twenty-minutes figure is explicitly an estimate in the current case
  and journey. Keep that qualifier even though interview scripts state it as an
  outcome. Do not convert it to an 83% measured reduction.
- **FX execution analytics remains beta.** The production call-centre blotter,
  in-build hedging project and public execution-analytics rebuild are separate
  projects. “Classic” represents the Barclays design; “Enhanced” is Shannon's
  extension. Current case status is correctly separated.
- **Fusion Analytics and Data Manager are distinct.** The two analysts finding a
  data-quality problem and the drill-down-versus-grid decision belong to Data
  Manager. Do not add them to the Analytics journey. Analytics' internal weekly
  reviews and two-client phase-two test are present in the later speaker notes.
- **The notes are preparation, not a research archive.** Placeholder prompts and
  instructions to check a timeframe are not evidence. The older “last couple of
  years at Barclays” conflicts with the confirmed September 2025 start; current
  portfolio dates correctly use 2025 onward. Retain J.P. Morgan 2016–2025 and
  Fusion 2023–2025. Do not import “fifteen years in finance” from the opening:
  earlier consumer work forms part of that broader career.
- **Team contribution is a strength.** Preserve the BA route to clients in the
  hedging story, shared UX ownership of Deal Model's flow, and the accessibility
  specialist in Fusion. Do not convert all “we” statements into sole ownership.
- **uoaui.ai is professional work in private alpha.** Keep the working builder,
  comparison and export evidence, with no adoption/time-saving claim. “No external
  test yet” remains clear and is more useful than repeated self-deprecating caveats.
- **Composite personas and journey quotes are designed scenarios.** Current role
  notes correctly say they are not participants. Keep that context close to the
  new maps; do not present emotion curves, fictional names or quotes as measured
  research evidence. Separate intended behaviour from observed behaviour.

## Product claims requiring implementation evidence

The notes cannot verify these. The implementation/asset audit should close them;
this review does not mark them false merely because the interview did not cover them.

| Location | Check needed before final sign-off |
|---|---|
| `CaseAi.astro:33`, `:90`, `:91`; `authored-content.json:742`, `:867` | Prompt actually generates from official components; all five named systems render/export; “never overridden” and “strictest definition wins” need a concrete implementation rule, not only a diagram. If not demonstrable, describe the intended constraint in first person instead of a universal guarantee. |
| `CaseAi.astro:72` versus the flow at `:63` | The recording description shows template selection, card editing and comparison. That alone does not prove prompt generation or React export. Verify both separately; align the walkthrough caption with what it actually shows. |
| `CaseFx.astro:62` and `HowIWork.astro:12` | A September preparation note explicitly warns that the “few clients deciding to trade or wait” account may belong to another FX pricing project. Later notes support observing traders for execution analytics. Prefer the already-supported trader observation in this case unless the original project record resolves the client attribution. |
| `CaseFusion.astro:141`; `authored-content.json:467` | “Several signed after that launch” is not corroborated by these interview notes. It may have another portfolio source. Keep only if that source is identified; otherwise “opened to external clients in phase two” is supported. Do not imply design caused sales. |
| `CaseWinking.astro:48`, `:153`–`:158` | Confirm web/iOS scope for six children, offline queue, shared board, Sample Family, midnight rollover, custody/birthday labels, VoiceOver, Dynamic Type and Calm Mode. The page now covers both platforms but this section mixes platform-specific claims. Add **“In the iPhone app”** where appropriate; do not imply identical web behaviour. |
| `CaseWinking.astro:158` | “Scaling cap so nothing clips” is an absolute accessibility assertion, while the next-step text identifies readability concerns. Verify larger-text screens or use **“I tested VoiceOver, larger text and Reduce Motion, with Calm Mode for quieter feedback”** only if those checks are evidenced. A scaling cap itself does not prove accessibility. |
| `deal-content.json:3`, `:91`–`:122`, `:135` | New original Figma exports may make “all redrawn schematics” inaccurate. Check each asset's provenance and keep sample-data statements exact. Original designs demonstrate designed states; they alone do not prove implemented legal routing, blocked imports or automatic summaries. |

## Final UI/UX review handoff

The product-specific maps should share type, spacing and interaction conventions,
not identical narrative labels. Distinguish an order intervention loop, analysis
and presentation, a designer/model correction loop, family handoffs across days,
and a pricing/approval cycle. Keep primary decisions readable without opening an
accordion, and put the source/evidence qualifier close enough to be understood.

Avoid multiplying the same paragraph across the introduction, persona, journey,
decision and outcome. Retain Shannon's authored material, but give each repetition
a different job: context, action, trade-off or evidence. The final visual reviewer
should check that this hierarchy is legible rather than treating equal-sized blocks
as consistency.

### Final attribution and scope reconciliation, 12 October

The FX case, home method and authored takeaway now describe traders observed on the desk. The separate client trade-or-wait story is no longer attributed to execution analytics. Winking accessibility copy is limited to labelled/selected tabs, text scaling up to 1.6× and confetti suppression with Reduce Motion or Calm Mode; it does not claim a complete device accessibility audit. The stale Fusion transcript now matches the corrected image's “Risk of divergence over time” text. The unused process-data AI component claim is narrowed to mappings with fallbacks.
