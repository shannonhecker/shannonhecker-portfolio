# Build log

How this site was made, kept honest. Shannon writes the entries marked **Shannon**. Claude Code's entries say what the model did. Nothing here is a claim about design authorship: every design decision on the page is Shannon's.

This is a chronological development history. Earlier entries describe the version at that point, including decisions I later changed. Later corrections take precedence over earlier dates, feature descriptions and measurements. Test counts and performance scores belong to the recorded version, not automatically to the current site.

## Process

- **Prototype:** `prototype/site-v4/index.html`, signed off by Shannon for content, order, tone, tokens and motion. It is kept in the repo so every production file can be diffed against it.
- **Brief:** `prototype/BRIEF.md`.
- **Tooling:** Claude Code in a cloud session, one branch and one PR per feature.

## Log

### PR 1 · Production scaffold

**What Claude Code did**

- Chose Astro 7 static output over Next.js. A one-page site needs no framework runtime, so the first paint is just HTML and CSS.
- Converted the prototype markup into Astro components with a script instead of retyping it, so the copy is byte-for-byte the signed-off copy.
- Copied the prototype CSS unchanged into `src/styles/prototype.css`. Production-only overrides live in `production.css`, and each one says why it's there.
- Moved word-splitting for heading reveals from runtime `innerHTML` to build time.
- Ported the motion to GSAP + ScrollTrigger from npm, and added Lenis on desktop pointer devices only.
- Added an image pipeline: AVIF and WebP with a JPEG fallback, width-based srcsets, and explicit dimensions.
- Made the page work with no JavaScript: the phone strip scrolls natively, and hidden reveal states only apply once motion is confirmed.
- Kept the prototype's clean axe result (zero violations, the same as v4). Added a few things on top: roles on the labelled scroll regions, a screen-reader warning on links that open a new tab, and keyboard focus now pauses the theme marquee.
- Added the `/revolut` route, Open Graph tags, a favicon, `robots.txt`, a sitemap, Playwright tests and CI.

### PR 2 · Mobile nav, brand mark, award-level quality pass

**What Claude Code did**

- Made the mobile nav show where it overflows, and kept the active link in view. At 390px, three of the six sections had been hidden.
- Brought in Shannon's SH mark from shannonhecker.com for the nav, the footer and the favicon set.
- Wrote the award criteria down as checks in `docs/QUALITY.md` and scored the site honestly against them.
- Added a real pause control for the marquees (WCAG 2.2.2), print and PDF output, a 404 page, security headers and structured data.
- Measured a regression and reversed it. Applying `text-wrap: pretty` site-wide cost about a second of first paint on mobile, so it now applies to lead text only.

### PR 3 · Game engine (placeholder art)

**What Claude Code did**

- Rejected Phaser on the research numbers: about 369 KB gzipped against a 400 KB budget. Wrote a canvas engine instead, and the whole game chunk is 3.5 KB gzipped.
- Took the movement tuning from published references: SMB1 frame data and Celeste's open-source player code. The jump is defined by its height and time-to-apex. Coyote time, jump buffering, corner correction and apex hang are all in.
- Wrote a scripted bot that plays the level to the end in CI, so a level edit can never make the game unfinishable. Its first run found a speed-cap bug, which is now fixed.
- Made the game keyboard-only playable with no focus trap. It pauses on Escape, on blur, when the tab is hidden and when scrolled offscreen. It loads only when Play is pressed, and the page still works if that load fails.

### PR 4 · Calls Shannon delegated ("I trust your findings")

**What Claude Code decided and did**

- **Structure:** an index plus a page per case. The one-page site was 43 screens long; the new home is 7.2.
- **Art direction:** cropped the case slides to their UI. The originals are kept, and a script makes the crops.
- **Panel URL:** `/revolut` is now `/panel`, so no URL names another company while Shannon works at Barclays.
- **Placeholders:** replaced with facts the page already states. Nothing is invented.
- **Game:** concept B, renamed **Working Order**. Platforms ride an FX rate line.

### PR 5 · Shannon's calls: home plus case pages, game concept A, pixel art

**What Shannon decided**

- Keep the home page plus one page per case.
- Use game concept A, three levels with one per case, so the game is part of the portfolio's story.
- Make it a 2D pixel-art platformer in the Super Mario style.

**What Claude Code did**

- Looked for a relevant skill or plugin and found SpriteCook, which generates sprites with AI. Offered it as optional. The art in the game is hand-authored as character grids, in line with the brief's "draw the sheet by hand".
- Kept the style Mario-era and the nouns Shannon's own: no pipes, no ? blocks, no mushrooms, no flagpole, no plumber.
- Rendered the game at a true 480×270, scaled up with nearest-neighbour, so every pixel stays crisp.
- Built three worlds:
  - The Desk: a night trading floor, candlestick platforms, falling spreadsheets and the FX rate line.
  - The Board Room: the site's own type, data-table rows and sliding "fixed templates".
  - Bedtime: cream hills, activity cards, the nag-loop cloud and an egg that hatches the week's pet.
- Tied the game to the story. After each level, a card shows that case with "Read the case". Each case page links to its level, and the link selects the level without starting it.
- Fixed problems the test bot found:
  - Checkpoints only triggered on touch, so a jump over one lost progress. They now trigger when you pass.
  - A spike sat right before a pit, which meant two demands back to back.
  - A staircase in Bedtime needed precise timing. The cards now overlap.
- Fixed the test server so tests always run against the current build. One earlier "pass" had been hitting a stale preview.

### PR 6 · The game moves into the hero

**What Shannon decided**

- Move the game into the landing-page hero, the way Google puts a playable Doodle on its home page, instead of a separate section at the end.

**What Claude Code did**

- Kept the headline as the main thing. The game takes the place of the hero image and stays idle until someone presses Play.
- Sized the game column at up to 480px, exactly 1× the pixel canvas, so the art stays crisp on retina screens. It stacks under the headline on phones, with the touch controls directly under the canvas.
- Removed the bottom `#play` section. "Play this case as a level" links now land on the hero.
- Measured the result: Lighthouse is 100 in all four categories on mobile and desktop. Mobile LCP is 1.3–1.5 s, because the pixel poster is 3–6 KB as AVIF where the photo was much larger.
- Removed a leftover scratch test from the repo.

### PR 7 · The game becomes Shannon's career

**What Shannon decided**

- Turn the game into her career journey.
- Supplied the facts the CV doesn't have:
  - She grew up in Kaohsiung, by the sea, in the city by the park, on a motorbike.
  - She worked as a web and visual designer at 捷元電腦 (B2C).
  - At J.P. Morgan she joined in June 2016 as an intern, then became Analyst, Senior Analyst and VP, in the UI/UX team. The work was mostly UI and visual at first, then UI and UX together.

**What Claude Code did**

- Read the facts from her CV (`assets/CV_ShannonH.pdf`): Ling Tung 2008–2010, the London Met MA 2015–2016, J.P. Morgan 2016–2025, Barclays 2025 to now, uoaui.ai 2026, and Winking Star 2026. Every card states only these facts.
- Built the world map with eight worlds:
  - **Kaohsiung:** you ride a scooter, which comes from her own detail.
  - **Ling Tung**, **捷元電腦** and **London**, the last one in the rain.
  - **The J.P. Morgan tower:** a vertical climb, one floor per title. The pickups change from colour swatches (UI) to flow arrows (UX) as you climb.
  - **Barclays**, with the FX rate line.
  - **Next: AI:** platforms are drafted until you get close.
  - **Winking Star**, as a bonus world.
- Gave the character a different outfit in each era.
- Made "Next: AI" describe her practice rather than a job search, because she currently works at Barclays and the site is public.
- Fixed the problems the level bots found:
  - The first tower layout needed jumps longer than the jump allows.
  - A low ceiling blocked the climb.
  - A Ling Tung platform ended right at a pit.
- Left the 捷元電腦 years off until Shannon confirmed them (2012, added in PR 8).

**What Shannon changed by hand**

- _To fill in._

**Decisions Shannon overruled**

- _To fill in._

### PR 8 · Shannon's own character

- Shannon sent two pixel-art references of herself. I redrew the 16×24 sprite by hand from them:
  - Long wavy dark-brown hair with a fringe, big eyes with a highlight, blush, and a pearl earring.
  - A cream turtleneck with a gold pendant, wide pink trousers and cream trainers.
- That outfit is her look today. Barclays, Next: AI and the Winking Star bonus world use it.
- Earlier worlds keep their era clothes: summer blue in Kaohsiung, student green at Ling Tung, cream and navy at 捷元電腦, a camel coat in London, navy at J.P. Morgan. Shades are derived from each era's two colours, so an era still names only a top and trousers.
- Left the laptop out of the sprite. Her reference shows tool-brand stickers, and the game uses no brand marks. At 16 px it would also hide the pendant.
- 捷元電腦 now shows 2012 on the map, the HUD and the end card.
- Regenerated the map poster so the no-JS and pre-play state shows the new character.
- Checked every pose in every world on a contact sheet. 57/57 Playwright tests pass.

### PR 9 · Era looks, small enemies and missions

- **Her look changes with each era** (`src/game/looks.ts`), matched to what was in style in that year:
  - Kaohsiung: a ponytail with a scrunchie, a PE tee and shorts, plus a half-helmet on the scooter.
  - Ling Tung (2008–10): side-swept bangs, a Breton top and skinny jeans.
  - 2012: ombré tips, a mint top with a Peter Pan collar and coral skinnies.
  - London (2015–16): a lob, a camel coat over a black tee and white trainers.
  - J.P. Morgan: a sleek centre part, a navy blazer and a pale-blue shirt.
  - Today: her reference look. In Next: AI she also carries the laptop from her reference, with a plain lid and no brand stickers.
  - Bedtime: a claw-clip updo and pyjamas.
- **Each era has its own hand-drawn grid.** I drew one head and torso per era rather than tinting one sprite, because hair is what dates a look. Legs vary by cut (shorts, skinny, straight, wide).
- **Contact-sheet fix:** at first the white shirts under the chin read as a beard. I added a neck, and changed the London tee to black and the J.P. Morgan shirt to pale blue.
- **One small enemy kind per world** (`src/game/enemies.ts`): mosquitoes, deadline clocks, bugs, pigeons, meeting invites, late-change sticky notes, hallucinations and glowing screens.
  - Landing on one clears it and bounces her (higher if Jump is held). Touching one from the side is a hit.
  - Pigeons fly off rather than flatten.
  - None is an employer, a client or a person. All are original 12×10 sprites.
- **One optional mission per world**, shown under the HUD strip, announced to screen readers and reported on the end card:
  - Ride the scooter to the sea.
  - Beat 3 deadlines.
  - Squash 4 bugs.
  - Find every book.
  - Collect every flow arrow.
  - Catch 3 late changes.
  - Verify 3 hallucinations.
  - Put 3 screens to sleep.
- **Missions are a bonus only.** Finishing a world never depends on one, so nobody gets stuck. The map star turns gold when the mission is done.
- **New tests:**
  - A stomp clears an enemy and counts toward the mission.
  - A side touch is a hit.
  - Every world has a mission.
  - The Kaohsiung bot completes its ride mission.
  - Every end card reports its mission.
- **Regenerated the map poster.**

### PR 10 · A real map, and 捷元電腦 is 2010

- **Map projection:** the world map is drawn like a real map now (`src/game/map.ts`). Taiwan and Great Britain come from simplified real coastline coordinates (latitude and longitude, squeezed by cos(latitude)), rasterised once with hard pixel edges, a coastline and a shallow-water band.
- **Real places:** Taiwan's stops sit where they really are: Kaohsiung in the south-west, Ling Tung in Taichung, 捷元電腦 in the north. A dashed flight with a little plane goes from Taipei to London.
- **London inset:** a box with the Thames and its Isle of Dogs loop holds London Met, J.P. Morgan and Barclays. It makes no claims about which office.
- **AI island:** Next: AI is an island with a dashed, still-drafting coast. Bedtime is a small island beside it.
- **Map furniture:** a graticule, a compass, and "Not to scale".
- **Character:** she stands on the selected world in that era's look.
- **Date:** 捷元電腦 now shows 2010. Shannon later confirmed the year and the location (Taipei, which is where the map already puts it).

### PR 11 · Controls that don't get in the way (Shannon's report)

- **Dropdown before Play:** choosing a world in the dropdown before pressing Play did nothing. Now it starts that world, before or after Play.
- **Map clicks:** clicking a world on the map now updates the dropdown too.
- **Pause on blur:** pressing an on-screen arrow, Sound or the dropdown paused the game immediately, because any loss of focus counted as leaving. Now only leaving the game area pauses it. Touch buttons keep focus on the canvas.
- **Unpausing:** a paused game now carries on with any game key (Escape still pauses and Tab still leaves), not only a click.
- **Tests:** `tests/controls.spec.ts` covers all five behaviours. Each failed before the fix.

### PR 12 · Flags and brand-colour badges (Shannon's choice)

- **Flags:** pixel flags for Taiwan and the UK, hand-placed at 16×10 above each country's name. They're simplified as pixel art has to be: the Union Jack without its counterchange, and Taiwan's sun as a small disc with eight rays.
- **Badges:** London Met, J.P. Morgan and Barclays get brand-colour badges. Each one has a plate in the organisation's colour, a stripe of its accent colour, and its name in the pixel font. Each node's tile frame uses that colour too.
- **Why not logos:** these are badges, not logos. Shannon picked this over official logo files, so the site uses no trademarked artwork, and her current employer's mark isn't on a job-search site.
- **Colours:** they are close matches and live in `BRAND` in `src/game/map.ts`, so they're easy to correct.
- **Label:** world 4's map label now reads "London Met", which names the organisation like the other two badges.

### PR 13 · School buildings on the map (Shannon's note)

- **School icons:** Ling Tung and London Met are where Shannon studied, so their map tiles now show school buildings, not the level's pickup icon.
  - Ling Tung: a cream campus block with a red-tiled roof and a flag.
  - London Met: a brick building with a pediment, tall windows and steps.
- **How:** both are hand-placed 16×14 sprites in `SCHOOL_ICONS` (`src/game/map.ts`).

### PR 14 · The Barclays eagle (Shannon's request)

- **Eagle icon:** Shannon sent the Barclays eagle and asked for it on the map. Her Barclays tile now shows it in cyan on white, as the mark appears.
- **Not redrawn:** the eagle was box-downsampled from her file to 15×16 rather than redrawn, so the shape stays the brand's own.
- **Easy to remove:** the icon lives in `LOGO_ICONS` in `src/game/map.ts`. Deleting that entry brings back the plain brand-colour tile.
- **Flagged to Shannon:** Barclays is her current employer and the site is part of a job search, so she should check Barclays' brand and social-media policy before the link goes out.

### PR 15 · The J.P. Morgan octagon (Shannon's request)

- **Octagon icon:** the J.P. Morgan tile shows the octagon from the logo file Shannon sent, blue on white. The wordmark is left off: at 16 px it can't be read, and the badge already names the company.
- **Seams restored:** downsampling closed the octagon's four white seams, which turned it into a plain ring. I put them back at 1 px each, where the logo has them, so the pinwheel around the square hole still reads.
- **Exact colours:** the J.P. Morgan badge now uses the wordmark brown and octagon blue sampled from her file, replacing my earlier close match.

### PR 16 · Worlds and stages (Shannon: "too many choices")

- **Four choices, not eight:** the map offered eight separate choices. They're now grouped the way Mario does it:
  - World 1 · Taiwan (1-1 Kaohsiung, 1-2 Ling Tung, 1-3 捷元電腦).
  - World 2 · London (2-1 London Met, 2-2 J.P. Morgan, 2-3 Barclays).
  - World 3 · Next: AI.
  - A bonus.
- **Choosing a world:** Left and Right on the map step through the four, landing on each world's first unfinished stage. A dashed red frame marks the whole world. The footer reads "World 2 · London · 3 stages".
- **Why stages, not merged levels:** merging the three Taiwan levels into one long level would have lost the era looks and the story cards that carry the facts. Each stage still ends on its card.
- **End-card buttons:** "Next stage" inside a world, then "Next world: London", "Next world: AI" and "Bonus: Bedtime".
- **Picker:** the world dropdown uses `<optgroup>`s, so it's four groups of stages. A case page's `?level=` link still starts its exact stage.
- **Shared data:** groups live in `CHAPTERS` in `src/lib/journey.ts`, which the game, the cards and the picker all share.

### PR 17 · Private share (Shannon: "private share only, for the Revolut interview")

- **No search listing:** every page now carries `noindex, nofollow`, and `vercel.json` sends the same as an `X-Robots-Tag` header on every file, including images and the CV. The sitemap is gone.
- **robots.txt stays open on purpose:** a Disallow there would stop crawlers reading the noindex, and a blocked URL can still turn up in search as a bare link.
- **Lighthouse gate:** CI now skips Lighthouse's `is-crawlable` audit, the one check this choice fails by design. Every category is still 100, mobile and desktop.
- **Limit:** noindex keeps the site out of search; it doesn't password-protect it. Anyone with the link can open it, so share the link only with the panel. A password would need Vercel's paid Deployment Protection, or Vercel Authentication, which would make interviewers log in to Vercel.

### PR 18 · Selection follows the coastline (Shannon: "can't the red dotted square be the Taiwan shape?")

- **Coastline outline:** the selected world is now outlined by its own shape, not a box. A red line runs 2 px outside the real coastline of Taiwan, of the AI island and of the bonus island. For London it goes around the inset frame.
- **How:** each outline is computed once from the land pixels when the map is drawn (`SELECT_RINGS` in `src/game/map.ts`).
- **Why solid:** I tried a dotted version first. At this size it broke up into noise along the curved coast, so the line is solid.

### PR 19 · Every way home leads to /panel; Next: AI says it plainly

- **Links home:** the panel gets the `/panel` link, so every link back home now goes there too: the logo, Work and How I work in the nav, the 404 and build pages, and each case page's "Play this chapter" link (`/panel?level=n`). The panel line never drops away while they browse.
- **Next: AI copy:** Shannon confirmed that AI is the focus of her job search, so the end card now says it: "Where I'm heading next: designing AI products. uoaui.ai is the AI-native product I design and build to get there. The model drafts, I decide."
- **Why it's safe to say:** the earlier "practice, not a job search" framing was for a public site. This one is a private link for one panel.
- **Kept as is:** the uoaui case still calls it a private alpha, not a shipped product, because that's true.

### PR 20 · The panel line names AI (Shannon approved)

- **New wording:** the `/panel` hero eyebrow now reads "Portfolio for the Revolut design panel: product design, heading into AI". This puts the job-search direction above the headline, so the panel sees it before anything else.

### PR 21 · Full screen game, with an easy way out (Shannon's request)

- **Play opens full screen:** pressing Play now opens the game full screen. It uses the browser's Fullscreen API where allowed. On iPhone Safari, which doesn't allow it for a canvas, the same layout appears as a fixed overlay.
- **Three ways out:**
  - Escape (the browser's own, or ours in the overlay);
  - a white "Exit full screen ✕" button in the top corner;
  - re-entry any time with a "Full screen" button under the game.
- **Leaving full screen:** a level you leave stays paused, so nothing happens while you're away. The map never gets stuck: starting any world clears the pause.
- **Phones:**
  - Upright: the game sits above its controls, with a hint to turn the phone.
  - Sideways: the game fills the height, ← and → sit in the left margin, ↑ in the right, and the exit button shrinks to a ✕ (still announced as "Exit full screen").
- **Tests:** three new ones cover Escape, the buttons, the map case and the phone overlay. 71 pass.

### PR 22 · FX case: the diagrams the panel looks for

- **Source:** Shannon's Revolut portfolio deck in Figma. I read all 36 slides, plus the 17-slide intro-call deck and its speaker notes.
- **Built in the site's style, not as slide images:** the deck's diagrams are dark slides with serif titles, and the brief rules out serif type and dark bands. Each one is rebuilt with the site's type and hairlines, as real text.
- **New diagram components** (`src/components/dg`): Flow, Layers, Matrix, Stack and BeforeAfter.
  - Each is real text, so screen readers read it and it stays sharp at any size.
  - Each stacks on a phone.
  - The Matrix is a real `<table>` with row headers.
- **FX now shows:**
  - **Understanding the data:** five spreadsheets, four kinds of data, one mark each. This is the deck's slide 09, which the site didn't have.
  - **Reprice flow:** monitoring to action as six steps, with the Cancel branch ("nothing changes"), confirmation and the audit trail.
  - **Before/after:** schematics of the two version-one debts. State regions became a state lane; a smear of dots became counted clusters. These are schematics, not screens, so they stay NDA-safe.
  - **State matrix:** the edge and validation states as a table (state, what the screen does, why), replacing a two-column list.
- **No new claims:** every word comes from the deck or the existing case copy.
- **Test fix:** "the scooter makes you faster" read the speed after a fixed 900 ms, which sometimes landed after the bot rode into the pit at tiles 26–28. It now reads the speed as soon as it builds. It passes 8 of 8 in a row.

### PR 23 · Fusion case: a real problem, and the system made visible

- **Problem beat fixed:** beat 01 was labelled "Problem" but listed only constraints. It now states the problem in Shannon's deck words: "Their real need was trust in the numbers, not more features". It also covers the users, the job, and where it started (the legacy RaaS layout).
- **Constraints beat:** constraints have their own beat, now with her role (she led the design; the UX designer was shared; a product owner set requirements).
- **Workflow:** the four-step workflow is a Flow diagram. "What testing changed" (deck slide 20) is added.
- **Design beat:** two images that were already public on shannonhecker.com.
  - The widget grid: one shell, five uses. This is the proof of "one widget, many cubes".
  - The configuration panels, beside the tier decision. They aren't captioned as before or after the cut, because I can't tell which version they show.
- **System diagram:** "The system underneath" is now a Stack diagram: pages, widgets, the Fusion layer (outlined as hers), Salt, then FactSet. Entitlements and adoption are noted on the side.
- **No new claims:** nothing beyond the deck and the existing copy. I removed one line I'd written that went beyond the source.

### PR 24 · uoaui.ai: real screens, a demo clip, and the live links on every case

- **Screens, at last:** the uoaui.ai case had no images. It now shows the prompt screen (dark and light) and the design hub with the chart set, both already public on shannonhecker.com.
- **A demo clip:** the 30-second builder walkthrough from shannonhecker.com, re-encoded from 4.5 MB to 0.9 MB at 1280 px. It loads nothing until it nears the screen, plays only while visible, and stays a still poster with controls under reduced motion. The caption carries the content for anyone who can't watch.
- **Diagrams:** the five-step builder flow, and a Stack showing how a screen is built: person, model, token mapping (hers), official components, export.
- **"What it isn't":** added from the deck, because the honest line belongs on the page.
- **Live links where the panel reads them:** each case head now links to its live thing, not only the footer. FX and Fusion link to the public rebuilds, uoaui.ai to uoaui.ai. The footer's "uoaui.ai on request" is now a link.
- **Fixed in review:** the first image was the logo card, not the prompt screen; and the Stack's side notes overflowed on long text.

### PR 25 · More room, current product evidence, and a little more me

- I gave the home page and every case more space between ideas. Screens use the full case width and keep their original proportions, with a full-size link for the dense details.
- My two pixel avatars now appear in the introduction and the AI case. Peach details connect them to the game. The game has a gentler map palette and more considered Kaohsiung scenery, plus a short Higgsfield waterfront animation on its cover.
- I replaced the old FX, Fusion and uoaui screenshots with captures of their current live products, including the signed-in uoaui builder. FX and Fusion have new real walkthroughs; uoaui uses the current clip from its own site. Product videos have native controls and wait for Play.
- Every case has direct links to its problem, personas, journey, flow and decision map. New diagrams are real responsive text, based on the case copy and Figma sources. Assumptions are labelled. Winking Star also shows the shared-board journey for a second adult.
- I checked all seven Figma pages. Older drafts and unconfirmed details stay out. Classic is the Barclays design; Enhanced is my public rebuild. No private bank screens or data were used.
- My existing story stays intact except for two corrections against the current products: compare and tune is my practice, not an enforced uoaui export gate; FX's state lane and counted clusters are shown as design refinements, not current live UI.
- I checked desktop and mobile layouts, uncropped images, playback, keyboard controls, reduced motion and the game. Current verification is recorded in `docs/QUALITY.md`; asset provenance is in `docs/MEDIA-SOURCES.md`.

### PR 26 · One illustrated world, with the work kept clear

- I brought the site into the soft illustrated adventure I chose: cream, peach, rose and sky blue, lighter headings, more open type and a shared spacing system. Each of my four cases has equal prominence, its own setting and accent, and a sticky chapter index.
- My avatar now changes outfit and props by chapter. The scenery and role illustrations came from Higgsfield; the role pictures are fictional artwork, not photographs of research participants. Product screens remain real captures with their original proportions.
- I replaced the mixed-city game poster with a Kaohsiung-inspired harbour scene and added illustrated backgrounds to all eight stages. They load per stage and do not repeat landmark towers. These are stylized settings, not literal records of my old campuses or offices. The sharper rendering and lighter ground keep the game closer to its cover without changing the physics.
- I fixed the full-screen startup pause exposed by CI. The game reads the latest visibility entry, recovers only from its own offscreen pause, and lets touch controls resume play. Deliberate pauses still stop the game.
- I made the case navigation cover more of the official Revolut brief. Current tablet and phone captures show what the products actually support, including the FX phone overflow. The brief coverage and remaining evidence gaps are recorded in `docs/REVOLUT-CHECKLIST.md`.
- I added my confirmed work on UITK before Fusion, and kept the accessibility specialist's involvement clear: from the start. The uoaui case now states what the private alpha demonstrates and the next validation question, without inventing adoption or time-saving figures.
- I made my end-to-end ownership visible in Winking Star and uoaui: original logos, current palettes, typography, spacing and component foundations. Winking uses the original 1024px app icon; uoaui uses my original lockup and a fresh capture of my own live system. Current product tokens take precedence over older portfolio swatches.
- I fixed the narrow-screen hero overflow and updated the enemy-landing check to approach an enemy and jump deliberately, rather than jump blindly on a timer. The test reads enemy positions; gameplay physics are unchanged.
- Final local verification: eight routes built, 73 files checked with zero diagnostics, all 78 tests passed in 42.0 seconds, and all ten Lighthouse runs met the 95-point category budget. Mobile performance is 96–99. Optional desktop effects now load on scroll. Release CI and deployment are tracked separately.

### PR 27 · Optional scores and private visit reports

- I added a stage scoreboard with an optional made-up nickname. Sharing is a deliberate choice at the end of a stage, and each stage has its own top ten. The score rewards finishing and pickups, with a small deduction for bumps.
- I connected a free London database with paid auto-upgrades disabled. The server checks score bounds, signs short-lived run receipts and saves repeat submissions only once. These are friendly, client-reported game scores, not a cheat-proof tournament.
- I connected my existing Google Analytics stream for visits, reading depth and stage starts/completions. Analytics loads only after consent, with advertising features off. Nicknames are never sent to Google. Footer settings and a privacy page explain the choice.
- I reset jump counts per attempt and prevent an old delayed finish from showing over a new stage. Network failures leave the game playable.
- Local checks: nine routes built, 81 files checked without diagnostics, 83 tests passed. A real database concurrency check saved one result from two simultaneous submissions, then removed the test entry. Release and visual checks are tracked in docs/TASKS.md.

- Following my visual review, I removed the illustrated landscape headers from all four cases and kept scenery in the game. The pages are white again, with stronger 700-weight headings, medium-weight introductions and more generous chapter, row and diagram spacing.
- Each case now opens with its own product UI: the current public FX and Fusion rebuilds, the current uoaui builder, and a three-screen Winking Star flow. Screens keep their full proportions.
- I removed the build credit from the footer after my review. The build log remains available at its existing address.

- I made the introduction and optional game feel like my own small adventure: my pixel SH mark, a larger avatar with blink and smile frames, bounded arrow controls and a pause button. The game preview stays compact and the four projects share equal space.
- I brought the game map, walk cycle, objects, obstacles and HUD closer to the detailed scenery. Artwork is prepared before play, with the original renderer as a connection fallback. Keyboard, touch and physics stay intact.
- I gave each project its own accent and added light, dark, system and project theme choices. FX starts dark. The main navigation slips away while reading and returns on upward scroll; Contact and the theme selector remain on one row.
- I put role portraits inside persona cards, added project-specific process illustrations, and removed repetitive filled boxes from journey and flow diagrams. All diagram text stays selectable and responsive. Decorative art is labelled separately from research evidence.
- I added more current public FX, Fusion and uoaui screens, plus Winking Star's published iPhone and iPad artwork and labelled French and Traditional Chinese store compositions. Screens retain their proportions and full-size links.
- The current local release candidate passes 94 browser tests, including all eight game stages, theme persistence, system preference changes, bounded avatar controls, accessibility and analytics consent. Ten Lighthouse runs meet the 95-point gate: mobile performance 96–99, desktop 100, and accessibility/best practices/SEO 100. CI and live deployment remain separate gates in the tracker.
- Preview verification caught TypeScript source extensions surviving Vercel's server compilation. I changed the server imports to emitted JavaScript paths and added a compiled-runtime CI check, so an import that only works in the source test runner cannot pass unnoticed.
- I replaced Winking Star's remaining automatic theme strip with a quiet, responsive gallery of four complete banners. There are no repeated copies or cropped scrolling artwork.
- CI's root-page performance check exposed an empty-grid-row bug: without the panel eyebrow, the optional game could appear ahead of the introduction. I assigned the landing rows explicitly and added a layout-order regression check for both URLs on phone and desktop.
- After reviewing the animation, I replaced the full-body expression swaps with separately generated and registered eye and mouth layers. The body stays fixed through each blink. My avatar now follows the pointer and responds gently to scrolling, with no arrow controls, a pause option, and a still version for reduced motion.
- I used Matthieu Givelet's generous typography and image-led spacing as a reference for a wider, cleaner gallery. The complete product images now lead each project, with aligned icons and labels beneath. A neutral sans-serif carries the case stories, with small project-coloured details and gentle left/right entrances. Native scrolling stays in place.
- I restored my original FX decision-loop graphic from the interview deck as the primary flow diagram, with a full-size link and a readable branch transcript. The current product rebuild remains labelled separately.
- I re-exported the original FX loop directly from its 69 Figma vector nodes at 3× resolution, so the full diagram stays sharp at case-page width. The source link and readable transcript stay alongside it.
- I fixed a lazy-image layout shift caught by release CI: screenshots now reserve their exact source proportions before loading, so a chapter link does not jump away when images appear above it. A delayed-image regression check covers the behaviour.
- I replaced the browser-native theme dropdown with a custom appearance menu: project, light, dark and system choices, with icons, a selected marker and a compact mobile trigger. Keyboard arrows, Escape, Tab, outside-click dismissal and saved preferences are covered by tests.
- I stopped the optional game cover and avatar competing with the heading at first load, and matched the consent heading to the site typography. The cover uses sizes appropriate to its compact preview.
- I simplified appearance to one keyboard-accessible light/dark switch and made the optional game a full-width shallow banner that opens at its original playing ratio.
- I replaced the realistic game scenery with a consistent chunky pixel palette across all eight stages, the map, avatar cycle, objects and enemies. The generated source jobs and preparation pipeline are recorded in docs/game-art-generation.json.
- I added an eight-second collectible power star, extra speed and protection, and an original quiet chiptune that follows the Sound toggle and stops on exit. Career achievements reveal verified project names from my CV, including the JPMM, DXD and Fusion work; the next stage continues the story.
- I removed the decorative process illustration strips. The journeys now connect interaction schematics to friction and design responses; decision branches show the chosen approach beside its alternative. My existing words and original FX Figma flow remain intact.
- I fixed rapid fullscreen exit/re-entry, narrow banner sizing and diagram connector overflow found during testing. Scroll reveals now batch layout reads before writes to reduce initial work on slower phones.
- My final preview check sharpened the map labels with the bitmap font, improved the game caption contrast, and corrected the home introduction to say four cases.
- Release CI caught the map chooser squeezing its canvas vertically. I reserved room for the chooser and kept the playing surface at 16:9. The hazard check now waits for collected star protection to expire before checking damage.
- I brought the stage results into the game's pixel palette, with a star emblem, square controls and compact achievement and score panels. Touch devices no longer perform the optional desktop reveal measurements on first load.
- I rebuilt the project index as large editorial rows and opened each case with a compact summary beside complete product screens. The composition follows the scale and spacing I liked in Matthieu Givelet's portfolio, with my own project colours, words and imagery. I kept the design work local.
- I made the scroll depth more visible: screens and headings approach the centre separately, and settle together without cropping the product. Touch devices and reduced-motion readers see all heading words immediately.
- I gave all eight game stages their own generated outfit and hairstyle, registered to a shared pixel grid with dark silhouette outlines. A flat wash quiets the scenery behind the character while leaving platforms and pickups sharp.
- I rebuilt the work index as two large image tiles with a narrow gutter and quiet labels underneath, following my supplied reference more closely. Case introductions now use a 40/60 summary and gallery, with context beside role details and the description below. I preserved my words and complete product screens.
- I replaced the full-width numbered chapter bar with one compact Sections control. It closes after a jump, on Escape, or when I click outside. I added coordinated title/gallery entrances, paired scroll depth and gentle product hover movement; reduced motion and touch keep content immediately readable.
- I made the world map react to hovering, with distinct selected and hovered markers. My character travels to the keyboard-selected stage; water glints and route lights animate gently. Up and Down select individual stages, while Left and Right still change worlds. Motion stops offscreen, when hidden, and under reduced motion.
- I gave project pages more space between sections, diagrams and screenshots. Small section headings have an opaque theme background, and portfolio labels share the same reading typeface. Pixel lettering stays in the game.
- I changed Mandarin interface labels to English, including Kaohsiung and Genuine C&C Inc. The employer name is verified in Taiwan's company register (23134543). Winking Star now compares English and French store artwork; its five supported languages remain accurately listed in English.
- I removed game objects from project titles, reading links and process steps. Project wayfinding is now simple text, numbers and arrows; the pixel objects remain with my avatar and the optional game.
- I made the section labels compact opaque pills, with rounded ends and less space after the text. Project arrows sit directly beside the title and appear on hover or keyboard focus; touch keeps them visible.
- I studied the archive transition in sequence and replaced the page crossfade with a lifting background, then a masked title entrance, then copy and product screens. Links, history and reduced motion keep their native behaviour.
- I added a small avatar cursor that changes outfit by project, walks with the pointer and rests when it stops. A precise dot marks the click point. Text fields, video, the game, keyboard use and reduced motion restore the native cursor; the footer has a saved on/off choice.
- I added a short landing greeting using new, registered arm poses. My original face and body stay fixed while the arm lifts and waves, with a gentle entrance and smile. It plays once when visible, stops when paused or hidden, and skips motion when requested.
- I staged the landing entrance: headline, introduction and links arrive in sequence, then my avatar appears after two seconds. Her separate hand now waves at the wrist, repeats after a short rest and greets mouse/touch visits. Pause, hidden/offscreen states and reduced motion stop it.

- I synced my revised Figma home gallery, including the FX tablet mockup, Fusion composition, Winking Star phone artwork and uoaui desktop. My home headings use the revised Inter type; project-page imagery stays unchanged.
- I moved the arch, book and star entrance after the copy and before my avatar. The game banner now has its own pixel title screen and Start adventure prompt. Decorative motion stops outside the viewport.
- I added a gold pixel umbrella to the rainy London stage, anchored to my character as she turns and jumps. I fixed a heading entrance that left case titles shifted offscreen, and cleared the navigation and avatar cursor from the full-screen game overlay.

### PR 25 · Final review: the reading experience and the journey

- I replaced the section popup with a closable side panel and made the FX status note plain text. My new FX personas, journey map and two interaction frames now come from my supplied Figma file, with source links and responsive text. The sample-data labels distinguish designs from the public rebuild.
- I removed the coloured gaps around the home artwork, set interface corners to 4px and kept desktop product statuses on one row. The introduction now flows from text to scenery to my avatar with a much shorter pause.
- I added my 2018 and 2021 family milestones, my 2013 move to the UK for a working holiday and study, and my art, craft, digital media, game and UX education details to the game. A few source-linked world events provide context.
- Every stage has an original tune. Losing a run or falling has its own cue. My scooter uses a seated pose, and a short skippable flight connects Taiwan to the UK.
- Winking Star now ends with an original Scrollkeeper villain, a storybook castle, a flag I raise and a celebration. Completed stages have check marks, optional missions have stars, and progress stays in the browser between visits.
- The combined build passes all 120 browser checks, including the final boss, flag, travel, saved completion, distinct stage music, timeline pause/resume, responsive artwork and title-label clearance. CI and live release are recorded separately.

### Final review: FX Figma sync and finale unlock

I brought my revised FX desktop artwork into the case introduction and carried it into the mobile layout: the chart, compare detail, order ticket and original data-layer diagram. The portfolio Figma desktop and mobile frames now also contain my three authored personas and five-stage journey; mobile keeps the copy at a readable size. The final game stage stays locked until all seven earlier stages are finished, including when someone follows a direct level link. The map explains the lock and saved progress unlocks it on later visits.

I added an original starlight wand to the finale. I can face the Scrollkeeper and cast with X or J, gamepad X or the touch Cast button. Gold sparks, a short hand pose, a casting sound and a cooldown make each attack visible. Three wand hits defeat the boss before I raise the flag. I also fixed a heading that clipped when a desktop window became mobile and tightened the greeting timing.

### Scroll motion and page-load rhythm

I made the work gallery move in layers: images arrive first, then titles and captions catch up. Section words reveal through masks that follow scrolling in both directions, and the intro's book, star and backdrop travel at different speeds. Touch uses smaller movements; reduced motion restores static, fully readable content. Case metadata and descriptions enter in a short sequence. I tightened the text-to-scene-to-avatar entrance and load the first greeting poses eagerly, so the choreography does not add a long wait. This pass changes website code only while Claude improves the Figma file.

I corrected my baby milestone from 2011 to 2021, keeping 2018 unchanged. The game journal now lists both family milestones in chronological order.

I gave every stage a different song arrangement: swung harbour melody, campus waltz, clipped workshop groove, slow London rain, rising city theme, fast market rhythm, spacious AI theme and a driving storybook finale. Each has its own note lengths, bass pattern and instrumentation. The browser test observes actual Web Audio notes and checks that changing stages stops the previous song. I embedded the small original journey vectors to avoid twenty competing image requests while the FX hero loads, and defer offscreen video posters with native lazy loading.

I removed the redundant Figma-design caption under the FX hero after my final review. The main project-status explanation and detailed source links remain in the case study.

I reduced the body font from three weight downloads to one local variable file while keeping the same type and supported weights. Phone entrances use small opacity and position changes, with a slightly quicker avatar arrival; desktop title masks and scroll masks stay in place. This reduces startup work on slower phones.

### Home motion, image detail and map markers

I made my home title and introduction respond from the first scroll, with staggered words and separate copy depth that reverse when I scroll back. The work captions now animate as the captions enter view, rather than finishing below the screen. My avatar scene has more visible depth, and reduced motion restores a still page.

I aligned Selected work and its gallery with the introduction and exported sharper original FX panels and Winking Star cover compositions from Figma without editing the file. Responsive images now retain source detail for large and Retina displays. The FX overview, ticket and comparison have clear space between them. My first company stage uses a computer-work badge, while universities show their own buildings and completed stages retain their ticks.

I made the shared stylesheet cacheable between pages instead of embedding the entire design system in every HTML response. The home document is now about 64KB rather than 194KB before compression, and the intro flows a little faster from words to scene to greeting.

I softened the navigation and reading-section dividers with a subtle, theme-aware neutral line. They now sit closer to the page background, especially in dark mode, while controls and focus indicators keep their contrast.

My fixed header now becomes frosted glass after scrolling: a translucent page tint, restrained blur and a soft inner highlight. It works in both themes and returns to an opaque surface for reduced transparency or browsers without backdrop-filter. I used the MDN and WebKit backdrop-filter examples as references, with no extra library.

I moved the avatar's blink and smile frames to stepped opacity animations, preserving the poses while allowing the browser to composite them without continuous visibility changes. Phones also avoid stacking individual word masks inside the title entrance. Lighthouse no longer reports non-composited avatar animations; the local mobile check scores 96 for performance and 100 in the other three categories.

I fixed my Contact button's hover and keyboard-focus colours in both themes. My scooter now has a solid rose body, dark chassis and opaque tyres. The game HUD uses the same hand-drawn bitmap lettering as the map, with crisp canvas scaling so its labels stay sharp on large screens.

I corrected the two remaining pale lines around How I work. They were using a fixed light colour; they now share the subtle theme-aware divider, as do the case-section and ticker rules.

## 11 October · dark by default

I made dark mode the starting appearance across my site, including the first HTML paint and browser theme colour. A visitor's saved light or dark choice still takes precedence. I also kept the missing-page link readable on hover against the dark background.
- The dark-default release check caught a slow mobile first paint. I kept the phone introduction's movement but let its text paint immediately, so the entrance does not delay reading. All 130 browser tests still pass.

### 11 October · Updated Figma content and Deal Model

**What Codex did**

I read the current desktop and mobile working pages in Shannon's portfolio Figma file and brought the updated case-study content into the existing site structure. I added Deal Model as the fifth project, with its four composite roles, five-step journey, six decisions, validation states and thirteen design-file screens. I kept the stated limits: smart pricing was explored, and the time saving is Shannon's estimate, not a measured result.

I replaced the older persona, journey and decision treatments for Fusion, uoaui.ai and Winking Star with the current authored material. I exported the updated FX persona illustrations and kept names, roles and quotes as accessible page text. I compared forty existing product-image placements against Figma and retained the higher-resolution originals where their content matched. I used the provided illustrations and diagrams; no generated replacement graphics were needed, and I did not edit the Figma file while Claude was working there.

I checked desktop composition, mobile reflow, image loading, section navigation, reduced motion and both themes. The first test pass caught a visible margin around the new home tile; I fixed its crop. The final local production build succeeds, Astro reports zero errors and warnings (one pre-existing hint), and all 140 browser checks pass. The release still requires its own remote CI and published-site verification.

The visual pass then caught two source-flow labels extending beyond their boxes and connector labels that were difficult to read against dark mode. I rebuilt the four small flow diagrams as theme-aware vectors, keeping their wording and relationships. I also increased chapter-jump clearance to account for the entrance motion, with a regression for the sticky header. All 141 local browser checks pass. I corrected the screenshot test to use Playwright's output directory so the same evidence can be saved on the Linux release runner.

The cloud mobile homepage audit scored 94, just below my 95 budget. I shortened the introductory paragraph's phone entrance and stopped the navigation from measuring the full gallery while the page is at the top. The title, avatar greeting and scroll motion remain. All 141 browser checks pass after this refinement.

### 11 October · Complete the graphic sync

I replaced the six generic FX decision sketches with my finished Figma chart comparisons: combined versus split views, chart repricing versus a settings menu, and market-price studies versus incomplete fill data. The six exports are 1748 pixels wide, with responsive delivery and original-size links. I gave the comparisons more room and stack them on phones. I also placed the authored comparison graphics on white surfaces so their dark illustration text stays readable in dark mode.

I audited the other case graphics alongside the product screenshots, personas, journey maps and decision flows. The prior source-backed assets remain; this pass fills the six missing FX vector drawings without substituting generated product evidence.

### 11 October · Match the expanded data-layer diagram

I brought the expanded FX data-layer view into line with my finished Figma diagram. Market context, order intent, execution results and benchmarks now keep their four branches, with price changes and order states together. The connected diagram keeps selectable text and stacks on phones; the original full-size design remains available above it.

I also removed the separate colour blocks from the FX personas. Each card now uses a continuous illustration-matched background behind the identity and supporting text, with dark type for contrast. The planned shared avatar pass will replace the remaining baked-in image backgrounds.

### 11 October · Consistent comparisons and a complete game entrance

I aligned my FX comparisons with the case reading column, keeping the diagrams smaller and their full explanations directly underneath. The original high-resolution images remain available to open. I removed the second repeated decision layout without cutting its wording, and kept the chosen and alternative views stacked on phones.

I removed the three-project status strip now that Selected work includes five projects. The game now shows an original pixel compass while its map loads and fullscreen settles, replacing the stretched poster flash. The loading scene remains until the canvas has painted, respects reduced motion, and allows retry after a loading failure.

The cloud mobile audit scored 94 against my 95 budget. I let the phone introduction paragraph paint immediately, while keeping the title entrance, avatar greeting and scroll-driven text movement.

### 11 October · One illustrated persona family

I recreated all fifteen persona portraits with Nano Banana 2, using the FX illustration style as the reference. They share a 1200 by 1600 source canvas and the same 300 by 400 display frame. Deal Model now includes all four composite roles. The cards share one continuous warm surface, with names, quotes and needs kept as selectable text in the existing project structure.

The illustrations are fictional design personas, not photographs of research participants. Their source jobs and role mapping are recorded in the media notes.

I prioritised the reading font on phones and limited the avatar image preloads to larger screens, where the illustration is visible immediately. The greeting frames still load eagerly and decode before the animation starts. I also removed an inherited portrait margin so every illustration rests at the card edge.

The hosted phone audit exposed an extra synchronous navigation layout during startup. I moved its overflow measurement into a resize observer and let CSS expose touch/reduced-motion content without rewriting every reveal class at load. Scroll motion and navigation behaviour remain covered by the browser suite.

### 11 October · Sounds like me, matches the Figma

I read every case against my interview notes and the working Figma file, then changed words, not structure. The Figma sync had already landed, so this pass is about voice and consistency.

- The diagram introductions stopped sounding like a report. "I have summarised the roles" became "The people I designed for, and what each one needed." The decision maps now open with "The calls, what I tried instead, and what each one cost."
- The honesty lines stay honest and now sound like me. FX: "No adoption numbers yet. Rollout brings three measures." uoaui.ai: "No adoption rate, no time saving, no external test yet. When another designer gets there without me, I'll say so here." The accessibility and responsive notes say what I can show and what I have not run.
- The FX before-and-after panels are labelled Today and Designed, the same as the Figma file, because the lane and the clusters are designed, not shipped.
- Every case has a number that matches the index: FX 01, Fusion 02, Winking Star 03, Deal Model 04, uoaui.ai 05. The home page no longer counts beats, because the cases do not all have six.
- Fusion's UITK paragraph is in my words from the interview notes: workshops in London and New York with design, product and development in the same room, to agree what a component is before anyone built it.
- Deal Model carries three lines from my notes: weekly with each team and a shared review every fortnight; the upload template idea came out of a user session, not from me; and when template uploads dropped to nothing we knew people had moved. The two-hours-to-twenty-minutes figure stays labelled as my estimate.
- The Revolut checklist has a Deal Model column and a note of what is still open: measured outcomes, the Fusion audit provenance, test records, and the names visible in the Deal Model screens.
- Checks: production build and Astro check pass. Browser suite: 143 of 145 pass locally. The two that fail, the product-recording playback check and the home scroll-motion check, fail the same way on main in this sandbox, so they are environment limits here, not this change. Release CI is the gate.
- Follow-up in the same pass: honest test records under the FX and Fusion decision maps, in my words, with "no protocol, no count" where that is true; the Fusion accessibility tile now names the method; and the Deal Model screens in the working Figma file use sample client and colleague names, so the next image sync carries no real names.

### 11 October · Keyboard focus keeps the whole tile still

The home scroll-motion check had been red on main. When a work tile takes keyboard focus the browser also scrolls it into view, and that scroll handed the artwork straight back to its scrubbed scroll tween, so the tile lifted again a frame after the focus reset. A tile's scroll triggers now pause while it holds focus, so the reset holds, and they pick up from the live scroll position when focus leaves. The test now checks both halves: still while focused, moving again after blur.

- Checks: production build and Astro check pass. The home scroll-motion test passes six times in a row locally. Full browser suite: 143 of 145 pass; the product-recording playback check still fails here as it does on main, and the chapter-jump image check timed out once in three runs on an unrelated page, under reduced motion, where this script does nothing.

### 11 October · Three small fixes from the audit pass

A Lighthouse, axe, keyboard and security pass on the live site found no violations and scores of 95 or better everywhere. Three small things came out of reading its "needs review" items, and this closes them.

- The three silent product recordings now carry a visible one-line description under the caption, so the text alternative says what the recording shows and that it has no sound.
- The FX chart legend and the brand palette blocks had a label on a plain container, which ARIA does not allow. They are groups now, so the label has something to attach to.
- Phones get an 800 pixel image candidate for the hero and authored images instead of jumping from 640 to 960 or 1280. Lighthouse had flagged 20 to 30 KB per hero as oversized on mobile and no longer does. The largest paint time itself did not move measurably in the sandbox, so this is bytes saved, not a faster score.
- Checks: build and Astro check pass. The axe, evidence, Figma-sync and polish suites pass apart from the product-recording playback check, which fails the same way on main here. Lighthouse mobile on the four hero pages stays in the 95 to 98 band it was in, with FX on the line at 94 to 96 across runs.

### 11 October · The footer stands up straight

The footer read as loose. Three CSS causes, no content change. The headline column was bottom-aligned to the taller link list, so "Live links" floated 250px below the top of the block. Both bottom rows carried the same 120px top margin, stacking 240px of air between the links and the privacy line. And the privacy row was a three-way justify, with the analytics status sitting alone on the right.

- The two columns top-align, the signature row sits closer under the links, and the privacy row groups Privacy and Analytics settings with the status beside them. Desktop footer height drops from about 940px to 800px.
- The FX link label is "FX analytics, rebuild", so its destination no longer wraps onto a second line on phones while the other five stay on one.
- The floating Sections opener now steps aside once the footer is in view, so it no longer covers the live links on phones or the legal row on desktop.
- Checks: build and Astro check pass; the scoreboard, controls and polish suites pass. Footer checked visually at 1440 and 390.
### 11 October · FX on the shared blocks

The design review found that FX, the first case the panel opens, was built on an older template than the other four. Its journey ran full width on a dark chart with five coloured stage bands, its headings had no accent bar, its labels were sentence case where the others are capitals, its decision cards had no Trade-off and Outcome columns, and it had no Opportunities, Insight, Who was in the room and How I measure it block.

FX now uses the same persona, journey and decision blocks as Fusion, Winking Star, Deal Model and uoaui, fed from the same content file. The words are the words that were already on the page, moved into the shared structure. Two things are new, and both are mine to check: a "What the system does" line under each journey stage, written from the product behaviour the case already describes, and the Trade-off and Outcome lines on the three decisions, taken from the existing verdicts.

- The journey plot is still my vector, not a flattened export. It sits on the shared white panel, so the stems and loop arrows that were drawn white for the dark panel take the ink colour instead. The original decision loop stays as the flow figure, with its transcript in the shared "Read the flow" disclosure.
- The journey moved inside the research beat, at the reading width the other cases use, instead of a full-width band of its own.
- Image descriptions for the six decision charts are kept through a new optional alt field on a choice.
- Checks: build and Astro check pass. The figma-sync, heading and axe suites pass; the FX decision test now measures alignment against the chart card edge, which is what the shared block aligns. Blocks checked visually at 1440 and 390.
### 11 October · Deal Model screens re-synced with sample names

The thirteen Deal Model screens under `src/assets/img/figma-sync/` are re-exported from the working Figma file, where the client and colleague names were replaced with the sample names the page already uses. Same nodes, same 2200 pixel width, same pipeline. The cloud environment can reach figma.com again, which is what had held this back.

- Checks: build passes; the Deal Model, figma-sync and chapter-jump tests pass. Spot-checked the deals landing and the pricing grid at full size: Northwind, Acme and the sample owners, no real names.

### 11 October · One grid through every case

I kept the section label on the left and all the content on the right throughout the five case studies. Screens and process work no longer jump out to the page edge. The page has a maximum reading width, and product captures stay within the content column with their full proportions. Project status now uses the same label and copy alignment as the rows above it.

The FX data diagram is the original vector export from my supplied Figma node 305:336356, always visible, with horizontal scrolling on phones. I removed the duplicate recreated accordion and the export's canvas background. I also removed the repeated capture dates and source-link rows under screenshots; explanatory captions and recording descriptions stay.

### 11 October · The phone map has room to read

I made the fullscreen map larger on phones. In portrait, it opens on the selected stage and I can swipe across the wider map. Sideways, it uses the available height without reserving space for movement controls that the map does not need. Tapping a marker starts its stage; swiping does not. The movement controls return during play.

- Checks: production build and all 148 browser tests pass, including portrait and landscape map sizing, marker taps, swipe cancellation, and fullscreen exit. Visually checked at 390 × 844 and 844 × 390.

### 11 October · Home and case artwork match Figma

I synced the updated Deal Model collage on Home and Panel directly from the original Figma vector, keeping the separate mobile artwork. Fusion now uses the newer discovery and performance images from the working file. I checked the other home artwork against its Figma image hashes and kept the matching originals.

I also aligned the Figma case layouts, widened project status and kept the FX data graphic visible on desktop and mobile. My updated graphics and image fills stay intact; the layout edits use the existing nodes and original vectors.

- Checks: production build, Astro check and all 148 browser tests pass. Home artwork checked in the browser; desktop and phone case layouts and fullscreen map covered by the browser suite.

### 11 October · Flow steps start with the line

I moved the coloured rule above each workflow step, with space before the number and title. The shared flow component carries this across all five case studies on desktop and mobile.

I replaced the rebuilt FX journey with the exact original Figma vector export from node 120:4779, including its persona, chart, approach and phase descriptions. It stays readable with horizontal scrolling on smaller screens. The matching workflow rules in the current Figma case frames now sit above the steps too.

I removed the extra background and source footer from the original FX decision loop. Flow explanations now remain visible across every case, without an accordion.

I removed the extra white surround and padding from comparison graphics across the case pages. The original chart edge now defines the image boundary, matching Figma, without changing the artwork. I also expanded the FX flow text in the desktop and mobile Figma frames and hid its obsolete source captions and disclosure arrows.

Validation: production build and all 148 Playwright tests passed. I checked the comparison edges and always-visible transcript in Chrome. Figma comparison frames already had zero padding, so their artwork needed no changes.

### 11 October · Workflow arrows beside the titles
I moved the horizontal workflow arrows from the middle of each card to the title row. They now follow the title position, so longer descriptions and the Cancel branch cannot push them down. This applies to the shared workflow across all case pages; stacked phone steps retain their downward connectors.

I also replaced the four state-lane and fill-cluster schematics with the exact current SVG graphics from Figma. Their outer card borders and padding are gone, with the same cleanup in the desktop and mobile Figma frames. The original artwork and explanatory copy stay intact.

Validation: production build and all 148 Playwright tests passed. Chrome visual checks confirmed the arrow alignment and the exact four graphics.

### 11 October · Current FX screenshots and a readable journey

I synced all nine updated screenshot sources from my working Figma FX page, using the original uploaded PNGs. The full flow now includes the hover tooltip, candlestick view and pre-filled ticket. The outcome recording uses the updated comparison screenshot as its poster, and the tablet and phone captures match Figma. The source node mapping is in docs/figma-fx-screenshot-sync.json.

I separated the journey's persona, scenario, goal and phase descriptions from the tiny vector lettering. They now use 16px body text, wider two-column stage descriptions and a single column on phones. The thoughts, feelings and approach chart still uses my exact original SVG, unchanged. I added matching readable text layouts in Figma, kept its original vector artwork, and preserved the existing mobile stage descriptions.

Validation: production build and all 148 Playwright tests passed. I checked the desktop and phone journey layouts in Chrome and the revised Figma journey composition.

### 11 October · Persona colours match my latest Figma cards

I kept Dana's peach background, changed Marcus to light grey and Priya to pale blue, using the exact colours in the working FX frame. I also synced the active transparent portrait assets so the old peach image backgrounds do not sit on the new card colours. The shared card accepts a background per persona; other projects keep their existing colours.

The FX screenshot display now applies the original Figma crop transforms to the full-resolution source images. This preserves the authored framing, including the hover capture without browser chrome, while leaving the downloaded originals untouched.

Validation: production build and all 148 browser tests passed. I checked the persona colours and hover framing in Chrome.

### 11 October · Screenshot shadows match Figma

I removed the hard outline from the shared product screenshot frames and used the drop shadow from my working Figma figures: 0px horizontal offset, 16px vertical offset, 32px blur, -8px spread and 40% dark colour. My original screenshots and crops stay intact.

I also gave the tablet and phone capture group 24px of padding on every side, with the same soft shadow around each image.

I arranged the FX hero as an overlapping composition matching my reference: the full chart behind the comparison panel, with the order ticket in front toward the lower left. Each retains its full-size link and original proportions.

Validation: production build and all 148 Playwright tests passed. I checked the borderless shadow in Chrome, mobile page width, and the overlapping hero composition.

### 11 October · Readable journeys, exact vectors and Deal Model repairs

I applied the readable FX journey layout to Fusion, uoaui.ai, Winking Star and Deal Model on the site and in the desktop and mobile Figma frames. Persona, scenario, goal, stage descriptions and takeaways now use readable text. The original thoughts, feelings and approach artwork stays intact as SVG, with horizontal scrolling on phones and all supporting text visible by default.

I exported the three original vector panels for the overlapping FX hero. I removed the export's page background and baked shadow margins, so the foreground panels have transparent surrounds and one soft shadow. Raster product captures retain their original resolution; wrapping those in SVG would not improve their detail.

I repaired all six chosen/alternative comparison pairs in Deal Model's desktop and mobile Figma layouts using the exact assets on the live page. The broken editable copies are preserved but hidden. The current graphics and other uploaded screenshots stay intact.

Validation: production build and all 148 Playwright tests passed. I checked the transparent SVG hero, readable desktop journey, mobile page width and scrolling, and the repaired Figma comparison graphics.

### 11 October · Clean screenshot and video edges

I removed the added outer shadows from the lower product captures and tablet/phone screenshot groups. Their original image framing stays intact, and the overlapping FX hero keeps its separate soft shadow. I also removed the video element's one-pixel border, which showed as a pale line along its top edge.

I checked the current Figma sources: these lower screens are raster image fills, so I retained their original image data rather than wrapping the same pixels in SVG.

Validation: production build and all 148 browser tests passed. I checked the screenshot edges and confirmed the video border is zero in Chrome.

### 11 October · Updated Fusion screen artwork

I synced the latest Fusion screen artwork from my portfolio Figma file. Performance, Risk, widget configuration, screening and entity comparison now use the exact vector exports. The M3 configuration screen supports the design-system section; the M1 entity comparison supports the outcome section. I kept the internal UI details and removed only the export's outer canvas and shadow margins.

I refreshed the configuration, tablet and phone captures from their original uploaded image data, preserving my Figma crops. I also reserved space for lazy-loaded SVG screens and journey graphics so section links do not shift as artwork loads.

Validation: production build, desktop and mobile visual checks, and the full browser suite, including delayed-image navigation on Fusion and uoaui.ai.

### 11 October · uoaui.ai artwork and quieter journey phases

I synced my updated uoaui.ai builder, comparison, UI Kit, charts, forms, house-system and responsive screenshots from Figma using the original image data. The Mei Lin and Dev Patel portraits and card colours now match my updated artwork.

I removed the vertical colour bars beside journey phase headings across the case studies. Larger gaps separate the phases, while the horizontal rules above individual steps remain.

Validation: type check and production build, desktop and mobile visual checks, and the browser suite. The persona check now expects my revised uoaui.ai card colour.

I repaired the uoaui.ai desktop and mobile Figma spacing using content columns with consistent gaps. Empty caption space and legacy duplicate mobile persona content are hidden. The artwork, image fills and copy remain intact. I checked the resulting section bounds and both persona layouts.

### 11 October · Current Winking screens and tighter personas

I brought in my updated Winking Star iPhone screens and original theme artwork, then compared the app's four tabs with the web's weekly board. The web captures use my original components with fictional sample data. I found and recorded the web, iOS and shared source repositories so the images can be traced back to their originals.

I tightened the type and spacing in all fifteen persona cards and kept my updated portraits and colours. Fusion's opening Performance image now uses the current Figma screenshot; its detailed vector screens remain in the design section. The Fusion and Winking portraits now match the latest Figma assets.

I also created a current completion checklist. Distinct project journeys, the newly supplied Deal Model images, interview voice review and final whole-site design audit remain queued; this release does not claim those are finished.

## 12 October 2026 · Project-specific evidence and decisions

Replaced repeated journey structures with a trading intervention loop, analytical
workspace journey, AI review loop, family routine cycle, and Deal owner/system
blueprint. Expanded 21 decisions with alternatives, rationale, trade-offs, evidence
and delivery status. Cross-checked public product repositories and original Deal
Figma frames; corrected automatic Sample Family, component-only/export-gate,
auto-written approval and rebuild-versus-specification claims. Updated exact
Figma exports, including the original Deal owner and approver workflows.

Kept FX artwork as SVG and compacted exported paths and unused metadata. Hero
assets use three-decimal precision; high-resolution raster comparisons show mean
channel differences under 0.005/255. The data-encoding diagram is pixel-identical
in the comparison. Combined compressed hero bytes fell from 391,343 to 129,158;
the data diagram fell from 124,689 to 48,241. Explicit dimensions and image priority
protect the main image. Local mobile Lighthouse improved from 84 to 95, with LCP from 4.5s to 2.7s.
This loading result does not close the separate final scroll-smoothness review.

Verification logs: `/private/tmp/portfolio-final-check.log`,
`/private/tmp/portfolio-final-build.log`, `/private/tmp/portfolio-final-tests.log`.
See `docs/DELIVERY-CHECKLIST.md`, `docs/DECISION-AUDIT.md` and
`docs/IMPLEMENTATION-CROSSCHECK.md` for remaining scope and evidence boundaries.

Final local validation: Astro check returned 0 errors and 0 warnings (4 existing
unused-variable hints); the production build passed; all 149 Playwright tests
passed in 59.9 seconds. Source-art updates are included in this run.

### PR 49 follow-up · One colour per persona

**What Codex changed at my request**

- I wanted the persona cards to follow my reference: a portrait and identity on the left, a quote, context, goals and pain points on the right, with one coloured response panel.
- Each card now has white surfaces and one accent colour. The separate pastel portrait backgrounds are gone, and the four Deal portraits have transparent backgrounds.
- The same template is applied to all 30 desktop and mobile Figma cards. Existing product artwork is preserved.
- Fixed the Deal hero width so its overlapping screens appear on desktop and stack on phones. Corrected the Deal journey return path to the documented TXN/SK rate review.
- Validation: production build passed; 149 browser tests passed in 58.2 seconds. Persona checks cover all 15 cards at four widths, including text fit, portrait framing and consistent colour.

- Removed the 0.7-second screenshot and hero scroll catch-up so dense product UI stays steady. Final production build and all 149 browser tests passed in 58.9 seconds after this change.

### PR 49 final review · Original evidence and readable detail

**What Codex changed at my request**

- Product screenshots open their original files when selected, including the Deal hero. There are no extra caption bars. The phone check confirmed that the original image can be enlarged to inspect its detail.
- Removed three Deal alternative illustrations with unsupported claims. Kept the written trade-offs. Replaced the two smart-pricing panels with the original Figma dialogs and labelled both as exploration, not built in my time.
- Corrected the remaining FX benchmark and study wording, removed an unverified Fusion client-signing claim, and kept Deal template mapping separate from an unsupported blocking rule. Synced the corresponding editable Figma copy.
- Removed an unintended decorative avatar from the uoaui.ai introduction. The explanatory text and product screens now lead the page, matching the Figma structure.
- Validation: Astro check has 0 errors and 0 warnings; production build passed; all 149 browser tests passed in 1.1 minutes. Desktop and phone reviews cover the changed evidence, personas, home and utility pages. Production CI and live verification remain the release gate.

### PR 49 follow-up · Persona accents and theme-aware graphics

**What Codex changed at my request**

- Each persona has its own accent. The transparent portrait sits on the same colour as the response panel, and headings and quote marks match.
- Persona cards now adapt to light and dark mode. Dark cards use lighter versions of the same accents with dark panel text. Original portrait colours stay intact.
- Corrected the FX research attribution to observing traders on the desk. Winking accessibility copy now describes the implemented tab labels, text scaling and quieter celebration controls.
- Synced Figma persona colours to each page's actual theme and recorded both colour variants. Theme-aware journey and diagram exports preserve original paths while adapting neutral surfaces and text.
- Removed inherited portrait margins and flex gaps that added 52px above persona names. Kept a 20px name gap, increased content padding and spacing between cards.
- Removed the one-second fade from whole case-study sections so product evidence and body copy are visible as they enter the viewport. Heading motion remains separate.
- Added a 1px inner outline at 50% opacity using each persona's current theme accent. It overlays the card edge without changing layout dimensions.
- Final local verification after the inside outline: Astro check has 0 errors and 0 warnings; production build passed; all 149 browser tests passed in 52.9 seconds. Thirteen themed SVG outputs retain the exact original content after their added colour stylesheet is removed.

### PR 49 follow-up · Current Figma compositions

I restored the current Figma compositions across the home gallery, uoaui.ai, Winking Star and Deal Model. The original grouping, padding, overlaps and shadows are part of each export. Desktop and mobile home artwork have separate source exports. Winking’s lower iPhone sequence keeps its original four-phone composition on desktop and full individual phones on small screens.

I kept vector geometry intact and re-encoded embedded screenshots only when their decoded RGBA pixels matched exactly. The current twenty-two files total 64.8 MB at source and 38.1 MB after lossless encoding across both responsive variants. Original-resolution images remain available to open. The body-image comparison also restored three Fusion compositions whose source framing and shadows were missing. Mobile Deal now uses the current screen collage. The final performance check is still in progress.

### PR 49 final source and delivery review

I checked every project against the current Figma artwork and my interview notes after the image work. The audit covers 108 source groups and 146 active image references. I corrected unsupported research and outcome wording, kept estimates labelled, and separated original designs, public rebuilds and earlier explorations. The corresponding Figma text and spacing have been updated.

The home gallery now chooses smaller SVG files for its display size while retaining the original geometry and full-resolution source exports. Embedded screenshots are resized inside the SVGs; this does not turn raster detail into vectors. The four raster-bearing desktop covers fall from 8.31 MB to 2.48 MB at the reviewed size. The Deal covers remain vectors and are about 40% smaller, with only tiny subpixel differences in render comparisons.

Final local verification after the last source-art and responsive-size changes: Astro check has 0 errors and 0 warnings (4 existing hints), the production build passed, and all 149 browser tests passed in 53.5 seconds. Exact-head CI and production verification remain the release gates.

### PR 49 performance follow-up · Fusion image decoding

The remote release check caught Fusion desktop at 94, below the required 95. Its largest image painted in 0.9 seconds, but main-thread blocking reached 180ms. The second hero carried a 4096×2392 embedded screenshot at a much smaller display size.

I added six responsive SVG versions for the two Fusion hero compositions. The 800px performance version decodes about 0.4 million pixels instead of 9.8 million. The composition, shadows and vector geometry stay intact; selecting the image still opens the original full-resolution export. The configuration artwork remains a vector. Render comparisons and source hashes are recorded in the Fusion delivery reports.

After this change, Astro check has 0 errors and 0 warnings, the build passed, and all 149 browser tests passed in 53.7 seconds. The remote performance gate must pass before publication; its threshold has not changed.

### PR 49 final delivery sizing · Winking Star, Deal Model and uoaui.ai

The complete local performance pass found oversized embedded hero screenshots on three more case pages. I added responsive SVG versions for those compositions as well, retaining their original paths, clipping, backgrounds and shadows. Smaller display versions use quality-95 WebP for resized screenshots where needed; this is display optimization, not vector conversion. The original full-resolution files remain available through the image links.

The final 800px Winking and Deal hero versions transfer about 76.5 KB and 92 KB gzipped. I sized their embedded screenshots to the actual phone/screen footprint with extra sampling room. All 16 variants retain the original SVG geometry, and paired render proofs show the composition intact. All 14 local Lighthouse checks now meet the 95 minimum; other categories score 100. Remote exact-head validation and production checks remain required.

Final local validation passed: 149 browser tests in 53.6 seconds, including the reduced-motion check. That test now waits up to one second for the browser's media-change event instead of asserting before the event is processed; it still requires the transform to return to zero.

### PR 49 release-test reliability

The remote browser run exposed a test-driver problem on the AI game's narrow platforms. The trace showed the automated player overshooting a landing and returning to its checkpoint, rather than a blocked tile. The driver now reads the level's landing surfaces and brakes with ordinary keyboard input. Three consecutive completion runs passed; the engine, assistance settings, time budget and completion assertions are unchanged. The artwork motion test now waits for its existing settling condition instead of assuming a fixed delay is sufficient on a busy runner.

### Mobile product images and dark-mode surrounds · 12 October 2026

I made the product heroes fill their available column on phones. Winking Star's centred hero was shrinking to 117px in a 350px space; it now uses the full width without cropping the phones.

The outer backdrops in my project compositions, individual Winking phone exports and home gallery now become transparent in dark mode. Light mode keeps the original colours. The screens themselves stay unchanged, and selecting an image still opens the full-resolution original. This uses the existing responsive images and adds no image downloads on a theme switch.

Validation: Astro check reports 0 errors and 0 warnings, production build passes, and all 152 browser tests pass. The new checks cover five products at four widths, exact preservation of all 84 source/derivative SVGs, and rendered dark/light background pixels with unchanged phone-screen pixels.

### Phone background correction · 12 October 2026

My phone still showed the cream image surround after the first fix. The previous version depended on the browser passing the site theme into an external SVG. I now remove the audited outer fills in the delivered files, so the page shows through in both themes. New image URLs avoid the previously cached version; the original product screens and full-size source files stay intact.

A controlled dark-page/light-image-container check failed on the previous implementation and passes with explicit transparency. The image regression suite now runs in Chromium and iPhone-configured WebKit. Current WebKit alone did not reproduce the original in-app behaviour, so the new checks also verify the files contain no theme-dependent background rule.

Validation: Astro check has 0 errors and 0 warnings; the production build and all 155 browser tests pass, including the three media regressions under iPhone-configured WebKit.

The remote release checks exposed startup rendering pressure on the homepage. I let the browser defer drawing off-screen product previews while their existing aspect ratios reserve the same space. All 155 browser checks pass again, including home-gallery geometry and scroll motion; the performance threshold remains unchanged.

### All-project content and image audit · 12 October 2026

I checked the home gallery and all five case pages, including images within the case content. Deal Model's overlapping hero is included in the transparent presentation backgrounds, alongside Fusion, Winking Star and uoaui.ai. FX's hero exports are already fitted to the product UI.

I also removed the browser-theme dependency from 13 journey and schematic images. Each now has explicit light and dark versions selected by the page theme, preserving its geometry and alt text. Product screenshots keep their actual interface colours. Persona cards and HTML diagrams already use the page's theme tokens. The project-by-project inventory is in `docs/PRODUCT-MEDIA-THEMES.md`.

I replaced the emoji-capable diagonal arrows in the shared Sections button and All projects link with a flat, current-colour SVG icon. All five case pages share that component, so iPhone can no longer substitute its blue emoji tile.

Validation for the expanded audit and arrow fix: production build passes, Astro check reports 0 errors and 0 warnings, and all 157 browser tests pass. The phone-sized Deal Model and Sections-panel previews were inspected and saved. The previously reported remote performance gate remains unresolved; these changes have not been published to production.

I extended the flat SVG arrow to every decision index, alternative marker and game-journal source link. The downward decision arrows keep their original direction, without relying on the phone emoji font. All diagonal-arrow characters are removed from the shared components.

### Journey connector alignment · 12 October 2026

I checked the journey graphics against the editable Figma source. Winking Star, Fusion, uoaui.ai and Deal Model had loop endpoints between dots and label rows that overlapped. I aligned the endpoints with the existing dots, gave each label a separate row, and preserved the authored text outlines and colours. FX already uses aligned endpoints and keeps its original map.

I checked all five rendered journey studies. The production build and all 161 browser tests pass, including new checks for connector attachment and label separation in both themes. Astro check reports no errors or warnings. This release also includes the earlier product-surround transparency and flat SVG arrow corrections. Shannon explicitly requested publishing the complete set of changes.

### Figma decision maps · 12 October 2026

I drew all five decision maps in Figma first, using the original FX loop as the visual reference. Each map follows the current project content, with deliberate decision points, exception branches and return loops. The text and nodes remain editable in Figma.

I added the exported light and dark graphics to each project, with a Figma source link, full-size view, keyboard-accessible horizontal scrolling and a complete text version. On phones the map starts on the central path. I embedded the site's Inter font so browser rendering keeps the Figma typography. The original FX diagram remains available as a reference.

Validation: production build passes; Astro check has zero errors and warnings; all 181 browser tests pass, including the new map checks in Chromium and iPhone WebKit. I visually checked the Figma maps and the website at desktop and phone sizes.

### Readable comparison artwork in dark mode · 12 October 2026

I restored a white backing behind the decision-comparison artwork across all five projects. Some images contain dark labels over transparent areas, which disappeared against the dark page. The backing preserves those labels and the original artwork colours. Product heroes remain transparent; journey and decision maps keep their explicit theme variants.

I visually checked the reported payment, onboarding and weekly-pet comparisons on a phone-sized preview. Browser regressions check every comparison in both themes at phone and desktop widths, including iPhone WebKit, while the existing checks protect transparent hero artwork.

### Figma user flows for all five projects · 12 October 2026

I reviewed user-flow examples from Figma and Nielsen Norman Group, then drew each project's flow in Figma using the current case content. The diagrams show who acts, the central path, alternate states and return loops. I kept the optional routes optional and marked FX's original specified sequence separately from the public demo.

I added light and dark exports to all five projects, with readable phone scrolling, keyboard panning, a Figma source link and a complete text version. The original workflow copy remains available below each graphic. Winking Star's caregiver steps link to the same shared-family flow.

Validation: production build passes; Astro check reports zero errors and warnings; all 203 browser tests pass, including the new flows in Chromium and iPhone WebKit. I checked that branch labels clear the nodes and every connector segment avoids unrelated nodes.

### Winking Star shared case layout · 12 October 2026

I brought Winking Star's introduction into the same label and content grid as the other cases, removing the inset promotional card while keeping its copy and illustration. The product links now sit with the shared hero metadata, and the persona illustration note stays inside its section's reading column.

I removed the old Winking-only page styling hook so case headings, row labels and outcome figures use the shared typography and theme colours. The actual product demo and artwork retain their own identity.

Validation: production build passes, Astro check reports zero errors and warnings, and all 204 browser tests pass. I checked desktop and phone layouts in both themes, including section alignment and the preserved transparent product hero.

### Maps that fit phone screens · 12 October 2026

I made the new decision maps and user flows fit the available width by default, so the whole diagram is visible on a phone. A shared Enlarge map control restores the readable detail view, centred on the main path with horizontal scrolling. Fit to screen returns to the overview. Both views follow the page theme and preserve the original graphic proportions.

Validation: production build passes; Astro check reports zero errors and warnings; all 204 browser tests pass. Map checks cover 320, 390, 760 and 1440px widths in both themes, including the enlarge/fit controls in Chromium and iPhone WebKit.

### Whole-site UX consistency review · 12 October 2026

I reviewed the home and panel pages, all five cases, Privacy, the build log and the missing-page screen. I added a clear Menu on small screens so every project is discoverable, and I put each case's Sections links in the same order as the content. Winking Star's introduction is now included in its index.

I brought the supporting pages into one shared layout with navigation, theme controls, a skip link and consistent reading spacing. The active project now stays highlighted in both themes. I also made the analytics notice follow the site colours and kept the missing-page return link readable when changing theme. The case copy, product screenshots and project-specific diagrams remain intact.

Validation: production build passes; Astro check reports zero errors and warnings; all 216 browser tests pass across Chromium and iPhone WebKit. I checked phone and desktop layouts, both themes, real mobile-menu navigation, section order, utility-page accessibility, consent-notice contrast and the existing media/game regressions. The review record is in docs/UI-UX-REVIEW.md.

### Evidence-led panel presentation · 12 October 2026

I now lead with Fusion and Winking Star, followed by FX, Deal Model and uoaui.ai. The navigation, case numbers and next-case links follow that order. Each case has a concise contribution, delivery and evidence summary after its opening product images, while the detailed narrative stays intact. The optional career game follows selected work on the panel page.

I added my confirmed Fusion component-audit and developer-review work, the Winking Star launch year, and the connection between my legal publishing name, Yu-Hsuan Chen, and Shannon Hecker. I have not added unmeasured outcomes. Outstanding evidence questions are tracked in docs/REVOLUT-EVIDENCE.md.

Validation: production build and Astro check pass, with zero errors and warnings. All 218 browser checks passed for the presentation changes; the final publishing-name copy is also checked with the responsive shell and evidence-summary checks. The tests cover the new reading order, the relocated game link, summary placement and contrast in both themes. I reviewed the desktop and phone presentation.

### Confirmed project timeline · 12 October 2026

I confirmed that Deal Model came before my move to Fusion in 2023, without overlap. I removed the incorrect January 2024 involvement endpoint from the Deal Model status, narrative and summary. I have not inferred a start date.

I split the case-summary browser check by project so Safari does not have to load ten pages and run twenty accessibility scans inside a single 30-second test. The assertions and viewport/theme coverage are unchanged. Production build and Astro check pass; the full suite now contains 226 checks.

### Scoped Fusion accessibility evidence · 12 October 2026

I clarified that my Fusion accessibility work covered a specific flow, working closely with an ADA specialist and using developer-tool checks. I replaced the broad zero-violations claim in the outcome, journey takeaway and How I work section. I do not claim a product-wide audit or formal certification from those checks.

Validation: production build and all 226 browser checks pass. A source search confirms the unscoped zero-violations wording is removed from the rendered portfolio content.

### Full-width mobile navigation · 12 October 2026

I replaced the inset mobile menu card with an edge-to-edge panel attached to the header. The same menu now spans tablet widths too, with generous link rows and subtle separators in both themes. In landscape, the links scroll within the available screen height while the menu toggle remains reachable.

Validation: I reviewed phone, tablet and short landscape previews. The browser checks now assert full-width placement across every page and exercise scrolling to the last link on a short screen, alongside the existing navigation and keyboard checks.

### A simpler header and a dedicated mobile menu · 12 October 2026

I reduced the phone header to my logo and a familiar hamburger icon. Opening it reveals a full-screen menu with larger project links, an explicit close icon, and a separate area for Appearance and Contact. The background page stays still and cannot receive keyboard focus while the menu is open.

The close control stays visible while the menu contents scroll in landscape. Escape restores focus, project links dismiss the menu, and returning to a larger screen releases the page. The light and dark menu surfaces switch together so text stays legible. I reviewed phone, tablet and landscape layouts and added checks for focus containment, page isolation and responsive cleanup. Existing theme tests now use the appearance control inside the mobile menu.

I limited this redesign to phone widths at 760px and below. Tablet screens keep the previous Menu button, header controls and full-width dropdown; desktop navigation is unchanged.

### Case-study content is visible without expanding · 12 October 2026

I removed the expandable disclosures from all five case studies. Decision-map explanations, user-flow steps, original workflow summaries, the FX reference diagram and Winking Star caregiver steps now appear directly in the page with ordinary headings. I kept all the content and added browser checks that the text is visible without clicking and case-study main content contains no disclosure elements.

### Consistent preview sizing and card frames · 12 October 2026

I fixed the next-project preview layout that squeezed Winking Star screens into a narrow column on phones. Every next-project link now uses the same responsive artwork as the selected-work gallery, filling the mobile width and occupying a dedicated media column on larger screens.

I removed the emoji-rendered return arrow in the Fusion journey; the existing loop explanation remains visible. Comparison artwork now sits inside a consistently padded white frame, avoiding conflicting image and container corners while preserving readable text and the source image proportions.

Validation: production build and Astro check pass. Browser coverage checks all next-project previews at phone, tablet and desktop widths, including native image proportions and placement beneath the mobile description.

### Illustrated workflow summaries · 12 October 2026

I replaced the text-only original workflow summaries across all five projects with illustrated sequences drawn in Figma. I used Nielsen Norman Group's wireflow examples as the reference for pairing an action with a small screen illustration. The graphics keep my existing workflow wording, the FX cancel branch and the distinction between the specified flow and the public rebuild.

The editable Figma page contains light and dark versions. Individual SVG exports reflow into a single readable column on phones and two columns on larger screens, without a zoom requirement or collapsed content. Each case links to its Figma source. The manifest in src/data/figma-workflow-summaries.json records the source nodes and reference.

Validation: Astro check reports zero errors and warnings. The regression run passed 240 checks; two Safari checks interrupted during the typography rebuild passed on rerun. All 56 final workflow and UX checks pass in Chromium and WebKit, including readable scaling, both themes, text bounds, navigation and accessibility. I reviewed the Figma compositions and the phone/desktop website renderings.

### Illustrating the explanations · 12 October 2026

I reviewed the five cases for prose that describes relationships or behaviour, using C4 relationship diagrams and NN/g service-blueprint examples as references. I replaced Fusion's repeated system-layer explanation, uoaui.ai's mapping stack, FX's constraints, Deal Model's shared-object/template/compliance explanations, and Winking Star's six edge-state paragraphs with editable Figma illustrations and concise labels.

The graphics replace the selected prose rather than sit beside duplicate paragraphs. My research accounts, design trade-offs, outcomes and evidence limitations remain explicit. Both themes use the site's typography and readable phone layouts; no content is placed behind accordions. The source manifest is src/data/figma-explanations.json.

Validation: production build and Astro check pass with zero errors and warnings. All 252 Playwright checks pass, including Chromium and WebKit coverage of the new artwork at 320, 390, 820 and 1440 pixels in both themes. I reviewed the editable Figma compositions and the phone and desktop website renderings.

### Detailed and scoped explanation diagrams · 12 October 2026

I refined all 17 Figma explanation diagrams to name the actors, dependencies, transitions and implementation scope. Fusion now explains the direction of its layer dependencies; Deal Model shows four views of a shared record rather than a handoff; uoaui.ai shows the component/fallback branch and my review loop. Winking Star separates web and iPhone entry and describes the offline queue, midnight rollover and accessibility settings. I kept unspecified behaviour labelled and retained the original case evidence. The accessible descriptions now include the diagram labels.

Validation: production build and Astro check pass with zero errors and warnings. I inspected all five revised Figma compositions, corrected the mapping branch endpoints, and reviewed phone dark mode and desktop light mode in the browser. Responsive tests cover both themes at 320, 390, 820 and 1440 pixels.

### Remove duplicate flow transcripts · 12 October 2026

I removed the User flow in detail and Actions, branches and returns sections from all five case pages. The visual flow and illustrated Workflow at a glance remain together, without the duplicated prose between them. I also removed the image description promising a text section that no longer follows.

Validation: production build and Astro check pass. The full browser run passed 231 checks; 21 Safari checks failed during a widespread slowdown involving menu clicks, navigation and theme changes. Three passed on a sequential retry; the remaining run was stopped after continued stalls. Chromium verifies the section removal on all five projects. Safari verification remains incomplete.

### Remove public Figma links · 12 October 2026

I removed View in Figma links from the flow maps, decision maps, workflow summaries and explanation graphics across every case. I also removed the unused external source URLs from the product artwork metadata. Figma source manifests remain in the repository for editing.

Validation: production build and Astro check pass. All five built case pages contain no Figma links. The attempted browser checks timed out amid continued local browser slowdown and were stopped; browser regression verification is incomplete.

### Restore the homepage Winking Star backdrop · 12 October 2026

I added a consistent support surface behind the Winking Star homepage preview at every viewport: warm cream in light mode and muted green in dark mode. Both sizes now use the same Winking Star composition because the separate mobile artwork retained a baked-in beige tint. The image scales proportionally, and neither size floats directly on the page background. Case-study artwork is unchanged.

Validation: production build and Astro check pass. The homepage artwork check passes at 390, 1280 and 1512 pixels with both theme backgrounds. I inspected the resulting screenshots and confirmed the mobile beige tint is gone.

### Sharp vector Fusion hero · 12 October 2026

I replaced the bitmap hero captures with native SVG screens from my supplied Analytics M1 Figma source. Discovery sits above and to the right of Performance, following my working-page composition. I reduced the overlap enough to preserve the discovery table in the shorter source design. Both screens scale proportionally on phones, retain their product surfaces in both themes and open at full size. The source nodes and export framing are recorded in docs/fusion-vector-hero.json.

Validation: production build and Astro check pass with zero errors and warnings. All five focused media and hero checks pass across Chromium and WebKit. I inspected the composition at 390 and 1440 pixels in light and dark mode and confirmed both SVGs contain vector paths with no embedded images.

### Restore diagram card typography scale · 12 October 2026

I stopped workflow and explanation SVG cards from stretching beyond their authored 336px width. Their headings now stay at 20px and body copy at 16px, matching the surrounding site instead of growing with wide desktop columns. Both shared components use the same compact two-column grid and switch to one column on small phones. This applies across all five projects and both themes, with the original artwork and wording preserved.

Validation: production build and Astro check pass. All ten Chromium checks pass across five projects, four viewport widths and both themes, covering text bounds, overflow and the new maximum artwork size. I visually reviewed the Fusion explanation cards at their corrected scale.

### Remove repeated decision-map prose · 12 October 2026

I removed Decision map in detail and Branches and return loops across all five projects. The themed diagrams and enlargement controls remain. I also removed the image description promising a following text version and the unused transcript styles.

Validation: production build and Astro check pass. All five Chromium map checks pass, covering both themes, phone sizing, enlargement and absence of the removed text.

### Rounded Winking Star tags · 12 October 2026

I gave the four product labels fully rounded pill corners so they read as tags. Their wording, colours and noninteractive span markup remain the same.

Validation: production build and the Winking Star layout check pass. Browser inspection confirms all four labels use the pill radius.

### Remove repeated persona captions · 12 October 2026

I removed the two requested captions, “Composite roles, not research participants” and “Role illustrations, not photographs of research participants”, wherever those lines appeared. Empty note paragraphs no longer render. Persona cards and their content remain.

Validation: production build passes; five case layout checks pass. The two requested strings are absent from the source.

### A family-specific Winking Star journey · 12 October 2026

I replaced Winking Star's qualitative emotion curves, invented scenario quotes and timing labels with a journey grounded in the family routine. It separates optional sample entry from creating a board, the repeating daily routine, weekly progress and a second adult joining at any time after setup. The other project journey studies remain unchanged.

I also refined all four Winking Star workflow cards in their Figma source, in both themes: named child selection, a labelled seven-day routine grid, growth stages and an invite-to-shared-board handoff. The card titles are now 16px and descriptions 14px. The site uses fresh SVG exports, with the existing source node IDs recorded in the manifest.

Validation: production build and Astro check pass with zero errors and warnings. Five focused Chromium and WebKit checks pass for the journey relationships, visible steps, card text bounds and theme switching. I reviewed the Figma cards and the site at phone and desktop sizes.

### Full-card app icon and separate FX captions · 12 October 2026

I expanded the original Winking Star icon to fill a square image card, using responsive exports from the 1024px original, and moved its caption beneath the artwork. I separated the six FX workflow illustrations from their headings and descriptions so the copy uses normal site typography outside the graphic panels.

Validation: production build and the Winking Star layout check pass. The FX summary check passes across four viewport widths and both themes. Browser inspection confirms the icon fills the card at 390px and 1440px without distortion.

I also separated the three Deal Model explanation diagrams from their captions and reduced the long Deal Model introduction to the site's 16px body size. The Deal Model explanation browser check passes in both themes across four widths.

### Clear Winking Star branch spacing · 12 October 2026

I moved the Sample Family branch below the entry decision's bottom border and left a 6px gap at the outgoing and incoming box edges. The Try it label follows the new route. Both theme exports and the branch source coordinates are updated.

Validation: production build and two Winking Star map checks pass; I inspected the connector spacing in the rendered SVG.

### Separate diagram captions across all projects · 12 October 2026

I extended the separate graphic-and-copy treatment to every workflow summary and visual explanation across Fusion, FX, Winking Star, Deal Model and uoaui.ai. Titles and descriptions now render as normal HTML beneath the illustration; diagram labels remain inside the artwork. Text wraps naturally at 18px for headings and 16px for descriptions.

Validation: production build and ten targeted browser checks pass across all five projects, four viewport widths and both themes.

### Remove caregiver handoff link · 12 October 2026

I removed the requested caregiver handoff link above the shared-board steps on Winking Star.

Validation: production build and the Winking Star layout check pass.

### Consistent spacing across the portfolio · 12 October 2026

I reviewed the homepage and all five case studies at phone, tablet and desktop widths. Case summaries now have 32px top and bottom padding, more space under their labels, and consistent separation before the evidence note. I removed the negative margin that squeezed FX's delivery status against the preceding content.

I consolidated case content spacing around 32px on smaller screens and 48px on desktop, removing doubled margins on diagrams and sections. Illustration captions have 20px separation from artwork, and card rows use 32px on smaller screens and 40px on desktop.

Validation: production build and 17 browser checks pass, including all-page navigation and overflow, all five case summaries, diagram captions in both themes, and a new spacing regression check. The six-page audit reports no overlapping content blocks or horizontal overflow at 390px, 820px and 1440px. I inspected the corrected summary at phone and desktop sizes.

### Remove the duplicate FX map · 12 October 2026

I removed the FX decision-map graphic because it repeated the full user flow. The section now says Design decisions, including its section-menu label, while the trade-offs and main user flow remain.

Validation: production build and a browser regression check confirm the duplicate map is absent and the main flow remains.

### Deal Model homepage artwork background · 12 October 2026

I added a muted rose background behind the Deal Model screen composition, with a deeper surface in dark mode. The background fills the image frame at mobile and desktop sizes.

Validation: production build and three review-polish checks pass. Browser inspection confirms the background colours in both themes at 390px and 1440px.

### Subtle Deal Model screenshot edges · 12 October 2026

I masked the bright outer pixel baked into the Deal Model gallery screenshots and replaced it with the subtle theme-aware divider colour. Full-size originals remain available through the image links.

Validation: production build and Deal Model layout check pass. I inspected the rendered screenshot edge.

### Aligned section-title motion · 12 October 2026

I replaced staggered, scroll-scrubbed word masks with a single 500ms heading entrance using a small 12px rise and fade. Words stay on their shared baseline throughout the animation, and headings remain settled when scrolling back. The CSS fallback also fades words together without moving them separately.

Validation: production build passes. Browser checks cover the heading throughout its animation, reduced motion, touch overflow and existing homepage scroll effects. All four checks pass after adapting the heading test to the site's deferred scroll initialization.

### Match the supplied artwork backgrounds · 12 October 2026

I matched the Winking Star preview to the supplied warm cream reference and Deal Model to the neutral grey surface in Figma node 288:466. I removed the added Deal Model inset to restore the edge-to-edge composition. These artwork surfaces keep their reference colours in both site themes.

Validation: production build and homepage artwork framing/theme checks pass at phone and desktop widths.

### Consistent case introduction typography · 12 October 2026

I reduced the Fusion introduction and the matching FX, Winking Star and uoaui introductions to 16px with 1.7 line-height, matching Deal Model. This replaces a viewport-based size that reached 23px and keeps the reading measure at 40 characters.

Validation: production build and all five case-summary browser checks pass. The checks now assert 16px introduction text at phone and desktop widths.

### Re-render Deal Model hero shadows · 12 October 2026

I inspected the original stakeholder-summary file and traced the unwanted glow to two purple, upward-offset shadows in the existing hero export. I replaced them with one neutral 14% black shadow, a 6px downward offset and 7px blur in the source SVG and all four responsive versions. The embedded product screens and their placement remain unchanged.

Validation: production build and Deal Model layout check pass. I inspected fresh light and dark renders and refreshed the responsive asset provenance hashes.

### Hiring-review fixes · 12 October 2026

I reviewed the live site as a Revolut hiring panel would and fixed what that review found. The case order is now FX, Fusion, Deal Model, Winking Star, uoaui.ai, with the optional game after the selected work on both the home page and the panel page. Deal Model shows 2022 to 2023 in its eyebrow and index line. The uoaui.ai status says which parts are public and which need an invited sign-in.

The scrolled navigation is now 92% opaque with a stronger blur, so headings no longer read through it on a phone. Decision images keep their white padding in the light theme and sit on the raised dark surface with a hairline in the dark theme. Five Deal Model screens that had a tall band of empty canvas between the table and the footer are trimmed to the content plus a 48px margin, with the footer kept; the originals stay beside them as the sync sources. Section reveals take 450ms with a 16px rise instead of one second and 32px. The analytics choice box is smaller so it covers less of a phone screen.

Fusion and FX outcomes are plain statements rather than stat tiles with words in them, and the FX section is labelled "Status and planned measures" because the measures have not run yet. Winking Star keeps its three real figures.

Copy: I removed the repeats, not the facts. The "How I tested" lists under the Fusion and FX decision maps said what the decision records already say. The "Original journey study" curves and quotes were labelled as not evidence, so they are gone. The journey takeaways now keep only "Opportunities" where it is not repeated in the outcome; "Insight", "Who was in the room" and "How I measure it" restated the problem, the role and the outcome sections. Each decision keeps "Why I chose it", "What it cost" and "What informed the decision"; "Where it stands" repeated the status line above it.

The FX decision section is labelled "Decision map" like the other four cases; it was the one page calling it "Design decisions", and the navigation test for it had been failing.

Validation: production build passes and all 256 Playwright tests pass. Four test expectations changed with the design: the header blur and opacity, the next case after uoaui.ai, the dark-theme image surface, and the count of themed journey artwork.

### Spacing consistency and reading comfort · 12 October 2026

I measured every computed padding, gap, font size and line height across all pages at phone, tablet and desktop. Body text sits at 16 to 17px with 1.65 to 1.8 line height, which is comfortable, so the fixes are about consistency. Sub-heading labels now sit 12px above their text everywhere; before, the same role used 8, 10 or 12px depending on the component. Leads are capped at 52ch and the case summary note at 70ch, because both ran past 80 characters a line on desktop. Captions, status lines and art notes that were 13px are 14px. The Deal Model constraints caption no longer repeats the upload-template sentence that "What was mine" already says.

Validation: production build passes and all 256 Playwright tests pass.

### Content-strategy pass · 13 October 2026

Each case told its flow three times: the user-flow diagram, the "Workflow at a glance" cards and the user journey. Shannon chose to keep the diagram and the journey, so the cards are gone from all five cases. FX section 04 "Explorations" was one paragraph under a heading that promised more; its words now open section 04 "Decisions and trade-offs" and the later FX sections renumber. "How I work" names Corporate Action Manager, Data Manager and MarketsOne, none of which has a case here, so a line under the principles says where they are. I checked shannonhecker.com before writing it: MarketsOne is there, the other two are not.

Validation: production build passes and the full Playwright suite passes; the illustrated-summary test went with the cards it tested.

### Winking Star: one place for the second adult · 13 October 2026

The journey's "Another adult can pick up here" block repeated the "Two adults, one shared board" caregiver steps, which also carry the offline state. The journey block is gone; the caregiver steps stay.

Validation: production build passes and the Playwright suite passes with the journey step count updated.

### No white edges on screenshots · 13 October 2026

Shannon spotted uneven white edges around the Deal Model screens on her phone. The Figma exports carried a thin stroke and a soft white gutter that differed by side: 4 to 22px on the left, 4 to 12px on the top, 4px right and bottom. Every Deal Model screen is now cropped to the app frame itself, measured from where the dark header and footer begin. The same pass found white borders on the uoaui.ai, Deal Model approval and Winking Star decision images (30 to 80px, uneven), so those are cropped to their content edge too. Originals stay beside the trimmed copies as the sync sources.

Validation: production build passes and the full Playwright suite passes.

### Decision images keep their white surface · 13 October 2026

The decision illustrations are transparent PNGs. My dark-theme frame from 12 October put them on the raised grey surface, which made dark-green text on the Winking Star and uoaui.ai cards hard to read, and the first edge trim had also flattened their transparency. The trims are redone with transparency kept, and the image itself now carries a white surface inside the frame in both themes.

Validation: production build passes and all 246 Playwright tests pass.

### No dark frame around decision images · 13 October 2026

Shannon asked for the decision images to sit on the same white card in dark mode as in light mode, with no grey frame. The dark-theme frame from 12 October is removed; the white padded card is the only surface in both themes.

Validation: production build passes and all 246 Playwright tests pass.

### Next-case artwork keeps its surface · 13 October 2026

The Winking Star and Deal Model compositions have their own cream and grey surfaces on the home page, but the next-case row at the end of each case drew the same artwork straight on the dark page. The surface rules now apply in both places.

Validation: production build passes and all 246 Playwright tests pass.

### Remove the pointer line under "How I work" · 13 October 2026

Shannon decided the line about Corporate Action Manager, Data Manager and MarketsOne is not needed, so it is gone. The principles keep their references as written.

Validation: production build passes and the Playwright suite passes.

### Align the two FX monitoring columns · 13 October 2026

In "While the order is working" the right column had a rule, a caption and a closing note, and the left column had none, so steps 03 and 04 started at different heights. Both columns now share the same structure. The left caption and note are my existing sentence split in two: "On schedule and inside the benchmarks" above the step and "Keep working and stay passive." below it.

### Looser footnotes in the explanation diagrams · 13 October 2026

The two-line footnote in every explanation card sat 11px under its rule and 18px above the card edge, with a 19px line. It now has 16px above, a 20px line and 24px below, the same breathing room as the label at the top of the card. All seventeen cards change together because the spacing is applied where the artwork is placed, not in each file.

Validation: production build passes and the full Playwright suite passes.

### Two FX diagrams, two jobs · 13 October 2026

The decision loop and the user flow on the FX page looked like the same chart twice. Both stay, with headings that say what each one answers. The loop is "Decision loop · when to step in". The flow is "Reprice flow · one intervention, step by step", and its first line says it follows one branch of the loop above, the reprice, from the drag to the audit record.

Validation: production build passes and the full Playwright suite passes.

### Link preview image resolves · 13 October 2026

The share image and canonical address were built against shannonhecker.com, my older public site, where those files return 404. Anyone pasting the portfolio link into email, Slack or LinkedIn got a card with no picture. The site address now points at the host that serves it.

Validation: production build passes and the full Playwright suite passes. I checked the share image address returns 200 on the live site.

### Light version of the FX decision loop · 13 October 2026

In the light theme the decision loop showed its dark nodes on a white page. I duplicated the original Figma frame beside the deck, recoloured the copy with the same light palette the other light diagrams use, and exported it at the same size with a transparent background. Light mode now shows the light copy; dark mode keeps the original. The original frame is untouched.

Validation: production build passes and the full Playwright suite passes. I checked both themes on phone and desktop.

### A share card for link previews · 13 October 2026

The link preview used a dense FX screenshot that turned to grey at thumbnail size. It is now a 1200 by 630 title card built from the site's own parts: my logo mark, the hero line, my name and role, and the pixel avatar in her arch.

Validation: production build passes and the full Playwright suite passes. I checked the image address returns 200 on the live site.

### No flash when the game leaves full screen · 13 October 2026

Leaving the game on a Mac flashed. The game dropped its dark full-screen styling the moment I pressed Escape, while the browser was still animating out of full screen, so for half a second it animated a box that had already snapped back to its in-page look. The styling now stays until the browser has finished leaving full screen.

Validation: production build passes and the Playwright suite passes, including the game and controls specs.

### Game on a phone: sideways layout and sound · 13 October 2026

Held sideways, the full-screen game was cut off at the top and its controls fell off the bottom. A rule added on 11 October re-showed the World map, Timeline and Sound bar and the caption in full screen, which overrode the sideways rule that hides them. Sideways now hides the caption and keeps only a small Sound button in the top-left margin, so the game fits the height again.

Sound did not play on an iPhone for three reasons, all fixed. The Sound button was unreachable sideways. The audio started after an awaited import instead of directly in the tap, which iPhone Safari refuses. And an iPhone with its ringer switch on silent mutes this kind of audio unless the page asks for playback. Any later tap also retries, so sound cannot stay stuck.

### J.P. Morgan title matches LinkedIn · 13 October 2026

My LinkedIn title for 2023 to 2025 is Digital Product Designer VP. The site said "VP of Product Design", which reads like head of a function. The hero, the page description, the Fusion role line and the game timeline now use the LinkedIn wording. The game timeline also says Lead Product Designer for Barclays, as LinkedIn does, and lists Deal Model with the 2019 to 2023 work.

Validation: production build passes and the full Playwright suite passes.

### Work titles stay readable while they scroll in · 13 October 2026

On the home page each project title and its description faded up from 25 to 30% opacity as they scrolled in, and only reached full strength two fifths of the way up the screen. They now keep the small rise but hold full opacity the whole way, so a heading is never dim.

Validation: production build passes and the full Playwright suite passes. I measured the title at eight positions down the screen on phone and desktop: opacity 1 at every one.

### Home page no longer stalls on scroll and hover · 13 October 2026

On desktop the home page froze for a moment while scrolling and when moving the mouse over the work list. Each work image is a vector file of 1 to 3 MB. It grew from 97 to 100% as it scrolled in and by 2.5% on hover, and every step of that growth redrew the whole file. It also shared a drawing surface with its title, so the title's motion redrew it too. The images now sit on their own layer and no longer scale. They keep their upward drift.

Validation: production build passes and the full Playwright suite passes. Scrolling the work list and back went from three stalls per pass to none in my measurement, and hovering from four to none.

### One entrance, not two · 13 October 2026

Arriving on a case page from a link played the title and hero image in twice. The page transition brought them in, and when it finished their own load animation started again from invisible. The load animation now stays off for any page reached through a transition. Section headings had the same problem when the scroll effects loaded while a heading was already on screen, for example after a refresh part-way down a page: it was hidden and faded in a second time. Headings already on screen are now left alone.

Validation: production build passes and the full Playwright suite passes. I recorded title and image opacity frame by frame: no drop back to invisible after arriving by a link, and none after a refresh part-way down the page.

### Header glass restored · 13 October 2026

On 12 October I raised the scrolled header to 92% opaque on desktop and made it solid on phones, to stop large headings reading through it. That removed the frosted glass, which was a deliberate choice. It is back at 78% with the original blur on every size. On phones the blur is stronger, so a heading passing behind the bar is a soft shape, not legible text.

Validation: production build passes and the full Playwright suite passes. Checked on phone and desktop in both themes.
