import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { themedNames, explicitThemeArtwork } from '../../../../lib/themed-art';
export const getStaticPaths = () => themedNames.flatMap(name => ['light', 'dark'].map(theme => ({params:{name,theme}})));
export const GET: APIRoute = ({params}) => {
 if (!themedNames.includes(params.name ?? '') || !['light','dark'].includes(params.theme ?? '')) return new Response(null,{status:404});
 const original=readFileSync(resolve('public/art',`${params.name}.svg`),'utf8');
 return new Response(explicitThemeArtwork(original,params.name!,params.theme as 'light'|'dark'),{headers:{'Content-Type':'image/svg+xml; charset=utf-8'}});
};
