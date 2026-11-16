import { test, expect, type Page, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Ask Shannon: the streamed chat on the home page. The real server is never called. Most
// tests answer the request with page.route(); the streaming and follow-scroll tests need to
// hold a response open between chunks, which route.fulfill cannot do, so those swap fetch for
// a stub whose stream the test controls. Either way the request body is checked.
const API = 'https://ask-shannon-api.onrender.com/**';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const REACH = 'I couldn’t reach the chat just now. Try again in a moment.';
const REACH_ASCII = "I couldn't reach the chat just now. Try again in a moment.";

const sse = (...texts: string[]) => texts.map((t) => `data: ${JSON.stringify({ text: t })}\n\n`).join('') + 'data: [DONE]\n\n';
const reply = (route: Route, body: string) => route.fulfill({ status: 200, contentType: 'text/event-stream', body });

async function open(page: Page, theme: 'dark' | 'light' = 'light') {
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
      if (!url.includes('ask-shannon-api.onrender.com')) return real(input, init);
      w.__askCalls.push({ url, method: init?.method, headers: init?.headers, body: JSON.parse(init?.body ?? 'null') });
      let ctrl: ReadableStreamDefaultController<Uint8Array>;
      const body = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; } });
      w.__push = (s: string) => ctrl.enqueue(new TextEncoder().encode(s));
      w.__end = () => ctrl.close();
      return Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
    };
  });
}
const push = (page: Page, s: string) => page.evaluate((x) => (window as any).__push(x), s);
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
      await expect(page.locator('#ask-messages .ask-error')).toHaveText(REACH);
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

  test('follow button appears when you scroll up during a long answer', async ({ page }) => {
    await holdStream(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    await input(page).fill('Tell me everything');
    await send(page).click();
    const para = 'A long paragraph of answer text that keeps going so the pane has to scroll. ';
    await push(page, `data: ${JSON.stringify({ text: para.repeat(60) })}\n\n`);
    await expect.poll(() => log(page).evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    const follow = page.locator('#ask .ask-follow');
    await expect(follow).toBeHidden();
    await log(page).evaluate((el) => { el.scrollTop = 0; });
    await push(page, `data: ${JSON.stringify({ text: ' More.' })}\n\n`);
    await expect(follow).toBeVisible();
    await expect(follow).toHaveAccessibleName('Scroll to latest message');
    await follow.click();
    await expect(follow).toBeHidden();
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
      await page.route(API, (route) => reply(route, sse('Here is a **bold** answer with a [link](https://example.com) and some more words to wrap.')));
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

  test('safe rendering: an answer is text, never markup', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    const nasty = '<img src=x onerror="window.__pwned=1"> and <script>window.__pwned=2</script> **bold** [bad](javascript:window.__pwned=3) [good](https://example.com/a) `code`';
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
    // Links are only made for http, https and mailto, and open safely.
    const hrefs = await answer.locator('a').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.getAttribute('rel')]));
    expect(hrefs).toEqual([['https://example.com/a', 'noopener noreferrer']]);
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

  test('no dashes in visitor copy', async ({ page }) => {
    await open(page);
    const text = await page.locator('#ask').evaluate((el) => el.textContent + ' ' + [...el.querySelectorAll('[aria-label],[placeholder],[title]')].map((e) => e.getAttribute('aria-label') + ' ' + e.getAttribute('placeholder') + ' ' + e.getAttribute('title')).join(' '));
    expect(text).not.toMatch(/[–—]/);
    // Words the site must never carry, written in pieces so this file stays clean too.
    expect(text).not.toMatch(new RegExp(['Revo' + 'lut', 'shannonhecker' + '-work'].join('|'), 'i'));
  });
});
