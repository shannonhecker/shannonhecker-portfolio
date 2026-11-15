# Portfolio UI and UX review · 12 October 2026

## Scope and design direction

I reviewed the portfolio as a path from the introduction to selected work, through a case study and back to another project or contact. Routes: `/`, `/panel`, `/fx`, `/fusion`, `/winking-star`, `/deal-model`, `/uoaui`, `/privacy`, `/build`, `/404`.

I kept the established design: white (#ffffff) and charcoal (#171b22) canvases; dark ink (#272b32) and light ink (#edf1f5); secondary text (#555d68 and #b7c1ce); Inter Tight headings and Inter body text. Project accents belong to the evidence. The shared shell uses one navigation system and the cases use the same left-hand section labels and right-hand reading column, stacked on phones.

The review preserves Shannon's case copy, actual product UI, deliberate project colours, complete images, Figma sources and optional game. Consistency means predictable navigation and reading structure; the products do not need identical artwork.

## Findings and corrections

| Finding | Reader impact | Correction |
| --- | --- | --- |
| Phone header showed only Work, FX and part of Fusion; remaining links needed horizontal discovery | Other cases and How I work were easy to miss | One visible Menu control exposes the existing seven destinations, with 44px targets, keyboard access, Escape dismissal, outside-click dismissal and a no-JavaScript fallback |
| Several case indexes placed Journey before an earlier flow/constraints section, or Accessibility before an earlier outcome | Jumping through the index moved backward in the story; the current-section label could misidentify the section | Index order now matches document order on all five cases; Winking's overview is included |
| Active project had a background only in dark mode | Location feedback changed with theme | Shared current-page treatment in both modes |
| Build log and 404 lacked navigation/theme controls; Privacy had separate spacing and no skip target | Supporting pages felt disconnected and harder to leave | Shared UtilityPage layout with header, footer, theme switch, main landmark, skip link and consistent prose rhythm |
| Analytics notice used fixed light colours in dark mode | An unrelated bright panel interrupted the reading palette | Shared surface, text, border and focus tokens; no analytics or consent behaviour changed |
| 404 return link could briefly present pale text against a light background during a theme change | Weak contrast on the recovery action | Explicit paired foreground/background colours, including hover and focus |

## Page review

- Home and panel: introduction, selected-work gallery, How I work, optional adventure entry, footer destinations. The portfolio remains usable without entering the game.
- FX: beta/public-rebuild distinction, research and personas, original journey, decision map, flow, outcome and accessibility. No content claims or source artwork changed.
- Fusion: shared hero, constraints and workflow, journey, decisions, UI craft, outcome and accessibility. Corrected index sequence.
- Winking Star: shared overview/template from the previous pass, product links, personas, family workflow, journey, decisions, brand, themes, edge states and outcome. Corrected index sequence and included the overview.
- Deal Model: phase-based product evidence, flow, journey, decisions, validation-state table and outcome. Its existing index was already in reading order.
- uoaui.ai: private-alpha framing, prompt/review/export flow, journey, decisions and brand/system content. Corrected index sequence.
- Privacy: readable paragraphs, navigation and theme consistency. Policy copy is unchanged.
- Build log: retains its chronological record and formatting, now within the shared navigation shell.
- Missing page: recovery action remains explicit and the header provides alternative destinations.

## Verification

New browser checks cover all ten routes at 320, 820 and 1440px in both themes, one main heading/landmark, menu visibility and destinations, Escape/focus behaviour, section order, no-JavaScript navigation, utility-page accessibility, active project styling and analytics-notice contrast. They run in Chromium and iPhone-configured WebKit.

The existing suite continues to cover complete product-image proportions, comparison-art contrast, fitted/enlarged maps at 320/390/760/1440px, theme selection, diagrams, sections drawers, reduced motion, keyboard access and optional game behaviour.

This is a visual and functional consistency review, not a new usability study with participants. External products and every possible game playthrough are outside this portfolio-page review; existing game regressions protect the interaction contract. Long cases remain intentionally complete because Shannon asked to retain the copy. The section index and transcripts provide alternate reading paths.

Release validation: all 216 tests passed in the final full run. One earlier game-map coordinate check failed once and passed unchanged on the targeted rerun and final full run. No game behaviour or assertion was weakened. Manual preview navigation also caught a focus-transfer issue in the new disclosure; it was corrected and actual project navigation is now tested in both engines.
