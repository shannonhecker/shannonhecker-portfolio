import { json, limited, namespace, readBody, redis, sameOrigin, validStage, validateResult, verify } from '../server/scoreboard.js';
export async function GET(req: Request) {
  const value = new URL(req.url).searchParams.get('stage');
  const stage = value === null ? -1 : Number(value);
  if (!validStage(stage)) return json({ error: 'Invalid stage' }, 400);
  try {
    const rows = await redis(['ZREVRANGE', `${namespace()}:board:${stage}`, 0, 9]);
    return json({ entries: rows.map((row: string) => { const item = JSON.parse(row); return { nickname: item.nickname, score: item.score }; }) }, 200, 'public, max-age=0, s-maxage=30');
  } catch { return json({ error: 'Scoreboard is resting. Try again shortly.' }, 503); }
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Same-site requests only' }, 403);
  let run, result;
  try { const body = await readBody(req); run = verify(body.token); result = validateResult(body, run); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Invalid run' }, 400); }
  try {
    if (await limited(req)) return json({ error: 'Too many attempts. Try again later.' }, 429);
    // The one-time receipt and score insert are atomic. A lost response can be retried safely.
    const script = `if redis.call('EXISTS',KEYS[1])==1 then return 0 end
      redis.call('SET',KEYS[1],'1','EX',7200)
      redis.call('ZADD',KEYS[2],ARGV[1],ARGV[2])
      redis.call('ZREMRANGEBYRANK',KEYS[2],0,-101)
      return 1`;
    await redis(['EVAL', script, 2, `${namespace()}:submitted:${run.id}`, `${namespace()}:board:${run.stage}`, result.score, JSON.stringify({ ...result, id: run.id })]);
    return json({ saved: true, score: result.score });
  } catch { return json({ error: 'Could not save just now. Your score is safe on this screen; try again.' }, 503); }
}
