// @ts-check
import { defineConfig } from 'astro/config';

// DECISION: Astro over Next. The page is one static document with a few
// islands of script, so Astro ships no framework runtime and first paint is
// HTML + CSS only. The brief named Astro 5; 7 is current stable and the
// static-output model is identical.
export default defineConfig({
  // The share image and canonical address must resolve where the site is hosted.
  // shannonhecker.com is the older public site and does not serve these files.
  site: 'https://shannonhecker-work.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  // Cache the shared stylesheet across cases instead of embedding the full
  // design system into every HTML document; tiny component styles stay inline.
  build: { format: 'file', inlineStylesheets: 'auto' },
  image: { responsiveStyles: false },
});
