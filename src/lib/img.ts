import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/img/**/*.{jpg,png}', { eager: true });

/** Look up a source image by its prototype filename, e.g. "fx-cover.jpg". */
export function img(name: string): ImageMetadata {
  const mod = files[`../assets/img/${name}`];
  if (!mod) throw new Error(`Missing image: ${name}`);
  return mod.default;
}

/** Small WebP for the cursor-following index preview. */
export async function peekSrc(name: string): Promise<string> {
  return (await getImage({ src: img(name), width: 840, format: 'webp' })).src;
}
