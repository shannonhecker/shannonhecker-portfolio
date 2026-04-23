# Motion system — shannonhecker.com

Single static HTML document with an embedded motion layer. No framework, no motion library, no build step. Every animation below composes from the primitives in this document.

## Principles

1. **Tokens over literals.** Any new motion consults the token block in `index.html:94–109`. New duration or easing enters the system only when an existing token genuinely doesn't fit — and the reason gets noted alongside the addition.
2. **Decelerate in, decelerate out.** Entrances use `--ease-decelerate`. Hovers and state flips use `--ease-standard`. Springs (`--ease-spring`) are reserved for tactile hover feedback (skill pills, magnetic release), never entrances — overshooting entrances read as juvenile.
3. **No more than two hero-scale motions at once.** Aurora keyframes + scroll parallax + cursor pull are one composite motion on `.orb`. Guilloché canvas breathing + scroll-reveal is another. Stacking a third concurrent effect would break the calm.
4. **Reduced motion is first-class.** Every interactive animation collapses to a static end state under `prefers-reduced-motion: reduce`. Not "faster" — absent. An opacity fade ≤ 200 ms is the only motion that may remain.
5. **Composite via individual transform properties.** Long-running keyframes claim `transform:`. Short-lived parallax / pull / magnetic-CTA motion all use the individual `translate:` property so they add rather than fight. This is how `.orb` keyframe drift + parallax + cursor pull all coexist on the same element without collision.
6. **One scroll listener.** All scroll-driven effects (nav glass, progress bar, orb parallax, hero text depth, background pinning) live in a single `scrollEffects` IIFE that shares one rAF per frame. Don't add a second scroll listener — fold new work into the existing one.

## Token reference

```css
/* Duration */
--dur-fast:     140ms   /* state flip: focus ring, toggle         */
--dur-base:     220ms   /* hover, press, chip activation          */
--dur-slow:     420ms   /* layout shift, nav glass, drawer        */
--dur-reveal:   650ms   /* entrances, scroll-reveal               */
--dur-ambient: 1200ms   /* reserved for slow drift — unused today */

/* Easing */
--ease-standard     /* cubic-bezier(.22,1,.36,1) — expressive exit   */
--ease-emphasized   /* cubic-bezier(.2, 0, 0, 1) — sharp entry       */
--ease-decelerate   /* cubic-bezier(0, 0, .2, 1) — pure decel        */
--ease-spring       /* cubic-bezier(.34,1.56,.64,1) — overshoot      */
```

Legacy tokens `--tf / --tb / --ts / --tr` and `--ease / --spring` remain in place and resolve to the same values. New code uses the verbose names; existing code stays as-is.

## Utility classes

Three classes do the work.

| Class | Purpose |
|---|---|
| `.rv` | Opacity + translateY reveal on intersection. Legacy API: `data-d="1".."6"` for stepped delays. New API: `style="--rv-i: N"` for grid cascades at 80 ms per step. |
| `.reveal-word` | Per-word entrance inside a parent. JS wraps each word of `.sh-text` headlines and sets `--i: N`. Cascade triggers when the enclosing `.rv` flips to `.on`. |
| `.magnetic` | Marker class. A single pointer handler reads it and writes `--mag-x / --mag-y` custom properties. The class uses `translate:` so it composes with existing `transform:` rules without conflict. |

## Interaction recipes

### Magnetic CTA

Apply `.magnetic` to any button or link. On pointer enter, the handler caches the rect; on pointer move, it updates `--mag-x / --mag-y` inside a rAF with a clamped `clientX - center` offset. On leave, the values reset and the 400 ms spring easing returns the element home. Pointer events are passive.

### Scroll-linked aurora parallax

Each aurora orb carries `data-p="N"` and a `--parallax-rate` defined in CSS. The consolidated `scrollEffects` IIFE reads every rate once at init and, on each scroll rAF, writes `--parallax-y = -scrollY * rate` on every `[data-p]` orb. The CSS composes this via the individual `translate:` property, so the existing `orbDrift` keyframes (which claim `transform:`) are untouched. Hero rates go up to 0.34; footer rates cap at 0.08 so the aurora settles as the reader reaches the footer. No CSS transition on the translate — smoothing is inherent to rAF scheduling plus the visual mass of the blurred orbs.

### Aurora cursor pull (hero only)

Each of the 4 hero orbs carries a `--pull-amp` (16 / 28 / 10 / 36 px) setting how far it can be pulled. A hero-scoped `pointermove` handler computes a normalized cursor position (`-1..+1` from center) and a rAF lerps each orb's `--pull-x / --pull-y` toward `target * amp` at 0.09 per frame. When the cursor leaves the hero, targets reset to `(0, 0)` and the lerp settles home; the rAF self-terminates when all orbs are within 0.1 px of target, so idle cost is zero. CSS composes pull with parallax via `translate: var(--pull-x) calc(var(--parallax-y) + var(--pull-y))`. Touch devices and `prefers-reduced-motion: reduce` early-return — no listeners attached.

### Per-word headline reveal

On DOMContentLoaded, a walker splits each `.sh-text` text node into word spans carrying `class="reveal-word" style="--i: N"`. Child elements (like `.sh-period`) get wrapped in a `.reveal-word` as their own cascade step. The CSS rule `.rv.on .reveal-word` flips them to the visible state using `transition-delay: calc(var(--i) * 40ms)` for the cascade.

### Scroll-progress indicator

A 2 px-tall gradient bar fixed at the top. Created inside `scrollEffects` and only under non-reduced motion. Each scroll frame, the handler writes `scrollY / (scrollHeight - innerHeight)` into `--scroll-progress` on the bar, which CSS applies via `transform: scaleX()`. The bar fades in after the first scroll event and fades out when back at the top.

## Reduced-motion contract

Under `prefers-reduced-motion: reduce`:

- All `animation-duration` and `transition-duration` values collapse to `0.01 ms`.
- `.rv`, `.reveal-word` resolve to their end state with no animation.
- `.magnetic` resets `translate` to `0 0` (the handler early-returns and never attaches listeners).
- Aurora parallax and cursor pull both reset `translate` to `0 0` on `.orb` and `.fv-orb` (their portion of `scrollEffects` and the entire `auroraCursorPull` handler early-return).
- Scroll-progress bar is never inserted into the DOM.
- Hero name slide-up collapses to `transform: none; clip-path: none`.

An opacity fade ≤ 200 ms is the only transition that may remain visible — justified because the alternative (pop-in) looks broken.

## Files

- `index.html:94–109` — motion tokens.
- `index.html:~135–200` — utility classes (`.rv`, `.reveal-word`, `.magnetic`).
- `index.html:~547–563` — aurora composite translate + parallax + pull amplitudes.
- `index.html:~1600` — reduced-motion block.
- `index.html:~2220` — per-word split IIFE + magnetic handler.
- `index.html:~2640` — `scrollEffects` (single scroll listener, all scroll work).
- `index.html:~2735` — `auroraCursorPull` (hero-only pointermove).

All motion lives in this one file. If that changes, update this document.

## History

- **hero-luminex.html** — an alternate hero direction (full-bleed luminous canvas + glassmorphic nav + bottom-left content block) that was built and reverted. Preserved as a frozen reference page with `noindex`. Aurora remains the production hero.
