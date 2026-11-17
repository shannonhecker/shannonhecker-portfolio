# Persona portrait backgrounds

12 October 2026. Shannon requested one accent colour per persona and removal of the coloured backgrounds inside portrait images.

All cards use white portrait, identity and content surfaces. A single project accent is shared by headings, the quote mark and the response panel. Illustrations retain their natural clothing colours. No multiply blending or separate pastel backgrounds remain.

The eleven existing transparent portraits were retained. The four opaque Deal portraits were edited with the built-in image generation tool in background-extraction mode and saved to `src/assets/img/personas/deal-0.png` through `deal-3.png`. Originals remain available in Git history. The resulting assets have transparent alpha; the edits are AI-assisted cutouts, not claims of pixel-identical extraction.

Prompt used: “Background extraction only for the supplied existing persona illustration. Remove all pale peach background to transparent alpha, including arm gaps. Preserve the original person exactly: same face, expression, hair, glasses if present, clothing colours, outlines, pose, framing and composition. Do not repaint, redraw or restyle the subject. No new shadow or backdrop.” The first two calls used equivalent wording tailored to those portraits.

Figma slot mapping and verification are recorded in `figma-persona-reference-template.json`.
