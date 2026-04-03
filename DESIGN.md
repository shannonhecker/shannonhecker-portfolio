# Shannon Hecker Portfolio — Design System

> A clean, minimal, premium portfolio for a Senior Product Designer. White canvas meets editorial serif headings, generous whitespace, and subtle motion. Every element earns its place.

---

## 1. Visual Theme & Atmosphere

**Philosophy:** Refined restraint. The design communicates seniority and craft through negative space, precise typography, and understated motion — not through decoration. Think high-end print editorial adapted for screen.

**Key principles:**
- White canvas with near-black type — maximum contrast, zero visual noise
- Serif display headings (Noto Serif Display) signal editorial sophistication
- Sans-serif body (Inter) keeps UI elements clean and functional
- Light font-weight (300) as base — the design breathes
- Generous horizontal padding (`clamp(28px, 6vw, 88px)`) gives content room
- Animated morphing blob aurora in hero — lavender-to-cyan color drift using CSS `@property` and `color-mix`
- Guilloché wave lines layered over hero for depth
- Scroll-reveal animations with staggered delays for progressive disclosure

**Mood:** Calm authority. Like a well-curated gallery — each piece intentionally placed with room to appreciate it.

---

## 2. Color Palette & Roles

### Light Mode (Default)

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background | `--c-bg` | `#FFFFFF` | Page background |
| Surface | `--c-surface` | `#FFFFFF` | Card/component surfaces |
| Panel | `--c-panel` | `#F5F5F5` | Recessed panels, code blocks |
| Primary text | `--c-ink` | `#0A0A0A` | Headlines, body copy |
| Pure black | `--c-ink-pure` | `#000000` | Maximum emphasis only |
| Secondary text | `--c-mid` | `#555555` | Descriptions, metadata |
| Tertiary text | `--c-light` | `#999999` | Captions, timestamps |
| Ghost text | `--c-ghost` | `#CCCCCC` | Placeholder, disabled |
| Rule/border | `--c-rule` | `#E8E8E8` | Dividers, subtle borders |
| Dark rule | `--c-rule-dk` | `#C8C8C8` | Stronger dividers |
| Nav text | `--c-nav` | `#595959` | Navigation links |
| Hover | `--c-hover` | `#111111` | Interactive hover state |
| Border | `--c-border` | `#C0C0C0` | Input/card borders |
| Accent | `--c-accent` | `#4A90D9` | Focus rings, interactive highlights |

### Dark Mode (Material Design 3 inspired)

| Role | Value | Usage |
|------|-------|-------|
| Background | `#121212` | Page background |
| Surface | `#1D1B20` | Elevated surface |
| Panel | `#211F26` | Recessed areas |
| Primary text | `rgba(255,255,255,0.87)` | High-emphasis content |
| Secondary text | `rgba(255,255,255,0.60)` | Medium-emphasis |
| Tertiary text | `rgba(255,255,255,0.38)` | Hint/disabled |
| Rule/border | `rgba(255,255,255,0.12)` | Subtle dividers |
| Image treatment | `filter: brightness(0.88)` | Reduce glare in dark UI |

**Dark mode implementation:** Toggle via `data-theme` attribute on `<html>`. Persists in localStorage. Defaults to light theme on first visit.

### Hero Aurora Colors

The hero gradient orbs drift between lavender and cyan using CSS `@property` animations:
- Orb palette: soft lavenders, cyans, and warm neutrals
- Dark mode: gradients recomputed for lower-brightness backgrounds

---

## 3. Typography Rules

### Font Families

| Role | Font | Stack |
|------|------|-------|
| UI / Body | Inter | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Display / Headings | Noto Serif Display | `'Noto Serif Display', Georgia, 'Times New Roman', serif` |

### Type Scale (Fluid via `clamp()`)

| Token | Min | Preferred | Max | Usage |
|-------|-----|-----------|-----|-------|
| `--t-micro` | 9px | 1vw | 10px | Fine print |
| `--t-tiny` | 11px | 1.2vw | 12px | Eyebrow labels, tags |
| `--t-sm` | 13px | 1.4vw | 14px | Small UI text, metadata |
| `--t-base` | 15px | 1.6vw | 17px | Body copy |
| `--t-md` | 17px | 1.8vw | 20px | Subheadings, card titles |
| `--t-lg` | 22px | 2.4vw | 28px | Section subtitles |
| `--t-xl` | 30px | 3.8vw | 44px | Section titles |
| `--t-2xl` | 42px | 5.5vw | 60px | Page titles |

### Specialty Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--t-hero` | `clamp(56px, 9vw, 112px)` | Homepage hero title |
| `--t-work-hero` | `clamp(40px, 6vw, 80px)` | Work page hero |
| `--t-page-title` | `clamp(32px, 5vw, 56px)` | About/contact page title |
| `--t-section` | `clamp(22px, 2.8vw, 34px)` | Section headings |
| `--t-section-block` | `clamp(24px, 3vw, 36px)` | Large section blocks |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--fw-body` | 300 | Default body text (light) |
| `--fw-ui` | 400 | UI elements, nav |
| `--fw-medium` | 500 | Emphasized text |
| `--fw-semibold` | 600 | Card titles, buttons |
| `--fw-bold` | 700 | Strong emphasis |

### Typography Patterns

- **Eyebrow labels:** `10px`, uppercase, `letter-spacing: 0.22em`, weight 500, color `--c-light`
- **Body copy:** `--t-base`, weight 300, `line-height: 1.75` — generous leading for readability
- **Section headings:** Eyebrow label + title combo (`.sh-eyebrow` + `.sh-text`)
- **Hero titles:** Noto Serif Display, italic optional, `line-height: 1.05`
- **Card titles:** `clamp(15px, 1.7vw, 20px)`, weight 600

---

## 4. Component Stylings

### Navigation

- Fixed top, 72px height (`--nav: 72px`)
- Frosted glass on scroll: `backdrop-filter: blur(16px)`, semi-transparent background
- Logo left, links center/right
- Mobile: hamburger drawer with slide-in panel
- Link style: weight 400, color `--c-nav`, hover `--c-hover`

### Buttons

- **Primary:** `background: var(--c-ink)`, `color: #fff`, `border-radius: var(--r-pill)` (999px)
- **Ghost/Outline:** Transparent background, `1px solid var(--c-rule)`, hover fills
- **Padding:** `14px 32px` (generous horizontal)
- **Font:** weight 500, `--t-sm` size
- **Hover transition:** `var(--tb)` (220ms) with `var(--ease)`

### Cards (`.pcard`)

- `border-radius: var(--r-card)` (16px)
- `background: var(--c-panel)` or image thumbnail
- Subtle shadow on hover: `var(--sh-sm)` transitioning to `var(--sh-md)`
- Title below image, weight 600
- Description in `--c-mid`, weight 300

### Section Heading Pattern

```
.sh-eyebrow  →  tiny uppercase label (role/context)
.sh-text     →  larger title below (section name)
```

Consistent across all pages. Eyebrow provides context, title provides content.

### Project Page Template

- Breadcrumb navigation at top
- Hero image (full-width or contained)
- Metadata row: role, team, timeline, tools
- Body content: `.proj-body` with weight 300, generous line-height
- Image grid: 2-column with gap
- NDA block: styled notice for confidential work
- Next project CTA at bottom

### Dark Mode Toggle

- Sun/moon icon button in navigation
- Smooth icon crossfade
- Triggers `data-theme="dark"` on `<html>`
- Canvas animations recompute gradients

---

## 5. Layout Principles

### Spacing System

Based on an 8px grid:

| Use | Value |
|-----|-------|
| Tight spacing | 8px, 12px, 16px |
| Component gaps | 24px, 32px |
| Section gaps | 48px, 64px, 80px |
| Major section breaks | 100px, 120px, 140px |

### Container

- Max width: `--mw: 1340px`
- Side padding: `--pad: clamp(28px, 6vw, 88px)`
- Centered with `margin: 0 auto`
- Class: `.wrap`

### Hero Section

- Top padding: `calc(var(--nav) + 60px)` — clears fixed nav
- Bottom padding: ~140px
- Canvas background for animated aurora/wave effects
- Text overlay with z-index layering

### Grid

- Project cards: CSS Grid, responsive columns
- 2-column on desktop, single column on mobile
- Gap: 24px–32px

---

## 6. Depth & Elevation

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| 0 — Flat | — | none | Default state |
| 1 — Subtle | `--sh-xs` | `0 1px 3px rgba(0,0,0,.04)` | Resting cards |
| 2 — Lifted | `--sh-sm` | `0 2px 10px rgba(0,0,0,.06)` | Hovered elements |
| 3 — Floating | `--sh-md` | `0 6px 24px rgba(0,0,0,.08)` | Dropdowns, modals |
| 4 — Prominent | `--sh-lg` | `0 12px 48px rgba(0,0,0,.10)` | Feature cards, hero elements |

**Dark mode shadows:** Deeper multipliers since dark backgrounds absorb shadow.

---

## 7. Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--r-pill` | 999px | Buttons, tags, pills |
| `--r-card` | 16px | Cards, images, panels |
| `--r-panel` | 16px | Content panels |
| `--r-chip` | 8px | Chips, small tags |
| `--r-input` | 10px | Form inputs |

---

## 8. Motion & Animation

### Easing Curves

| Token | Value | Feel |
|-------|-------|------|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Smooth deceleration |
| `--spring` | `cubic-bezier(.34,1.56,.64,1)` | Bouncy overshoot |

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--tf` | 140ms | Micro-interactions (hover color) |
| `--tb` | 220ms | Standard transitions (buttons, links) |
| `--ts` | 420ms | Reveals, panel slides |
| `--tr` | 650ms | Scroll-reveal entrance animations |

### Scroll Reveal

- Elements start `translateY(32px)` + `opacity: 0`
- Animate to natural position on viewport entry
- Staggered via `data-d` attribute (100ms, 200ms, 300ms increments)
- Duration: `--tr` (650ms) with `--ease`

### Hero Animations

- **Morphing aurora:** CSS `@property` animated gradient orbs with `color-mix()` drift between lavender and cyan
- **Guilloché waves:** Canvas-drawn parametric curves with slow oscillation
- **GPU accelerated:** `will-change: transform`, `translateZ(0)`, `contain: layout style paint`

---

## 9. Do's and Don'ts

### Do

- Use generous whitespace — let content breathe
- Pair serif display headings with sans-serif body text
- Keep body text at weight 300 for the light, editorial feel
- Use fluid `clamp()` values for responsive typography
- Apply pill radius (999px) to all buttons and tags
- Use subtle shadows that grow on hover
- Stagger scroll-reveal animations for rhythm
- Keep dark mode at Material Design 3 canonical `#121212`
- Use eyebrow + title pattern for section headings

### Don't

- Use bold (700) for body text — it breaks the light aesthetic
- Add decorative borders — use shadows or subtle rules instead
- Use sharp corners (0 radius) on interactive elements
- Mix more than 2 typefaces
- Use saturated accent colors — the palette is intentionally neutral
- Add excessive motion or parallax — keep it calm
- Use traditional underlines on links — opacity/color transitions only
- Overcrowd layouts — the generous padding is intentional

---

## 10. Responsive Behavior

| Breakpoint | Target |
|------------|--------|
| < 480px | Mobile small |
| 480–768px | Mobile / small tablet |
| 768–1024px | Tablet |
| 1024–1340px | Desktop |
| > 1340px | Large desktop (max-width caps) |

**Key responsive rules:**
- Navigation collapses to hamburger drawer below 768px
- Project grid: 2 columns → 1 column below 768px
- Hero title scales fluidly via `clamp()` — no breakpoint jumps
- Side padding compresses from 88px → 28px via `clamp()`
- Touch targets: minimum 44px on mobile

---

## 11. Accessibility

- Skip-to-content link (hidden until focused)
- `:focus-visible` ring: `2px solid #4A90D9`, `offset: 3px`
- Semantic HTML throughout (`<nav>`, `<main>`, `<article>`, `<section>`)
- ARIA labels on navigation toggle and interactive elements
- Color contrast: `#0A0A0A` on `#FFFFFF` = 18.4:1 (AAA)
- Dark mode contrast: `rgba(255,255,255,0.87)` on `#121212` = 13.8:1 (AAA)
- Reduced motion: respects `prefers-reduced-motion`

---

## 12. Performance

- Images: WebP with PNG fallback
- Fonts: preloaded, non-blocking (`onload` swap)
- Canvas: GPU-accelerated, reduced draw steps (240 vs 480)
- `contain: layout style paint` on expensive animated elements
- 3px scrollbar for minimal visual interference
- `-webkit-font-smoothing: antialiased` for crisp rendering

---

## 13. File Structure

```
index.html              — Homepage (design tokens defined inline)
work.html               — Work listing with canvas wave animation
about.html              — Bio, expertise, experience
project-*.html          — Individual project case studies (9 total)
assets/
  dark-mode.css          — Dark palette (Material Design 3)
  dark-mode.js           — Theme toggle + persistence
  typography-system.css  — Shared type definitions
  *.webp / *.png         — Optimized project images
```

---

## 14. Agent Quick Reference

**When generating new pages or components, use these values:**

```css
/* Base setup */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-weight: 300;
line-height: 1.75;
background: #FFFFFF;
color: #0A0A0A;

/* Container */
max-width: 1340px;
padding: 0 clamp(28px, 6vw, 88px);
margin: 0 auto;

/* Card */
border-radius: 16px;
background: #F5F5F5;
box-shadow: 0 2px 10px rgba(0,0,0,.06);

/* Button */
border-radius: 999px;
padding: 14px 32px;
background: #0A0A0A;
color: #FFFFFF;
font-weight: 500;

/* Section heading */
/* Eyebrow: */ font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #999999;
/* Title:   */ font-size: clamp(22px, 2.8vw, 34px); color: #0A0A0A;

/* Hover transition */
transition: all 220ms cubic-bezier(.22,1,.36,1);
```

**Example component prompt:**
> "Create a project card with a 16px border-radius thumbnail image, a semibold title below, light-weight description in mid-gray, and a pill-shaped 'View Project' link. Hover lifts the card shadow from sh-sm to sh-md."
