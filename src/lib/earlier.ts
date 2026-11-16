// The ten earlier projects, in the order they are shown.
//
// This file has to stay importable from plain TypeScript (the sitemap route and
// the Playwright tests read EARLIER_SLUGS), so `astro:content` is a type-only
// import here and the collection is only loaded, lazily, inside the function.
import type { CollectionEntry } from 'astro:content';

export const EARLIER_SLUGS = [
  'stock-dashboard',
  'tripup',
  'design-system',
  'data-solution',
  'ui-toolkit',
  'corporate-action',
  'complex-assets',
  'research',
  'algo-center',
  'dps-brand',
] as const;

export type EarlierSlug = (typeof EARLIER_SLUGS)[number];

/** Every earlier project, sorted by its `order` field. */
export async function earlierProjects(): Promise<CollectionEntry<'earlier'>[]> {
  const { getCollection } = await import('astro:content');
  const entries = await getCollection('earlier');
  return entries.sort((a, b) => a.data.order - b.data.order);
}
