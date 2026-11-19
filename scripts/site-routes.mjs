import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'parse5';

const formerProjectPaths = {
  analytics: '/fusion',
  fx: '/fx',
  uoaui: '/uoaui',
  winkingstar: '/winking-star',
  'deal-model': '/deal-model',
};

function pagePolicy(html) {
  const scripts = new Set();
  const handlers = new Set();
  const hash = text => "'sha256-" + createHash('sha256').update(text).digest('base64') + "'";
  function visit(node) {
    if (node.tagName === 'script' && !node.attrs.some(a => a.name === 'src')) {
      const text = node.childNodes.map(child => child.value).join('');
      if (text) scripts.add(hash(text));
    }
    for (const attr of node.attrs || []) {
      if (attr.name.startsWith('on')) handlers.add(hash(attr.value));
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(parse(html));
  return [
    "default-src 'self'",
    "script-src 'self' " + [...scripts, 'https://www.googletagmanager.com', 'https://*.clarity.ms'].join(' '),
    "script-src-attr " + (handlers.size ? "'unsafe-hashes' " + [...handlers].join(' ') : "'none'"),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
    "connect-src 'self' https://ask-shannon-api.onrender.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
    "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'none'",
  ].join('; ');
}

export async function siteRoutes(staticDir, environment) {
  const headers = {
    'Strict-Transport-Security': 'max-age=63072000',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  };
  if (environment !== 'production') headers['X-Robots-Tag'] = 'noindex, nofollow';
  const assets = join(staticDir, 'assets');
  const cssFiles = ['dark-mode.css', 'portfolio.css', 'typography-system.css'];
  const styles = new Map(await Promise.all(cssFiles.map(async file =>
    [file, await readFile(join(assets, file), 'utf8')]
  )));
  const themeJS = await readFile(join(assets, 'dark-mode.js'), 'utf8');
  const routes = [
    { src: '/(.*)', headers, continue: true },
    { src: '^/(?:panel|build)/?$', status: 308, headers: { Location: '/' } },
    { src: '^/assets/(?:main|game)-[A-Za-z0-9_-]{8}\\.(?:js|css)$',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
  ];
  for (const file of (await readdir(staticDir)).filter(name => name.endsWith('.html')).sort()) {
    const name = file.slice(0, -5);
    const aliases = ['/' + name];
    if (name === 'index') aliases.push('/');
    if (name.startsWith('project-')) {
      const project = name.slice('project-'.length);
      if (!['barclays-data-viz', 'ausos'].includes(project)) {
        aliases.push(formerProjectPaths[project] || '/work/' + project);
      }
    }
    if (name.startsWith('writing-')) aliases.push('/writing/' + name.slice('writing-'.length));
    const path = join(staticDir, file);
    let html = await readFile(path, 'utf8');
    // Directory-style aliases must resolve assets and links from the canonical page.
    const base = name === 'index' ? '/' : '/' + file;
    html = html.replace('<head>', '<head>\n  <base href="' + base + '">');
    // Preserve cascade order and deliver the common layout in the first response.
    html = html
      .replace(/<link rel="stylesheet" href="\/?assets\/([\w-]+\.css)(?:\?[^"]*)?"\s*\/?>/g,
        (link, file) => styles.has(file) ? '<style>\n' + styles.get(file) + '\n</style>' : link)
      .replace(/<script src="\/?assets\/dark-mode\.js"(?: defer)?><\/script>/, () => '<script>\n' + themeJS + '\n</script>');
    if (name === 'project-uoaui') {
      const wordmark = await readFile(join(assets, 'uoaui-logo-lockup.png'), 'base64');
      html = html.replace('src="assets/uoaui-logo-lockup.png"', 'src="data:image/png;base64,' + wordmark + '"');
    }
    if (name === 'index') {
      const portrait = await readFile(join(assets, 'featured-portrait.jpg'), 'base64');
      html = html.replace('src="assets/featured-portrait.jpg"', 'src="data:image/jpeg;base64,' + portrait + '"');
      // Bind the contact form even when the browser loses a separate script request.
      const chat = await readFile(join(assets, 'ask-shannon.js'), 'utf8');
      html = html.replace('<script src="assets/ask-shannon.js"></script>', () => '<script>\n' + chat + '\n</script>');
    }
    await writeFile(path, html);
    const aliasPattern = '(?:' + aliases.filter(p => p !== '/').join('|') + ')/?';
    const root = name === 'index' ? '|/' : '';
    const source = '^(?:/' + name + '\\.html|' + aliasPattern + root + ')$';
    routes.push({ src: source, headers: { 'Content-Security-Policy': pagePolicy(html) }, continue: true });
    routes.push({ src: '^(?:' + aliasPattern + root + ')$', dest: '/' + file });
  }
  for (const [src, dest] of Object.entries({
    '/og-card.png':'/assets/og-preview.png', '/apple-touch-icon.png':'/assets/apple-touch-icon.png',
    '/favicon.svg':'/assets/favicon.svg', '/og.jpg':'/assets/og-preview.png',
  })) routes.push({ src: '^' + src.replaceAll('.', '\\.') + '$', dest });
  routes.push({ handle: 'filesystem' }, { src: '/(.*)', status: 404, dest: '/404.html',
    headers: { 'Content-Security-Policy': pagePolicy(await readFile(join(staticDir,'404.html'),'utf8')) } });
  return routes;
}
