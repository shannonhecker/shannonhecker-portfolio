# shannonhecker.com

One-page portfolio, built from the signed-off prototype in `prototype/site-v4`. The brief is `prototype/BRIEF.md`. The build log is `BUILD.md`, which is served at `/build`.

## Run

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm test           # Playwright: hero, nav, tick demo, axe, no-JS, reduced motion
```

In the Claude Code cloud sandbox, point Playwright at the pre-installed Chromium:
`PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm test`

## Where things live

| What | Where |
|---|---|
| Prototype CSS, unchanged | `src/styles/prototype.css` |
| Production overrides, each with a reason | `src/styles/production.css` |
| Sections (one per prototype section, same ids and class names) | `src/components/*.astro` |
| Motion (GSAP, ScrollTrigger, Lenis) | `src/scripts/motion.ts` |
| Winking Star tick demo | `src/scripts/demo.ts` |
| Images (source JPEGs, optimised at build) | `src/assets/img/` |
| Favicon and OG image generator | `scripts/make-meta-images.mjs` |

Judgement calls are marked with `DECISION:` comments in the code.

## Before each release

- Open the LinkedIn and App Store links by hand. CI skips them because they block bots.
- Search the source for `todo` placeholders, which are still in the prototype on purpose.

## Deploy

Vercel, framework preset Astro, with no other settings needed. Each PR gets a preview URL.
