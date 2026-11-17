# Product-specific journey review

11 October 2026. Implementation draft, awaiting rendered and production review.

## Evidence and method

Shannon asked for five genuinely different journeys rather than five copies of an
emotion curve. The primary source remains the authored case content in
`src/data/authored-content.json`, original Figma artwork and the product source.
Public research guides the choice of mapping method; it does not prove what a
participant said, what shipped or what the product enforces.

- [NN/g, UX mapping methods study guide](https://www.nngroup.com/articles/ux-mapping-methods-study-guide/)
  distinguishes scenario exploration from mapping service components. This supports
  changing the representation to match the design question.
- [NN/g, service blueprints](https://www.nngroup.com/articles/service-blueprints-definition/)
  explains the relationship between touchpoints and supporting operations. This
  informs Deal Model's aligned action/system rows.
- [Microsoft HAX, efficient correction](https://www.microsoft.com/en-us/haxtoolkit/guideline/support-efficient-correction/)
  informs the emphasis on correction in uoaui.ai. It is design guidance, not evidence
  that the app enforces an approval gate.

## Layout decisions

| Case | Question made visible | Structure | Grounding |
|---|---|---|---|
| FX | When does a trader leave monitoring to act? | Preparation, bounded live monitoring/intervention loop, post-trade review | Existing five authored stages and original decision loop |
| Fusion | How does a useful analytical view become a presentation? | Data entry, two-way filter/analysis workspace, presentation and reuse | Existing cube, configuration and widget narrative |
| uoaui.ai | Who makes the decision when a generated draft misses? | Alternating designer/model exchanges; correction returns | Existing prompt, generation, comparison, tuning and React export stages |
| Winking Star | How does a routine pass between family members over time? | Parent setup, daily parent/child loop, weekly return, caregiver handoff | Original iPhone Sample Family scenario; not asserted as current web onboarding |
| Deal Model | What connects the owner's actions to the shared deal record? | Frontstage/system blueprint with pricing feedback | Existing five stages; original owner/approver, pricing, tiering and iteration views inspected |

Shared font hierarchy, neutral surfaces and restrained project accents maintain
site consistency. The distinctions are in grouping, flow and actor relationships,
not recolouring. Rules sit above stages. No decorative vertical bars or accordions.
Mobile reflows the readable narrative; original detailed artwork can scroll.

## Factual safeguards

- Stage descriptions, recommendations and system descriptions are sourced from
  existing authored JSON, except the source correction below. Original quotes and
  takeaways remain intact as authored exploration.
- Deal approval correction: original Figma file `MhZ5D5sh8DZgOTYdLXX8It`, Approver
  view `1:34619`, shows “Approve THIS DEAL”, approval with comments, proposal
  comparison and a comment thread. The owner creates the description and publishes
  it with the deal. The readable journey therefore replaces the previous automatic
  sign-off summary claim with owner-authored description and approval discussion.
  Root must also resolve the older claim elsewhere in the case/JSON; original SVG
  itself is retained unchanged as requested.
- Original SVG files are not edited or redrawn. They remain visible below the
  readable product-specific presentation, labelled as original qualitative design
  exploration. The curves are not presented as measured emotion scores.
- Quotation marks in the original scenario are retained as authored; the heading
  explicitly calls them scenario thoughts. No participant count or observed score
  is inferred from them.
- FX remains beta. The journey represents the authored workflow, not evidence of
  production adoption or actual bank screens.
- AI compare/tune steps are the intended designer workflow, not mandatory system
  gates. Export is not shipment. No adoption or time-saving claim is added.
- Winking's journey describes the original iPhone experience. The current web
  flow has different setup and consent requirements, covered by the product-page
  comparison. Original return-loop timing is not promoted to a measured result.
- Deal tolerance correction is supported by the authored approach and field
  validation narrative. Approval-return routing is not newly invented.
- Fusion's phase-two external reuse is retained as authored, not extrapolated
  from the present public rebuild.

## Outstanding validation

Root agent to propagate the Deal source correction across the case,
verify Winking narrative against current iOS source, and inspect all five journeys
at desktop/tablet/mobile before release. New representations do not certify that
original authored claims were externally validated. Source contradictions should
be resolved with evidence and recorded separately, not silently converted into
new product behaviour.
