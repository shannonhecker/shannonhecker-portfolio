# Cleanup Archive 2026-04-25

Created during project cleanup from `/Users/shannonhecker/Downloads/protofolio`.

## Archived From This Repo

- `shannonhecker-portfolio/`
  - Reason: directory contained only an incomplete `.git` folder with sample hooks/config and no working files.
  - New location: `archive/cleanup-20260425/in-repo/shannonhecker-portfolio-empty-git/`

## Archived From Sibling Downloads Folder

Copied from `/Users/shannonhecker/Downloads/` before deleting originals:

- `portfolio.html`
- `portfolio_landing.html`
- `portfolio_landing02.html`
- `portfolio_landing03.html`
- `portfolio_22_wave.html`
- `portfolio_22_wave_1.html`
- `Fusion_Analytics_Portfolio_Slides_Visual_Walkthrough.pptx`

These appear to be older standalone portfolio/prototype files, not referenced by the current repo.

## Verification

- `npm run build` completed successfully.
- `node --check api/server.js` completed successfully.
- `node --check serve-static.js` completed successfully.
- `npm --prefix api install` restored missing backend packages:
  - `express-rate-limit`
  - `helmet`
- API module load check completed successfully with `VERCEL=1`.

## Checksums

```text
c4273f16e965a70e1ed22d98855a7f8f5351b378  Fusion_Analytics_Portfolio_Slides_Visual_Walkthrough.pptx
7c139f2496d9ae545e8b26157c6ab30a9a3b7d09  portfolio.html
34c981ce9caabd18b0a42c51beea762a0ecefeb2  portfolio_22_wave.html
4403dd3d5d9abd8e218f95511ebfcccc1dd94fab  portfolio_22_wave_1.html
9355b0cbfa922c510674e46b566a9abc10dd9f20  portfolio_landing.html
f316503098999770ec9ca0a91bbad42068b73400  portfolio_landing02.html
34c981ce9caabd18b0a42c51beea762a0ecefeb2  portfolio_landing03.html
```
