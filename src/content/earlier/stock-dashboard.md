---
title: "Stock dashboard design task"
summary: "Stock performance dashboard design task. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts."
contribution: "I organised the raw data, chose the charts and designed the desktop and iPad layouts."
role: "Product Designer"
dates: "2025"
order: 1
legacy: "project-barclays-data-viz.html"
details:
  - label: "Project type"
    value: "Data Visualisation Dashboard"
outcomes:
  - value: "6+"
    label: "Visualisation patterns delivered"
  - value: "2"
    label: "Responsive breakpoints (Desktop + iPad)"
  - value: "3"
    label: "Dashboard views (Overview, Sector, Company)"
tags:
  - "Data Visualisation"
  - "Dashboard Design"
  - "Figma"
  - "D3.js"
  - "Angular"
  - "Responsive"
  - "Financial Services"
  - "Enterprise UX"
cover: ../../assets/earlier/stock-dashboard/stock-dashboard-banner.webp
coverAlt: "Stock dashboard: desktop, tablet, and mobile views"
matte:
  - "stock-dashboard-banner"
---
## Project Overview

**The brief.** The project centred on raw stock price data for **six companies across two sectors**, covering end-of-day prices, daily changes, and percentage changes over five days. The dashboard needed to support **end-of-week stock performance analysis** quickly and confidently.

**The core problem.** Dense financial data needs to be instantly scannable. Users should spot the biggest movers, compare sectors, and drill into company trends without losing context.

## My Role

I owned the design from **data analysis and information architecture** through to high-fidelity UI and prototyping. That included structuring the raw data, selecting chart types, setting the visual hierarchy, and delivering responsive layouts for **desktop and iPad**.

## Design Process

**Understanding the data.** I cleaned and restructured the datasets, consolidating percentage changes, EoD prices, and daily differences into a format that could support multiple chart types.

**Information architecture.** I structured the dashboard around three views: **overview**, **sector**, and **company**. Global filters for company, sector, and date range sit at the top so users can slice data without losing their place.

**Visual exploration.** I tested line charts, horizontal bar charts, heatmaps, sector comparisons, and interactive tables, referencing D3.js patterns for the Angular build. The final dashboard uses **summary tiles, multi-series line charts, stacked bars, a colour-coded heatmap**, and per-company sparklines.

**Responsive design.** The tablet layout keeps the same modules and reading order, reflowed into a narrower grid.

![Stock dashboard: detailed chart modules, heatmap, and sector views](../../assets/earlier/stock-dashboard/stock-dashboard-02.webp)
