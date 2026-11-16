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

export const collections = { earlier };
