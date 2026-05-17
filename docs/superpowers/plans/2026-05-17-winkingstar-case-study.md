# Winking Star Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `project-winkingstar.html` to `shannonhecker.com` and integrate it into the work grid + sitemap, with a Remotion-built hero video composited from fresh simulator captures.

**Architecture:** Clone the `project-ausos.html` shell unchanged (same CSS, same layout grid). Fill it with Winking Star content per the design spec. Build the hero video in a sibling sandbox repo to keep the portfolio repo free of Remotion deps. Lift visual assets from the live `weekly-superstar-ios` repo + fresh `/private/tmp/` simulator captures. Renumber `work.html` cards by + 1.

**Tech Stack:** Static HTML/CSS (no build step for the page itself), Remotion 4.x for video (in sibling sandbox), Squoosh CLI for WebP conversion, ImageMagick for screenshot scrubbing/cropping, git feature branch + PR via `gh`.

**Spec:** `docs/superpowers/specs/2026-05-17-winkingstar-case-study-design.md`

**Branch:** `feat/winkingstar-case-study` (NEW — separate from the spec branch `feat/winkingstar-case-study-spec`)

---

## File Structure

### Created
| File | Purpose |
|---|---|
| `project-winkingstar.html` | The case-study page itself |
| `assets/winkingstar-card.webp` | 1200×720 work-grid + OG cover |
| `assets/winkingstar-poster.webp` | Hero MP4 poster |
| `assets/winkingstar-hero.mp4` | Hero looped composite video |
| `assets/winkingstar-doodle-map.webp` | Brand doodle illustration |
| `assets/winkingstar-doodle-treasure.webp` | Brand doodle illustration |
| `assets/winkingstar-petpal-{bear,fox,unicorn,deer,elephant,robot}.webp` | 6 pet-pal art thumbnails |
| `assets/winkingstar-shot-{home,progress,pet,demo,treasure,landing}.webp` | 6 inline screenshots |

### Modified
| File | Change |
|---|---|
| `work.html` | Insert new card at position 02; renumber existing 02–13 → 03–14; update "Thirteen" → "Fourteen" in hero copy + meta description |
| `sitemap.xml` | Add `<url>` for `project-winkingstar.html` at priority 0.8; bump `lastmod` on modified pages |
| `project-ausos.html` | Update Next link in `proj-next` block from Barclays → Winking Star |
| `index.html` | Conditional: insert Winking Star into featured-work strip if one exists |

### NOT modified
- `assets/portfolio.css` — reusing existing classes
- `assets/dark-mode.css` — single `.proj-cover` override added inline in page `<style>` block
- `VOICE.md` — already covers em-dash rule
- `sh-tokens` — no new tokens
- Any `weekly-superstar-*` repo — assets are copied OUT, not modified

---

## Phase 0 — Asset prep (parallel-safe)

These tasks produce binary assets. They can be executed in any order, in parallel if dispatched as separate subagents.

### Task 1: Set up working branch + asset paths

**Files:**
- Create: feature branch `feat/winkingstar-case-study`

- [ ] **Step 1: Confirm on portfolio repo**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
git status --short
git branch --show-current
```

Expected: working tree may show pre-existing `M CLAUDE.md` and the 20+ "X 2.html" duplicate files. Leave them — they were there before this work and are out of scope.

- [ ] **Step 2: Branch from main**

```bash
git checkout main
git checkout -b feat/winkingstar-case-study
git branch --show-current
```

Expected: `feat/winkingstar-case-study`

- [ ] **Step 3: Verify spec is reachable**

```bash
test -f docs/superpowers/specs/2026-05-17-winkingstar-case-study-design.md && echo OK
```

Expected: `OK`. If missing, the spec was committed to `feat/winkingstar-case-study-spec` — cherry-pick or merge that branch first.

### Task 2: Lift doodle + pet-pal art from iOS repo

**Files:**
- Create: `assets/winkingstar-doodle-map.webp`
- Create: `assets/winkingstar-doodle-treasure.webp`
- Create: `assets/winkingstar-petpal-{bear,fox,unicorn,deer,elephant,robot}.webp`

- [ ] **Step 1: Verify source files exist**

```bash
ls ~/Documents/Cursor/weekly-superstar-ios/assets/ui-icons/illustrations/doodle-map.png
ls ~/Documents/Cursor/weekly-superstar-ios/assets/ui-icons/illustrations/doodle-treasure-box.png
ls ~/Documents/Cursor/weekly-superstar-ios/assets/graphics/{bear,fox,unicorn,deer,elephant,robot}.png
```

Expected: all 8 paths print without "No such file" error.

- [ ] **Step 2: Install Squoosh CLI if not present**

```bash
which squoosh-cli || npm install -g @squoosh/cli
```

Expected: a path is printed (already installed), OR npm install succeeds and prints the binary path.

- [ ] **Step 3: Convert doodle illustrations to WebP at 800px max-width**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
mkdir -p assets

squoosh-cli --webp '{"quality":82}' --resize '{"width":800}' \
  ~/Documents/Cursor/weekly-superstar-ios/assets/ui-icons/illustrations/doodle-map.png \
  -d assets/

mv assets/doodle-map.webp assets/winkingstar-doodle-map.webp

squoosh-cli --webp '{"quality":82}' --resize '{"width":800}' \
  ~/Documents/Cursor/weekly-superstar-ios/assets/ui-icons/illustrations/doodle-treasure-box.png \
  -d assets/

mv assets/doodle-treasure-box.webp assets/winkingstar-doodle-treasure.webp

ls -la assets/winkingstar-doodle-*.webp
```

Expected: both files exist, each ≤ 80 KB.

- [ ] **Step 4: Convert pet-pal art to WebP at 600px square**

```bash
for pet in bear fox unicorn deer elephant robot; do
  squoosh-cli --webp '{"quality":82}' --resize '{"width":600,"height":600,"method":"contain"}' \
    ~/Documents/Cursor/weekly-superstar-ios/assets/graphics/${pet}.png \
    -d assets/
  mv assets/${pet}.webp assets/winkingstar-petpal-${pet}.webp
done

ls -la assets/winkingstar-petpal-*.webp | wc -l
```

Expected: `6`.

- [ ] **Step 5: Verify visually**

```bash
open assets/winkingstar-doodle-map.webp assets/winkingstar-petpal-fox.webp
```

Expected: both open in Preview, look like the source art, no obvious resampling artifacts.

- [ ] **Step 6: Commit**

```bash
git add assets/winkingstar-doodle-*.webp assets/winkingstar-petpal-*.webp
git commit -m "assets(winkingstar): add doodle + pet-pal art (webp, 82q)"
```

### Task 3: Scrub + convert screenshot shortlist

**Files:**
- Source: `/private/tmp/winkingstar-{final-home,progress-installed,copy-pet-iphone,demo-board,treasure-ipad,landing-art-after}.png`
- Create: `assets/winkingstar-shot-{home,progress,pet,demo,treasure,landing}.webp`

- [ ] **Step 1: Verify source captures exist**

```bash
ls -la /private/tmp/winkingstar-final-home.png \
       /private/tmp/winkingstar-progress-installed.png \
       /private/tmp/winkingstar-copy-pet-iphone.png \
       /private/tmp/winkingstar-demo-board.png \
       /private/tmp/winkingstar-treasure-ipad.png \
       /private/tmp/winkingstar-landing-art-after.png
```

Expected: all 6 files print with sizes ranging 60 KB – 4.5 MB.

- [ ] **Step 2: Inspect for real superstar names**

Open each image in Preview and note any visible names:

```bash
open /private/tmp/winkingstar-final-home.png \
     /private/tmp/winkingstar-progress-installed.png \
     /private/tmp/winkingstar-copy-pet-iphone.png \
     /private/tmp/winkingstar-demo-board.png \
     /private/tmp/winkingstar-treasure-ipad.png \
     /private/tmp/winkingstar-landing-art-after.png
```

For each image, write down: (a) the bounding box (top-left x, y, width, height in pixels) of any text showing a real name like "Nathan", "Maya", etc.; (b) the replacement name to use (default: "Sam" for the first kid, "Alex" for the second).

- [ ] **Step 3: Scrub names with ImageMagick text overlay**

For each image with a real name visible, run (substitute the bounding box you noted in Step 2):

```bash
# Template — repeat per image as needed.
# Args: X,Y,WIDTH,HEIGHT,REPLACEMENT-TEXT,FONT-SIZE,IN,OUT
magick /private/tmp/winkingstar-final-home.png \
  -fill '#F8F1E4' -draw 'rectangle X1,Y1 X2,Y2' \
  -font 'Nunito-Bold' -pointsize 32 -fill '#5A3A2E' \
  -draw "text X1,Y1+30 'Sam'" \
  /private/tmp/winkingstar-final-home-scrubbed.png
```

If no names are visible in an image, skip that image's scrub step and use the original file in Step 4.

- [ ] **Step 4: Convert all 6 to WebP**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio

declare -A MAP=(
  [home]=winkingstar-final-home
  [progress]=winkingstar-progress-installed
  [pet]=winkingstar-copy-pet-iphone
  [demo]=winkingstar-demo-board
  [treasure]=winkingstar-treasure-ipad
  [landing]=winkingstar-landing-art-after
)

for label in "${!MAP[@]}"; do
  src=/private/tmp/${MAP[$label]}-scrubbed.png
  [ -f "$src" ] || src=/private/tmp/${MAP[$label]}.png
  squoosh-cli --webp '{"quality":82}' --resize '{"width":1600}' "$src" -d assets/
  mv assets/${MAP[$label]}*.webp assets/winkingstar-shot-${label}.webp 2>/dev/null
done

ls -la assets/winkingstar-shot-*.webp | wc -l
```

Expected: `6`.

- [ ] **Step 5: Verify no names remain**

Open each output and confirm no real superstar names visible:

```bash
open assets/winkingstar-shot-*.webp
```

- [ ] **Step 6: Commit**

```bash
git add assets/winkingstar-shot-*.webp
git commit -m "assets(winkingstar): add 6 screenshots from simulator (webp, scrubbed)"
```

### Task 4: Build Remotion hero video in sandbox

**Files:**
- Create: `~/Documents/Cursor/winkingstar-hero-render/` (sibling sandbox; NOT committed to portfolio)
- Create: `assets/winkingstar-hero.mp4`
- Create: `assets/winkingstar-poster.webp`
- Create: `assets/winkingstar-card.webp`

- [ ] **Step 1: Create sibling render sandbox**

```bash
cd ~/Documents/Cursor
mkdir winkingstar-hero-render
cd winkingstar-hero-render
```

- [ ] **Step 2: Initialise minimal Remotion project**

```bash
npm init -y
npm install remotion@^4 @remotion/cli@^4 @remotion/bundler@^4 \
  react@^18 react-dom@^18 \
  ffmpeg-static @ffprobe-installer/ffprobe
```

Expected: install completes; `node_modules/remotion` exists.

- [ ] **Step 3: Apply macOS 12 ffmpeg workaround (binaries directory + audio codec patch)**

```bash
mkdir -p bin
ln -sf "$(node -e 'console.log(require("ffmpeg-static"))')" bin/ffmpeg
ln -sf "$(node -e 'console.log(require("@ffprobe-installer/ffprobe").path)')" bin/ffprobe
ls -la bin/
```

Expected: two symlinks pointing into `node_modules/`.

Find the Remotion audio-codec module and patch `libfdk_aac` → `aac`:

```bash
AUDIO_FILE=$(find node_modules/@remotion -name "audio-codec*" -name "*.js" | head -1)
echo "Patching: $AUDIO_FILE"
# Backup
cp "$AUDIO_FILE" "$AUDIO_FILE.bak"
# Replace
sed -i.tmp 's/libfdk_aac/aac/g' "$AUDIO_FILE" && rm "$AUDIO_FILE.tmp"
grep -c "aac" "$AUDIO_FILE"
```

Expected: at least one match for `aac` (no longer `libfdk_aac`).

- [ ] **Step 4: Create Remotion config**

Create `remotion.config.ts`:

```typescript
import { Config } from '@remotion/cli/config';
import path from 'path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setBinariesDirectory(path.resolve(__dirname, 'bin'));
```

- [ ] **Step 5: Create the composition**

Create `src/index.tsx`:

```tsx
import { registerRoot, Composition } from 'remotion';
import { Hero } from './Hero';

const FPS = 30;
const SHOTS = 4;
const SHOT_FRAMES = 75;          // 2.5s per shot
const CROSSFADE_FRAMES = 12;     // 0.4s overlap
const TOTAL = SHOTS * SHOT_FRAMES;

const Root = () => (
  <Composition
    id="WinkingstarHero"
    component={Hero}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1600}
    height={700}      // 16/7 aspect
    defaultProps={{ crossfadeFrames: CROSSFADE_FRAMES, shotFrames: SHOT_FRAMES }}
  />
);

registerRoot(Root);
```

Create `src/Hero.tsx`:

```tsx
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';

const SHOTS = [
  '/winkingstar-shot-home.webp',
  '/winkingstar-shot-pet.webp',
  '/winkingstar-shot-progress.webp',
  '/winkingstar-shot-treasure.webp',
];

const BG = '#F8F1E4'; // earthy.cream

interface HeroProps { crossfadeFrames: number; shotFrames: number; }

export const Hero: React.FC<HeroProps> = ({ crossfadeFrames, shotFrames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG, padding: 36 }}>
      {SHOTS.map((src, i) => {
        const start = i * shotFrames;
        const end = start + shotFrames;
        const fadeIn = interpolate(frame, [start, start + crossfadeFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const fadeOut = interpolate(frame, [end - crossfadeFrames, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const opacity = i === 0 ? fadeOut : (i === SHOTS.length - 1 ? fadeIn : fadeIn * fadeOut);
        const zoom = interpolate(frame, [start, end], [1, 1.04], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <AbsoluteFill key={src} style={{ opacity, alignItems: 'center', justifyContent: 'center' }}>
            <Img src={staticFile(src)} style={{ height: '100%', transform: `scale(${zoom})`, transformOrigin: 'center', objectFit: 'contain' }} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 6: Stage shot images in Remotion's `public/`**

```bash
mkdir -p public
cp ~/Documents/Cursor/shannonhecker-portfolio/assets/winkingstar-shot-{home,pet,progress,treasure}.webp public/
ls public/
```

Expected: 4 webp files in `public/`.

- [ ] **Step 7: Render the MP4**

```bash
npx remotion render src/index.tsx WinkingstarHero out/hero.mp4
```

Expected: render completes; `out/hero.mp4` exists ≤ 4 MB.

- [ ] **Step 8: Render the poster (first frame)**

```bash
npx remotion still src/index.tsx WinkingstarHero out/poster.png --frame=0
```

Expected: `out/poster.png` exists.

- [ ] **Step 9: Render the card image (mid-frame for variety)**

```bash
npx remotion still src/index.tsx WinkingstarHero out/card.png --frame=75
```

Expected: `out/card.png` exists.

- [ ] **Step 10: Convert poster + card to WebP and copy to portfolio**

```bash
squoosh-cli --webp '{"quality":85}' --resize '{"width":1200,"height":720,"method":"contain"}' \
  out/poster.png out/card.png -d out/

cp out/hero.mp4   ~/Documents/Cursor/shannonhecker-portfolio/assets/winkingstar-hero.mp4
cp out/poster.webp ~/Documents/Cursor/shannonhecker-portfolio/assets/winkingstar-poster.webp
cp out/card.webp   ~/Documents/Cursor/shannonhecker-portfolio/assets/winkingstar-card.webp

cd ~/Documents/Cursor/shannonhecker-portfolio
ls -la assets/winkingstar-{hero.mp4,poster.webp,card.webp}
```

Expected: 3 files exist with non-zero sizes.

- [ ] **Step 11: Commit assets**

```bash
git add assets/winkingstar-hero.mp4 assets/winkingstar-poster.webp assets/winkingstar-card.webp
git commit -m "assets(winkingstar): add hero MP4 + poster + card from Remotion render"
```

---

## Phase 1 — Page scaffold

### Task 5: Clone ausōs page, swap shell metadata

**Files:**
- Create: `project-winkingstar.html`

- [ ] **Step 1: Copy ausōs page as starting point**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
cp project-ausos.html project-winkingstar.html
wc -l project-winkingstar.html
```

Expected: file copied, ~610 lines.

- [ ] **Step 2: Replace `<title>`**

Edit `project-winkingstar.html`:

OLD:
```html
<title>ausōs.ai · AI design-system builder · Shannon Hecker</title>
```

NEW:
```html
<title>Winking Star · Native iOS + iPad + Web habit tracker for families · Shannon Hecker</title>
```

- [ ] **Step 3: Replace meta description**

OLD:
```html
<meta name="description" content="ausos.ai: an AI design-system builder. UI Kit plus private-preview Builder across Salt, Material 3, Fluent 2, Carbon, and the ausos system. Side project by Shannon Hecker, in private alpha." />
```

NEW (≤160 chars verified):
```html
<meta name="description" content="Winking Star: a habit tracker for families, shipped on iPhone, iPad and web. Solo design and build. Earthy brand, doodle illustrations, sticker-sheet scan." />
```

- [ ] **Step 4: Replace canonical URL**

`replace_all` on the string `https://shannonhecker.com/project-ausos.html` → `https://shannonhecker.com/project-winkingstar.html`.

- [ ] **Step 5: Replace OG title + description**

OLD:
```html
<meta property="og:title" content="ausōs.ai · AI design-system builder · Shannon Hecker" />
<meta property="og:description" content="ausos.ai: an AI design-system builder. UI Kit plus private-preview Builder across Salt, Material 3, Fluent 2, Carbon, and the ausos system. Side project by Shannon Hecker, in private alpha." />
```

NEW:
```html
<meta property="og:title" content="Winking Star · Native iOS + iPad + Web habit tracker for families · Shannon Hecker" />
<meta property="og:description" content="Winking Star: a habit tracker for families, shipped on iPhone, iPad and web. Solo design and build. Earthy brand, doodle illustrations, sticker-sheet scan." />
```

(Twitter card image stays as `assets/og-preview.png` for now; if a Winking Star OG image is wanted later, swap to `assets/winkingstar-card.webp`.)

- [ ] **Step 6: Replace JSON-LD CreativeWork block**

OLD: the block starting `"headline": "ausōs.ai"`.

NEW (entire block):
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "headline": "Winking Star",
  "description": "Winking Star: a habit tracker for families, shipped on iPhone, iPad and web. Solo design and build. Earthy brand, doodle illustrations, sticker-sheet scan.",
  "url": "https://shannonhecker.com/project-winkingstar.html",
  "image": "https://shannonhecker.com/assets/winkingstar-card.webp",
  "datePublished": "2026-05-17",
  "author": { "@type": "Person", "name": "Shannon Hecker", "url": "https://shannonhecker.com" },
  "creator": { "@type": "Person", "name": "Shannon Hecker" },
  "isPartOf": { "@type": "CreativeWorkSeries", "name": "Shannon Hecker Portfolio", "url": "https://shannonhecker.com" }
}
```

- [ ] **Step 7: Replace BreadcrumbList JSON-LD**

In the second `application/ld+json` block, change `"name": "ausōs.ai"` → `"name": "Winking Star"` and `"item": "https://shannonhecker.com/project-ausos.html"` → `"item": "https://shannonhecker.com/project-winkingstar.html"`.

- [ ] **Step 8: Replace breadcrumb visible text**

OLD:
```html
<div class="proj-breadcrumb rv">
  <a href="work.html">Work</a>
  <span class="proj-breadcrumb-sep">›</span>
  <span>ausōs.ai</span>
</div>
```

NEW:
```html
<div class="proj-breadcrumb rv">
  <a href="work.html">Work</a>
  <span class="proj-breadcrumb-sep">›</span>
  <span>Winking Star</span>
</div>
```

- [ ] **Step 9: Replace meta-row content**

OLD: 5 `.proj-meta-item` divs starting `Project | ausōs.ai`.

NEW:
```html
<div class="proj-meta-row rv" data-d="1">
  <div class="proj-meta-item"><span class="proj-meta-label">Project</span><span class="proj-meta-value">Winking Star</span></div>
  <div class="proj-meta-item"><span class="proj-meta-label">Project Type</span><span class="proj-meta-value">Family Product · iOS + iPad + Web · Side Project</span></div>
  <div class="proj-meta-item"><span class="proj-meta-label">Year</span><span class="proj-meta-value">2026</span></div>
  <div class="proj-meta-item"><span class="proj-meta-label">Role</span><span class="proj-meta-value">Designer + Builder · solo</span></div>
  <div class="proj-meta-item"><span class="proj-meta-label">Site</span><span class="proj-meta-value"><a href="https://winkingstar.com/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;">winkingstar.com ↗</a></span></div>
</div>
```

- [ ] **Step 10: Replace the cover block (light-only video)**

OLD: the `<div class="proj-cover proj-cover--demo rv">` block with two `<video>` elements (light + dark variants).

NEW:
```html
<div class="proj-cover proj-cover--winkingstar rv" style="aspect-ratio:16/7;overflow:hidden;display:flex;align-items:center;justify-content:center;">
  <video
    src="assets/winkingstar-hero.mp4"
    poster="assets/winkingstar-poster.webp"
    autoplay muted loop playsinline preload="metadata"
    aria-label="Winking Star iOS app — Home, Pet pals, Progress, Treasure tabs cycling"
    style="width:100%;height:100%;object-fit:contain;border-radius:8px;display:block;"
  ></video>
  <div class="img-shield"></div>
</div>
```

- [ ] **Step 11: Add a dark-theme background override in the page `<style>` block**

Inside the existing `<style>` block (before `</head>`), append:

```css
/* Winking Star is a light-mode-only product. Keep the cover background warm in both themes. */
.proj-cover--winkingstar { background: #F8F1E4 !important; padding: 36px; box-sizing: border-box; }
html[data-theme="dark"] .proj-cover--winkingstar { background: #F7F5EF !important; filter: none; }
@media (max-width: 720px) { .proj-cover--winkingstar { padding: 18px; } }
```

(Remove the entire `.proj-cover--demo` rule block originally cloned from ausōs — we no longer need the two-video light/dark machinery.)

- [ ] **Step 12: Replace title + lead**

OLD:
```html
<h1 class="proj-title-post rv" data-d="2">ausōs.ai</h1>
<p class="proj-lead rv" data-d="3">An AI design-system builder. ...</p>
```

NEW:
```html
<h1 class="proj-title-post rv" data-d="2">Winking Star</h1>
<p class="proj-lead rv" data-d="3">A habit tracker for families. A native iOS app on iPhone and iPad with a companion web app at winkingstar.com. One Firebase backend, one earthy palette, three form factors. Solo design and build.</p>
```

- [ ] **Step 13: Verify it renders**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
npx serve . -l 4173 &
SERVE_PID=$!
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/project-winkingstar.html
kill $SERVE_PID
```

Expected: `200`. Open `http://localhost:4173/project-winkingstar.html` in a browser; hero video autoplays on a cream background; nav + footer match the ausōs page; no console errors.

- [ ] **Step 14: Commit scaffold**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): scaffold project-winkingstar.html from ausōs shell"
```

---

## Phase 2 — Content fill

### Task 6: Section 1+2 — Project Overview + My Role

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace the first two `.proj-about-block` blocks**

The cloned page has `Project Overview` and `My Role` from ausōs. Replace their `.proj-body` contents.

`Project Overview` body NEW:
```html
<div class="proj-body">
  <p>Winking Star is a habit tracker for families. A grown-up sets weekly activities — read for ten minutes, brush teeth, tidy up — and each superstar in the family earns stars as they complete them. A weekly milestone unlocks a pet pal that grows over the next few weeks.</p>
  <p>It runs as a native iOS app on iPhone and iPad, plus a web app at winkingstar.com. Same Firestore backend, same earthy design language, three form factors. I designed and built both surfaces solo, with AI coding agents (Claude Code, Codex, Cursor) as build partners.</p>
</div>
```

`My Role` body NEW:
```html
<div class="proj-body">
  <p>Solo. Design, brand, copy, illustration direction, React Native + Expo build, Firebase backend, Apple Sign In, App Store Connect submission. Five real families recruited as testers via interview-led research; weekly iteration on their feedback.</p>
</div>
```

- [ ] **Step 2: View + commit**

```bash
npx serve . -l 4173 &
SERVE_PID=$!
sleep 2
open http://localhost:4173/project-winkingstar.html
sleep 4
kill $SERVE_PID

git add project-winkingstar.html
git commit -m "feat(winkingstar): overview + role copy"
```

Expected: page shows new copy in the first two sections.

### Task 7: Section 3 — Design Thinking Process

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace `Design Thinking Process` block body**

```html
<div class="proj-body">
  <p>I ran the build through five Design Thinking phases — Empathise, Define, Ideate, Prototype, Test — with five real families recruited for short remote interviews. Each phase closed on a validated assumption before the next began.</p>
  <p>Family interview transcripts shaped two of the biggest decisions: pet pals had to be a surprise, not a choice; and the sticker reward had to exist in both worlds, fridge and phone. The five-phase structure forced me to test before iterating, which is harder to do as a solo builder than it sounds.</p>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): design thinking process copy"
```

### Task 8: Section 4 — Brand Identity

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace `Brand Identity` block (body + swatches + grid)**

Find the existing `Brand Identity` `proj-about-block`. Replace the entire block contents (everything between its opening `<h3>` and closing `</div>`) with:

```html
<h3 class="proj-about-h3">Brand Identity</h3>
<div class="proj-body">
  <p>Warm and earthy. The Winking Star brand sits in cream, sage, terracotta, and cocoa, with hand-drawn doodle illustrations replacing flat icons across the headers and tab bar. Light mode only — the product is built to feel like an open picture book, not a dashboard.</p>
  <p>The terracotta and divider tokens were retuned for WCAG AA in April after an accessibility sweep flagged the original values. Body text now sits at 12.4:1 on cards; section headings at 5.1:1.</p>
</div>
<div style="display:flex;gap:12px;margin:24px 0 0;flex-wrap:wrap;">
  <div style="display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:50%;background:#F8F1E4;border:1px solid var(--c-rule);display:block;"></span><span style="font-size:12px;color:var(--c-light);">Cream · card surface</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:50%;background:#9DAC85;display:block;"></span><span style="font-size:12px;color:var(--c-light);">Sage · panel tint</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:50%;background:#AE5525;display:block;"></span><span style="font-size:12px;color:var(--c-light);">Terracotta · accent + CTA</span></div>
  <div style="display:flex;align-items:center;gap:8px;"><span style="width:24px;height:24px;border-radius:50%;background:#5A3A2E;display:block;"></span><span style="font-size:12px;color:var(--c-light);">Cocoa · body + CTA label</span></div>
</div>
<div class="proj-img-grid rv" style="margin-top:32px;">
  <img src="assets/winkingstar-doodle-map.webp" alt="Winking Star doodle map illustration" width="800" height="800" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-doodle-treasure.webp" alt="Winking Star doodle treasure box illustration" width="800" height="800" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
</div>
<div class="proj-img-grid rv" style="margin-top:16px;grid-template-columns:repeat(3,1fr);">
  <img src="assets/winkingstar-petpal-bear.webp" alt="Pet-pal bear illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-petpal-fox.webp" alt="Pet-pal fox illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-petpal-unicorn.webp" alt="Pet-pal unicorn illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-petpal-deer.webp" alt="Pet-pal deer illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-petpal-elephant.webp" alt="Pet-pal elephant illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
  <img src="assets/winkingstar-petpal-robot.webp" alt="Pet-pal robot illustration" width="600" height="600" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;aspect-ratio:1/1;object-fit:contain;display:block;width:100%;height:auto;padding:24px;box-sizing:border-box;" />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): brand identity section with swatches + doodle + pet-pals grids"
```

### Task 9: New Section 5 — Cross-platform (iPhone + iPad + Web)

**Files:**
- Modify: `project-winkingstar.html`

The ausōs page has a `Design System Integration` block in this position. Repurpose it as `Cross-platform`.

- [ ] **Step 1: Replace the block**

```html
<div class="proj-about-block rv">
  <h3 class="proj-about-h3">Cross-platform: iPhone + iPad + Web</h3>
  <div class="proj-body">
    <p>One Firebase project, one token system, three form factors. The web app at winkingstar.com and the iOS app at <code>com.winkingstar.app</code> share the same Firestore data, the same earthy palette, and the same Nunito typography.</p>
    <p>The iOS app runs natively on iPhone and iPad. The iPad layout is a full pass across the five-tab IA — Home, Activity, Treasure, Progress, More — so it reads as designed-for-iPad, not stretched-iPhone. The iOS app adds custom haptics, push notifications, sticker-sheet scanning, and universal links. The web app stays where a grown-up's laptop and a TV-cast view live.</p>
  </div>
  <div class="proj-img-grid rv" style="margin-top:32px;grid-template-columns:1fr 1fr;">
    <img src="assets/winkingstar-shot-home.webp" alt="Winking Star — Home tab on iPhone" width="1600" height="1200" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;object-fit:contain;display:block;width:100%;height:auto;" />
    <img src="assets/winkingstar-shot-treasure.webp" alt="Winking Star — Treasure tab on iPad" width="1600" height="1200" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;object-fit:contain;display:block;width:100%;height:auto;" />
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): cross-platform iPhone+iPad+Web section"
```

### Task 10: Replace the NDA strip with screenshot showcase

**Files:**
- Modify: `project-winkingstar.html`

ausōs page has a `proj-nda` block (private alpha CTA). Winking Star is publicly shipped — replace with a wider screenshot grid + live-site CTA.

- [ ] **Step 1: Replace the entire `proj-nda` block**

Find the block starting `<div class="proj-nda rv">` and replace with:

```html
<div class="proj-about-block rv">
  <h3 class="proj-about-h3">In the app</h3>
  <div class="proj-img-grid rv" style="margin-top:24px;grid-template-columns:1fr 1fr 1fr;">
    <img src="assets/winkingstar-shot-progress.webp" alt="Progress tab — weekly adventure map" width="1600" height="1200" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;object-fit:contain;display:block;width:100%;height:auto;" />
    <img src="assets/winkingstar-shot-pet.webp" alt="Pet pal moment — surprise reveal" width="1600" height="1200" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;object-fit:contain;display:block;width:100%;height:auto;" />
    <img src="assets/winkingstar-shot-demo.webp" alt="Demo board — try-before-signin" width="1600" height="1200" loading="lazy" decoding="async" style="border-radius:12px;background:#F8F1E4;object-fit:contain;display:block;width:100%;height:auto;" />
  </div>
  <div style="margin-top:24px;text-align:center;">
    <a class="ausos-strip-cta primary" href="https://winkingstar.com/" target="_blank" rel="noopener noreferrer">Visit winkingstar.com <span aria-hidden="true">↗</span></a>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): replace NDA strip with screenshot showcase + live-site CTA"
```

### Task 11: Section 6 — 3 Decisions

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace the `Decisions` block body**

```html
<div class="proj-body">
  <p><strong>Decision 1. Native iOS, not just responsive web.</strong></p>
  <p><em>Options considered:</em> PWA only; responsive web wrapped in WebView; native React Native / Expo build.</p>
  <p><em>What I chose:</em> native RN/Expo.</p>
  <p><em>Why:</em> haptics, push notifications, universal links to winkingstar.com, App Store distribution, and real mobile gestures all needed a native runtime. A PWA would have shipped the same screens but felt like a web page on iOS.</p>

  <p><strong>Decision 2. Pet pals are a random surprise; themes are chosen.</strong></p>
  <p><em>Options considered:</em> let superstars pick their pet pal; let them pick both; randomise both.</p>
  <p><em>What I chose:</em> themes are picked by the grown-up per superstar; pet pals appear as a surprise after a weekly milestone.</p>
  <p><em>Why:</em> two different design jobs. Themes are personalisation — the superstar should see themself in the page chrome every day. Pet pals are dopamine — surprise drives the moment, and freedom of choice would have killed the reveal.</p>

  <p><strong>Decision 3. Physical sticker sheet, digital sync.</strong></p>
  <p><em>Options considered:</em> digital-only stars; printable reward sheet, no sync; printable sheet with camera scan-back.</p>
  <p><em>What I chose:</em> printable activity sheet with a camera scan that mirrors stars back to the chart.</p>
  <p><em>Why:</em> families wanted both the physical reward of putting a sticker on the fridge and the digital memory in the app. Scanning closes the loop without making the grown-up double-track.</p>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): three decisions section"
```

### Task 12: Section 7 — Outcomes grid

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace the `Outcomes` block contents**

```html
<div class="proj-outcomes">
  <div class="proj-outcome"><span class="proj-outcome-num">3</span><span class="proj-outcome-label">Form factors shipped — iPhone, iPad, Web</span></div>
  <div class="proj-outcome"><span class="proj-outcome-num">17</span><span class="proj-outcome-label">Themes designed</span></div>
  <div class="proj-outcome"><span class="proj-outcome-num">26</span><span class="proj-outcome-label">Pet-pal families × 4 stages</span></div>
  <div class="proj-outcome"><span class="proj-outcome-num">5</span><span class="proj-outcome-label">Native iOS tabs in the IA</span></div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): outcomes grid with verified numbers"
```

### Task 13: Section 8 — Tags

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace tags list**

OLD:
```html
<span class="proj-tags-list">Side Project · Design Systems · Component Library · AI-Assisted Build · Brand Identity · Design Thinking · Prototyping · React · Angular</span>
```

NEW:
```html
<span class="proj-tags-list">Mobile · iOS · iPad · React Native · Expo · Firebase · Family Product · Side Project · Design Engineering</span>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): tags chip strip"
```

### Task 14: Update project-nav (prev / next on this page)

**Files:**
- Modify: `project-winkingstar.html`

- [ ] **Step 1: Replace `proj-next` block**

OLD:
```html
<div class="proj-nav-item proj-nav-item--prev">
  <span class="proj-nav-hint">Previous</span>
  <a href="project-dps-brand.html" class="proj-nav-link">…D&PS Brand Identity</a>
</div>
<div class="proj-nav-item proj-nav-item--next">
  <span class="proj-nav-hint">Next</span>
  <a href="project-barclays-data-viz.html" class="proj-nav-link">Barclays Data Viz…</a>
</div>
```

NEW:
```html
<div class="proj-nav-item proj-nav-item--prev">
  <span class="proj-nav-hint">Previous</span>
  <a href="project-ausos.html" class="proj-nav-link">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ausōs.ai
  </a>
</div>
<div class="proj-nav-item proj-nav-item--next">
  <span class="proj-nav-hint">Next</span>
  <a href="project-barclays-data-viz.html" class="proj-nav-link">
    Barclays Data Viz
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M19 12l-6-6M19 12l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-winkingstar.html
git commit -m "feat(winkingstar): wire project-nav prev=ausōs next=barclays"
```

---

## Phase 3 — Site integration

### Task 15: Insert Winking Star card on work.html

**Files:**
- Modify: `work.html`

- [ ] **Step 1: Read existing card structure**

```bash
grep -n "project-barclays-data-viz.html" work.html
grep -n 'pcard-num">' work.html
```

Confirm the position 02 currently links to Barclays.

- [ ] **Step 2: Insert new card before Barclays card**

Locate the Barclays `<div class="bc-6 rv" data-d="2">` block. Insert this immediately BEFORE it:

```html
<div class="bc-6 rv" data-d="2">
  <article class="pcard-article"><a href="project-winkingstar.html" class="pcard">
    <div class="pcard-img">
      <img src="assets/winkingstar-card.webp" alt="Winking Star iOS app" width="1200" height="720" loading="lazy" decoding="async" />
      <div class="pcard-overlay"><span class="pcard-overlay-title">Winking Star</span></div>
    </div>
    <div class="pcard-body">
      <div class="pcard-meta">
        <span class="pcard-num">02 / 14</span>
        <div class="pcard-arrow"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>
      </div>
      <div class="pcard-title">Winking Star</div>
      <p class="pcard-desc">Family habit tracker shipped on iPhone, iPad and web. Native React Native app with iPad-responsive sweep, custom haptics, doodle illustrations, and a sticker-sheet camera scan.</p>
      <div class="pcard-tags"><span class="chip chip-default">Mobile</span><span class="chip chip-default">iOS</span><span class="chip chip-default">iPad</span><span class="chip chip-default">Side Project</span></div>
    </div>
  </a></article>
</div>
```

- [ ] **Step 3: Renumber the original 02–13 → 03–14**

For each `<span class="pcard-num">NN / 13</span>` in `work.html` (excluding the new Winking Star card), increment NN by 1 AND change the `/ 13` to `/ 14`. There are 13 such spans.

Concretely:
- `01 / 13` → keep as `01 / 14` (ausōs)
- `02 / 13` → `03 / 14` (Barclays)
- `03 / 13` → `04 / 14` (TripUp)
- `04 / 13` → `05 / 14` (Fusion Analytics)
- `05 / 13` → `06 / 14` (Fusion Design System)
- `06 / 13` → `07 / 14` (Fusion Data Solution)
- `07 / 13` → `08 / 14` (UI Toolkit)
- `08 / 13` → `09 / 14` (Corporate Action Manager)
- `09 / 13` → `10 / 14` (Complex Assets)
- `10 / 13` → `11 / 14` (JPMM Research)
- `11 / 13` → `12 / 14` (Global Custody Deal Model)
- `12 / 13` → `13 / 14` (Execute Algo Center)
- `13 / 13` → `14 / 14` (D&PS Brand Identity)

Use this sed pipeline (verify before committing):

```bash
# Step A: bump denominator first (avoids double-mutation)
sed -i.bak 's| / 13<| / 14<|g' work.html
# Step B: bump numerators 02..13 down-to-up to avoid collisions
for n in 13 12 11 10 09 08 07 06 05 04 03 02; do
  m=$(printf '%02d' $((10#$n + 1)))
  sed -i.tmp "s|>${n} / 14<|>${m} / 14<|g" work.html
  rm work.html.tmp
done
rm work.html.bak
grep -c 'pcard-num">[0-9]\+ / 14<' work.html
```

Expected: `14` matches.

- [ ] **Step 4: Update hero copy + meta description**

OLD:
```html
<p class="work-hero-sub">Thirteen projects across …</p>
```

NEW:
```html
<p class="work-hero-sub">Fourteen projects across mobile, trading UX, data visualisation, design systems, and AI workflows. Work from Barclays, J.P. Morgan, and a few side projects along the way.</p>
```

Also update meta description (line ~27) the same way: `Thirteen case studies` → `Fourteen case studies`.

- [ ] **Step 5: Verify locally**

```bash
npx serve . -l 4173 &
SERVE_PID=$!
sleep 2
open http://localhost:4173/work.html
sleep 4
kill $SERVE_PID
```

Expected: Winking Star card appears at position 02 right after ausōs; numbering reads 01–14 with no gaps.

- [ ] **Step 6: Commit**

```bash
git add work.html
git commit -m "feat(work): insert Winking Star card at 02/14; renumber rest; bump count"
```

### Task 16: Update sitemap.xml

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Insert new `<url>` block after the `project-ausos` entry**

Insert after the existing block ending with `</url>` that has `<loc>https://shannonhecker.com/project-ausos.html</loc>`:

```xml
  <url>
    <loc>https://shannonhecker.com/project-winkingstar.html</loc>
    <lastmod>2026-05-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 2: Bump `lastmod` on touched pages**

In `sitemap.xml`, update `<lastmod>` to `2026-05-17` on these three entries:
- `https://shannonhecker.com/work.html`
- `https://shannonhecker.com/project-ausos.html`
- `https://shannonhecker.com/` (homepage, if `index.html` was modified in Task 17)

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "feat(sitemap): add winkingstar URL; bump lastmod on touched pages"
```

### Task 17: Update ausōs page project-nav

**Files:**
- Modify: `project-ausos.html`

- [ ] **Step 1: Replace the Next link**

In `project-ausos.html`, find the `proj-nav-item--next` block. Currently links to Barclays.

OLD:
```html
<div class="proj-nav-item proj-nav-item--next">
  <span class="proj-nav-hint">Next</span>
  <a href="project-barclays-data-viz.html" class="proj-nav-link">
    Barclays Data Viz
    <svg…>…</svg>
  </a>
</div>
```

NEW:
```html
<div class="proj-nav-item proj-nav-item--next">
  <span class="proj-nav-hint">Next</span>
  <a href="project-winkingstar.html" class="proj-nav-link">
    Winking Star
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M19 12l-6-6M19 12l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add project-ausos.html
git commit -m "feat(ausos): point Next link to Winking Star"
```

### Task 18: Conditional — index.html featured strip

**Files:**
- Modify: `index.html` (only if a featured strip exists)

- [ ] **Step 1: Check whether index.html has a featured-work strip**

```bash
grep -nE "project-ausos|project-barclays|project-tripup" index.html
```

If zero matches: skip the rest of this task; commit nothing for `index.html`.

If matches found: continue with steps 2–3.

- [ ] **Step 2: Read the surrounding 60 lines to understand the strip structure**

```bash
grep -n "project-ausos" index.html | head -1 | cut -d: -f1 | while read line; do
  sed -n "$((line-20)),$((line+40))p" index.html
done
```

Note the markup pattern used (likely `.pcard` or a custom strip card).

- [ ] **Step 3: Insert a Winking Star entry into the strip**

Mirror the existing structure for ausōs, but with:
- `href="project-winkingstar.html"`
- title `Winking Star`
- image `assets/winkingstar-card.webp`
- description: `"Family habit tracker shipped on iPhone, iPad and web."`

Position: immediately after ausōs.

- [ ] **Step 4: Commit (only if changed)**

```bash
git add index.html
git commit -m "feat(home): add Winking Star to featured strip"
```

---

## Phase 4 — Verification

### Task 19: Vocabulary lock check

**Files:** all touched HTML files

- [ ] **Step 1: Grep for forbidden vocabulary in display copy**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio

# Words allowed inside <script>, <code>, comments, or URLs — but NOT in visible body
# We accept some matches in script blocks etc. Manually review hits.

echo "--- 'kid' (should be 'superstar') ---"
grep -nE '>[^<]*\bkids?\b[^<]*<' project-winkingstar.html work.html | grep -v '<!--'
echo "--- 'task' ---"
grep -nE '>[^<]*\btasks?\b[^<]*<' project-winkingstar.html work.html | grep -v '<!--'
echo "--- 'sticker' (allowed once: 'sticker sheet' in the decision; flag others) ---"
grep -nE '>[^<]*\bstickers?\b[^<]*<' project-winkingstar.html work.html | grep -v 'sticker sheet'
echo "--- 'parent' (allowed in 'parental controls' if referencing iOS feature; flag others) ---"
grep -nE '>[^<]*\bparents?\b[^<]*<' project-winkingstar.html work.html | grep -v 'parental'
```

Expected: zero hits across all four. If any appear, rewrite using the correct vocab (`superstar` / `activity` / `star` / `grown-up`).

- [ ] **Step 2: Commit any fixes**

If fixes were made:
```bash
git add project-winkingstar.html work.html
git commit -m "fix(winkingstar): scrub legacy vocab to current product wording"
```

### Task 20: Em-dash + en-dash check

**Files:** all touched HTML files

- [ ] **Step 1: Grep for `—` and `–`**

```bash
echo "--- em-dashes in winkingstar ---"
grep -nE '—' project-winkingstar.html | grep -v '<!--' | grep -v 'script'
echo "--- en-dashes in winkingstar ---"
grep -nE '–' project-winkingstar.html | grep -v '<!--' | grep -v 'script'
echo "--- em/en in modified work.html lines ---"
git diff main -- work.html | grep -E '^\+' | grep -nE '—|–'
```

Expected: zero hits in display copy.

- [ ] **Step 2: Fix any hits**

Replace per `VOICE.md`:
- For an emphatic pause / "this is X" beat → period
- For a list lead-in / definition → colon
- For a mid-sentence aside → comma pair

- [ ] **Step 3: Commit any fixes**

```bash
git add project-winkingstar.html work.html
git commit -m "fix(winkingstar): replace em/en-dashes with periods, colons, commas per VOICE.md"
```

### Task 21: Accessibility contrast pass

**Files:** `project-winkingstar.html`

- [ ] **Step 1: List all colour pairs in the new page**

Open the page in a browser; run the `accesslint:contrast-checker` skill against the file. Report all pairs with their ratios.

Known concerns to verify:
- Cream (`#F8F1E4`) swatch background on the page's white (`#FFFFFF`) — should be fine for non-text decoration
- Cocoa (`#5A3A2E`) body text on white — should pass AA (~10:1)
- Sage (`#9DAC85`) swatch — only used as a circle decoration, no text on it, so contrast not required
- Terracotta (`#AE5525`) swatch — same
- Pet-pal images sit on cream — purely decorative

- [ ] **Step 2: Fix any failing pair**

Adjust the relevant colour in the page-local `<style>` block. Do NOT modify `assets/portfolio.css` or `assets/dark-mode.css`.

- [ ] **Step 3: Commit any fixes**

```bash
git add project-winkingstar.html
git commit -m "fix(winkingstar): adjust colour pair for WCAG AA"
```

### Task 22: Lighthouse audit

**Files:** none (audit only)

- [ ] **Step 1: Start local server**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
npx serve . -l 4173 &
SERVE_PID=$!
sleep 2
```

- [ ] **Step 2: Run Lighthouse on the new page**

```bash
npx lighthouse http://localhost:4173/project-winkingstar.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless" \
  --output=json --output-path=./lh-winkingstar.json \
  --quiet

node -e '
  const r = require("./lh-winkingstar.json");
  for (const k of Object.keys(r.categories)) {
    console.log(k, "->", Math.round(r.categories[k].score * 100));
  }'
```

Expected: accessibility ≥ 95; performance ≥ 80; best-practices ≥ 95; seo ≥ 95.

- [ ] **Step 3: Run Lighthouse on work.html (regression check)**

```bash
npx lighthouse http://localhost:4173/work.html \
  --only-categories=accessibility,seo \
  --chrome-flags="--headless" \
  --output=json --output-path=./lh-work.json \
  --quiet

node -e '
  const r = require("./lh-work.json");
  for (const k of Object.keys(r.categories)) {
    console.log(k, "->", Math.round(r.categories[k].score * 100));
  }'

kill $SERVE_PID
```

Expected: accessibility + seo unchanged from baseline (re-run on `main` if unsure).

- [ ] **Step 4: Clean up report files**

```bash
rm -f lh-winkingstar.json lh-work.json
```

- [ ] **Step 5: Commit any page fixes (if Lighthouse flagged something)**

Only if fixes were made:
```bash
git add project-winkingstar.html
git commit -m "fix(winkingstar): address Lighthouse findings (a11y/SEO)"
```

### Task 23: Visual review in both themes

**Files:** none (manual visual check)

- [ ] **Step 1: Open the page**

```bash
cd ~/Documents/Cursor/shannonhecker-portfolio
npx serve . -l 4173 &
SERVE_PID=$!
sleep 2
open http://localhost:4173/project-winkingstar.html
```

- [ ] **Step 2: Walk-through light mode**

- [ ] Hero video autoplays on cream background, 16:7 aspect, no letterbox or stretching
- [ ] No console errors
- [ ] All 6 inline screenshots render
- [ ] All 2 doodle illustrations render
- [ ] All 6 pet-pal thumbnails render
- [ ] Brand swatches show correct hexes
- [ ] Outcomes grid shows `3 / 17 / 26 / 5`
- [ ] CTA `Visit winkingstar.com ↗` opens in new tab
- [ ] Project-nav `Previous: ausōs.ai`, `Next: Barclays Data Viz`
- [ ] Breadcrumb: `Work › Winking Star`

- [ ] **Step 3: Toggle dark mode (theme button in nav)**

- [ ] Hero video sits on `#F7F5EF` (warm, NOT black)
- [ ] All body text remains readable
- [ ] Cream swatch is visible on the dark page bg (has its border)
- [ ] No layout shift compared to light mode
- [ ] All images still load (no broken refs)

- [ ] **Step 4: Resize to mobile width (≤720px)**

- [ ] Image grids collapse to single column
- [ ] Outcomes flex column with hairline dividers
- [ ] Hero video padding reduces (from 36px to 18px)
- [ ] Nav drawer opens via burger button

- [ ] **Step 5: Stop server**

```bash
kill $SERVE_PID
```

### Task 24: Pre-ship sweep — global checks

**Files:** none

- [ ] **Step 1: Confirm no rules-class files were touched**

```bash
git diff main --name-only | grep -E 'firestore\.rules|storage\.rules|iam|oauth' || echo "OK — no rules files touched"
```

Expected: `OK — no rules files touched`.

- [ ] **Step 2: Confirm no `index.html` change if step 1 of Task 18 returned zero**

```bash
git diff main --name-only | grep index.html
```

Expected: empty (if index.html had no featured strip) OR `index.html` (if it did and Task 18 inserted).

- [ ] **Step 3: Verify branch state**

```bash
git log --oneline main..HEAD
git diff --stat main
```

Expected: a clean set of feature commits with descriptive messages.

- [ ] **Step 4: Run any tests already in repo**

```bash
[ -f package.json ] && npm test --silent 2>/dev/null
```

Expected: no test suite, OR all pass. (Portfolio is static HTML so likely no test suite.)

---

## Phase 5 — Ship

### Task 25: Open PR (NO auto-merge)

**Files:** none

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/winkingstar-case-study
```

Expected: push succeeds.

- [ ] **Step 2: Create PR**

```bash
gh pr create --title "feat(winkingstar): add Winking Star case study (project + work card + sitemap)" --body "$(cat <<'EOF'
## Summary
- New case-study page `project-winkingstar.html` (14th project, slot 02/14)
- Mobile-first framing: native iOS app on iPhone + iPad + companion web app at winkingstar.com
- Hero MP4 = Remotion composite of fresh simulator captures (light only — product is light-mode)
- Three decisions: native-not-PWA · random-pet-pals-chosen-themes · sticker-sheet-scan
- Outcomes verified against codebase: 3 form factors / 17 themes / 26 pet-pal families × 4 stages / 5 native iOS tabs
- Renumbered `work.html` cards (NN/13 → NN+1/14); updated hero count
- Sitemap entry added; ausōs project-nav Next link repointed

## Spec
`docs/superpowers/specs/2026-05-17-winkingstar-case-study-design.md`

## Plan
`docs/superpowers/plans/2026-05-17-winkingstar-case-study.md`

## Test plan
- [ ] Hero video autoplays on cream bg in light + dark themes
- [ ] No real superstar names visible in any image
- [ ] Vocab check passes: superstar / activity / star / pet pals / grown-up (no kid / task / sticker / parent in display copy)
- [ ] No em-dash or en-dash in display copy
- [ ] WCAG AA contrast on all text/bg pairs
- [ ] Lighthouse accessibility ≥ 95 on project-winkingstar.html
- [ ] Numbering on work.html reads 01–14 with no gaps
- [ ] Project-nav: Previous=ausōs, Next=Barclays
- [ ] Live preview on Vercel matches local

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL returned; status `Open`.

- [ ] **Step 3: STOP. Do NOT merge.**

Per `feedback_no_auto_merge.md` — open PRs freely, never merge to main without explicit per-PR go.

Print PR URL. Wait for user to say `merge` or `ship it`.

---

## Self-Review

Spec coverage check (against `docs/superpowers/specs/2026-05-17-winkingstar-case-study-design.md` §1–18):

| Spec § | Plan coverage |
|---|---|
| §1 Goal | Tasks 5–14 |
| §2 Audience | Reflected in tone of copy in tasks 6–13 |
| §3 Honesty constraints | Task 3 (name scrub), Tasks 19 (vocab) + 20 (em-dash) |
| §4 8-section structure | Tasks 6, 7, 8, 9, 10, 11, 12, 13 |
| §5 Hero (light-only video) | Task 4 (Remotion), Task 5 step 11 (dark-bg override) |
| §6 Decisions ×3 | Task 11 |
| §7 Outcomes | Task 12 |
| §8 Tags | Task 13 |
| §9 Brand identity | Task 8 |
| §10 Cross-platform | Task 9 |
| §11 Screenshot shortlist | Task 3, embedded across Tasks 8–10 |
| §12 Meta + SEO + JSON-LD | Task 5 |
| §13 Work-grid card | Task 15 |
| §14 Files to create / modify | All Phase 0–3 tasks |
| §15 Remotion workflow | Task 4 |
| §16 Acceptance criteria | Tasks 19–23 (verification phase) |
| §17 Out of scope | NOT in plan — correct |
| §18 Implementation phases preview | Plan = expansion of this |

No spec gaps found.

Placeholder scan: no TBD / TODO / "implement later" present in any task. The conditional in Task 18 has concrete grep + insertion behaviour for both branches.

Type/name consistency:
- `winkingstar-shot-{home,progress,pet,demo,treasure,landing}.webp` consistent across Tasks 3, 8, 9, 10
- `winkingstar-petpal-{bear,fox,unicorn,deer,elephant,robot}.webp` consistent across Tasks 2, 8
- `winkingstar-doodle-{map,treasure}.webp` consistent across Tasks 2, 8
- `winkingstar-{hero.mp4,poster.webp,card.webp}` consistent across Tasks 4, 5, 15
- `proj-cover--winkingstar` class consistent across Task 5 steps 10 + 11
- Branch `feat/winkingstar-case-study` consistent across Tasks 1, 25
- Outcome numbers `3 / 17 / 26 / 5` consistent across Task 12 (page) and Task 25 PR body
