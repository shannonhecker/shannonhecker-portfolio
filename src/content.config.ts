import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The ten earlier projects imported from the old static site
// (scripts/import-legacy.mjs). The Markdown body holds the sections and inline
// images in their original order.
const earlier = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/earlier' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // The old page's lead sentence, also the page description.
      summary: z.string(),
      role: z.string(),
      dates: z.string(),
      // 1 to 10: the order projects are listed in, and the next-project loop.
      order: z.number().int().positive(),
      // The old file name (project-tripup.html), kept for the redirects.
      legacy: z.string(),
      // The rest of the old meta row (Client or Project, Project type), in order.
      details: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      outcomes: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
      tags: z.array(z.string()).min(1),
      cover: image(),
      coverAlt: z.string().min(1),
    }),
});

// The Writing articles imported from the old static site
// (scripts/import-writing.mjs). The Markdown body is the essay itself: paragraphs,
// numbered sections, a quote, and <dl class="essay-terms"> lists for the old callouts.
const writing = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    // The old page's meta description (also the JSON-LD description).
    description: z.string(),
    published: z.coerce.date(),
    // The old file name (writing-<slug>.html), kept for the redirects.
    legacy: z.string(),
    // The standfirst shown under the title on the article page.
    dek: z.string(),
    // The line shown under the title on the index; the old site worded it differently.
    blurb: z.string(),
    minutes: z.number().int().positive(),
    words: z.number().int().positive(),
    keywords: z.array(z.string()).default([]),
  }),
});

export const collections = { earlier, writing };
