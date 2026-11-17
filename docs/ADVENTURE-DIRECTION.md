# Portfolio art direction, 10 October 2026

This records Shannon's latest decisions and supersedes the earlier restriction
to a white editorial layout. Existing content, source and NDA rules still apply.

## Confirmed by Shannon

- An immersive pixel world throughout the site.
- Scroll through illustrated chapters, with clear navigation and optional play.
- A soft illustrated adventure in cream, peach, rose and sky blue, matching the supplied avatar.
- Friendly, readable headings and body text; pixel lettering for small labels.
- One shared world, with a distinct setting and accent colour for each project.
- The avatar travels through scenes on scroll and changes outfits and props by
  chapter. Preserve her identity. Reduced-motion mode uses static placements.
- Give all four projects equal prominence.
- Combine gentle ambient scenery and brief interaction feedback with the
  travelling character. Disable nonessential movement under reduced motion.
- Keep each case a readable continuous page with a sticky chapter index.
- Current type feels too tight and bulky. Explore lighter headings, looser
  tracking and comfortable leading, not merely larger text and more bold.
- Image boxes must follow intrinsic proportions, with useful image scale and
  no accidental empty bands, inherited zoom or cropping.
- Layouts may change when a better design serves the portfolio's purpose.
- 12ui may process screenshots and visible text from the portfolio to generate alternatives.
- Ask design questions sequentially; record the answers instead of reopening them.

## Local implementation plan

Shannon chose a local review instead of connecting a 12ui account. Use the
frontend-design workflow; the 12ui capture is evidence only, not an approved
generated target. She explicitly approved uploading both supplied avatars to
Higgsfield for cutouts and chapter outfits.

- Palette: canvas cream `#fffaf2`, peach `#f7dfcf`, rose `#9b4e65`, sky
  `#e7f3f7`, ink `#343b46`, sage `#e9f1e5`. Project accents are subordinate.
- Type: Nunito 600 headings, Inter 400 body and 500 controls, Pixelify Sans
  only for short labels. Body 17/1.75; display capped at 76px with open tracking.
- Layout: a shared 1280px canvas, 24/40/64px responsive gutters, 24px component
  gaps, 48px content groups and 80/112px sections. Left-aligned reading areas
  stay within 64 characters. Four equally prominent project entrances.
- Composition: introduction and avatar, full-width playable landscape, project
  entrances, working principles, links. Cases have title and metadata, an
  illustrated setting, a sticky index and a continuous readable story.
- Diagrams: journeys use connected stages and aligned task/friction/response
  lanes; decisions show visible branches and the rationale. Follow the FX
  analytics reference. Do not merely decorate existing columns of text.

The subject-specific element is Shannon travelling through a coherent
illustrated world, from her harbour story to her design practice. Product
evidence stays visually separate from atmosphere. Avoid a generic card grid
with arbitrary pastel decoration; scenery and motion must establish place.

Home and panel share a composition. Review every case, build page, 404, navigation,
footer, game cover, world map and all eight playable stages. Check desktop, tablet
and phone layouts and transitions, including reduced motion and keyboard access.

The current CSS layers compound section, heading and beat spacing. Consolidate
shared type and spacing roles before page-specific corrections. Preserve complete
product screenshots and supplied artwork with intrinsic proportions. Keep text
on calm, readable surfaces within the illustrated world.

Kaohsiung must use recognisable local scenery. The existing mixed London/harbour
cover is not an accurate Kaohsiung scene. Cover, map and gameplay must share art
direction; gameplay must not abruptly switch to unrelated coarse pixel art.

## Current review evidence

The 12ui capture kit is local at `/private/tmp/portfolio-uiux-adventure` and covers
panel, FX, Fusion, uoaui, Winking Star, build and 404. Shannon chose local review
instead of connecting 12ui. No external design generation is required or claimed.
The local adventure layout, chapter settings, avatar variants and fictional role
illustrations are implemented but still under validation.

PR 23 deployed but its subsequent CI run failed two game checks and retried one.
The failure was reproduced with Chromium 147 and traced to transient fullscreen
visibility entries, including two entries batched in one callback. The local fix
reads the latest entry, distinguishes observer pauses from deliberate pauses,
and lets touch input resume play. Eighteen focused checks across three repetitions
and the full 78-test suite passed. Release CI still needs to pass independently.

An additional Higgsfield Kaohsiung backdrop was generated as job
`24a07ecc-0765-488d-8789-7a547bcf854a`. The inspected source is at
`/private/tmp/portfolio-review/kaohsiung-adventure.png`, now integrated as
`scene-kaohsiung.png` in the static game poster. The old mixed-city cover motion
is not active. Cover, map and playable-scene consistency still need inspection.

Award-winning quality is the target for craft and review, not a claim of award
approval. Keep visual inspection evidence separate from automated test results.


Current content follow-up adds source-backed pre-Fusion UITK context from the
12 September shared conversation, an explicit uoaui outcome/validation section
without invented metrics, and case navigation covering more review criteria.
The official brief and remaining evidence gaps are in `REVOLUT-CHECKLIST.md`.

Latest local check: 69 files with no diagnostics. The first current test run
reported 73 passed and five failed (four stale navigation-distance assumptions
and 320px hero overflow). Fixes are building; this is not a green final run or
release. Reinspect and rerun before claiming completion.


Latest stage integration adds eight illustrated WebP backgrounds, lazy per stage,
with a 960px backing canvas and existing 480px logical HUD. Landmark scenery no
longer tiles repeatedly; ground art is lighter. All images were visually viewed;
settings are stylized, not literal historical offices or campuses. Physics is
unchanged. Fresh build produced eight routes and check found zero diagnostics
across 70 files. The latest full suite passed 77 tests with one enemy-landing
timing failure under investigation; layout and axe checks passed. No release yet.

## Review correction, 10 October 2026, 16:49

Shannon removed the illustrated room/landscape scenes from all project pages.
Keep scenery inside the game. Site background returns to clean white, with more
padding and space and stronger typography. This supersedes the cream page and
scroll-traveller case-header decisions above. Product screens, persona graphics
and diagrams remain; their intrinsic proportions still apply.

## Final review direction, 10 October 2026

Shannon's later feedback takes precedence over the original cream-world pass:
white, clean case pages; FX defaults dark to frame its real screenshots. A saved
Light / Dark / System / Theme choice applies across the site. Product heroes show
product screens, never decorative office scenes. Pixel art belongs to identity,
process illustration, navigation accents and the optional game. Typography is
stronger again (700 headings), with generous reading space. No generic scrolling
word marquee and no build-credit footer line. The original words remain.

Avoid a template impression through specific original brand assets, actual
product flows and trade-offs, varied screen compositions and semantic project
accents. More decorative images alone do not meet this direction. Keep the game
secondary, with clear routes to the work and reduced-motion/static alternatives.
