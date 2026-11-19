import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { siteRoutes } from '../scripts/site-routes.mjs';

test('the packaged homepage resolves assets from legacy URLs and carries its layout CSS', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'homepage-routing-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'assets'));
  for (const file of ['index.html', '404.html', 'assets/portfolio.css']) {
    await cp(new URL('../' + file, import.meta.url), join(dir, file));
  }

  const routes = await siteRoutes(dir, 'production');
  const html = await readFile(join(dir, 'index.html'), 'utf8');
  const css = await readFile(join(dir, 'assets/portfolio.css'), 'utf8');
  assert.ok(html.includes('<style>\n' + css + '\n</style>'));
  const base = html.match(/<base href="([^"]+)">/)[1];
  for (const path of ['/', '/panel/', '/build/']) {
    assert.ok(routes.some(route => route.dest === '/index.html' && new RegExp(route.src).test(path)));
    const url = new URL(base, 'https://shannonhecker.com' + path);
    assert.equal(new URL('assets/nav-scroll.js', url).pathname, '/assets/nav-scroll.js');
  }
});
