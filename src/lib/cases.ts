// The project index. Used by the home
// index and by the next-case row at the end of each case page.
export const CASES = [
  {
    "href": "/fx",
    "n": "01",
    "vt": "fx",
    "title": "FX execution analytics",
    "meta": "Barclays · 2025 to now · in beta. Five spreadsheets and a static chart became one chart a trader can act from.",
    "arrow": "Read →",
    "img": "live-fx.png"
  },
  {
    "href": "/fusion",
    "n": "02",
    "vt": "fusion",
    "title": "Fusion analytics dashboard",
    "meta": "J.P. Morgan · 2023 to 2025 · shipped. Board-ready analytics on Salt, reusable widget and filtering patterns, opened to clients in phase two.",
    "arrow": "Read →",
    "img": "figma-fusion-performance.png"
  },
  {
    "href": "/deal-model",
    "n": "03",
    "vt": "deal",
    "title": "Deal Model",
    "meta": "J.P. Morgan · Securities Services · 2022 to 2023 · in use internally. Four teams, one deal object, four views. Pricing, comparison and approval in one platform.",
    "arrow": "Read →",
    "img": "figma-sync/source-242-530.png"
  },
  {
    "href": "/winking-star",
    "n": "04",
    "vt": "winking",
    "title": "Winking Star",
    "meta": "Solo · 2026 · live on web and iOS. A shared routine board for families. Designed, built and shipped by me.",
    "arrow": "Read →",
    "img": "ws-marketing.jpg"
  },
  {
    "href": "/uoaui",
    "n": "05",
    "vt": "ai",
    "title": "uoaui.ai and how I use AI",
    "meta": "Private alpha, landing and UI Kit public. A design platform on Claude that builds screens from real design systems, and where a designer still matters.",
    "arrow": "Read →",
    "img": "live-uoaui-builder.png"
  }
] as const;

export type CaseRow = (typeof CASES)[number];
