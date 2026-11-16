// Ask Shannon: streams answers from the chat server into the #ask section.
//
// Protocol (unchanged from the previous site):
//   POST https://ask-shannon-api.onrender.com/api/chat
//   Content-Type: application/json
//   body: { "messages": [{ "role": "user" | "assistant", "content": string }, ...] }  (last 10 turns)
//   reply: server-sent lines "data: {\"text\":\"...\"}", ending "data: [DONE]";
//          a line "data: {\"error\":\"...\"}" is a failure.
// Answers are drawn with DOM nodes and textContent only, never innerHTML, so nothing the
// server sends can become markup.
export {};

const API_URL = 'https://ask-shannon-api.onrender.com/api/chat';
const FETCH_TIMEOUT_MS = 30000;
const CHUNK_TIMEOUT_MS = 15000;
const AT_BOTTOM = 40;
const KEEP_HISTORY = 20;
const SEND_HISTORY = 10;
const REACH_ERROR = 'I couldn’t reach the chat just now. Try again in a moment.';

type Turn = { role: 'user' | 'assistant'; content: string };

const log = document.getElementById('ask-messages');
const form = document.getElementById('ask-form') as HTMLFormElement | null;
const input = document.getElementById('ask-input') as HTMLTextAreaElement | null;
const sendBtn = document.getElementById('ask-send') as HTMLButtonElement | null;
const chipsEl = document.getElementById('ask-suggestions');
const micBtn = document.getElementById('ask-mic') as HTMLButtonElement | null;
const followBtn = document.querySelector<HTMLButtonElement>('#ask .ask-follow');
const statusEl = document.getElementById('ask-status');

if (log && form && input && sendBtn) init(log, form, input, sendBtn);

function init(log: HTMLElement, form: HTMLFormElement, input: HTMLTextAreaElement, sendBtn: HTMLButtonElement) {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let history: Turn[] = [];
  let busy = false;
  let following = true;
  let raf = 0;

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
      b.addEventListener('click', () => {
        if (busy) return;
        const at = Array.from(chipsEl.children).indexOf(b);
        send(q);
        setIndex++;
        renderChips(at);
      });
      return b;
    });
    chipsEl.replaceChildren(...buttons);
    // The row you pressed is replaced; keep the keyboard where it was.
    if (refocus >= 0) (buttons[refocus] as HTMLElement | undefined)?.focus({ preventScroll: true });
  }

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

  // ── Safe rendering: a small markdown subset built from nodes ──
  const safeUrl = (u: string) => /^(https?:\/\/|mailto:)/i.test(u);
  const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|((?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com)[^\s<,)]+[^\s<,).!?])|\n/gi;
  function link(href: string, label: string) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
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
        frag.append(safeUrl(m[3]) ? link(m[3], m[2]) : m[2]);
      } else if (m[4] !== undefined) {
        frag.append(link('mailto:' + m[4], m[4]));
      } else if (m[5] !== undefined) {
        frag.append(link(/^https?:\/\//i.test(m[5]) ? m[5] : 'https://' + m[5], m[5]));
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
  function addError() {
    const el = document.createElement('p');
    el.className = 'ask-error';
    el.textContent = REACH_ERROR;
    log.append(el);
    force();
  }
  function say(text: string) { if (statusEl) statusEl.textContent = text; }

  // ── Sending ──
  function send(text: string) {
    addUser(text);
    input.value = '';
    input.style.height = '';
    history.push({ role: 'user', content: text });
    if (history.length > KEEP_HISTORY) history = history.slice(-KEEP_HISTORY);
    void stream();
  }

  async function stream() {
    busy = true;
    sendBtn.disabled = true;
    log.setAttribute('aria-busy', 'true');
    say('Shannon’s AI is replying.');
    syncFollow();

    const bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai streaming';
    const body = document.createElement('p');
    const wait = document.createElement('span');
    wait.className = 'ask-wait';
    wait.append('Thinking', document.createElement('i'), document.createElement('i'), document.createElement('i'));
    bubble.append(hidden('Answer: '), body, wait);
    log.append(bubble);
    force();

    let full = '';
    const controller = new AbortController();
    let timer = 0;
    const arm = (ms: number) => { clearTimeout(timer); timer = window.setTimeout(() => controller.abort(), ms); };
    const paint = () => {
      raf = 0;
      draw(body, full);
      follow();
    };
    const take = (text: string) => {
      if (!text) return;
      if (!full) wait.remove();
      full += text;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    // One "data: ..." line. Returns normally for noise, throws for a server error.
    const line = (raw: string) => {
      if (!raw.startsWith('data: ')) return;
      const payload = raw.slice(6).trim();
      if (payload === '[DONE]') return;
      let data: { text?: unknown; error?: unknown };
      try { data = JSON.parse(payload); } catch { return; }
      if (data.error) throw new Error(String(data.error));
      if (typeof data.text === 'string') take(data.text);
    };

    arm(FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-SEND_HISTORY) }),
        signal: controller.signal,
      });
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
        line(buffer);
      }
      if (!full) throw new Error('Empty answer');
      cancelAnimationFrame(raf);
      raf = 0;
      draw(body, full);
      bubble.classList.remove('streaming');
      history.push({ role: 'assistant', content: full });
      say('Reply complete.');
    } catch {
      cancelAnimationFrame(raf);
      raf = 0;
      bubble.remove();
      addError();
      say('');
      // Drop the unanswered question so a retry starts clean.
      if (history.length && history[history.length - 1].role === 'user') history.pop();
    } finally {
      clearTimeout(timer);
      busy = false;
      sendBtn.disabled = false;
      log.removeAttribute('aria-busy');
      if (!isMobile) input.focus({ preventScroll: true });
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
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  });

  // ── Speech to text, only where the browser has it ──
  type Recognition = {
    continuous: boolean; interimResults: boolean; lang: string;
    onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null; onerror: (() => void) | null;
    start(): void; stop(): void;
  };
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (micBtn && typeof Ctor === 'function') {
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    const set = (on: boolean) => { micBtn.classList.toggle('listening', on); micBtn.setAttribute('aria-pressed', String(on)); };
    micBtn.hidden = false;
    micBtn.addEventListener('click', () => {
      if (micBtn.classList.contains('listening')) { rec.stop(); return; }
      try { rec.start(); set(true); } catch { set(false); }
    });
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      input.value = transcript;
    };
    rec.onend = () => { set(false); if (!isMobile) input.focus({ preventScroll: true }); };
    rec.onerror = () => set(false);
  }

  renderChips();
}
