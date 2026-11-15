# Figma source audit

Read-only review, 10 October 2026. File `17Rsi3vWFtaYwlrRf5iO8E`.


The user supplied node `2048:250`, then clarified that all pages should be
scanned. The exact node is intro speaker-note text inside `2048:248` (Notes 02),
not a design frame with descendants. Its parent page is `2044:260`. The audit
inventoried every top-level node, screened every text node for relevant claims
and placeholders, and read key case and speaker-note frames in full. It did
not visually inspect every image embedded in the file.

| Page | ID | Top-level nodes | Text nodes | Useful context |
|---|---|---:|---:|---|
| JPMC 2026 | `2002:854` | 31 | 127 | FX depth, Fusion, Data Solution, Markets Execute, Algo Center and Deal Model |
| page2 | `2025:239` | 57 | 1,402 | Duplicate deck plus detailed legacy Corporate Action warning, skip-link, dashboard and accordion designs |
| LSEG 2026 | `2027:7140` | 27 | 94 | Corporate Action, ETF migration, Deal Model, Data Solution; interview-specific Phoenix framing |
| Page 1 | `0:1` | 115 | 231 | Original project slides, notes, Fusion branding, icons, typography, logo and image assets |
| Revolut 2026 | `2044:260` | 34 | 115 | 17 intro slides plus 17 speaker-note frames; richest narrative sources for the three next projects |
| LSEG 2026 - Sai | `2063:260` | 27 | 94 | Alternate ordering of the LSEG evidence; do not import Phoenix interview prompts into this portfolio |
| Revolut Portfolio 2026 | `2068:239` | 36 | 370 | Current four-case context, personas, journeys, trade-offs and several explicit unfinished claims |

### Source map and important findings

- **FX:** `2048:286` explains the static chart/five spreadsheets and repricing
  clue; `2048:289` explains the chart interaction and direct client observation;
  `2048:293` covers the six phases, study-source reversal and proposed measures.
  **`2048:290` explicitly distinguishes Classic, designed at Barclays, from
  Enhanced, Shannon's own rebuild. Neither combined UI toggle nor the Enhanced
  work should be described as having shipped at Barclays.**
- **Fusion:** `2048:297` covers RaaS replacement, shared UX support, configurable
  pages, FactSet import/export, removed configuration tier and accessibility.
  `2073:352` and `2078:272` supply workflow and system-layer context. Original
  branding lives on `0:1`; current product screens still come from the live URL.
- **uoaui.ai:** `2078:387` supports mapping five systems and their disagreements.
  `2078:390` contains the older forced-compare/tune claim flagged by the live
  audit above. `2078:393` includes an unfinished alpha-tester count and must not
  be promoted into evidence. Live builder media and observed behavior take
  precedence for current UI and interaction claims.
- **Winking Star:** `2080:287`, `2080:342`, `2081:272` hold personas, journey and
  decision context. Older `2068:10851` uses a Sunday reveal; `2068:10862` describes
  setup before first use and a web platform. These do not override the later
  approved Sample Family, Monday-new-pet and app-platform copy in the repo.
- **Corporate Action Manager:** `2048:257` describes processor/checker roles,
  per-market deadlines, twelve months with the ops desk, status-check research,
  priority queue and inline keyboard actions. The 40% faster / 60% fewer steps /
  zero accessibility violations claims are explicitly in the source, not new
  measurements made during this site pass. Source frame `2044:600`; detailed
  historical UI frames include `2026:22207` (Skip-Link) and `2026:22361`
  (Dashboard 1280). Keep this as the next feature, not silently added scope.
- **Deal Model:** `2048:269` identifies custody ops, sales, legal and product,
  about sixty product owners, a year embedded, and two hours to twenty minutes.
  `2048:272` explains one object/four views, three design versions per review,
  five-step flow and spreadsheet upload bridge. Source frames `2044:2375` and
  `2044:6806`; original image assets occur under `43:34301` on `0:1`.
- **Data Solution:** `2048:279` identifies data engineers and analysts, trusted
  ingestion and drill-down over a faster-to-build flat grid. `2048:282` describes
  column profiling, dimension/metric/boolean types, chart toggle, two analysts
  and reusable data-quality rules. It says four frameworks but names only three;
  source `9:68` supplies the fourth, Recipe Builder, alongside Rule Builder,
  Data Manager and Discovery. Avoid inventing quantitative speed improvements.
- **Dates/experience:** older intro `2048:250` says fifteen years in fintech;
  newer `2068:444` says fifteen years in design, ten in fintech. Older JPMC/page2
  intros say two years at Barclays. Preserve the approved September 2025 start
  and current site wording rather than importing these inconsistencies.

### Excluded incomplete evidence

Do not import `[Confirm]` assertions at `2081:361`, `2081:364` or `2081:352`.
In particular, no-op duplicate ticks and later-timestamp-wins sync are not
confirmed. Exclude unfinished date, downloads, retention, release and future
roadmap fields at `2081:376`, `2081:379`, `2081:382`, `2081:385`, `2081:388`,
and alpha tester counts at `2078:393`. Existing approved repo facts retain
precedence even when an older deck left the same topic unfinished.

### Supporting-art candidates and attribution limits

Presence in Shannon's deck is provenance, not proof that she authored every
brand asset. Current approved case prose establishes Fusion component, token
and pattern work; it does not establish sole authorship of the Fusion logo or
brand illustrations. The following are research candidates only. Do not publish
them with an authorship claim or add them merely to decorate the case.

Current UI screenshots and videos must come from the three current live product
URLs. These historical artwork candidates must never replace current screens.



Read-only exports, visually inspected, saved outside the app for review:

- `/private/tmp/portfolio-review/figma-fusion-brand-system.png`, node
  `29:17427`, 1753×300. Six line-based Fusion brand forms. Potential supporting
  evidence for the original brand/system work; not current product UI.
- `/private/tmp/portfolio-review/figma-fusion-icons.png`, node `30:777`,
  1218×1014. Icon applications and their original product-marketing descriptions.
  Contains wording beyond Shannon's approved case copy, so do not insert the
  whole sheet solely to decorate the page.

Further reusable originals are mapped at `30:561` (Fusion logo vector group),
`29:534` (typography) and `29:560` (brand concept). No historical product screen
was exported to replace a current live capture, and no Figma node was modified.

### Restored FX decision-loop diagram

The original slide is `2068:1681`, “10 FX · Explorations, the decision loop”.
Its authored vector diagram is frame `2068:1768` (1019 × 889); the title is
`2068:1767`. The existing `ui-fx-loop.jpg` reproduces the complete diagram;
`fx-loop.jpg` includes the full presentation slide and its title. A fresh
read-only Figma screenshot visually confirmed the branches on 10 October.
The FX page now uses that existing diagram as its primary decision-map visual,
with an accessible branch transcript and a link to the original source.
It replaces the later generic SVG, without replacing the separately labelled
current public-rebuild product captures. This is design exploration evidence,
not a confidential bank screenshot or a claim that Enhanced shipped at Barclays.

The initial JPEG restoration was superseded by a fresh 3× PNG export from
`2068:1768`: `public/art/fx-original-decision-loop.png`, 3057 × 2667 pixels.
The source contains 69 vector nodes and no bitmap nodes; all labels are outlined.
The PNG preserves the exact authored paths and transparency. It is displayed
uncropped on #111418 with a full-resolution link and no 1008px display cap.
SVG export succeeded, but the tool did not attach SVG files; the 3× PNG artifact
was transferred directly from its image attachment and visually verified.

## 11 October 2026 · Current working-page sync

Source: `l6noy7onfsRiuBgjqSsKbt`, supplied node `181:601` inside the Fusion persona artwork. Read-only inspection; no Figma writes.

| Working page | Desktop / mobile | Implementation |
|---|---|---|
| Home | 32:3 / 32:4 | Existing hero, game and motion retained; five-case index including Deal Model |
| Panel | 32:6 / 32:7 | Same project update, with panel introduction retained |
| FX | 32:9 / 32:10 | Updated three persona illustrations; native identity text; existing high-resolution product captures retained |
| Fusion | 32:12 / 32:13 | Three personas, five-step qualitative journey, three decision comparisons and authored flow |
| uoaui.ai | 32:15 / 32:16 | Two personas, five-step journey, three decision comparisons and flow |
| Winking Star | 32:18 / 32:19 | Three personas, six-step journey, six decision comparisons and flow |
| Deal Model | 233:460 / 239:493 | New case: four roles, five steps, six decisions, seven edge states, four validation examples, thirteen product screens |
| Build / Privacy / 404 | 32:21 / 32:24 / 32:27 and mobile counterparts | Current site log/privacy/404 retained; newer operational copy is not reverted to the captured version |

Desktop content and mobile text inventories were compared. Mobile's shorter captions do not remove the fuller desktop narrative from the responsive website. Qualitative journey plots and schematic comparisons are original authored diagrams; narrative, personas, journey steps and trade-offs are real HTML. Diagrams have native text alternatives and full-size links. Horizontal scrolling is confined to labelled, keyboard-focusable diagram/table regions.

Image comparison checked forty existing product placements. Most normalized pixel differences were 0.1–1.2%; the original website screenshots were larger than the Figma display exports. Retaining those avoids a resolution downgrade. The new Deal Model screens are the sample-name versions from nodes 242:530 through 242:590 (increments of five), not the unsanitized original design page. The FX illustrations use 120:7013, 120:7019 and 120:7025. Existing product media provenance remains in MEDIA-SOURCES.md.

No Nano Banana generation was needed: the required source artwork was available. No portfolio material was sent to 12ui or another design-generation service.

Visual exception: the four decision-flow exports are retained as source references, but rendered as inline SVG on the website. This corrects overflowing Deal Model labels and weak outlined connector labels in the other exports, adds dark-theme pairing and applies the site's 4px corner treatment. The original graph structure and text remain intact.

### 11 October · Finished-file vector audit

The screenshot-only comparison missed six native FX chart drawings. They are now mapped explicitly, in reading order:

| Figma node | Website asset |
| --- | --- |
| 140:5074 | fx-decision-1-chosen.png |
| 140:5087 | fx-decision-1-alternative.png |
| 140:5114 | fx-decision-2-chosen.png |
| 140:5128 | fx-decision-2-alternative.png |
| 140:5155 | fx-decision-3-chosen.png |
| 140:5168 | fx-decision-3-alternative.png |

Each asset is a direct 6× render of the editable source, delivered through AuthoredImage. The re-audit covers Home, Panel and all five case pages, including native vector containers as well as image fills. FX's data-layer chart, journey, original decision loop, hero details and before/after states are retained. Fusion, uoaui.ai, Winking Star and Deal Model's authored comparisons, qualitative plots and product images were already present. Their transparent comparison artwork now sits on a white surface to preserve its dark embedded labels in either page theme.

## Decision maps drawn in Figma first, 12 October 2026

I used the original FX decision loop (`17Rsi3vWFtaYwlrRf5iO8E`, `2068:1768`) as the visual reference, then drew five editable maps in the portfolio design file. The new page is **Decision maps · October 2026**, `438:10271`, in `l6noy7onfsRiuBgjqSsKbt`. Existing case frames remain intact.

| Project | Dark frame | Light frame |
| --- | --- | --- |
| Fusion | 438:10272 | 438:10341 |
| uoaui.ai | 438:10410 | 438:10488 |
| Winking Star | 438:10566 | 438:10675 |
| Deal Model | 438:10784 | 438:10875 |
| FX | 438:10966 | 438:11080 |

The maps use editable Inter text and auto-layout nodes, with routed vector connectors, arrowheads, labelled branches and dashed return loops. Blue marks decisions, green marks starts/outcomes and amber marks exceptions. The design follows current authored content and decision evidence: Sample Family and alpha review are optional; smart pricing remains explicitly explored; FX remains beta. All existing decision comparisons and their evidence remain below the maps. The original FX artwork is retained in an expandable reference section.

The site uses direct SVG_STRING exports from these ten frames. `scripts/prepare-decision-svg.py` normalizes the export's encoded Unicode and embeds the existing licensed Inter font, without redrawing geometry. The font license accompanies the exports. `src/data/figma-decision-maps.json` records the source IDs; `decision-map-content.json` provides the accessible text version. For later edits, change the Figma frame, export it again, run the preparation script and validate both themes.

Visual review corrected wrapped-text heights, a branch-label overflow and connectors crossing node interiors. Browser tests check all five map assets, theme switching, keyboard panning, image proportions, page overflow, accessible transcripts and rendered text bounds. Mobile starts on the central decision path and allows horizontal panning at full label size.
