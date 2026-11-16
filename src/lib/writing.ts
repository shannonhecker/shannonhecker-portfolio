// The Writing articles, newest first.
//
// This file has to stay importable from plain TypeScript (the sitemap route reads
// WRITING_SLUGS), so `astro:content` is a type-only import here and the collection
// is only loaded, lazily, inside the function.
import type { CollectionEntry } from 'astro:content';

export const WRITING_SLUGS = [
  'when-everyone-can-ship',
  'the-design-system-is-the-contract',
  'trust-surfaces-in-ai',
] as const;

export type WritingSlug = (typeof WRITING_SLUGS)[number];

/** Every article, newest first. */
export async function writingEntries(): Promise<CollectionEntry<'writing'>[]> {
  const { getCollection } = await import('astro:content');
  const entries = await getCollection('writing');
  return entries.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

/** The date as the old site showed it, 2026-04-20. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Words as the old site showed them, 1,200. */
export const thousands = (n: number) => n.toLocaleString('en-GB');
