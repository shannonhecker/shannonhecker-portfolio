import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { themedNames, explicitThemeArtwork } from '../../../lib/themed-art';

// Compatibility for cached pages. New pages select explicit theme files.
export const getStaticPaths = () => themedNames.map(name => ({ params: { name } }));
export const GET: APIRoute = ({ params }) => {
  if (!themedNames.includes(params.name ?? '')) return new Response(null, { status: 404 });
  const original = readFileSync(resolve('public/art', `${params.name}.svg`), 'utf8');
  const rules = (['light','dark'] as const).map(theme => {
    const css = explicitThemeArtwork(original,params.name!,theme).match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
    return `@media(prefers-color-scheme:${theme}){${css}}`;
  }).join('\n');
  return new Response(original.replace(/(<svg\b[^>]*>)/, `$1<style>${rules}</style>`), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
