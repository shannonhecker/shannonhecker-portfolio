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
  const routes = [{ src: '/(.*)', headers, continue: true }];
  for (const file of (await readdir(staticDir)).filter(name => name.endsWith('.html')).sort()) {
    const name = file.slice(0, -5);
    const aliases = ['/' + name];
    if (name === 'index') aliases.push('/', '/panel', '/build');
    if (name.startsWith('project-')) {
      const project = name.slice('project-'.length);
      if (!['barclays-data-viz', 'ausos'].includes(project)) {
        aliases.push(formerProjectPaths[project] || '/work/' + project);
      }
    }
    if (name.startsWith('writing-')) aliases.push('/writing/' + name.slice('writing-'.length));
    const path = join(staticDir, file);
    let html = await readFile(path, 'utf8');
    // A document opened on an old nested URL must resolve images, scripts,
    // fragment links and project links against its canonical HTML file.
    if (name !== 'index') {
      html = html.replace('<head>', '<head>\n  <base href="/' + file + '">');
      await writeFile(path, html);
    }
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
