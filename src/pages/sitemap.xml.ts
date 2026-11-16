import type { APIRoute } from 'astro';
import { EARLIER_SLUGS } from '../lib/earlier';

// Lists every static page under src/pages without a hard-coded list.
// Pages that are not for search (404) and files with dynamic segments
// (art, case slugs) are skipped; add dynamic routes through `extraPaths`.
const files = Object.keys(import.meta.glob('./**/*.astro'));
const extraPaths: string[] = EARLIER_SLUGS.map((slug) => `/work/${slug}`);

const paths = [
  ...files
    .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, '').replace(/(^|\/)index$/, ''))
    .filter((route) => !route.includes('[') && route !== '404' && !route.split('/').some((segment) => segment.startsWith('_')))
    .map((route) => `/${route}`),
  ...extraPaths,
];

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://shannonhecker.com')).origin;
  const urls = [...new Set(paths)].sort((a, b) => a.length - b.length || a.localeCompare(b));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
