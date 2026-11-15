# Brand and design-system source audit

10 October 2026. Shannon explicitly requested end-to-end brand/logo/system
coverage for Winking Star and uoaui.ai, with additional context from the former
portfolio. These findings support original ownership and visual decisions;
current application tokens and product behavior take precedence.

## Source locations

- Public [uoaui project page](https://shannonhecker.com/project-uoaui.html),
  retrieved successfully. Its local counterpart is under the clone below.
- Public Winking Star project page could not be retrieved by the web tool;
  inspected the local `project-winkingstar.html` fallback instead. Do not
  describe that fallback as a fresh capture of the deployed page.
- Clone root: `/Users/shannonhecker/Library/Mobile Documents/com~apple~CloudDocs/Documents/Cursor/shannonhecker-portfolio`.

## Supported brand context

### uoaui.ai

`project-uoaui.html:370–412` states solo ownership of interface, front-end,
brand, product direction and the system model. The name wraps U and I as a nod
to people using the tool. The brand began dark-first, using deep backgrounds
and aurora accents. Its four named roles are teal input (`#49D0BE`), purple
compute (`#8A58C9`), peach output (`#E5A999`) and midnight canvas (`#0B1120`).
The own-brand system sits alongside Salt, Material 3, Fluent 2 and Carbon.

Historical brand artifacts: `assets/uoaui.webp`, `assets/uoaui-brand.webp`,
`assets/uoaui-logo-lockup.png`. These may establish identity history; an old
product screenshot within a brand board must not replace current captures or
be presented as current UI. Retrieve exact current logos from source projects
where available, rather than recreate them from generated illustrations.

### Winking Star

`project-winkingstar.html:414–449` attributes brand, copy, illustration direction,
React Native/Expo build, Firebase work and submission to Shannon. It describes
a picture-book character using cream, sage, terracotta and cocoa with doodles
in headers/navigation and Nunito typography. The historical swatches are
cream (`#F8F1E4`), sage (`#9DAC85`), terracotta (`#AE5525`) and cocoa (`#5A3A2E`).
Check the current app's theme file before calling these today's canonical tokens.

Historical original assets: `assets/winkingstar-doodle-map.webp`,
`assets/winkingstar-doodle-treasure.webp`, and supplied app/brand hero imagery.
The current approved naming account (Sparkle/Twinkle unavailable, Winking Star
chosen) already appears in the case. No unsupported logo-construction symbolism
should be inferred merely by looking at the mark.

## Conflicts and exclusions

- Winking's old page claims five families, remote interviews and five formal
  phases. Current approved evidence records own-two-child observation and
  Figma has unresolved household/tester placeholders. Do not treat old published
  copy alone as verified research; retain this as an unresolved source conflict.
- Old Winking copy claims web parity/three form factors, star-sheet scanning,
  April token changes and exact 12.4:1/5.1:1 contrast results. Verify against
  original implementation/audit records before reusing. Current iPhone/iPad,
  Sample Family and Monday behavior remains authoritative.
- Old uoaui copy claims designer-friend tests between five phases and three days
  to the first prototype. Those are not newly verified study/timing records.
  Keep private-alpha status and no measured external outcome claims.
- “Dark mode reduces eye strain” and a claimed general user preference are not
  substantiated by this brand source. Describe a visual choice without turning
  its rationale into a proven ergonomic or research result.
- Logo/brand ownership is explicitly supported by Shannon's current instruction
  and the original portfolio role statements. That does not grant authorship of
  third-party Salt/Material/Fluent/Carbon brand systems themselves.

## Implementation review

Show logo, palette, typography, component examples and the connection to the
actual product, with end-to-end ownership stated accurately. Keep the case
legible inside the portfolio's illustrated style. Brand artifacts are authored
design evidence; newly generated persona/scenery art is decorative support.
The parent agent is inspecting original product tokens and implementing these
sections. This audit does not mark implementation or validation complete.


## Current source verification and implementation

Main verified the following against original product code and current live UI.
These supersede the historical palette values above for the implemented brand
sections. `BrandSystem.astro` and `BrandMark.astro` now show both brands on their
cases and work entries; validation of this newest scope is pending.

- **Winking Star:** `weekly-superstar-ios/lib/themeColors.ts`, `VOY_PALETTE`:
  canvas `#F7F5EF`, forest `#12351F`, sage `#A9D5B2`, peach `#FFE0D2`.
  `weekly-superstar-ios/lib/tokens.ts` spacing: 2/4/8/12/16/20/24/32.
  `weekly-superstar-shared/src/tokens` defines Nunito typography, radius 25
  and minimum button height 50. These are source implementation values,
  not independently verified universal accessibility claims.
- The original 1024px app icon comes from
  `weekly-superstar-ios/assets/icon.png`, replacing the smaller 320px copy
  in portfolio asset `ws-icon.png`.
- **uoaui:** `UOAUI_LANDING` in `src/data/uoaui/tokens.ts`, corroborated by
  current `https://uoaui.ai/`: midnight `#0A0E1A`, purple `#A78BFA`, peach
  `#F0B5A4`, teal `#3DDCC4`. Identity type uses Bricolage/Inter/IBM Plex Mono;
  components use Inter. Motion durations are 150/250/350ms.
- The original `uoaui-logo-lockup.png` comes from the former portfolio clone's
  `assets/uoaui-logo-lockup.png`; it is authored identity art, not generated.
- `live-uoaui-own-system.png` is a real 1600×1100 browser capture made on
  10 October 2026 from `https://uoaui.ai/ui-kit?ds=uoaui`, showing the current
  house system. It is distinct from the previously captured Salt library.

Ownership concerns the original product identity, own system and integration
work. Salt, Material, Fluent and Carbon remain third-party systems; displaying
them does not imply Shannon authored those libraries.
