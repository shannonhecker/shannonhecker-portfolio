# Winking Star source audit

11 October 2026. Original assets are reused without regeneration or redrawing.

| Source | Revision inspected | Role |
|---|---|---|
| [Web app](https://github.com/shannonhecker/weekly-superstar-tracker) | 4a889bd | Board, theme artwork, weekly chart and responsive layout |
| [iOS app](https://github.com/shannonhecker/weekly-superstar-ios) | 8388f4d | Four main tabs, app artwork, Sample Family and raw app screenshots |
| [Shared package](https://github.com/shannonhecker/weekly-superstar-shared) | fb7e63f | Shared domain and design tokens |

`winking-source-image-inventory.json` lists 339 image files: 234 iOS and 105 web,
with original paths, revisions, byte counts and SHA-256 hashes. It is an inventory,
not a claim that every image belongs on the portfolio page.

## Assets used

- Home, Activity and Progress: exact original image fills from working Figma
  frame `32:18`, nodes `345:343541`, `345:343546`, `345:343551`.
- Welcome: original fill from `345:343536`, retained as source material.
- Treasure: iOS `app-store-assets/screenshots/03-treasure-raw.png`.
- Football, dinosaur, ocean and unicorn: original iOS `assets/theme-banners/`.
- Three role portraits: active Figma image fills in `293:1639`, `293:1659`,
  `293:1679`; card backgrounds match the working design.
- Web overview, full board and mobile: original web Board components rendered
  locally using fictional Sample Family data. The isolated capture fixture uses
  no live Firebase data. These are component captures, not captures of a real
  family's private board and not evidence of backend synchronization.

## Product comparison

The web concentrates days, activities and totals in one weekly board. The iPhone
app separates the family overview, daily actions, collection and progress into
Home, Activity, Treasure and Progress. The portfolio explains this distinction
instead of treating the two layouts as interchangeable screenshots.

The original iPhone Sample Family journey remains labelled as that journey. Web
setup has a theme selection and grown-up check; it must not inherit the iPhone
claim of opening directly into a sample board. No new research results, retention
rates or time-saving claims were inferred from source code.
