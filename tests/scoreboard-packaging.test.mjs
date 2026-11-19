import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
import { execFileSync } from 'node:child_process';

test('the protected preview packages only scoreboard functions and keeps its routing and score namespace', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'scoreboard-build-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  const config = '{"version":3,"routes":[{"src":"/(.*)","headers":{"X-Robots-Tag":"noindex"},"continue":true},{"handle":"filesystem"}]}';
  await writeFile(join(output, 'config.json'), config);
  await mkdir(join(output, 'static'));
  execFileSync(process.execPath, ['scripts/package-scoreboard.mjs', output]);

  assert.equal(await readFile(join(output, 'config.json'), 'utf8'), config);
  const functions = join(output, 'functions/api');
  assert.deepEqual((await readdir(functions)).sort(), ['game-run.func', 'leaderboard.func']);
  async function load(endpoint) {
    const directory = join(functions, endpoint + '.func');
    const settings = JSON.parse(await readFile(join(directory, '.vc-config.json'), 'utf8'));
    assert.equal(settings.runtime, 'nodejs22.x');
    assert.equal(settings.launcherType, 'Nodejs');
    return (await import(pathToFileURL(join(directory, settings.handler)))).default;
  }
  const gameRun = await load('game-run');
  const leaderboard = await load('leaderboard');

  // Exercise the same Node handler entry point that the Vercel launcher uses.
  const host = 'portfolio-unique-preview.vercel.app';
  async function request(handler, method, url, data, origin = 'https://' + host) {
    const input = Readable.from(data ? [Buffer.from(JSON.stringify(data))] : []);
    Object.assign(input, { method, url, headers: { host, origin, 'content-type': 'application/json' } });
    const result = { headers: {} };
    await handler(input, {
      setHeader(key, value) { result.headers[key.toLowerCase()] = value; },
      writeHead(status, headers) { result.status = status; Object.assign(result.headers, headers); return this; },
      end(body) { if (body?.length) result.body = JSON.parse(body); },
    });
    return result;
  }
  process.env.VERCEL_ENV = 'preview';
  process.env.KV_REST_API_TOKEN = 'unit-test-only';
  process.env.KV_REST_API_URL = 'https://unused.invalid';
  const commands = [];
  let rows = [];
  let rate = 1;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://unused.invalid');
    const command = JSON.parse(options.body);
    commands.push(command);
    let result = rate;
    if (command[0] === 'ZREVRANGE') result = rows;
    if (command[0] === 'EVAL' && command[2] === 2) {
      rows = [command.at(-1)];
      result = 1;
    }
    return Response.json({ result });
  });
  const issue = data => request(gameRun, 'POST', '/api/game-run', data);
  assert.equal((await request(gameRun, 'POST', '/api/game-run', { stage: 0 }, 'https://other.example')).status, 403);
  assert.equal((await issue({ stage: 8 })).status, 400);
  assert.equal((await request(gameRun, 'GET', '/api/game-run')).status, 405);
  assert.equal(commands.length, 0);

  const started = Date.now();
  const now = t.mock.method(Date, 'now', () => started);
  const run = await issue({ stage: 0 });
  assert.equal(run.status, 200);
  const data = { token: run.body.token, collected: 3, hits: 1, elapsed: 7000, nickname: 'River' };
  now.mock.mockImplementation(() => started + 7000);
  const submit = body => request(leaderboard, 'POST', '/api/leaderboard', body);
  assert.equal((await submit({ ...data, collected: 18 })).status, 400);
  assert.deepEqual((await submit(data)).body, { saved: true, score: 165 });
  const top = await request(leaderboard, 'GET', '/api/leaderboard?stage=0');
  assert.equal(top.headers['cache-control'], 'no-store');
  assert.deepEqual(top.body, { entries: [{ nickname: 'River', score: 165 }] });
  assert.equal(commands.at(-1)[1], 'shannonhecker-com:v1:preview:board:0');
  assert.match(commands[1][3], /^shannonhecker-com:v1:preview:rate:/);
  assert.equal(commands.find(c => c[2] === 2)[4], 'shannonhecker-com:v1:preview:board:0');

  process.env.VERCEL_ENV = 'production';
  assert.equal((await submit(data)).status, 400);
  await request(leaderboard, 'GET', '/api/leaderboard?stage=0');
  assert.equal(commands.at(-1)[1], 'shannonhecker-com:v1:production:board:0');
  rate = 121;
  assert.equal((await issue({ stage: 0 })).status, 429);
});
