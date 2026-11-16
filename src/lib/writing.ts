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

/**
 * How long an essay really is, read from its rendered body so the figures cannot
 * drift from the text. `words` is the exact count (for structured data), `shown`
 * the same rounded to the nearest 50 (what a visitor sees), `minutes` the reading
 * time at 200 words a minute, rounded up. The index and the article both call this,
 * so they always agree.
 */
export function bodyStats(entry: CollectionEntry<'writing'>) {
  const html = entry.rendered?.html;
  if (!html) throw new Error(`writing/${entry.id}: no rendered body to count`);
  const text = html
    .replace(/<\/?(?:p|h[1-6]|blockquote|div|dl|dt|dd|li|ul|ol|br|hr)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, shown: Math.round(words / 50) * 50, minutes: Math.max(1, Math.ceil(words / 200)) };
}
