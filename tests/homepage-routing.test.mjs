import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { siteRoutes } from '../scripts/site-routes.mjs';

test('packaged pages carry their shared styles and resolve assets from legacy URLs', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'homepage-routing-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'assets'));
  for (const file of ['index.html', 'project-fx.html', '404.html', 'assets/typography-system.css', 'assets/portfolio.css', 'assets/dark-mode.css', 'assets/dark-mode.js', 'assets/ask-shannon.js', 'assets/featured-portrait.jpg']) {
    await cp(new URL('../' + file, import.meta.url), join(dir, file));
  }

  const routes = await siteRoutes(dir, 'production');
  const html = await readFile(join(dir, 'index.html'), 'utf8');
  const css = await readFile(join(dir, 'assets/portfolio.css'), 'utf8');
  const typography = await readFile(join(dir, 'assets/typography-system.css'), 'utf8');
  for (const page of ['index.html', 'project-fx.html', '404.html']) {
    const document = await readFile(join(dir, page), 'utf8');
    assert.ok(document.includes('<style>\n' + css + '\n</style>'));
    if (page !== '404.html') assert.ok(document.includes('<style>\n' + typography + '\n</style>'));
    assert.doesNotMatch(document, /<link[^>]+href="[^"]*(?:portfolio|typography-system)\.css/);
    assert.ok(document.includes(await readFile(join(dir, 'assets/dark-mode.css'), 'utf8')));
    assert.ok(document.includes(await readFile(join(dir, 'assets/dark-mode.js'), 'utf8')));
  }
  assert.ok(html.includes(await readFile(join(dir, 'assets/ask-shannon.js'), 'utf8')));
  assert.doesNotMatch(html, /<script src="assets\/ask-shannon\.js"/);
  const portrait = await readFile(join(dir, 'assets/featured-portrait.jpg'), 'base64');
  assert.ok(html.includes('<img src="data:image/jpeg;base64,' + portrait + '"'));
  const base = html.match(/<base href="([^"]+)">/)[1];
  for (const path of ['/panel/', '/build/']) {
    assert.ok(routes.some(route => route.status === 308 && route.headers.Location === '/' && new RegExp(route.src).test(path)));
  }
  for (const path of ['/', '/index']) {
    assert.ok(routes.some(route => route.dest === '/index.html' && new RegExp(route.src).test(path)));
    const url = new URL(base, 'https://shannonhecker.com' + path);
    assert.equal(new URL('assets/nav-scroll.js', url).pathname, '/assets/nav-scroll.js');
  }
});
