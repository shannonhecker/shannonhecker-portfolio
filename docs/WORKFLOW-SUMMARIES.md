# Illustrated workflow summaries

Reference: [Nielsen Norman Group, Wireflows](https://www.nngroup.com/articles/wireflows/). The reference pairs simplified screen context with the action being taken. No reference artwork was copied.

Editable source: https://www.figma.com/design/l6noy7onfsRiuBgjqSsKbt?node-id=460-9348

Ten frames cover Fusion, Winking Star, FX, Deal Model and uoaui.ai in both themes. The illustrations are schematic explanations, not evidence of additional shipped screens. Existing workflow wording and caveats remain. The FX cancellation branch and specified-versus-rebuild distinction are retained.

The Figma source uses editable vectors, text and auto-layout. `src/data/figma-workflow-summaries.json` records every exported card and frame. `src/data/workflow-summaries.json` is the accessible description/caption source. The build script in `scripts/figma` records how the source was composed; it runs inside the Figma Plugin API with the content object supplied, not as a Node script.

The website renders the exported SVGs inline so they use the site's loaded Inter font. Each card has a complete accessible image description. The sequence is an ordered list, with one column at phone widths and two columns on larger screens. Both theme versions are exported; only the active version is displayed and exposed to accessibility tools. No summary is behind a disclosure or zoom control.
