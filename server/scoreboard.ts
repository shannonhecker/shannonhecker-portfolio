import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { LEVELS } from '../src/game/levels.js';

export const ttl = 7200;
export const stageLimits = LEVELS.map(level => ({
  pickups: (level.rows.join('').match(/[ou]/g) || []).length,
  foes: (level.rows.join('').match(/E/g) || []).length,
}));
export function score(collected: number, hits: number) {
  return Math.max(100, 100 + collected * 25 - hits * 10);
}
export function nickname(value: unknown): string {
  if (typeof value !== 'string' || value.length > 20 || !/^[\p{L}\p{N} _-]*$/u.test(value)) throw new Error('Use up to 20 letters, numbers, spaces, hyphens or underscores.');
  return value.trim() || 'Explorer';
}
export function validStage(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) < stageLimits.length;
}
function secret() {
  const key = process.env.KV_REST_API_TOKEN;
  if (!key) throw new Error('Storage unavailable');
  return key;
}
export function namespace() { return `portfolio:v1:${process.env.VERCEL_ENV === 'production' ? 'production' : 'preview'}`; }
function signature(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
export function issue(stage: number, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ id: randomUUID(), stage, started: now, env: namespace() })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export function verify(token: unknown, now = Date.now()): { id: string; stage: number; started: number } {
  if (typeof token !== 'string' || token.length > 700) throw new Error('Invalid run');
  const [payload, signed, extra] = token.split('.');
  const expected = signature(payload || '');
  if (extra || !signed || signed.length !== expected.length || !timingSafeEqual(Buffer.from(signed), Buffer.from(expected))) throw new Error('Invalid run');
  const run = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (!validStage(run.stage) || run.env !== namespace() || !Number.isFinite(run.started) || now < run.started || now - run.started > ttl * 1000) throw new Error('Run expired. Play the stage again.');
  return run;
}
export function validateResult(body: Record<string, unknown>, run: { stage: number; started: number }, now = Date.now()) {
  const limits = stageLimits[run.stage];
  const { collected, hits, elapsed } = body;
  if (!Number.isInteger(collected) || Number(collected) < 0 || Number(collected) > limits.pickups || !Number.isInteger(hits) || Number(hits) < 0 || Number(hits) > 10000 || !Number.isInteger(elapsed) || Number(elapsed) < 5000 || Number(elapsed) > ttl * 1000 || Number(elapsed) > now - run.started + 3000 || now - run.started < 5000) throw new Error('This run could not be verified. Play the stage again.');
  return { nickname: nickname(body.nickname), score: score(Number(collected), Number(hits)), stage: run.stage };
}
export async function redis(command: unknown[]) {
  const url = process.env.KV_REST_API_URL;
  if (!url) throw new Error('Storage unavailable');
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${secret()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Storage unavailable');
  const data = await response.json();
  if (data.error) throw new Error('Storage unavailable');
  return data.result;
}
export function json(body: unknown, status = 200, cache = 'no-store') {
  return Response.json(body, { status, headers: { 'Cache-Control': cache } });
}
export function sameOrigin(req: Request) {
  return req.headers.get('origin') === new URL(req.url).origin && req.headers.get('content-type')?.startsWith('application/json');
}
export async function limited(req: Request) {
  // Only a daily keyed digest is stored, never the address itself. Expires after an hour.
  const address = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for') || 'local';
  const digest = signature(`${new Date().toISOString().slice(0, 10)}:${address}`);
  const count = await redis(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n", 1, `${namespace()}:rate:${digest}`]);
  return count > 120;
}
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > 2048) throw new Error('Request too large');
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request');
  return value;
}
