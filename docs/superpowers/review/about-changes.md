# About: what changed from the old pages

The old About is in two places: `about.html` (My approach, Experience, Expertise) and the About section of the old home page (portrait, opening, three figures, links, Now, Outside work, and the Let's Talk close). Both are on `/about` now. Every line a visitor read there is on the new page word for word, except the places below. A test (`tests/about.spec.ts`, "carries every line of the old About") checks each line against the built page, and `node scripts/import-legacy.mjs about` prints the old sections for comparison.

There was no em or en dash anywhere in the old About, so nothing was replaced for that rule.

## 1. Job titles and dates (your facts)

| Where | Before (old site) | After (now) |
|---|---|---|
| Barclays, dates | 2025 to present | Sep 2025 to present |
| J.P. Morgan, role line | User Experience Designer to Digital Product Designer VP | Two role lines, newest first: Digital Product Designer VP, Feb 2023 to Sep 2025; User Experience Designer, Aug 2016 to Jan 2023 |
| J.P. Morgan, dates | 2016 to 2025 | Aug 2016 to Sep 2025 (the whole span, beside the dot) |
| Page description (search result) | Design engineer in London. Fifteen years in design, 10+ in fintech. ... | Product designer in London. Fifteen years in design, 10+ in fintech. ... (rest unchanged) |
| Page title | About me · Shannon Hecker · Design engineer | About me · Shannon Hecker |

Left as they were, because they already agree with your facts: "Lead Product Designer" (Barclays), the J.P. Morgan sentence "User Experience Designer from 2016, then Digital Product Designer VP on Fusion from 2023", and "Digital Product Designer VP" in the figures and the opening.

Not added: the internship (June to September 2016). The old page never mentioned it, so there was no place where the page stated it. Tell me if you want it as a line under J.P. Morgan.

## 2. The opening line

The old home About opened: "Design engineer at **Barclays**, running the design system across FX and MarketsOne: tokens, components, and accessibility. Before that, nine years at **J.P. Morgan**, ending as Digital Product Designer VP on Fusion. Building **uoaui.ai** on the side, in private alpha."

Now the page opens with the home hero's intro paragraph, set large: "Hi, I'm Shannon Hecker, a product designer in London. I lead design for FX and MarketsOne at Barclays. Before that, I was Digital Product Designer VP at J.P. Morgan. I build what I design."

The old paragraph follows it with only its title phrase removed: "At **Barclays**, running the design system across FX and MarketsOne: tokens, components, and accessibility. Before that, nine years at **J.P. Morgan**, ending as Digital Product Designer VP on Fusion. Building **uoaui.ai** on the side, in private alpha." ("Design engineer at" became "At".)

The two paragraphs say some of the same things ("Before that" twice, Digital Product Designer VP twice). I kept both because nothing may be dropped. If you want one trimmed, say which.

Typography only, no change of words: the apostrophe in "I'm" is curly like the rest of the page, and "J.P. Morgan" in the opening and in the second figure holds together on one line.

## 3. Added, for you to confirm

**Education.** The old page had no education section (its stylesheet marks one as removed). The brief lists education and gives the facts, so the page shows exactly these two lines and nothing more:

- London Metropolitan University, MA Digital Media, 2015 to 2016
- Ling Tung, 2008 to 2010

"Ling Tung" is as you gave it: I did not add "University" or a programme. To remove the section, delete the `education` array and the `about-education` section in `src/pages/about.astro`.

## 4. Not carried, and why

- **The Ask Shannon chat** and its text on the old home Contact section: "Ask Shannon a question", the placeholder "Ask about my work, career, or current projects.", the speech and send buttons, the line "I'm Shannon's AI. I can be wrong, and Shannon may review chats to improve this portfolio. Don't share confidential info.", and the suggestion chips. The chat is built separately, on Home only. The old About page itself (`about.html`) had no chat. The heading "Let's Talk." and the "Email me directly" link are kept as the close.
- **The old JSON-LD** is not copied. The site's `Person` block stays, and the page adds a plain `AboutPage` block that names only you and the page.
- **Old site chrome**: the nav labels (Intro, Resume, Let's Talk), the footer line "©2026 Shannon Hecker • Design engineer" and the "Skip to content" link. The new site has its own nav and footer; the Résumé link is in the opening as it was on the old home About.
- **Styling only**: the expertise "chips" (they had a hover fill) are a ruled list; the animated wave background is not used.

## 5. For you to confirm (personal details, carried over as written)

These are public on the old site today. You removed two family entries from another part of the site, so please say which of these should stay.

1. "Married with two kids, plus one fluffy cat called Quorra." (Outside work)
2. "Based in St Albans, a 40-minute ride from King's Cross." (Outside work, home location)
3. "Taiwan-born. English and Mandarin." (Outside work)
4. "Soya latte, extra shot. Strong leaf tea on design days." (Outside work)
5. The portrait itself, with the old alt text "Shannon Hecker in a gallery".
6. Your personal Gmail address, behind the "Email" and "Email me directly" links (it is in the link, not shown as text).

## 6. Claims carried over that I could not check

Left as written because they are your words, but worth a look now that they sit on a hiring page:

- "15 yrs, In design, from brand to enterprise fintech": your earliest role is 2008, which is 18 years. The old page also said "Fifteen years in design" in its description.
- "AA WCAG, Across every product shipped": a strong, unmeasured claim.
- "Ten years designing for engineering, quant, and ops audiences" (My approach) next to "15 yrs" and the J.P. Morgan dates.
- "Sole designer on FX" (Barclays) next to the opening's "I lead design for FX and MarketsOne".
- "Now · this month" (Shipping, Reading, Writing, Experimenting) is dated to the old site's last edit.

## 7. Small things

- The old home line "Designing what traders and analysts use every day." is the small line at the foot of the page title. The old About page's headline, "I design what traders and analysts use every day. Trading floors. AI tools.", is the large statement under "My approach." Both are kept; they say nearly the same thing.
- "Writing." in Now links to `/writing/the-design-system-is-the-contract` (it was `writing-the-design-system-is-the-contract.html`).
- The "Let's Talk." heading keeps its capital T, as on the old site, though the rest of the site uses sentence case.

## Owner decision (16 Nov 2026)

Home location: "Based in St Albans, a 40-minute ride from King's Cross." became "Based just outside London, a 40-minute ride from King's Cross." Family details and the cat stay. The same change was made in the chat.

Figure: "AA WCAG, Across every product shipped" became "AA WCAG, The standard I design to", to match the chat.
