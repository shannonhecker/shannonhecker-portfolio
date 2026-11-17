# Product media sizing and themes · 12 October 2026

The Winking Star hero collapsed to its min-content width because its centred grid item had auto margins without an explicit width. At a 390px viewport it occupied 117px of the available 350px. All project heroes now explicitly use their grid column; phone captures use the full available width without cropping.

`src/lib/adaptive-art.ts` lists the audited outer presentation layers for 22 compositions: eight case compositions, four individual Winking phones, and ten home gallery desktop/mobile compositions. The static `/art/transparent/` route applies the same treatment to their existing responsive derivatives. These layers have an explicit `fill="none"`, so the real page colour shows through in both light and dark mode. No SVG media query or theme propagation is required. The old `/art/adaptive/` paths remain available for cached pages; new URLs prevent reuse of the previous conditional image files.

## Correction after phone feedback

PR #50 used an SVG `prefers-color-scheme` rule that passed Chrome and current WebKit, but Shannon's iPhone in-app browser still showed the cream surround. A controlled Chromium regression with a dark page and light image-container colour scheme reproduced the failure. The correction removes those fills at build time instead. This also removes the cream/pastel presentation blocks in light mode, letting the white page show through.

Actual product UI backgrounds, phone frames, screenshots and illustrations keep their authored colours. Full-resolution links still open the untouched originals. No inversion, multiply filter, new raster encoding, generated artwork or Figma edits are involved. Raster-only screenshots with backgrounds inside the product remain intact; recolouring those would misrepresent the product.

Regression checks cover full hero width and page overflow at 320, 390, 430 and 820px across all five products; exact source recovery after restoring only audited fill attributes; and rendered background/phone-screen pixels when the site theme changes while the image container is forced to a light colour scheme. The focused media suite runs under both Chromium and iPhone-configured WebKit in CI. This is browser-engine coverage, not a claim of physical-device testing.

## Full project-content audit

The audit covers the home gallery and all five case pages, including hero art, in-body captures, journeys, decision comparisons, personas, diagrams and next-project previews.

| Project | Presentation artwork | Content treatment |
| --- | --- | --- |
| FX | Home compositions are transparent; the three hero exports are tightly fitted product UI | Data-layer diagram and four before/after schematics use explicit theme variants. Original dark journey, decision-loop evidence and product screenshots retain their source colours. |
| Fusion | Both hero compositions and the in-body configuration composition are transparent | Journey and approach use explicit theme variants. Individual full-screen product captures preserve their UI. |
| Winking Star | Hero, four-phone composition and each individual phone have transparent surrounds | Journey and approach use explicit theme variants. Web captures, app icon and illustrated theme banners retain product colours. |
| Deal Model | The overlapping hero from the phone screenshot and both home compositions have transparent surrounds | Journey and approach use explicit theme variants. The 13 product-flow screens and decision evidence retain actual interface backgrounds. |
| uoaui.ai | Both hero compositions and home compositions have transparent surrounds | Journey and approach use explicit theme variants. Builder, UI-kit and comparison captures retain product colours. |

The 13 semantic diagrams previously used an external-SVG colour-scheme query. New pages use `ThemedArtwork.astro`, which selects one of two explicit SVG variants with CSS tied directly to `html[data-theme]`. Only the visible version is exposed to accessibility tools; sizes and alt text are preserved. Both files contain unconditional paints. The old conditional endpoint remains solely for cached-page compatibility. Paint mappings are shared in one module.

HTML content, persona cards and authored diagrams already use page theme tokens or `html[data-theme]`; those do not rely on the external SVG mechanism. Original screenshots and evidence exports are not indiscriminately inverted or recoloured. Full-size source links still open the originals.

## Journey geometry audit, 12 October 2026

The editable Figma Winking Star approach strip (`l6noy7onfsRiuBgjqSsKbt`, node `352:5861`) reproduces the reported issue: six baseline dots use different x positions from the three loop endpoints, and 22px labels sit on rows only 18px apart. The Fusion, uoaui.ai and Deal Model exported approach strips have the same coordinate mismatch. Their existing dot order and authored glyph paths are retained; connector endpoints now meet the nearest existing dot's upper stroke edge. Labels have 34px row spacing in a 156px canvas and paint above connectors. Upper experience curves remain unchanged. FX's authored connector endpoints already share its dot x coordinates and its labels occupy separate rows.

`tests/journey-geometry.spec.ts` checks every corrected connector endpoint and rendered label rectangle in explicit light and dark SVGs. The page image dimensions reserve the revised height before load.

## Comparison artwork readability correction

The raster decision comparisons contain dark labels over transparent areas. They now receive a white backing from `.authored-choice-pair .authored-image-link` in both themes, across all five projects. This backing is necessary for the baked-in text; it does not change the transparent product heroes, the explicit themed journey diagrams or the new Figma decision maps. Full image proportions and source colours are preserved. Regression checks cover every comparison at phone and desktop widths in both themes, in Chromium and iPhone WebKit.
