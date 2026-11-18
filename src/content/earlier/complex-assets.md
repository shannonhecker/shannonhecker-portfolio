---
confidential: true
title: "Complex Assets Derivatives Valuation"
summary: "Derivatives valuation workspace for trading desks. Unified inputs, live charts, and scenario modelling three times faster."
contribution: "I led the interface and interaction design from the first workshops through release."
role: "Product Designer"
dates: "2022"
order: 7
legacy: "project-complex-assets.html"
details:
  - label: "Client"
    value: "J.P. Morgan"
  - label: "Project type"
    value: "Web App"
outcomes:
  - value: "3x"
    label: "Faster scenario modelling"
  - value: "Single"
    label: "Unified workspace"
  - value: "95%"
    label: "Trader satisfaction"
tags:
  - "Finance UX"
  - "Data Viz"
  - "Derivatives"
  - "Trading"
  - "Complex Interactions"
cover: ../../assets/earlier/complex-assets/complex-banner.webp
coverAlt: "Complex Assets Derivatives Valuation"
matte:
  - "complex-banner"
---
## Project Summary

Traders valuing complex derivatives were working across spreadsheets, terminal screens, and an internal tool at the same time. Managing strike price, volatility surface, and term structure across disconnected tools caused errors and slowed deal flow.

## My Role

As **Product Designer**, I owned interface and interaction design from exploration through release: workshops, critique cycles, detailed Figma specifications, and handoff patterns the team could build against.

## Design Process

I designed a **unified valuation workspace** that brought the inputs into one structured view. Interactive charts updated as traders adjusted parameters.

The **split-panel layout** put inputs on the left and live valuation output on the right. Contextual tooltips helped newer users without cluttering the expert workflow.

## Decisions

### Decision 1. Split-panel layout, inputs left, output right.

*Options considered:* tabbed interface, modal forms, single-pane with scrolling, split-panel side-by-side.

*What I chose:* split-panel with inputs on the left and live valuation output on the right.

*Why:* Scenario modelling only works when a trader can see the effect of a parameter change while still looking at the parameter. Tabs hide the cause-effect relationship. A modal breaks the mental model. Only side-by-side preserves the loop that the 3x speed improvement depends on.

### Decision 2. Real-time interactive charts, not periodic refresh.

*Options considered:* spreadsheet-like tables, static charts with refresh on submit, PDF export, live interactive charts.

*What I chose:* live charts that update as parameters change.

*Why:* Traders think in what-ifs, and the attention cost of answering a what-if is what kills spreadsheet tools. Interactive redraws move that cost close to zero, so the trader stays in flow. Static output forces them to mentally replay their change, which is both slower and error-prone.

### Decision 3. Contextual tooltips, not a separate help panel.

*Options considered:* inline labels only, dedicated help sidebar, modal tour on first launch, contextual tooltips on demand.

*What I chose:* tooltips that appear on hover for less experienced users and stay out of the way for experts.

*Why:* Trading desks have mixed seniority. A permanent help panel eats real estate that experts resent. A first-launch tour is forgotten by day three. Tooltips on demand let novices discover information at the moment they need it, while experts never see them.

<aside class="earlier-note" aria-labelledby="earlier-note-title">
<h2 id="earlier-note-title">Oops!</h2>
<p>This project is under NDA.</p>
<p>I can’t share full details publicly, but I’m happy to walk through the work in a conversation.</p>
</aside>
