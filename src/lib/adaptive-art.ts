// Only audited presentation backdrops become transparent in both themes. Product surfaces,
// raster bytes, paths, masks and phone frames retain their original colours.
export const backdrops: Record<string, { tag: 'rect' | 'path'; count: number }> = {
  'winking-hero-composition': { tag: 'rect', count: 5 },
  'winking-ios-composition': { tag: 'rect', count: 3 },
  'fusion-hero-discovery-composition': { tag: 'rect', count: 4 },
  'fusion-hero-performance-composition': { tag: 'rect', count: 4 },
  'fusion-configuration-composition': { tag: 'rect', count: 2 },
  'ai-hero-builder-composition': { tag: 'rect', count: 4 },
  'ai-hero-kit-composition': { tag: 'rect', count: 4 },
  'deal-hero-composition': { tag: 'rect', count: 2 },
  ...Object.fromEntries(['launch', 'home', 'activity', 'progress'].map(screen =>
    [`winking-ios-${screen}`, { tag: 'rect' as const, count: 1 }])),
  ...Object.fromEntries(['fx', 'fusion', 'ai', 'winking', 'deal'].flatMap(project =>
    ['current', 'mobile-current'].map(variant => [`home-${project}-composition-${variant}`, {
      tag: project === 'deal' ? 'path' as const : 'rect' as const,
      count: project === 'deal' ? (variant === 'current' ? 2 : 4) : project === 'winking' && variant === 'current' ? 4 : 2,
    }]))),
};

export function artworkKey(path: string): string {
  const name = path.split('/').pop()!.replace(/\.svg$/, '');
  if (path.includes('home-responsive/')) {
    return name.replace(/^(fx|fusion|ai|winking)-(.*)-\d+$/, 'home-$1-composition-$2');
  }
  return name.replace(/-\d+$/, '');
}

export function adaptiveArt(path: string): string {
  return backdrops[artworkKey(path)] ? path.replace('/art/', '/art/transparent/') : path;
}

export function themeArtwork(svg: string, key: string): string {
  const rule = backdrops[key];
  if (!rule) throw new Error(`Unaudited artwork: ${key}`);
  let marked = 0;
  const themed = svg.replace(new RegExp(`<${rule.tag}\\b[^>]*>`, 'g'), tag => {
    if (marked >= rule.count) return tag;
    if (/fill="url\(#pattern/.test(tag)) throw new Error(`Product image reached: ${key}`);
    if (rule.tag === 'rect') {
      const canvasWidth = Number(svg.match(/<svg\b[^>]*\bwidth="([\d.]+)"/)?.[1]);
      const layerWidth = Number(tag.match(/\bwidth="([\d.]+)"/)?.[1]);
      if (!canvasWidth || layerWidth < canvasWidth - 1) throw new Error(`Backdrop dimensions changed: ${key}`);
    }
    marked++;
    if (!/\bfill="[^"]+"/.test(tag)) throw new Error(`Backdrop fill missing: ${key}`);
    return tag.replace(/\bfill="([^"]+)"/, 'data-presentation-backdrop="$1" fill="none"');
  });
  if (marked !== rule.count) throw new Error(`Backdrop count changed: ${key}`);
  // Explicit transparent paint works in Safari and embedded browsers without
  // relying on the host document's colour scheme reaching an external SVG.
  // Keep the old paint as metadata so source integrity remains verifiable.
  return themed;
}
