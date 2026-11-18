# Portfolio review, 18 November 2026

The public portfolio gives readers a clear reason to explore Shannon’s work. The strongest opening is the home headline, “I design tools where mistakes cost money.” The main opportunity is how quickly a reader who opens a case can find the decision Shannon made and the evidence behind it.

## What changed locally

- The “Earlier work” link on all ten archive projects now returns to the archive heading on Work. Previously it opened the top of the page, with five flagship cases between the visitor and the collection. The final heading lands about 102 pixels from the top on both phone and desktop, below the fixed navigation.
- The missing-page link “Back to the work” now opens the Work index. Previously it opened Home. The missing page also has its own description.
- The review branch brings together the existing About, introductory copy, outline icon and game fixes so they can be tested together. About drops from 605 to 473 words of visible main content in the measured phone layout.

## Priorities by visitor journey

| Area | Evidence and decision |
| --- | --- |
| Home | Keep the headline, the work link and the optional game. They establish the field, give a hiring manager a direct route into the portfolio and let an interested visitor explore the personal story. The game waits for an explicit start. |
| Work | Keep the five flagship cases ahead of the ten earlier projects. The groups distinguish the work that merits a deep read from the wider career record. Direct archive return links make the grouping work in both directions. |
| Five flagship cases | Give a reader one concrete decision near each title, using the existing contribution wording. In the combined build the contribution and delivery block begins 1,028 to 1,253 pixels down at 390 × 844. Try relocating that one sentence and removing its repeat below the media. Keep the full-resolution artwork, section navigation and detailed outcomes for readers examining the process. |
| Deal Model | Start the next editorial pass here. It is the longest live case, about 3,906 visible words including interface labels. The four teams sharing one deal record is the organising idea. Explain it once in the opening and use the workflow and decision sections to show precisely where their needs diverged. Preserve the status, dates and qualification on the time-saving estimate. |
| Ten earlier projects | Prioritise role, year and work sample on a phone. On Fusion Design System the Tags row alone occupies about 171 pixels at 390 pixels wide. A later placement for the tags would bring the first work sample forward while keeping the terminology searchable. Preserve the original outcome figures. |
| About | Use the shorter local version. It removes about 22% of the visible main text while preserving career history, named roles and the personal material that gives the page its voice. |
| Writing | Keep the essay lengths and reading-time labels. The three essays have independent arguments and the index gives readers a synopsis before they commit. The local index itself is about 132 words. |
| Chat and contact | A live question about FX received a successful streamed answer identifying the correct case and its beta status. A clickable case reference in this kind of answer would complete the journey from question to evidence. The résumé resolved successfully. LinkedIn blocked automated requests, leaving that external destination unverified. |
| Privacy and recovery | Keep the direct consent language, theme controls and short missing-page recovery. The live missing route returned HTTP 404 and offered paths back into the work. |

Visible word counts use the main element’s rendered text at phone width. They include visible interface labels and captions and exclude closed or hidden content. They describe reading density, not an editorial word limit.

## Verification

- Crawled all 23 live sitemap pages and an intentionally missing URL in Chrome at 390 × 844. Every listed page returned HTTP 200. Each had one primary heading, a title and a description. Canonicals matched all 23 listed URLs. No document overflow, uncaught page errors or unresolved internal page fragments appeared in this pass.
- Checked 119 other linked same-origin paths, including project artwork and the résumé. All returned HTTP 200. Fourteen external URL variants returned HTTP 200. Two LinkedIn variants returned 999 to the automated client.
- Ran axe on all 24 initial mobile page states against WCAG A and AA tags through WCAG 2.2. It reported zero violations in the tested states. The local suite separately exercises menus, dialogs, focus, keyboard controls, consent and theme changes. Screen-reader and physical-device sessions remain outside this pass.
- Inspected mobile first-screen captures across the live site and checked the corrected archive and missing-page journeys at 390 × 844 and 1440 × 900 in both themes.
- Measured three live paths using Lighthouse’s simulated mobile profile. Home scored 99 for performance with a 1.8-second largest contentful paint. About scored 100 at 1.7 seconds. Deal Model scored 98 at 2.2 seconds on a repeat after Lighthouse failed to record a first paint on the initial attempt. Each successful run scored 100 for accessibility, best practices and SEO. These are lab samples. Real visitor performance and award judging are separate evidence.
- The final production build, Astro diagnostics, public-content and copy checks and 23 redirect mappings passed. All 885 Chromium and WebKit tests passed on the final build in three minutes. An intermediate WebKit run needed one retry while the preview was being rebuilt. The game has a separate live playthrough and regression review. Publishing requires Shannon’s confirmation.
