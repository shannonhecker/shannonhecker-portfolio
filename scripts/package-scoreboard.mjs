import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const [outputPath, staticDir] = process.argv.slice(2);
if (!outputPath) throw new Error('Usage: node scripts/package-scoreboard.mjs <build-output-directory> [vite-dist-directory]');
const output = resolve(outputPath);
if (staticDir) {
  // A normal Vercel build owns the full output. The prebuilt path already has
  // its own static files and routing policy and supplies just the first argument.
  await mkdir(output, { recursive: true });
  await cp(resolve(staticDir), join(output, 'static'), { recursive: true });
  const routes = [];
  if (process.env.VERCEL_ENV !== 'production') {
    routes.push({ src: '/(.*)', headers: { 'X-Robots-Tag': 'noindex' }, continue: true });
  }
  routes.push({ handle: 'filesystem' }, { src: '/(.*)', dest: '/404.html', status: 404 });
  await writeFile(join(output, 'config.json'), JSON.stringify({ version: 3, routes }, null, 2));
} else {
  const config = JSON.parse(await readFile(join(output, 'config.json'), 'utf8'));
  if (config.version !== 3) throw new Error('Expected a Vercel Build Output API v3 directory.');
}

const source = new URL('../server/scoreboard/', import.meta.url);
for (const endpoint of ['game-run', 'leaderboard']) {
  const directory = join(output, 'functions', 'api', endpoint + '.func');
  await mkdir(directory, { recursive: true });
  const handler = endpoint + '.mjs';
  // Vite bundles only the endpoint's imports, including the same level data as the game.
  await build({
    configFile: false,
    publicDir: false,
    logLevel: 'warn',
    build: {
      ssr: fileURLToPath(new URL(handler, source)),
      target: 'node22',
      outDir: directory,
      emptyOutDir: false,
      rollupOptions: { output: { entryFileNames: handler, format: 'es' } },
    },
  });
  await writeFile(join(directory, '.vc-config.json'), JSON.stringify({
    runtime: 'nodejs22.x', launcherType: 'Nodejs', handler, shouldAddHelpers: false,
  }, null, 2));
}
