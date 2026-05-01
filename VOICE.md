# Voice

How copy on this site should sound. Reference for any future edit — by me, by an AI, by anyone.

The voice is **warm and concrete**. Short. Specific. Mildly dry. Verb-forward. Reads like I'm talking, not writing.

---

## House style — do

- **Lead with verbs.** "Shipping…", "Designing…", "Founding…", "Reading…", "Writing…", "Running…", "Built…". Not "I'm a designer who…".
- **Be specific.** "St Albans, 40 minutes from King's Cross" beats "near London". "Nine years VP at J.P. Morgan" beats "extensive senior experience". "FX and MarketsOne" beats "trading platforms".
- **Concrete numbers, low-key tone.** "Fifteen years", "thirteen projects", "two kids, one fluffy cat". Never "extensive", never "passionate".
- **Short, then one longer.** Tight. Tight. Then a fuller line that lands the point.
- **Plain trade vocabulary.** "Trading floors", "design system", "tokens", "WCAG AA" — used as nouns. Not bragged about.
- **Self-aware dryness.** "Soya latte, extra shot." "Married with two kids, plus one fluffy cat called Quorra." "I'm Shannon's AI. I'll do my best."
- **British English.** "centre", "tokenised", "visualisation", "colour", "optimise".
- **Words for small numbers** (one through nine). Digits at 10+.
- **Sentence case + period for headings.** "Featured work.", "About me.", "Career experience.", "Let's talk.", "Writing."
- **One canonical title.** "Design engineer at Barclays. Founding ausōs.ai on the side." That's the lead. Variants for context only.

## House style — don't

### AI-cliché block list (zero tolerance)

- leveraging, leverage
- passionate about, love crafting
- at the intersection of
- innovative, cutting-edge, world-class
- rich tapestry, deep dive, unlock, unleash
- in today's fast-paced, in a world where
- seamless, delightful, transformative
- "I'm a designer who…" (lead with the verb instead)
- "Set design vision", "raised the craft bar", "shipping high-craft experiences for expert users at scale" (corporate-deck filler)

### Voice rules

- **No double-stack of insider mystique.** "Most never see" is used **once** on the site (hero only). Never again.
- **Drop "shaping" and "spearheaded"** in About body copy. Replace with "leading", "running", "ran", "set up", "built", "shipping". One "spearheaded" max in formal CV timeline if essential.
- **No corporate filler bullets.** Every job description should be plain sentences with specific products and outcomes.
- **No "AI-native" outside ausōs.ai.** Barclays/about copy uses "AI-assisted", "AI integrated where it adds value", "AI-enhanced" — measured, not marketed.

---

## Brand spelling

- **`ausōs.ai`** with macron in display copy, headlines, prose.
- **`ausos.ai`** plain ASCII in URLs, `<title>`, `<meta>`, `mailto:`, `alt`, anywhere copyable or indexed.

## AI stance — two lanes

- **ausōs.ai strip:** Founder-confident, AI-forward. "AI-native visual web builder", "private alpha", concrete stage detail.
- **Barclays / About / career:** AI integrated where it adds value. "AI-assisted design system", "AI tooling that helps the team ship faster". Measured tone.

Don't cross the lanes. A recruiter at a regulated bank will read "AI-native" on every page as a red flag; a founder reading "where it genuinely adds value" on the ausōs.ai strip will read it as lukewarm.

---

## Voice zones (per surface)

| Surface | Voice |
|---------|-------|
| Hero | Warm-concrete + one insider line. Three lines max. **Hero is propose-only — see below.** |
| ausōs.ai strip | Founder-confident, AI-forward, factual stage detail. |
| Featured work cards | Plain trade vocab. Scope and outcome in one breath. ~25 words each. |
| About hero line | Warm-concrete. No "seam between" / philosophical lines. |
| About body | First-person, conversational. What I do, not what I believe. |
| Now list | Already in voice. Audit only — light edit if any. |
| Outside Work | Sacred. Preserve verbatim. |
| Career timeline (about.html) | CV register — slightly more formal — but verb-led, no buzzwords. Scope, outcome, named products. |
| Writing intro | Editorial allowed (essays earn it). Still in voice. No second insider refrain. |
| Project case studies | Match featured-work voice. Expanded with Problem / Approach / Outcome structure. |
| Meta titles + descriptions | SEO-tight. Recruiter-keyword-aware. ASCII brand name. |
| Footer | One line. Sentence case. |
| Ask Shannon (UI + bot) | Closest to spoken. Brief, helpful, dry. Never gushing. |

---

## Sacred (do not edit)

- Essay titles: "The design system is the contract.", "Trust surfaces in AI for expert users."
- Project names: Fusion Design System, Execute Algo Center, Barclays Data Visualisation, D&PS Brand Identity, plus the other nine.
- ausōs.ai brand line: "A visual web builder for designers who think in systems."
- Personal details: St Albans, Taiwan-born, English and Mandarin, Quorra the cat, soya latte / strong leaf tea.

## Hero — propose-only

The homepage hero has been reverted twice in past iterations. Treat as high-risk surface. Any future change:

1. Draft 2–3 variants on a separate `content/hero-options` branch.
2. Push for review. Do **not** merge silently.
3. Merge only on explicit "ship this one".

---

## Verification (run before merging any copy PR)

1. **Read aloud.** If a sentence sounds like a press release or LinkedIn bio, rewrite.
2. **Recruiter 30s scan (homepage only).** Open `index.html`, 30 seconds, read what the eye lands on. At the end: title, current company, years, current side project — all four visible? If not, tighten.
3. **AI-cliché audit.** Grep edited files for the block list above. Zero hits required.
4. **British English check.** `grep -nE '\b(center|tokenized|visualization|customize|optimize|color)\b'` against edited HTML. Zero hits in body copy.
5. **Brand spelling.** Grep `ausos\.ai` in display HTML (should be `ausōs.ai`). Grep `ausōs\.ai` in `<meta>`, `href`, `mailto:` (should be `ausos.ai`).
6. **Voice spot-check.** Pick three random sentences from three different pages. Same person?
7. **Live preview.** Vercel/GitHub preview URL. Visual review before merge.

---

Last updated: 2026-05-01.
