// Ask Shannon: streams answers from the chat server into the #ask section.
//
// Protocol (unchanged from the previous site):
//   POST https://ask-shannon-api.onrender.com/api/chat
//   Content-Type: application/json
//   body: { "messages": [{ "role": "user" | "assistant", "content": string }, ...] }
//   reply: server-sent lines "data: {\"text\":\"...\"}", ending "data: [DONE]";
//          a line "data: {\"error\":\"...\"}" is a failure.
// The server refuses bodies over 16 KB and messages over 4,000 characters, so a long chat is
// trimmed before it is sent (see payload()). Answers are drawn with DOM nodes and textContent
// only, never innerHTML, so nothing the server sends can become markup.
export {};

const API_URL = 'https://ask-shannon-api.onrender.com/api/chat';
// The wake call is an OPTIONS request to the chat address: the server answers it with CORS headers,
// so nothing is logged to the console. (/api/health sends no CORS headers and is blocked cross-origin.)
const WAKE_URL = API_URL + '?wake=1';
// The free server sleeps and can take about a minute to wake.
const FIRST_BYTE_TIMEOUT_MS = 75000;
const WAKING_AFTER_MS = 8000;
const CHUNK_TIMEOUT_MS = 15000;
const AT_BOTTOM = 40;
const KEEP_HISTORY = 20;
const SEND_HISTORY = 10;
const MAX_BODY_BYTES = 14 * 1024;
const MAX_STORED_ANSWER = 3500;

const REACH_ERROR = 'I couldn’t reach the chat just now. Try again in a moment.';
const RATE_ERROR = 'You’re asking quickly. Wait a minute and try again.';
const WAKING = 'Waking the chat up. This can take up to a minute.';
const REPLYING = 'Shannon’s AI is replying.';
const SPEECH_OFF = 'Speech to text isn’t available here. You can type instead.';

// The only places an answer may link to.
const HOSTS = new Set([
  'shannonhecker.com', 'www.shannonhecker.com', 'uoaui.ai', 'www.uoaui.ai',
  'winkingstar.com', 'www.winkingstar.com', 'linkedin.com', 'www.linkedin.com', 'github.com',
]);

type Turn = { role: 'user' | 'assistant'; content: string };

const section = document.getElementById('ask');
const log = document.getElementById('ask-messages');
const form = document.getElementById('ask-form') as HTMLFormElement | null;
const input = document.getElementById('ask-input') as HTMLTextAreaElement | null;
const sendBtn = document.getElementById('ask-send') as HTMLButtonElement | null;
const chipsEl = document.getElementById('ask-suggestions');
const micBtn = document.getElementById('ask-mic') as HTMLButtonElement | null;
const followBtn = document.querySelector<HTMLButtonElement>('#ask .ask-follow');
const statusEl = document.getElementById('ask-status');
const speechEl = document.getElementById('ask-speech');
const MAIL = (section?.dataset.mail ?? '').toLowerCase();

// Wake the server the first time the section is seen, so the first question is usually quick.
if (section && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    try { fetch(WAKE_URL, { method: 'OPTIONS' }).catch(() => {}); } catch { /* ignore */ }
  });
  io.observe(section);
}

if (log && form && input && sendBtn) init(log, form, input, sendBtn);

function init(log: HTMLElement, form: HTMLFormElement, input: HTMLTextAreaElement, sendBtn: HTMLButtonElement) {
  // iPadOS reports a Mac user agent, so ask about the pointer, not the device.
  const coarse = matchMedia('(pointer: coarse)');
  let history: Turn[] = [];
  let busy = false;
  let following = true;
  let raf = 0;

  const grow = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  };
  const focusInput = () => { if (!coarse.matches) input.focus({ preventScroll: true }); };

  // ── Suggestions: sets that rotate each time one is used ──
  const SETS: string[][] = [
    ['How do you approach AI product design?', 'Tell me about uoaui.ai', 'Show me your trading platform work', 'What’s your leadership style?'],
    ['Tell me about a hard design call you made', 'How do you hire and mentor designers?', 'How do you measure design impact?', 'What’s your take on AI in design?'],
    ['Tell me about a favourite project', 'How did you build the Fusion Design System?', 'What was hardest about the Algo Center?', 'How do you approach data-dense UI?'],
    ['Where are you based?', 'What languages do you speak?', 'Tell me a fun fact about you', 'How can I get in touch?'],
  ];
  let setIndex = 0;

  function renderChips(refocus = -1) {
    if (!chipsEl) return;
    const buttons = SETS[setIndex % SETS.length].map((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ask-chip';
      b.textContent = q;
      if (busy) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', (e) => {
        if (busy) return;
        const at = Array.from(chipsEl.children).indexOf(b);
        quiet(e.clientX, e.clientY);
        send(q);
        setIndex++;
        renderChips(coarse.matches ? at : -1);
        focusInput();
      });
      return b;
    });
    chipsEl.replaceChildren(...buttons);
    // The row you pressed is replaced; on touch, keep focus where it was.
    if (refocus >= 0) (buttons[refocus] as HTMLElement | undefined)?.focus({ preventScroll: true });
  }
  // The list is redrawn under the pointer after a click. Until the pointer really moves, the row it
  // rests on shows no hover underline, so the new first row does not look picked.
  let quietAt: [number, number] | null = null;
  function quiet(x: number, y: number) {
    if (!chipsEl) return;
    chipsEl.dataset.quiet = '';
    quietAt = [x, y];
  }
  chipsEl?.addEventListener('pointermove', (e) => {
    if (!quietAt || Math.hypot(e.clientX - quietAt[0], e.clientY - quietAt[1]) < 8) return;
    quietAt = null;
    delete chipsEl.dataset.quiet;
  });
  const chipsBusy = (on: boolean) => {
    chipsEl?.querySelectorAll('button').forEach((b) => (on ? b.setAttribute('aria-disabled', 'true') : b.removeAttribute('aria-disabled')));
  };

  // ── Scrolling: follow the stream unless the reader scrolled up ──
  const distance = () => log.scrollHeight - log.scrollTop - log.clientHeight;
  const toBottom = () => { log.scrollTop = log.scrollHeight; };
  function syncFollow() {
    if (followBtn) followBtn.hidden = !(busy && !following);
  }
  log.addEventListener('scroll', () => { following = distance() <= AT_BOTTOM; syncFollow(); }, { passive: true });
  followBtn?.addEventListener('click', () => { toBottom(); following = true; syncFollow(); });
  function follow() { if (following) toBottom(); }
  function force() { toBottom(); following = true; syncFollow(); }

  // ── Safe rendering: a small markdown subset built from nodes, links only to known places ──
  function resolveHref(raw: string): string | null {
    const s = raw.trim();
    if (/^mailto:/i.test(s)) {
      const to = s.slice(7).split('?')[0].toLowerCase();
      return MAIL && to === MAIL ? 'mailto:' + MAIL : null;
    }
    if (s.startsWith('/')) {
      if (s.startsWith('//') || s.includes('\\')) return null;
      try {
        const u = new URL(s, location.origin);
        return u.origin === location.origin ? u.pathname + u.search + u.hash : null;
      } catch { return null; }
    }
    try {
      const u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
      if (u.username || u.password) return null;
      return HOSTS.has(u.hostname.toLowerCase()) ? u.href : null;
    } catch { return null; }
  }
  const TOKEN = new RegExp([
    '\\*\\*(.+?)\\*\\*', // 1 bold
    '\\[([^\\]]+)\\]\\(([^)\\s]+)\\)', // 2 label, 3 url
    '([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})', // 4 email
    '(https?:\\/\\/[^\\s<,)]+[^\\s<,).!?]|(?:www\\.)?[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}(?:\\/[^\\s<,)]*[^\\s<,).!?])?)', // 5 address
    '(^|\\s)(\\/(?:fx|fusion|deal-model|winking-star|uoaui|work|writing|about|privacy)(?:\\/[a-z0-9-]+)*)(?![\\w/-])', // 6 lead, 7 page
    '\\n',
  ].join('|'), 'gi');
  function link(href: string, label: string) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function linkOrText(href: string | null, label: string): Node {
    return href ? link(href, label) : document.createTextNode(label);
  }
  function draw(el: HTMLElement, text: string) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(TOKEN)) {
      const at = m.index ?? 0;
      if (at > last) frag.append(text.slice(last, at));
      if (m[1] !== undefined) {
        const s = document.createElement('strong');
        s.textContent = m[1];
        frag.append(s);
      } else if (m[2] !== undefined) {
        frag.append(linkOrText(resolveHref(m[3]), m[2]));
      } else if (m[4] !== undefined) {
        frag.append(linkOrText(resolveHref('mailto:' + m[4]), m[4]));
      } else if (m[5] !== undefined) {
        frag.append(linkOrText(resolveHref(m[5]), m[5]));
      } else if (m[7] !== undefined) {
        frag.append(m[6] === '\n' ? document.createElement('br') : m[6]);
        frag.append(linkOrText(resolveHref(m[7]), m[7]));
      } else {
        frag.append(document.createElement('br'));
      }
      last = at + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    el.replaceChildren(frag);
  }

  // ── Messages ──
  function hidden(text: string) {
    const s = document.createElement('span');
    s.className = 'vh';
    s.textContent = text;
    return s;
  }
  function addUser(text: string) {
    const el = document.createElement('div');
    el.className = 'ask-msg ask-msg--user';
    const p = document.createElement('p');
    p.append(hidden('You asked: '), text);
    el.append(p);
    log.append(el);
    force();
  }
  function addError(message: string) {
    const el = document.createElement('p');
    el.className = 'ask-error';
    el.textContent = message;
    log.append(el);
    force();
  }
  function say(text: string) { if (statusEl) statusEl.textContent = text; }

  // ── What goes to the server: last turns, under the size limit, starting with the visitor ──
  const bytes = (messages: Turn[]) => new TextEncoder().encode(JSON.stringify({ messages })).length;
  function payload() {
    let messages = history.slice(-SEND_HISTORY);
    const dropOldest = () => {
      do { messages = messages.slice(1); } while (messages.length > 1 && messages[0].role !== 'user');
    };
    while (messages.length > 1 && messages[0].role !== 'user') dropOldest();
    while (messages.length > 1 && bytes(messages) > MAX_BODY_BYTES) dropOldest();
    return JSON.stringify({ messages });
  }
  function storable(text: string) {
    let cut = text.slice(0, MAX_STORED_ANSWER);
    const end = cut.charCodeAt(cut.length - 1);
    if (end >= 0xd800 && end <= 0xdbff) cut = cut.slice(0, -1); // never leave half an emoji
    return cut;
  }

  // ── The log is exactly as tall as its content, up to the cap (CSS max-height) ──
  // The CSS leaves the height on auto. When the content changes, the box eases from its old
  // height to the new one, so the composer glides instead of jumping; under reduced motion it
  // simply changes. Past the cap the log scrolls and follow() keeps the latest line in view.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let lastH = log.offsetHeight;
  let settleTimer = 0;
  function keepComposerInView() {
    const reserved = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--consent-h')) || 0;
    const room = innerHeight - reserved - 16;
    const bottom = form.getBoundingClientRect().bottom;
    if (bottom > room && bottom < innerHeight + 400) window.scrollBy({ top: bottom - room, behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  function settle() {
    window.clearTimeout(settleTimer);
    log.style.transition = '';
    log.style.height = '';
    delete log.dataset.growing;
    lastH = log.offsetHeight;
    keepComposerInView();
  }
  function fit() {
    const animating = log.dataset.growing !== undefined;
    const from = animating ? log.getBoundingClientRect().height : lastH;
    // Measuring resizes the box for a moment, which can move the scroll position: put it back.
    const keep = log.scrollTop;
    const restore = () => { if (following) toBottom(); else log.scrollTop = keep; };
    log.style.transition = 'none';
    log.style.height = 'auto';
    const to = log.offsetHeight;
    if (reduced.matches || Math.abs(to - from) < 1) {
      log.style.transition = '';
      log.style.height = '';
      delete log.dataset.growing;
      lastH = to;
      restore();
      if (to > from) keepComposerInView();
      return;
    }
    log.style.height = from + 'px';
    void log.offsetHeight;
    restore();
    log.dataset.growing = '';
    log.style.transition = 'height .26s var(--ease)';
    log.style.height = to + 'px';
    lastH = to;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 340);
  }
  // Focusing the box (or sending) leaves the whole composer above the analytics bar, if it is open.
  input.addEventListener('focus', () => requestAnimationFrame(keepComposerInView));
  new MutationObserver(fit).observe(log, { childList: true, subtree: true, characterData: true });
  function startConversation() {
    if (started) return;
    started = true;
    log.dataset.started = '';
  }

  // ── Sending ──
  function send(text: string) {
    startConversation();
    addUser(text);
    input.value = '';
    input.style.height = '';
    history.push({ role: 'user', content: text });
    if (history.length > KEEP_HISTORY) history = history.slice(-KEEP_HISTORY);
    void stream(text);
  }

  async function stream(question: string) {
    busy = true;
    sendBtn.disabled = true;
    chipsBusy(true);
    log.setAttribute('aria-busy', 'true');
    say(REPLYING);
    syncFollow();

    const bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai streaming';
    const body = document.createElement('p');
    const wait = document.createElement('span');
    wait.className = 'ask-wait';
    const label = document.createTextNode('Thinking');
    wait.append(label, document.createElement('i'), document.createElement('i'), document.createElement('i'));
    bubble.append(hidden('Answer: '), body, wait);
    log.append(bubble);
    force();

    let full = '';
    const controller = new AbortController();
    let timer = 0;
    const arm = (ms: number) => { clearTimeout(timer); timer = window.setTimeout(() => controller.abort(), ms); };
    let waking = 0;
    const settle = () => {
      clearTimeout(waking);
      if (label.data === WAKING) { label.data = 'Thinking'; delete wait.dataset.waking; say(REPLYING); }
    };
    const paint = () => { raf = 0; draw(body, full); follow(); };
    const take = (text: string) => {
      if (!text) return;
      if (!full) { settle(); wait.remove(); }
      full += text;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    // One "data: ..." line. Throws for a server error.
    const line = (raw: string) => {
      if (!raw.startsWith('data: ')) return;
      const payloadText = raw.slice(6).trim();
      if (payloadText === '[DONE]') return;
      let data: { text?: unknown; error?: unknown };
      try { data = JSON.parse(payloadText); } catch { return; }
      if (data.error) throw new Error(String(data.error));
      if (typeof data.text === 'string') take(data.text);
    };

    let failureMessage = REACH_ERROR;
    arm(FIRST_BYTE_TIMEOUT_MS);
    waking = window.setTimeout(() => {
      if (full) return;
      label.data = WAKING;
      wait.dataset.waking = 'true';
      say(WAKING);
    }, WAKING_AFTER_MS);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload(),
        signal: controller.signal,
      });
      settle();
      if (res.status === 429) { failureMessage = RATE_ERROR; throw new Error('rate limited'); }
      if (!res.ok) throw new Error('API returned ' + res.status);

      if (!res.body || typeof res.body.getReader !== 'function') {
        const text = await res.text();
        let any = false;
        for (const l of text.split('\n')) { if (l.startsWith('data: ')) any = true; line(l); }
        if (!any) take(text);
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          arm(CHUNK_TIMEOUT_MS);
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          lines.forEach(line);
        }
        buffer += decoder.decode();
        line(buffer);
      }
      if (!full) throw new Error('Empty answer');
      cancelAnimationFrame(raf);
      raf = 0;
      // Finish quietly: clear "busy" first, then drop in the whole answer as a fresh element,
      // so a screen reader announces it once instead of every frame of the stream.
      history.push({ role: 'assistant', content: storable(full) });
      const done = document.createElement('div');
      done.className = 'ask-msg ask-msg--ai';
      const text = document.createElement('p');
      draw(text, full);
      done.append(hidden('Answer: '), text);
      log.removeAttribute('aria-busy');
      bubble.replaceWith(done);
      say('');
    } catch {
      cancelAnimationFrame(raf);
      raf = 0;
      const message = failureMessage;
      // One announcement only: the log announces the visible line, so the status line stays quiet.
      log.removeAttribute('aria-busy');
      bubble.remove();
      addError(message);
      say('');
      // Drop the unanswered question so a retry starts clean, and give it back to the visitor.
      if (history.length && history[history.length - 1].role === 'user') history.pop();
      if (!input.value) { input.value = question; grow(); }
    } finally {
      clearTimeout(timer);
      clearTimeout(waking);
      busy = false;
      sendBtn.disabled = false;
      chipsBusy(false);
      log.removeAttribute('aria-busy');
      focusInput();
      follow();
      syncFollow();
    }
  }

  // ── Composer ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    send(text);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener('input', grow);

  // ── Speech to text, only where the browser has it ──
  type Recognition = {
    continuous: boolean; interimResults: boolean; lang: string;
    onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null; onerror: ((e: { error?: string }) => void) | null;
    start(): void; stop(): void;
  };
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (micBtn && typeof Ctor === 'function') {
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-GB';
    const set = (on: boolean) => { micBtn.classList.toggle('listening', on); micBtn.setAttribute('aria-pressed', String(on)); };
    let draft = '';
    micBtn.hidden = false;
    micBtn.addEventListener('click', () => {
      if (micBtn.classList.contains('listening')) { rec.stop(); return; }
      if (speechEl) speechEl.textContent = '';
      // Dictation adds to what is already typed.
      draft = input.value.replace(/\s+$/, '');
      if (draft) draft += ' ';
      try { rec.start(); set(true); } catch { set(false); }
    });
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      input.value = (draft + transcript).slice(0, input.maxLength);
      grow();
    };
    rec.onend = () => { set(false); focusInput(); };
    rec.onerror = (e) => {
      set(false);
      if (speechEl && ['not-allowed', 'service-not-allowed', 'network'].includes(e?.error ?? '')) speechEl.textContent = SPEECH_OFF;
    };
  }

  renderChips();
}
