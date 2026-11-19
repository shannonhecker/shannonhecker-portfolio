---
title: "Fusion Design System"
summary: "A shared design system for teams building data products on J.P. Morgan Fusion."
contribution: "I built the Figma pattern library on Salt and owned the accessibility standards. I used Figma variants and shared tokens so a change to a control could reach the screens that used it. I reviewed those patterns with development and an accessibility specialist."
role: "Product Designer"
dates: "2022 to 2024"
order: 3
legacy: "project-design-system.html"
details:
  - label: "Project"
    value: "Fusion Design System"
  - label: "Project type"
    value: "Design System & Component Library"
outcomes:
  - value: "16+"
    label: "Named components shipped"
  - value: "AA"
    label: "WCAG 2.1 audit pass"
  - value: "100%"
    label: "Components meeting AA contrast"
  - value: "0"
    label: "Blocker accessibility issues at release"
tags:
  - "Design System"
  - "Figma"
  - "Salt Design System"
  - "Design Tokens"
  - "Component Library"
  - "Accessibility (ADA/WCAG)"
  - "Enterprise UX"
  - "Cross-team Collaboration"
cover: ../../assets/earlier/design-system/fusion-ds-banner.webp
processFigure:
  image: ../../assets/earlier/design-system/fusion-d02.webp
  alt: "Fusion platform: unified data experience, data catalog, and portfolio management"
coverAlt: "Fusion Design System: data catalog, ESG datasets, and cloud-native data platform"
matte:
  - "fusion-ds-banner"
  - "fusion-d02"
---
### Project overview

**The problem.** Product teams were rebuilding the same components, creating visual drift, duplicated effort, and slower delivery. There was no shared source of truth for design or code.

**The goal.** Build a **scalable design system** for enterprise products, from analytics dashboards to data management tools. It had to support data-dense interfaces without becoming a bottleneck.

### My role

As **Product Designer** on the core design team, I owned visual identity, component architecture, and accessibility standards. I built the Figma pattern library on the Salt Design System foundation, translating complex data requirements into reusable interaction patterns.

### Design process

**Requirements.** I worked with the product owner, UX, development, and an ADA specialist to define the system goals and review patterns against real product needs.

**Component architecture.** I built the system with **design tokens, auto layout, and variants** in Figma. The library covered headers, navigation, data grids, progress tracking, drawers, forms, date selectors, tabs, cards, and data visualisation patterns.

**Accessibility.** Components were validated against **WCAG 2.1 AA** using Colour Contrast Analyser and axe DevTools.

**Developer handoff.** I partnered with developers through the build, delivering dev-ready specs and documentation.

### Design decisions

I built Fusion as an extension of Salt. Its tokens, components and accessibility tooling were already in use at J.P. Morgan. That gave us a common starting point and left room to design patterns specific to data management and analytics.

A data grid showed why we needed two levels of component. Teams could use a simple control on its own, or take a complete pattern when they needed a familiar combination of controls. I gave the two levels separate naming conventions so people could find the right starting point in Figma.

Figma held the visual and interaction specifications. The code repository described how a component actually behaved. Each component page brought those references together so a designer and an engineer could review the same change.

### Accessibility in practice

I checked text and interface contrast with Colour Contrast Analyser and used axe DevTools to review the page structure. Keyboard checks covered tab order, visible focus and a way back from each action. Closing a dialog, for example, had to return focus to the control that opened it.

For components with changing state, I reviewed the announcements in VoiceOver and NVDA. Sorting a data grid needed to announce the column, the new sort order and the number of results. I kept the checks with each component so teams could refer to them during implementation.
