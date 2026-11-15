# Portfolio layout and motion, 10 October

The panel must be able to inspect Shannon's work. The latest supplied Matthieu
screenshots are the structural reference: two large, close-set project images
on the index and a 40/60 summary/gallery split on case introductions.

The home gallery uses 2.5vw outer margins, a 6px centre gutter and 1.3:1 image
surfaces. Complete UI images sit within project-coloured surfaces. Numbers,
titles and reading links share one centre line below; original context follows.
The preserved method paragraph is smaller alongside the Selected work heading.

Each case title spans the left summary. Below it, the date/context occupies the
left subcolumn; role, status and product links occupy the right subcolumn, with
the description beneath. Large product captures form the right gallery. All
words and image proportions are preserved. Phones use a single reading column.
The section index is one compact Sections disclosure, not a second sticky bar.

White #ffffff, ink #20262d, FX blue #dbeaf2, Fusion teal #e4efec, Winking peach
#fff0de and uoaui lilac #ede8f6 provide the palette. Inter Tight carries titles,
Inter carries reading, and Pixelify stays in the game and small pixel accents.

Motion uses the existing GSAP ScrollTrigger runtime, loaded after desktop
browsing starts. Paired gallery images enter at separate depths and settle
before reaching the reading area. Complete case frames approach from either
side. Intro titles and the image gallery enter at different distances. Hover
lifts product images gently; Winking phones alternate depth. Native route view
transitions connect project titles. No screenshot cropping or scroll capture.
Touch and reduced-motion modes show content immediately.

Open-source options researched from primary sources: Motion is MIT licensed
(https://github.com/motiondivision/motion); Lenis is MIT licensed
(https://github.com/darkroomengineering/lenis). GSAP is already installed and
uses its standard no-charge license, not MIT
(https://gsap.com/community/standard-license/). Retaining one animation engine
avoids overlapping runtimes. The design work stays local; no 12ui transfer.

Verify desktop/mobile appearance, disclosure keyboard and jump behaviour,
uncropped evidence, reduced motion, automated tests and production CI. Awards
are a craft reference, not a certification that this site has won one.
