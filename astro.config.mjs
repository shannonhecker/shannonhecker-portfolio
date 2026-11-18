// @ts-check
import { defineConfig } from 'astro/config';

// DECISION: Astro over Next. The page is one static document with a few
// islands of script, so Astro ships no framework runtime and first paint is
// HTML + CSS only. The brief named Astro 5; 7 is current stable and the
// static-output model is identical.
export default defineConfig({
  // Canonical host: the share image, canonical links and sitemap resolve here.
  site: 'https://shannonhecker.com',
  output: 'static',
  // Keep compiled scripts external so the production CSP only needs hashes for the early boot scripts.
  vite: { build: { assetsInlineLimit: (file) => file.endsWith('.js') ? false : undefined } },
  trailingSlash: 'never',
  // Cache the shared stylesheet across cases instead of embedding the full
  // design system into every HTML document; tiny component styles stay inline.
  build: { format: 'file', inlineStylesheets: 'auto' },
  image: { responsiveStyles: false },
});
