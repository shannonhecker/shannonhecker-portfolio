# Figma user flows · 12 October 2026

The five user flows are authored as editable Inter text, auto-layout nodes and vector connectors in the existing portfolio Figma file. They are exported directly to `public/art/user-flows/`, with the same licensed embedded Inter font as the decision maps. The title and context stay above a separately exported artwork frame, so they remain readable while the diagram is panned on phones. Source frame IDs are in `src/data/figma-user-flows.json`; content, actor labels and connector geometry are in `src/data/user-flow-content.json`.

Figma source: https://www.figma.com/design/l6noy7onfsRiuBgjqSsKbt?node-id=445-9348

## Research and design direction

Reviewed Figma's user-flow examples (https://www.figma.com/resource-library/user-flow/) and Nielsen Norman Group's wireflow guidance (https://www.nngroup.com/articles/wireflows/). Applied clear starting points, action-labelled branches, explicit system feedback, recovery and return paths, and actor handoffs. These diagrams summarise the current case narratives; they are not copied third-party diagrams or invented production screens.

The main path runs top to bottom. Alternate states sit alongside it. Solid arrows progress through a task; dashed arrows return to an earlier state. Labels and role text explain meaning independently of colour. Native auto-layout keeps the text inside its node. The two explicit theme variants avoid dark labels disappearing against transparent backgrounds.

## Content boundaries

- FX: original specified monitoring-to-action flow, beta. The diagram and surrounding text explicitly distinguish this from the simulated public rebuild, which does not execute orders or write an audit trail.
- Fusion: analyst selects a cube, filters, analyses, refines, presents, then shares/reuses the view. Based on the existing case workflow and journey.
- uoaui.ai: model drafts, designer decides. Compare/tune are optional; direct export remains a first-class branch. Export is handover, not a completed product.
- Winking Star: optional iPhone Sample Family, family setup, daily routine, local offline feedback and later sync, weekly pet and caregiver invitation. No invented parent names or mandatory sample step.
- Deal Model: direct data/template entry, rate warning and iteration retry, comparison, owner-authored proposal and approver sign-off. Smart pricing is not presented as built.

Original workflow copy remains available below each graphic. The Winking caregiver summary links to the same full flow. Existing journeys and decision maps are preserved.

## Validation

Browser tests cover light/dark switching, full proportions, readable mobile size, keyboard panning, no page overflow, text alternatives, exported text bounds, branch labels clear of nodes, and connector endpoints on their source/target boundaries. Runs include Chromium and iPhone-configured WebKit. Figma composition screenshots are reviewed before export.
