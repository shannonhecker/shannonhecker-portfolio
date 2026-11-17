import { issue, json, limited, readBody, sameOrigin, validStage } from '../server/scoreboard.js';
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Same-site requests only' }, 403);
  let body;
  try { body = await readBody(req); } catch { return json({ error: 'Invalid request' }, 400); }
  if (!validStage(body.stage)) return json({ error: 'Invalid stage' }, 400);
  try {
    if (await limited(req)) return json({ error: 'Too many attempts. Try again later.' }, 429);
    return json({ token: issue(body.stage) });
  } catch { return json({ error: 'Scoreboard is resting. You can still play.' }, 503); }
}
