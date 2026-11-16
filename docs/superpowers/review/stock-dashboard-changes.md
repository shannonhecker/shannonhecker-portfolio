# Stock dashboard page: what changed from the old page

For Shannon to read before the site goes live. Source: `project-barclays-data-viz.html` on the `legacy-static` branch. New page: `/work/stock-dashboard`, content in `src/content/earlier/stock-dashboard.md`.

## Needs your decision

The two images on the page still show the Barclays eagle mark in the dashboard's sidebar, and "Barclays" appears as one of the six companies in the sample data (a tile and a row in the price table). The page text, file names, alt text, title, meta description and JSON-LD are clean, but a visitor looking at the pictures will see the name. I have not edited the images:

- `src/assets/earlier/stock-dashboard/stock-dashboard-banner.webp` (the cover): eagle in the sidebar, "Barclays" row in the price table, "Barclays" tile at the bottom left.
- `src/assets/earlier/stock-dashboard/stock-dashboard-02.webp` (the second image): eagle in each sidebar, "Barclays" row in the price tables, "Barclays" tile at the bottom.

If the design task should carry no Barclays marks, both images need re-exporting with the logo removed and that company renamed.

The rule: the words "Barclays" and "Front Office" appear nowhere on the page, including image file names, alt text, title, meta description and JSON-LD. Titles and the lead are as you gave them. Everywhere else only the minimum words came out.

| Where | Before | After |
|---|---|---|
| Title (h1, tab title, search title) | Barclays Data Visualisation | Stock dashboard design task |
| Lead (also the meta description and the next-project line on other pages) | Stock performance dashboard for Barclays Front Office. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts. | Stock performance dashboard design task. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts. |
| Meta row, Client | Client: Barclays | Removed. The row now shows Project type, Year and Role only. |
| Tags | ... Data Visualisation, Dashboard Design, Barclays, Figma, D3.js ... | "Barclays" removed. The other eight tags are unchanged. |
| Cover alt text | Barclays stock dashboard: desktop, tablet, and mobile views | Stock dashboard: desktop, tablet, and mobile views |
| Second image alt text | Barclays stock dashboard: detailed chart modules, heatmap, and sector views | Stock dashboard: detailed chart modules, heatmap, and sector views |
| Image file names | barclays-banner.webp, barclays-02.webp | stock-dashboard-banner.webp, stock-dashboard-02.webp |

Nothing in the body text named Barclays or Front Office, so the body is word for word as it was.

## Redirect note

The old address `/project-barclays-data-viz.html` is kept in the content file's `legacy` field (never shown on the page) so the redirect task can send it to `/work/stock-dashboard`.
