import { test, expect, type Page, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Ask Shannon: the streamed chat on the home page. The real server is never called. Most
// tests answer the request with page.route(); the streaming and follow-scroll tests need to
// hold a response open between chunks, which route.fulfill cannot do, so those swap fetch for
// a stub whose stream the test controls. Either way the request body is checked.
const API = 'https://ask-shannon-api.onrender.com/api/chat';
const HEALTH = 'https://ask-shannon-api.onrender.com/api/chat?wake=1';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const REACH = 'I couldn’t reach the chat just now. Try again in a moment.';
const REACH_ASCII = "I couldn't reach the chat just now. Try again in a moment.";
const RATE = 'You’re asking quickly. Wait a minute and try again.';
const WAKING = 'Waking the chat up. This can take up to a minute.';
const SPEECH_OFF = 'Speech to text isn’t available here. You can type instead.';

const sse = (...texts: string[]) => texts.map((t) => `data: ${JSON.stringify({ text: t })}\n\n`).join('') + 'data: [DONE]\n\n';
const reply = (route: Route, body: string) => route.fulfill({ status: 200, contentType: 'text/event-stream', body });

async function open(page: Page, theme: 'dark' | 'light' = 'light') {
  // The wake-up ping is answered here so no test ever reaches the real server.
  await page.route(HEALTH, (route) => route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' }, body: '' }));
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('portfolio-theme', t);
      localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() }));
    } catch { /* storage blocked */ }
  }, theme);
  await page.goto('/');
  await page.locator('#ask').scrollIntoViewIfNeeded();
}

// Replace fetch for the chat URL with a response the test feeds chunk by chunk.
async function holdStream(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    w.__askCalls = [];
    const real = w.fetch.bind(w);
    w.fetch = (input: any, init: any) => {
      const url = typeof input === 'string' ? input : input.url;
      // The wake call (?wake=1) goes to the network, where open() answers it.
      if (!url.endsWith('ask-shannon-api.onrender.com/api/chat')) return real(input, init);
      w.__askCalls.push({ url, method: init?.method, headers: init?.headers, body: JSON.parse(init?.body ?? 'null') });
      let ctrl: ReadableStreamDefaultController<Uint8Array>;
      const body = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; } });
      w.__push = (s: string) => ctrl.enqueue(new TextEncoder().encode(s));
      w.__pushBytes = (a: number[]) => ctrl.enqueue(new Uint8Array(a));
      w.__end = () => ctrl.close();
      return Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
    };
  });
}
const push = (page: Page, s: string) => page.evaluate((x) => (window as any).__push(x), s);
const pushBytes = (page: Page, bytes: number[]) => page.evaluate((x) => (window as any).__pushBytes(x), bytes);
const end = (page: Page) => page.evaluate(() => (window as any).__end());

const input = (page: Page) => page.locator('#ask-input');
const send = (page: Page) => page.locator('#ask-send');
const log = (page: Page) => page.locator('#ask-messages');

test.describe('Ask Shannon', () => {
  test('streams an answer', async ({ page }) => {
    await holdStream(page);
    await open(page);
    await expect(log(page)).toHaveAttribute('role', 'log');
    await expect(log(page)).toHaveAttribute('aria-live', 'polite');
    await expect(page.getByRole('heading', { name: 'Ask Shannon a question' })).toBeVisible();
    await expect(input(page)).toHaveAttribute('placeholder', 'Ask about my work, career, or current projects.');

    await input(page).fill('What is uoaui.ai?');
    await send(page).click();

    // The question is set first, then the answer grows chunk by chunk.
    await expect(page.locator('.ask-msg--user')).toHaveText(/What is uoaui\.ai\?/);
    const answer = page.locator('.ask-msg--ai.streaming');
    await expect(answer).toHaveCount(1);
    await push(page, 'data: {"text":"It is a "}\n\n');
    await expect(answer).toContainText('It is a');
    await push(page, 'data: {"text":"design system builder."}\n\n');
    await expect(answer).toContainText('It is a design system builder.');
    await expect(send(page)).toBeDisabled();
    await push(page, 'data: [DONE]\n\n');
    await end(page);
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(page.locator('.ask-msg--ai').last()).toContainText('It is a design system builder.');
    await expect(send(page)).toBeEnabled();

    // The protocol: POST JSON {messages:[{role,content}]}, the visitor's turns and earlier answers only.
    const calls = await page.evaluate(() => (window as any).__askCalls);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://ask-shannon-api.onrender.com/api/chat');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].headers).toEqual({ 'Content-Type': 'application/json' });
    expect(calls[0].body).toEqual({ messages: [{ role: 'user', content: 'What is uoaui.ai?' }] });
  });

  test('a second question sends the first answer as history', async ({ page }) => {
    const bodies: unknown[] = [];
    await page.route(API, async (route) => {
      bodies.push(route.request().postDataJSON());
      await reply(route, sse('First answer.'));
    });
    await open(page);
    await input(page).fill('One');
    await send(page).click();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(send(page)).toBeEnabled();
    await input(page).fill('Two');
    await send(page).click();
    await expect(page.locator('.ask-msg--user')).toHaveCount(2);
    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[1]).toEqual({ messages: [
      { role: 'user', content: 'One' },
      { role: 'assistant', content: 'First answer.' },
      { role: 'user', content: 'Two' },
    ] });
  });

  test('suggestion chips', async ({ page }) => {
    await page.route(API, (route) => reply(route, sse('Sure.')));
    await open(page);
    const chips = page.locator('#ask-suggestions button');
    await expect(chips).toHaveCount(4);
    const first = await chips.allTextContents();
    expect(first.every((t) => t.trim().length > 0)).toBe(true);
    await chips.first().click();
    await expect(page.locator('.ask-msg--user')).toHaveText(new RegExp(first[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    const second = await chips.allTextContents();
    expect(second).toHaveLength(4);
    expect(second).not.toEqual(first);
    // Chips are real buttons, so the keyboard reaches them.
    await expect(chips.first()).toHaveAttribute('type', 'button');
  });

  test('server asleep', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    await page.route(API, (route) => route.abort('failed'));
    await open(page);
    await input(page).fill('Hello?');
    await send(page).click();
    const error = page.locator('#ask-messages .ask-error');
    await expect(error).toHaveCount(1);
    await expect(error).toHaveText(REACH);
    expect(REACH).not.toBe(REACH_ASCII); // the page uses the typographic apostrophe the site uses everywhere
    await expect(send(page)).toBeEnabled();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    expect(errors).toEqual([]);
    // A retry works once the server is back.
    await page.unroute(API);
    await page.route(API, (route) => reply(route, sse('Back now.')));
    await input(page).fill('Hello again');
    await send(page).click();
    await expect(page.locator('.ask-msg--ai').last()).toContainText('Back now.');
  });

  for (const status of [500, 429]) {
    test(`server error ${status}`, async ({ page }) => {
      const errors: Error[] = [];
      page.on('pageerror', (e) => errors.push(e));
      await page.route(API, (route) => route.fulfill({ status, contentType: 'application/json', body: '{"error":"nope"}' }));
      await open(page);
      await input(page).fill('Hello?');
      await send(page).click();
      await expect(page.locator('#ask-messages .ask-error')).toHaveText(status === 429 ? RATE : REACH);
      // One announcement only: the log carries the visible line, the status line stays quiet.
      await expect(page.locator('#ask-status')).toHaveText('');
      await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
      await expect(send(page)).toBeEnabled();
      expect(errors).toEqual([]);
    });
  }

  test('an error event inside the stream is shown as the same plain message', async ({ page }) => {
    await page.route(API, (route) => reply(route, 'data: {"text":"Partly"}\n\ndata: {"error":"upstream failed"}\n\n'));
    await open(page);
    await input(page).fill('Hello?');
    await send(page).click();
    await expect(page.locator('#ask-messages .ask-error')).toHaveText(REACH);
    await expect(send(page)).toBeEnabled();
  });

  test('server slow', async ({ page }) => {
    await page.route(API, async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await reply(route, sse('Worth the wait.'));
    });
    await open(page);
    await input(page).fill('Anyone there?');
    await send(page).click();
    // A visible waiting state, announced politely, inside 500 ms.
    await expect(page.locator('.ask-wait')).toBeVisible({ timeout: 500 });
    await expect(page.locator('#ask-status')).toHaveText(/replying|thinking/i, { timeout: 500 });
    await expect(log(page)).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.ask-msg--ai').last()).toContainText('Worth the wait.', { timeout: 8000 });
    await expect(page.locator('.ask-wait')).toHaveCount(0);
    await expect(log(page)).not.toHaveAttribute('aria-busy', 'true');
  });

  test('limits', async ({ page }) => {
    let requests = 0;
    await page.route(API, async (route) => { requests++; await reply(route, sse('Ok.')); });
    await open(page);
    await expect(input(page)).toHaveAttribute('maxlength', '1000');
    await expect(page.locator('label[for="ask-input"]')).toHaveCount(1);
    await expect(page.locator('form#ask-form')).toHaveCount(1);

    // Empty and whitespace-only messages do not send.
    await input(page).focus();
    await page.keyboard.press('Enter');
    await input(page).fill('   \n  ');
    await page.keyboard.press('Enter');
    await send(page).click();
    await page.waitForTimeout(200);
    expect(requests).toBe(0);
    await expect(page.locator('.ask-msg--user')).toHaveCount(0);

    // Shift+Enter adds a line; Enter sends.
    await input(page).fill('');
    await input(page).pressSequentially('first');
    await page.keyboard.press('Shift+Enter');
    await input(page).pressSequentially('second');
    await expect(input(page)).toHaveValue('first\nsecond');
    expect(requests).toBe(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('.ask-msg--user')).toHaveCount(1);
    await expect(page.locator('.ask-msg--user')).toContainText('first');
    await expect(page.locator('.ask-msg--user')).toContainText('second');
    await expect(input(page)).toHaveValue('');
    expect(requests).toBe(1);
  });

  test.describe('mic button', () => {
    test('hidden when speech recognition is not available', async ({ page }) => {
      await page.addInitScript(() => {
        for (const k of ['SpeechRecognition', 'webkitSpeechRecognition']) {
          try { delete (window as any)[k]; } catch { /* ignore */ }
          try { Object.defineProperty(window, k, { value: undefined, configurable: true }); } catch { /* ignore */ }
        }
      });
      await open(page);
      await expect(page.locator('#ask-mic')).toBeHidden();
      await expect(page.getByRole('button', { name: 'Speech to text' })).toHaveCount(0);
    });

    test('present and labelled when it is, and it fills the box', async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).SpeechRecognition = class {
          onresult: any; onend: any; onerror: any;
          start() { setTimeout(() => this.onresult?.({ resultIndex: 0, results: [[{ transcript: 'Tell me about Fusion' }]] }), 20); }
          stop() { this.onend?.(); }
        };
      });
      await open(page);
      const mic = page.getByRole('button', { name: 'Speech to text' });
      await expect(mic).toBeVisible();
      await expect(mic).toHaveAttribute('aria-label', 'Speech to text');
      await mic.click();
      await expect(input(page)).toHaveValue('Tell me about Fusion');
    });
  });

  test('only on home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#ask')).toHaveCount(1);
    await expect(page.locator('#ask-messages')).toHaveCount(1);
    for (const path of ['/about', '/work']) {
      await page.goto(path);
      await expect(page.locator('#ask'), path).toHaveCount(0);
      await expect(page.locator('#ask-messages'), path).toHaveCount(0);
    }
  });

  test('a long answer leaves the question on the log’s top edge and offers a button to follow the stream', async ({ page }) => {
    await holdStream(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    await input(page).fill('Tell me everything');
    await send(page).click();
    const para = 'A long paragraph of answer text that keeps going so the pane has to scroll. ';
    await push(page, `data: ${JSON.stringify({ text: para.repeat(60) })}\n\n`);
    await expect.poll(() => log(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    // The stream is not pinned to the foot, so the question is never pushed through the top edge.
    const edge = await log(page).evaluate((el) => el.querySelector('.ask-msg--user')!.getBoundingClientRect().top - el.getBoundingClientRect().top);
    expect(edge, 'the question is never sliced by the top edge').toBeGreaterThanOrEqual(-1);
    const follow = page.locator('#ask .ask-follow');
    await expect(follow).toBeVisible();
    await expect(follow).toHaveAccessibleName('Scroll to latest message');
    await follow.click();
    await expect(follow).toBeHidden();
    await expect.poll(() => log(page).evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(41);
    // Following now, the stream keeps the latest line in view.
    await push(page, `data: ${JSON.stringify({ text: ' More.' })}\n\n`);
    await expect.poll(() => log(page).evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(41);
    await push(page, 'data: [DONE]\n\n');
    await end(page);
  });

  test('shows the disclaimer and the privacy link', async ({ page }) => {
    await open(page);
    const note = page.locator('#ask .ask-note');
    await expect(note).toContainText('I’m Shannon’s AI. I can be wrong, and Shannon may review chats to improve this portfolio. Don’t share confidential info.');
    await expect(note.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`both themes: axe finds nothing serious in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.route(API, (route) => reply(route, sse('Here is a **bold** answer with a [link](https://uoaui.ai/) and some more words to wrap.')));
      await open(page, theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const scan = async (label: string) => {
        const { violations } = await new AxeBuilder({ page }).include('#ask').withTags(WCAG).analyze();
        const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(bad.map((v) => `${label} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      };
      await scan('empty');
      await input(page).fill('Say something');
      await send(page).click();
      await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
      await expect(page.locator('.ask-msg--ai').last()).toContainText('Here is a bold answer');
      await scan('conversation');
      await page.unroute(API);
      await page.route(API, (route) => route.abort('failed'));
      await input(page).fill('And again');
      await send(page).click();
      await expect(page.locator('.ask-error')).toHaveCount(1);
      await scan('error');
    });
  }

  test('phone: nothing overflows and targets are big enough', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => { (window as any).SpeechRecognition = class { start() {} stop() {} }; });
    await page.route(API, (route) => reply(route, sse('A reply long enough to wrap onto a couple of lines on a phone screen, with a verylongunbrokenwordthatmustnotpushthepagewideraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.')));
    await open(page);
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    for (const target of [input(page), send(page), page.locator('#ask-mic')]) {
      const box = (await target.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
    await input(page).fill('Hi');
    await send(page).click();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    expect(await overflow()).toBeLessThanOrEqual(0);
    const small: string[] = [];
    for (const b of await page.locator('#ask button:visible').all()) {
      const box = (await b.boundingBox())!;
      if (box.height < 44 || box.width < 44) small.push(`${(await b.textContent())?.trim() || (await b.getAttribute('aria-label'))} ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
    expect(small).toEqual([]);
  });

  for (const [name, size] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]] as const) {
    test(`look (${name}): round Send, centred pills, a gradient card, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript(() => { (window as any).SpeechRecognition = class { start() {} stop() {} }; });
      await open(page, 'dark');
      // Send keeps its name and is a round target of at least 44 by 44.
      await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
      const sendBox = (await send(page).boundingBox())!;
      expect(sendBox.width).toBeGreaterThanOrEqual(44);
      expect(sendBox.height).toBeGreaterThanOrEqual(44);
      await expect(send(page)).toHaveCSS('border-top-left-radius', '50%');
      const micBox = (await page.locator('#ask-mic').boundingBox())!;
      expect(micBox.width).toBeGreaterThanOrEqual(44);
      await expect(page.locator('#ask-mic')).toHaveCSS('border-top-left-radius', '50%');
      // The conversation sits in one rounded card.
      expect(parseFloat(await page.locator('#ask .ask-main').evaluate((el) => getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(24);
      // The suggestion pills are visible, rounded and centred on the card.
      const chips = page.locator('#ask-suggestions .ask-chip');
      expect(await chips.count()).toBeGreaterThan(0);
      const main = (await page.locator('#ask .ask-main').boundingBox())!;
      const mid = main.x + main.width / 2;
      let left = Infinity; let right = -Infinity;
      for (const c of await chips.all()) {
        await expect(c).toBeVisible();
        await expect(c).toHaveCSS('border-top-left-radius', /^(999|[0-9]{4,})px$|^[2-9][0-9]px$/);
        const b = (await c.boundingBox())!;
        left = Math.min(left, b.x); right = Math.max(right, b.x + b.width);
      }
      expect(Math.abs((left + right) / 2 - mid)).toBeLessThanOrEqual(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }

  test('safe rendering: an answer is text, never markup', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    const nasty = '<img src=x onerror="window.__pwned=1"> and <script>window.__pwned=2</script> **bold** [bad](javascript:window.__pwned=3) [good](https://www.linkedin.com/in/shannonhecker/) `code`';
    await page.route(API, (route) => reply(route, sse(nasty)));
    await open(page);
    await input(page).fill('<b>me</b>');
    await send(page).click();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    const answer = page.locator('.ask-msg--ai').last();
    await expect(answer).toContainText('<img src=x onerror="window.__pwned=1">');
    await expect(answer).toContainText('<script>window.__pwned=2</script>');
    await expect(log(page).locator('img, script, b')).toHaveCount(0);
    await expect(page.locator('.ask-msg--user')).toContainText('<b>me</b>');
    expect(await page.evaluate(() => (window as any).__pwned)).toBeUndefined();
    // Only allow-listed hosts become links, and they open safely.
    const hrefs = await answer.locator('a').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.getAttribute('rel')]));
    expect(hrefs).toEqual([['https://www.linkedin.com/in/shannonhecker/', 'noopener noreferrer']]);
    expect(errors).toEqual([]);
  });

  test('the system cursor shows over the whole widget', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    // Wake the avatar cursor on the hero first, then move into the widget.
    await page.evaluate(() => scrollTo(0, 0));
    await page.mouse.move(700, 450);
    await page.mouse.move(780, 480, { steps: 5 });
    await expect(page.locator('html')).toHaveClass(/avatar-cursor-active/);
    await page.locator('#ask .ask-log').scrollIntoViewIfNeeded();
    const box = (await page.locator('#ask .ask-log').boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 40, { steps: 4 });
    await expect(page.locator('html')).not.toHaveClass(/avatar-cursor-active/);
  });

  // ── Review round 1 ──
  test('cold start: a long wait says the chat is waking up, then still completes', async ({ page }) => {
    await page.route(API, async (route) => {
      await new Promise((r) => setTimeout(r, 9000));
      await reply(route, sse('Awake now.'));
    });
    await open(page);
    await input(page).fill('Anyone there?');
    await send(page).click();
    await expect(page.locator('.ask-wait')).toContainText('Thinking');
    await page.waitForTimeout(2000);
    await expect(page.locator('.ask-wait')).not.toContainText('Waking');
    await expect(page.locator('.ask-wait')).toHaveText(WAKING, { timeout: 8000 });
    await expect(page.locator('#ask-status')).toHaveText(WAKING);
    await expect(page.locator('.ask-msg--ai').last()).toContainText('Awake now.', { timeout: 8000 });
    await expect(page.locator('.ask-wait')).toHaveCount(0);
  });

  test('the wake call is sent once, only after the section comes into view', async ({ page }) => {
    const pings: string[] = [];
    await page.route(HEALTH, (route) => { pings.push(route.request().method()); return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' }, body: '' }); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(pings).toHaveLength(0);
    await page.locator('#ask').scrollIntoViewIfNeeded();
    await expect.poll(() => pings.length).toBe(1);
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('#ask').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(pings).toEqual(['OPTIONS']);
  });

  test('a failed wake call is swallowed', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    await page.route(HEALTH, (route) => route.abort('failed'));
    await page.goto('/');
    await page.locator('#ask').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  for (const [label, ch] of [['ASCII', 'a'], ['multi-byte curly quotes', '’']] as const) {
    test(`long chats (${label}): answers are capped, and the body stays under 14 KB with a user turn first`, async ({ page }) => {
      const bodies: { messages: { role: string; content: string }[] }[] = [];
      // 3,900 characters back: over the 3,500 cap. Curly quotes are 3 bytes each, so bytes and characters differ a lot.
      const big = ch.repeat(3900);
      await page.route(API, async (route) => { bodies.push(route.request().postDataJSON()); await reply(route, sse(big)); });
      await open(page);
      for (let i = 1; i <= 5; i++) {
        await input(page).fill(`Question ${i} ` + ch.repeat(900));
        await send(page).click();
        await expect.poll(() => bodies.length).toBe(i);
        await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
        await expect(send(page)).toBeEnabled();
      }
      for (const body of bodies) {
        expect(Buffer.byteLength(JSON.stringify(body), 'utf8')).toBeLessThan(14 * 1024);
        expect(body.messages[0].role).toBe('user');
        expect(body.messages[body.messages.length - 1].role).toBe('user');
        for (const m of body.messages) expect(m.content.length).toBeLessThanOrEqual(4000);
      }
      const last = bodies[4].messages;
      expect(last[last.length - 1].content).toContain('Question 5');
      for (const body of bodies) for (const m of body.messages) if (m.role === 'assistant') expect(m.content.length).toBe(3500);
      if (ch === 'a') {
        // Small enough to keep a couple of pairs, so the cap on stored answers is visible.
        expect(bodies[1].messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
        // Older pairs were dropped to fit.
        expect(last.length).toBeLessThan(9);
      } else {
        // One curly-quote pair is already about 13 KB, so only the newest question fits.
        expect(bodies[1].messages.map((m) => m.role)).toEqual(['user']);
      }
    });
  }

  test('screen readers: busy while streaming, cleared before the final answer is inserted', async ({ page }) => {
    await holdStream(page);
    await open(page);
    await page.evaluate(() => {
      const w = window as any;
      w.__events = [];
      const el = document.getElementById('ask-messages')!;
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === 'attributes' && r.attributeName === 'aria-busy' && !el.hasAttribute('aria-busy')) w.__events.push('busy-removed');
          if (r.type === 'childList') r.addedNodes.forEach((n) => {
            const e = n as HTMLElement;
            if (e.classList?.contains('ask-msg--ai') && !e.classList.contains('streaming')) w.__events.push('final-added');
            if (e.classList?.contains('ask-error')) w.__events.push('error-added');
          });
        }
      }).observe(el, { attributes: true, childList: true });
    });
    await input(page).fill('Question');
    await send(page).click();
    await expect(log(page)).toHaveAttribute('aria-busy', 'true');
    await push(page, 'data: {"text":"Part one. "}\n\n');
    await push(page, 'data: {"text":"Part two."}\n\n');
    await expect(page.locator('.ask-msg--ai.streaming')).toContainText('Part one. Part two.');
    await expect(log(page)).toHaveAttribute('aria-busy', 'true');
    await push(page, 'data: [DONE]\n\n');
    await end(page);
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(log(page)).not.toHaveAttribute('aria-busy', 'true');
    const events: string[] = await page.evaluate(() => (window as any).__events);
    expect(events.filter((e) => e === 'final-added')).toHaveLength(1);
    expect(events.indexOf('busy-removed')).toBeGreaterThanOrEqual(0);
    expect(events.indexOf('busy-removed')).toBeLessThan(events.indexOf('final-added'));
    await expect(page.locator('.ask-msg--ai').last()).toContainText('Part one. Part two.');
  });

  test('links: only allow-listed hosts, no credentials tricks, same-origin paths', async ({ page }) => {
    const mail = await (async () => { await page.goto('/about'); return page.locator('footer a[href^="mailto:"]').first().getAttribute('href'); })();
    expect(mail).toMatch(/^mailto:.+@/);
    const text = [
      'Trick one https://github.com@evil.io/x done.',
      'Trick two linkedin.com.evil.io/in/x done.',
      'Off list [click here](https://evil.example/page) done.',
      'Script [run it](javascript:alert(1)) done.',
      'Protocol relative [sneaky](//evil.io/x) done.',
      'Page /fx and /work/tripup and [Fusion](/fusion) done.',
      'Good www.linkedin.com/in/shannonhecker and github.com/shannonhecker and [mine](https://uoaui.ai/) done.',
      `Mail [me](${mail}) and [them](mailto:someone@else.example) done.`,
    ].join('\n');
    await page.route(API, (route) => reply(route, sse(text)));
    await open(page);
    await input(page).fill('Links?');
    await send(page).click();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    const answer = page.locator('.ask-msg--ai').last();
    // Tricks stay visible as plain text and never become links.
    await expect(answer).toContainText('https://github.com@evil.io/x');
    await expect(answer).toContainText('linkedin.com.evil.io/in/x');
    await expect(answer).toContainText('click here');
    await expect(answer).toContainText('run it');
    await expect(answer).toContainText('sneaky');
    await expect(answer).not.toContainText('evil.example/page');
    const links = await answer.locator('a').evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute('href')]));
    expect(links).toEqual([
      ['/fx', '/fx'],
      ['/work/tripup', '/work/tripup'],
      ['Fusion', '/fusion'],
      ['www.linkedin.com/in/shannonhecker', 'https://www.linkedin.com/in/shannonhecker'],
      ['github.com/shannonhecker', 'https://github.com/shannonhecker'],
      ['mine', 'https://uoaui.ai/'],
      ['me', mail],
    ]);
    // Same-origin links stay in this tab; outside links open safely in a new one.
    expect(await answer.locator('a[href="/fx"]').getAttribute('target')).toBeNull();
    expect(await answer.locator('a[href^="https://uoaui.ai"]').getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('parser: a data line split across two chunks renders once, whole', async ({ page }) => {
    await holdStream(page);
    await open(page);
    await input(page).fill('Split');
    await send(page).click();
    await push(page, 'data: {"text":"Hel');
    await page.waitForTimeout(100);
    await expect(page.locator('.ask-msg--ai.streaming p').first()).toHaveText('');
    await push(page, 'lo there"}\n\ndata: {"te');
    await expect(page.locator('.ask-msg--ai.streaming')).toContainText('Hello there');
    await push(page, 'xt":"!"}\n\ndata: [DONE]\n\n');
    await end(page);
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(page.locator('.ask-msg--ai').last()).toContainText('Hello there!');
    await expect(page.locator('.ask-error')).toHaveCount(0);
  });

  test('parser: a multi-byte character split across chunks renders correctly', async ({ page }) => {
    await holdStream(page);
    await open(page);
    await input(page).fill('Bytes');
    await send(page).click();
    const bytes = [...Buffer.from('data: ' + JSON.stringify({ text: 'It’s here 😀 ok' }) + '\n\ndata: [DONE]\n\n', 'utf8')];
    // Cut inside the three-byte apostrophe and again inside the four-byte emoji.
    const a = bytes.indexOf(0xe2) + 1;
    const b = bytes.indexOf(0xf0) + 2;
    await pushBytes(page, bytes.slice(0, a));
    await pushBytes(page, bytes.slice(a, b));
    await pushBytes(page, bytes.slice(b));
    await end(page);
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(page.locator('.ask-msg--ai').last()).toHaveText(/It’s here 😀 ok/);
  });

  test('a double submit and a chip click while streaming send one request', async ({ page }) => {
    await holdStream(page);
    await open(page);
    await input(page).fill('Once only');
    await input(page).press('Enter');
    await page.evaluate(() => (document.getElementById('ask-form') as HTMLFormElement).requestSubmit());
    // Chips are marked aria-disabled while an answer streams, so Playwright needs force to press them.
    await page.locator('#ask-suggestions button').first().click({ force: true });
    await page.locator('#ask-suggestions button').first().click({ force: true });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__askCalls.length)).toBe(1);
    await expect(page.locator('.ask-msg--user')).toHaveCount(1);
    await push(page, 'data: [DONE]\n\n');
    await end(page);
  });

  test('a failed question is put back, and is not sent twice afterwards', async ({ page }) => {
    const bodies: { messages: { role: string; content: string }[] }[] = [];
    let n = 0;
    await page.route(API, async (route) => {
      bodies.push(route.request().postDataJSON());
      if (++n === 1) return route.abort('failed');
      return reply(route, sse('Fine.'));
    });
    await open(page);
    await input(page).fill('First try');
    await send(page).click();
    await expect(page.locator('.ask-error')).toHaveCount(1);
    await expect(input(page)).toHaveValue('First try');
    // Typing something new replaces it; the failed turn is not in the next body.
    await input(page).fill('Second try');
    await send(page).click();
    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[1].messages).toEqual([{ role: 'user', content: 'Second try' }]);
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
  });

  test('a failure does not overwrite something the visitor typed meanwhile', async ({ page }) => {
    await page.route(API, async (route) => { await new Promise((r) => setTimeout(r, 400)); await route.abort('failed'); });
    await open(page);
    await input(page).fill('First try');
    await send(page).click();
    await input(page).fill('Typing something else');
    await expect(page.locator('.ask-error')).toHaveCount(1);
    await expect(input(page)).toHaveValue('Typing something else');
  });

  test.describe('speech details', () => {
    const stub = (script: string) => `window.SpeechRecognition = class { constructor(){ window.__rec = this; } start(){ ${script} } stop(){ this.onend && this.onend(); } };`;
    test('uses British English and appends to a typed draft', async ({ page }) => {
      await page.addInitScript(stub(`setTimeout(() => this.onresult({ resultIndex: 0, results: [[{ transcript: 'Fusion work' }]] }), 10);`));
      await open(page);
      await input(page).fill('Tell me about ');
      await page.getByRole('button', { name: 'Speech to text' }).click();
      await expect(input(page)).toHaveValue('Tell me about Fusion work');
      expect(await page.evaluate(() => (window as any).__rec.lang)).toBe('en-GB');
    });
    for (const code of ['not-allowed', 'service-not-allowed', 'network']) {
      test(`${code} gives one polite line`, async ({ page }) => {
        await page.addInitScript(stub(`setTimeout(() => this.onerror({ error: '${code}' }), 10);`));
        await open(page);
        await page.getByRole('button', { name: 'Speech to text' }).click();
        await expect(page.locator('#ask-speech')).toHaveText(SPEECH_OFF);
        await expect(page.locator('#ask-speech')).toHaveAttribute('role', 'status');
        await expect(page.getByRole('button', { name: 'Speech to text' })).toHaveAttribute('aria-pressed', 'false');
      });
    }
    test('a quiet error such as no-speech says nothing', async ({ page }) => {
      await page.addInitScript(stub(`setTimeout(() => this.onerror({ error: 'no-speech' }), 10);`));
      await open(page);
      await page.getByRole('button', { name: 'Speech to text' }).click();
      await page.waitForTimeout(200);
      await expect(page.locator('#ask-speech')).toHaveText('');
    });
  });

  test('focus: a chip click puts the cursor in the box on desktop', async ({ page }) => {
    await page.route(API, (route) => reply(route, sse('Sure.')));
    await open(page);
    await page.locator('#ask-suggestions button').first().click();
    await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
    await expect(input(page)).toBeFocused();
  });

  test.describe('touch devices', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    test('the box is not focused after an answer, so the keyboard stays down', async ({ page }) => {
      await page.route(API, (route) => reply(route, sse('Sure.')));
      await open(page);
      expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
      await input(page).fill('Hello');
      await send(page).tap();
      await expect(page.locator('.ask-msg--ai.streaming')).toHaveCount(0);
      await expect(page.locator('.ask-msg--ai').last()).toContainText('Sure.');
      await expect(input(page)).not.toBeFocused();
    });
  });

  test('no dashes in visitor copy', async ({ page }) => {
    await open(page);
    const text = await page.locator('#ask').evaluate((el) => el.textContent + ' ' + [...el.querySelectorAll('[aria-label],[placeholder],[title]')].map((e) => e.getAttribute('aria-label') + ' ' + e.getAttribute('placeholder') + ' ' + e.getAttribute('title')).join(' '));
    expect(text).not.toMatch(/[–—]/);
    // Words the site must never carry, written in pieces so this file stays clean too.
    expect(text).not.toMatch(new RegExp(['Revo' + 'lut', 'shannonhecker' + '-work'].join('|'), 'i'));
  });
});
