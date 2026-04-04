# Figma-to-Code Token Map

Figma file: [Shannon Hecker — Design System](https://www.figma.com/design/wJROW3KCcf6hqpcXDh5pCm)

## Variable Collections

| Figma Collection | Modes       | CSS File         |
|-----------------|-------------|------------------|
| Color           | Light, Dark | `tokens.css`     |
| Spacing         | Default     | `tokens.css`     |
| Radius          | Default     | `tokens.css`     |
| Typography      | Default     | `tokens.css`     |
| Layout          | Default     | `tokens.css`     |

## Color Token Map

| Figma Variable          | CSS Token (Light)    | CSS Token (Dark)            |
|------------------------|---------------------|-----------------------------|
| `surface/bg`           | `--c-bg: #FFFFFF`   | `--c-bg: #121212`           |
| `surface/surface`      | `--c-surface: #FFF` | `--c-surface: #1D1B20`      |
| `surface/panel`        | `--c-panel: #F5F5F5`| `--c-panel: #211F26`        |
| `text/ink`             | `--c-ink: #0A0A0A`  | `--c-ink: rgba(255,255,255,0.87)` |
| `text/ink-pure`        | `--c-ink-pure: #000`| `--c-ink-pure: #FFF`        |
| `text/mid`             | `--c-mid: #555`     | `--c-mid: rgba(255,255,255,0.60)` |
| `text/light`           | `--c-light: #999`   | `--c-light: rgba(255,255,255,0.38)`|
| `text/ghost`           | `--c-ghost: #CCC`   | `--c-ghost: rgba(255,255,255,0.12)`|
| `border/rule`          | `--c-rule: #E8E8E8` | `--c-rule: rgba(255,255,255,0.12)` |
| `border/rule-dk`       | `--c-rule-dk: #C8C8C8`| `--c-rule-dk: rgba(255,255,255,0.20)`|
| `border/border`        | `--c-border: #C0C0C0`| `--c-border: rgba(255,255,255,0.16)`|
| `interactive/nav`      | `--c-nav: #595959`  | `--c-nav: rgba(255,255,255,0.60)` |
| `interactive/hover`    | `--c-hover: #111`   | `--c-hover: rgba(255,255,255,0.87)`|
| `interactive/accent`   | `--c-accent: #4A90D9`| `--c-accent: #7AB3E8`      |
| `semantic/success`     | `--c-success: #2E7D32`| `--c-success: #66BB6A`    |
| `semantic/warning`     | `--c-warning: #ED6C02`| `--c-warning: #FFA726`    |
| `semantic/error`       | `--c-error: #D32F2F`| `--c-error: #EF5350`        |
| `semantic/info`        | `--c-info: #0288D1` | `--c-info: #29B6F6`         |
| `available`            | `--c-available: #22c55e`| `--c-available: #22c55e` |

## Component Map

| Figma Component      | CSS Classes                                                      |
|---------------------|------------------------------------------------------------------|
| Navigation          | `.nav` `.nav.s` `.nav-inner` `.nav-logo` `.nav-links` `.nav-cta` |
| Navigation / Mobile | `.nav-burger` `.nav-drawer` `.nav-right`                         |
| Theme Toggle        | `.theme-toggle` `.theme-icon--sun` `.theme-icon--moon`           |
| Hero                | `.hero` `.hero-name` `.hero-tagline` `.hero-descriptor`          |
| Hero / Stats        | `.hero-stats` `.hero-stat` `.hero-stat-num` `.hero-stat-label`   |
| Hero / CTA          | `.hero-cta` (gradient ring button)                               |
| Hero / Availability | `.hero-avail` `.hero-avail-dot`                                  |
| Hero / Role Line    | `.hero-role-line` `.hero-role-text` `.hero-role-sep`             |
| Hero / Scroll       | `.hero-scroll` `.hero-scroll-label`                              |
| Section Heading     | `.sh` `.sh-eyebrow` `.sh-row` `.sh-text` `.sh-link` `.sh-period`|
| Section / Portrait  | `.sh-title-group` `.sh-work-portrait`                            |
| Project Card        | `.pcard` `.pcard-article` `.pcard-img` `.pcard-body` `.pcard-title` |
| Placeholder Card    | `.ph` `.ph-1` through `.ph-8`                                   |
| About Panel         | `.about-panel` `.about-eyebrow` `.about-intro` `.about-body`    |
| About Links         | `.about-links` `.about-link`                                    |
| About Portrait      | `.about-portrait-panel`                                          |
| About Skills        | `.about-skills-panel` `.skills-label` `.skills-list` `.skill`    |
| Contact Panel       | `.contact-left` `.contact-heading` `.contact-sub`                |
| Contact Form        | `.contact-form-panel` `.contact-form` `.f-group` `.f-label`     |
| Form Input          | `.f-input` `.f-textarea`                                         |
| Form Button         | `.f-btn`                                                         |
| Footer Visual       | `.footer-visual` `.fv-blobs` `.fv-orb`                          |
| Footer              | `.footer` `.footer-inner` `.footer-copy` `.footer-role` `.footer-li` |
| Aurora Orbs (Hero)  | `.orb` `.orb-1` `.orb-2` `.orb-3` `.orb-4`                     |
| Aurora Orbs (Footer)| `.fv-orb` `.fv-orb-1` `.fv-orb-2` `.fv-orb-3`                  |
| Scroll Reveal       | `.rv` `.rv.on` `.rv[data-d="1"]` through `[data-d="6"]`         |
| Skip Link           | `.skip-link`                                                     |
| Section Divider     | `.section-divider`                                               |
| Bento Grid          | `.bento` `.bc-3` `.bc-4`                                         |
| Container           | `.wrap`                                                          |
| Cursor              | `#img-cursor`                                                    |

## Aurora Color Palettes

| Location | Orbs | CSS Custom Property | Gradient Colors |
|----------|------|--------------------|---------------------------------|
| Hero     | 4    | `--aurora`         | Lavender, Cyan, Periwinkle, Teal |
| Footer   | 3    | `--fv-aurora`      | Pink, Amber, Coral               |
| Work Hero| 3    | `--wh-aurora`      | Pink, Amber (same as footer)     |
| CTA Ring | 1    | `--cta-angle`      | Purple, Pink, Amber, Cyan        |

## How to Use

### In Code
```html
<link rel="stylesheet" href="design-system/index.css" />
```

### In Figma
1. Open the design system file
2. Publish as a library (Assets panel > Publish)
3. In any project file: Assets > Libraries > Enable "Shannon Hecker — Design System"
4. All components and variables are available
5. Switch dark/light: select any frame > Design panel > Color variables > change mode

### Adding a New Token
1. Add the CSS variable to `design-system/tokens.css`
2. Add the Figma variable to the appropriate collection
3. Add both values (light + dark) to `design-system/tokens.json`
4. Update this map

### Adding a New Component
1. Add the CSS to `design-system/components.css` in the correct section
2. Add dark mode overrides at the bottom of `components.css`
3. Add the component to `tokens.json` under `components`
4. Create the Figma component with matching structure
5. Update this map
