import type { APIRoute } from 'astro';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { artworkKey, backdrops, themeArtwork } from '../../../lib/adaptive-art';

export const getStaticPaths = () => ['', 'case-responsive/', 'fusion-responsive/', 'home-responsive/']
  .flatMap(directory => readdirSync(resolve('public/art', directory))
    .filter(file => file.endsWith('.svg') && backdrops[artworkKey(directory + file)])
    .map(file => ({ params: { path: directory + file.replace(/\.svg$/, '') } })));

export const GET: APIRoute = ({ params }) => {
  const path = `${params.path}.svg`;
  const original = readFileSync(resolve('public/art', path), 'utf8');
  return new Response(themeArtwork(original, artworkKey(path)), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
