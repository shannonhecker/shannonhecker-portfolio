# Implementation cross-check

12 October 2026. Read-only checks of the repositories behind Shannon’s public
rebuilds. These are not private production systems. Repository HEAD is evidence
of source behaviour, not proof of the revision deployed on each public domain.
No product repository was changed and no production data was accessed.

## Source revisions

| Product | Repository | Revision | Temporary checkout |
|---|---|---|---|
| FX public rebuild | shannonhecker/fx-execution-analytics | `ce8de50efb936fdf358a812ffdc0e378432ac28d` | `/private/tmp/fx-source-audit` |
| Fusion public rebuild | shannonhecker/jpm-analytics-dashboard | `86a0e11a2f074fde90486f694d9e9d17e80352e3` | `/private/tmp/fusion-source-audit` |
| uoaui.ai | shannonhecker/desinghub | `5f603e731556c0ec9908a4222c6399a6af765e5f` | `/private/tmp/uoaui-source-audit` |
| Winking iOS | shannonhecker/weekly-superstar-ios | `8388f4d47ea5a027d921e586eccd064d83ac203c` | `/private/tmp/weekly-superstar-ios-portfolio` |

uoaui and Winking findings are detailed in DECISION-AUDIT.md. The most consequential
corrections are component fallbacks, direct export without mandatory review, and
an optional Sample Family route rather than automatic first-open sample seeding.

## FX: material gaps between the specification and public rebuild

**Limit dragging does not open a confirmation ticket.** In
`src/components/ExecutionPanel.jsx:656`, the reprice branch changes the local
limit, appends the amendment point, redraws and shows a demo toast immediately.
The separate BID-pill drag at `:646` calls the order-ticket callback. These must
not be described as the same implemented interaction.

**The order ticket is a demonstration, not a recorded order or audit trail.**
`src/components/OrderTicket.jsx:37` emits a demo submission string.
`src/App.jsx:784` handles submission by closing the ticket and setting a toast.
That is not evidence of persistence, a broker submission or an audit backend.

**The source does not implement a study-source picker.** Searches of the complete
`src` tree for study controls and standard indicator terms found no such feature.
The inspection of ExecutionPanel and its menu paths did not reveal one. The
historical code-exploration/vendor finding can remain as the reason for a design
reversal; do not say the current rebuild demonstrates that picker or restriction.

**What is supported:** dual-axis rendering and limit amendments in ExecutionPanel;
venue highlighting at `AnalyticsPanel.jsx:56`, `:81` and `:215`; comparison modal at
`App.jsx:753`; demo ticket callbacks; table CSV copied to the clipboard at
`ExecutionPanel.jsx:1289`. “Copy CSV” is more exact than a file-download claim.
README.md and `App.jsx:792` explicitly identify seeded synthetic data and a
simulated feed. These behaviours do not establish Barclays production behaviour.

Applied narrowly to `CaseFx.astro`: original confirmation/audit flow now clearly
labelled as specified; current local drag and demo ticket differences stated near
the screenshots and flow; edge-state caption distinguishes unimplemented features;
study reversal no longer claims a current picker. Original diagrams remain intact.

Remaining cross-page check: persona, journey and decision wording must preserve
this same specification-versus-rebuild distinction, especially “confirmation”,
“audit trail”, “studies run” and “cannot reprice by accident”. The latter is an
absolute safety claim and should not be used even for the intended interaction.

## Fusion: historical architecture is not the rebuild’s backend

**No evidence of FactSet connectivity or entitlement enforcement in this rebuild.**
`server/index.js:1` imports demo datasets from `src/data.js`; its public Hono routes
return those datasets directly. No authentication/role middleware is present there.
Searching `src` and `server` found no FactSet or entitlement implementation.
`src/data.js:7` defines the risk rows locally. Performance can combine market
snapshots with fallback/example data (`src/data/performance.js:18`, `:79` and
`src/data/snapshot.bench.js:1`). It is not a direct FactSet-backed production feed.

This does not invalidate the original Fusion project’s partner-engine and
entitlement decisions. It means the case must explicitly attribute those claims
to the original project, not invite readers to infer they can verify them in the
public rebuild. `CaseFusion.astro:59`, `:73`, `:113` and `:126` sit beside rebuild
imagery and therefore need a clear distinction nearby.

**Import/export is not established by the visible controls alone.**
`PanelToolbar.jsx:77` only renders an export control if supplied a callback;
source searches found no substantive CSV/Excel export callback or FactSet import
path in the current components. The presence of a download icon is not a verified
export workflow. Keep import/export through FactSet as original project context,
not a demonstrated rebuild capability, until a runtime or source path proves it.

**What is supported:** performance, risk, screening and entity-comparison pages;
context filters; configurable panel content and columns; density settings; demo
market snapshots and analytics datasets. `ConfigDrawer.jsx:1237` includes reset
and close/apply controls; panel configuration is real source behaviour. None of
this proves the original product’s external-client rollout, accessibility review
result or pattern adoption. Those remain historical case claims with their own
source record.

## Completion boundary

This review identifies high-impact truth mismatches, not a full functional test of
these products. The portfolio build/browser checks and deployed-source alignment
remain separate tasks. Verify the final screenshots and explanatory labels beside
them, not just whether these repository paths exist.

## Final reconciliation, 12 October

The final independent read found remaining wording discrepancies in FX benchmarks/studies, Fusion client signings and Deal import blocking. These are corrected in current `authored-content.json`, `decision-evidence.json` and `CaseFusion.astro`; corresponding editable Figma text is synchronized. See `DECISION-AUDIT.md` and `figma-decision-art-corrections.json` for source references and replacement artwork. Original design concepts remain explicitly separate from public rebuild functionality and measured outcomes.
