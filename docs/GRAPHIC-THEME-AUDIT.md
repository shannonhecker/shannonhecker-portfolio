# Graphic theme audit

12 October 2026. Active supporting diagrams across the five case pages; persona theme work is owned separately by the parent agent.

## Changes

`src/pages/art/themed/[name].svg.ts` emits 13 static SVG derivatives from the exact original assets in `public/art`. Paths, dimensions, masks, wording and layout are retained; originals are not overwritten. Embedded `prefers-color-scheme` rules inherit the site's explicit `color-scheme`, rather than applying an inversion filter.

- Fusion, uoaui, Winking and Deal: the original experience and approach diagrams now change neutral panel, text and divider colours in dark mode. Curve/connector strokes receive readable versions of their existing hue; labelled colour blocks retain white lettering.
- FX: the four state/fill comparison diagrams change neutral chart surfaces, text and dividers in dark mode. Translucent individual fill dots receive a lighter blue; counted-cluster labels keep their original contrasting treatment.
- FX: the supplied data-to-encoding SVG changes white text to dark text and uses darker versions of its four accent hues in light mode. Its container now uses `--bg-2` instead of a fixed dark background.
- `AuthoredJourney.astro` points its eight affected images to the themed derivatives. `CaseFx.astro` points its five affected images to the derivatives; no source geometry was redrawn.

## Active components already adaptive

`ProductJourney`, `JourneyStep`, `AuthoredJourney` text/context/takeaways, `AuthoredDecisions`, `Flow`, `Stack`, `Matrix`, `CoParent` and `BeforeAfter` HTML surfaces use the existing foreground, secondary foreground, background, divider and project-accent tokens. Flow branch surfaces already have a dark override. No additional fixed neutral contrast bug was found in these active shells.

`Schematic`, the old `Journey`/`DecisionMap`, `FxJourneyPlot`, `Layers`, `AuthoredDecisionFlow` and `DealDecisionFlow` are not imported by active case pages. They were not altered as if they were visible evidence.

## Deliberate exceptions

- Product screenshots, recordings, home marketing composites and raster decision artwork retain their depicted product theme. Recolouring those pixels would change the source evidence, not implement a real product theme. Existing actual FX light and dark captures remain presented as separate evidence; they are not silently swapped, because their market state can differ.
- `/art/fx-original-decision-loop.png` is an exact raster export. Its colours remain intact. A genuine vector original or paired source export is needed for faithful theme adaptation.
- `/art/fx-journey-original.svg` contains mixed original dark-page artwork and embedded raster content in a large Figma export. A blanket white-to-dark replacement would also change coloured labels and mask-dependent content. It remains an original-art inset pending a separately scoped, source-aware colour mapping.
- Brand palette swatches intentionally show the product's named colour values. App icons, logos and their original dark lockups retain identity colours; captions and surrounding editorial UI adapt.
- Winking's interactive product demo intentionally retains its own native family-product palette (`#demo` declares a light product colour scheme). It represents the app, rather than an editorial diagram.

## Verification

Chrome at local port 4341: explicitly toggled the site switch and observed Fusion's exact experience/approach vectors repaint from dark panels/light lettering to their original light panels/dark lettering. FX data layers were inspected in light mode; FX before/after vectors were inspected in dark mode. No geometry changes or inverted screenshots were introduced.

Proof: `/private/tmp/portfolio-final-review/fusion-journey-dark.jpg`, `fusion-journey-light.jpg`, `fx-data-layers-light.jpg`. `npm run check` passed with zero errors and zero warnings (four existing hints). Parent owns the final build and complete browser suite, including static endpoint generation.
