# Ask Shannon: what changed in the chat's facts

The chat answers from one block of text in `chat-server/server.js` (the system prompt). These are the only lines I changed. Nothing reaches the live chat until the Render service is redeployed from `chat-server` at go-live.

## 1. Job titles and dates

| Before | After |
|---|---|
| Barclays, London. Senior Product Designer (2025 to present) | Barclays, London. Lead Product Designer (September 2025 to present) |
| J.P. Morgan, London. Vice President, Product Design (2019 to 2025) | J.P. Morgan, London. Digital Product Designer VP (February 2023 to September 2025) |
| J.P. Morgan, London. Security Service Products (2019 to 2023) | J.P. Morgan, London. User Experience Designer (August 2016 to January 2023). Security Service Products (2019 to 2023) |
| J.P. Morgan, London. JPMM Execute Trading Platform (2016 to 2019) | J.P. Morgan, London. User Experience Designer (August 2016 to January 2023). JPMM Execute Trading Platform (2016 to 2019) |
| (no internship line) | J.P. Morgan, London. Internship (June to September 2016) |

The description under each role is unchanged.

## 2. Projects

| Before | After |
|---|---|
| KEY PROJECTS (13 case studies on the portfolio) | KEY PROJECTS (15 on the portfolio, at shannonhecker.com) |
| (not listed) | FX execution analytics (Barclays, 2025 to now, in beta). Five spreadsheets and a static chart became one chart a trader can act from. No real screens or client names are shown. |
| (not listed) | Winking Star (solo, 2026, live on web and iOS). A shared routine board for families. Designed, built and shipped by me. |
| Barclays Data Visualisation (Product Designer). Equities monitoring dashboard: charts, heatmaps, filters, and responsive layouts. ... | Stock dashboard design task (Product Designer). Stock performance dashboard design task: charts, heatmaps, filters, and responsive layouts. ... (rest unchanged, no bank named) |
| Global Custody Deal Model (UI Designer). Bespoke deal modelling: multi-step wizard that cut deal creation from 2 hours to 20 minutes with full audit trail. | Deal Model (UI lead, J.P. Morgan Securities Services, 2022 to 2023). Bespoke deal modelling: multi-step wizard with full audit trail. Deal creation went from about two hours to 20 minutes. That figure is my own estimate, not a measured one, so say so when you quote it. |

Every project now carries its page address (`/fx`, `/fusion`, `/deal-model`, `/winking-star`, `/uoaui`, `/work/tripup` and so on), and the list is in the site's order: the five selected cases first, then the ten earlier projects. The other eleven descriptions and their figures are word for word as before.

The two new entries use only the words on the Work page. The Winking Star entry makes no claim about family testing.

## 3. Hosting

`chat-server/render.yaml`: `rootDir: api` became `rootDir: chat-server`, because the folder was renamed.

## 4. Left as it was, for you to decide

The plan said to change nothing else, so these still stand. Each one now differs from the site:

1. **"Design engineer."** DONE, 16 Nov 2026, with Shannon's OK: both lines now say "product designer" ("a product designer at Barclays and founder of uoaui.ai", "Product designer based in London."), matching the site.
2. **"Open to Design Manager and Director roles"** and the notice period ("4 weeks"), office days ("two days a week in the office with Barclays") and the personal Gmail address. The chat will say these to anyone who asks.
3. **"uoaui.ai. Founder & Product Designer (2026 to present)"** and "Details are shared in private conversations only", while the site has a public `/uoaui` page.
4. **Strong claims with no source:** "Every project I ship is WCAG 2.1 AA compliant", "adopted by 5+ product teams and 200+ components", "Fifteen years in design overall, ten of those in fintech".
5. **Family and home details** in Fun facts (married with two kids, St Albans, the cat). The same question is open on the About page.
6. **The model setting** in `render.yaml` is `claude-sonnet-4-6`. It still works; it is not the newest.
