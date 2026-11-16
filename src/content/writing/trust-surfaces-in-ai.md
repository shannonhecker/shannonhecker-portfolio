---
title: "Trust surfaces in AI for expert users"
description: "What the banks taught me about designing AI that professionals will actually use. Confidence, citations, failure states, reversal, and the absence surface."
published: 2026-04-18
legacy: "writing-trust-surfaces-in-ai.html"
dek: "What the banks taught me about designing AI that professionals will actually use. Confidence, citations, failure states, reversal, and the absence surface."
blurb: "What banks taught me about AI professionals will actually use: confidence, citations, failure states, reversal, and the absence surface."
keywords:
  - "AI design"
  - "trust"
  - "expert users"
  - "fintech"
  - "enterprise UX"
  - "design leadership"
---
Every bank I have worked at has tried to roll out AI. Some shipped it. Most quietly turned it off within six weeks.

The difference, in every case I have seen, was not the model. The models are fine. The difference was **trust**.

A trader does not need the AI to be right 95% of the time. A trader needs to know, at a glance, *which 5% it is wrong about, and why*. That "at a glance, and why" is design. It is not a research problem or an infrastructure problem. It is a surface problem.

I call the things we build for this purpose **trust surfaces**. They are the small interface elements through which a human expert negotiates with an AI system: confidence indicators, source citations, failure states, reversal controls. When they are designed well, the feature ships. When they are missing, or generic, or lifted from a consumer product, the feature gets turned off by the desk head on a Tuesday afternoon.

This is an essay about how to build them, from someone who has shipped AI into environments where being wrong costs real money.

## The honest confidence signal

The most common trust-surface mistake I see is showing a probability without showing what it is a probability of.

"87% confident" does not mean anything to a trader. 87% confident that the price will rise? That a buyback is happening? That the model is returning a valid number at all? Each of these is a different question, and the answer shapes what the trader does with the information.

The discipline: never display a confidence figure without the proposition it measures, and never display the proposition without an anchor to its counterfactual.

<dl class="essay-terms">
<div><dt>Weak</dt><dd>

"87% confident this trade is aligned with the mandate."

</dd></div>
<div><dt>Strong</dt><dd>

"87% confident this trade is aligned. 13% misaligned across six policy clauses. Top risk: clause 3.2 (concentration cap)."

</dd></div>
</dl>

The counterfactual is the thing that lets the expert do their own judgement call, which is the thing they are being paid to do.

## Source attribution as primary, not footnote

Consumer AI products tend to treat source citations as polish. A little \[1\] at the end. You can click it if you want. Most people do not.

For expert users, the citation is the primary information. The prose is secondary. A portfolio manager reading an AI summary of an earnings call does not trust the summary until they can see which sentences came from the CFO, which from the CEO, which are the model’s own synthesis. The design move is to make sources *inline and colour-coded*, not tucked in a footer.

This changes the information hierarchy of the entire surface. The summary becomes a scaffolding for citations, not a substitute for them. The expert’s eye moves through it one claim at a time.

## Failure states that do not lie

When an AI system has low confidence, or missing data, or is rate-limited, or is returning the hallucinated median instead of a real answer, consumer apps tend to paper over it. They say "Generating…" and then produce something. They say "Based on recent data" when the data is three weeks stale. They serve a polite fiction.

An expert-user product cannot do this. The fictional answer will be acted on, and the consequences will be real.

Three failure states I always build:

<dl class="essay-terms">
<div><dt>Unknown</dt><dd>

The system does not have enough context to answer. Surface reads: "I do not have the data to answer this. Here is what I would need."

</dd></div>
<div><dt>Stale</dt><dd>

The system has an answer but from older data than the user probably assumes. Surface reads: "My last data point is 2026-04-03. Would you like me to try a refresh?"

</dd></div>
<div><dt>Low confidence</dt><dd>

The system has an answer but would not bet on it. Surface reads: "My best guess is X, but I am below my usual threshold. Here is what is weak about it."

</dd></div>
</dl>

Each of these is a design decision, not a model decision. The model always has this information in some form. The question is whether the interface lets it through, or hides it.

## Reversal is a first-class action

An AI system that cannot be undone is an AI system that cannot be trusted. Everyone agrees with this at the whiteboard and then ships without it.

A trust-surface pattern I lean on: every AI-generated artifact that can be acted on should have a one-click revert to pre-AI state, visible in the same screen where the artifact lives. Not buried in a menu. Not gated behind a confirmation modal. Present, permanent, honest.

This is as much a psychological surface as a functional one. The presence of the revert is what lets the expert engage with the AI output without feeling watched, rushed, or committed. They know they can walk out. So they lean in.

## The quiet one: explain the absence

The trust surfaces that work hardest are the ones that explain what the AI is *not* doing.

> "I am not using your private portfolio data to answer this. This is a general-knowledge answer, not a company-specific one. I cannot see trades older than 30 days."

In consumer AI, these are disclosures, bolted on for legal. In expert-user AI, they are reassurances, and they change behaviour. They tell the domain professional exactly where the seams are, so they can form a mental model of the AI’s reach and stop treating it as a magic box.

The expert who knows the edges of the system will use it six times more often than the expert who does not. Every expert-user AI product I have shipped has confirmed this.

## Where this goes next

AI products for experts are not the same category as AI products for consumers. The shape of the trust surface is the single biggest difference. Consumer AI hides the seams. Expert AI exposes them.

If you are designing for this category now, the question to keep asking is: *what is the most honest version of this interaction?* It will almost always be more granular, more confession-heavy, and less confident-sounding than the consumer AI playbook. That is the feature, not the bug. The expert reads it as integrity.

And the feature that was going to get turned off on a Tuesday afternoon stays on.
