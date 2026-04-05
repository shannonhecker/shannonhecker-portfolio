/**
 * Ask Shannon,Anthropic Chat Proxy
 *
 * Lightweight Express server that proxies recruiter questions
 * to the Anthropic Messages API with Shannon's full experience
 * baked into the system prompt.
 *
 * Usage:
 *   cp .env.example .env   # add your ANTHROPIC_API_KEY
 *   npm install
 *   npm start              # → http://localhost:3001
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app  = express();
app.set('trust proxy', 1); /* correct client IP behind Render / other proxies */
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'https://shannonhecker.com',
  'https://www.shannonhecker.com',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '16kb' }));

const rateLimit = require('express-rate-limit');
app.use('/api/chat', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
}));

/* ------------------------------------------------------------------ */
/*  CONVERSATION LOG — stores visitor questions in memory + log file  */
/* ------------------------------------------------------------------ */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const https  = require('https');

const LOG_FILE = process.env.CONVERSATIONS_LOG_PATH
  ? path.resolve(process.env.CONVERSATIONS_LOG_PATH)
  : path.join(__dirname, 'conversations.log');

(function ensureLogPath() {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.error('Could not create conversations log directory:', e.message);
  }
})();

const conversations = [];
const visitorMap = new Map(); /* visitorId → { firstSeen, visits, location } */

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'shannon')).digest('hex').slice(0, 12);
}

function cleanIp(req) {
  const raw = req.headers['x-forwarded-for'] || req.ip || '';
  return raw.split(',')[0].trim().replace('::ffff:', '') || 'unknown';
}

function geoLookup(ip) {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return Promise.resolve({ city: 'Local', country: 'Dev' });
  }
  return new Promise(resolve => {
    const req = https.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve({ city: j.city || '—', country: j.country_name || '—', region: j.region || '' });
        } catch { resolve({ city: '—', country: '—' }); }
      });
    });
    req.on('error', () => resolve({ city: '—', country: '—' }));
    req.on('timeout', () => { req.destroy(); resolve({ city: '—', country: '—' }); });
  });
}

function trackVisitor(visitorId, geo) {
  const existing = visitorMap.get(visitorId);
  if (existing) {
    existing.visits++;
    existing.lastSeen = new Date().toISOString();
    return { isNew: false, visits: existing.visits };
  }
  visitorMap.set(visitorId, {
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    visits: 1,
    location: geo
  });
  return { isNew: true, visits: 1 };
}

function logConversation(entry) {
  conversations.push(entry);
  if (conversations.length > 500) conversations.shift();
  const line = JSON.stringify(entry) + '\n';
  fs.appendFile(LOG_FILE, line, err => {
    if (err) console.error('Failed to append conversations log:', err.message);
  });
}

/* Load existing conversations from log file on startup */
(function loadHistory() {
  try {
    if (!fs.existsSync(LOG_FILE)) return;
    const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
    let loaded = 0;
    for (const line of lines) {
      if (!line) continue;
      try {
        const entry = JSON.parse(line);
        conversations.push(entry);
        /* Rebuild visitorMap from historical data */
        if (entry.visitorId) {
          const existing = visitorMap.get(entry.visitorId);
          if (existing) {
            existing.visits++;
            existing.lastSeen = entry.timestamp;
          } else {
            visitorMap.set(entry.visitorId, {
              firstSeen: entry.timestamp,
              lastSeen: entry.timestamp,
              visits: 1,
              location: entry.location || { city: '—', country: '—' }
            });
          }
        }
        loaded++;
      } catch { /* skip malformed lines */ }
    }
    /* Keep only last 500 */
    while (conversations.length > 500) conversations.shift();
    if (loaded > 0) console.log(`Loaded ${loaded} conversations from log file`);
  } catch (err) {
    console.error('Could not load conversation history:', err.message);
  }
})();

/* ------------------------------------------------------------------ */
/*  SYSTEM PROMPT,Shannon's complete professional profile            */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `You are Shannon Hecker, a Senior Product Designer responding directly to visitors on your portfolio site. Speak in the first person ("I", "my", "me") with a warm, confident, conversational tone. You are genuinely enthusiastic about your work and love sharing what you've built.

IMPORTANT STYLE RULES:
- NEVER use em dashes (—) or en dashes (–) in your responses. Use commas, full stops, or just start a new sentence instead.
- Write naturally. Like chatting with a smart colleague over coffee, not reading a script.
- Use simple punctuation. Commas and full stops are your friends.
- Keep answers concise (2-4 sentences) unless the visitor wants more depth.
- When a hiring manager asks about a project, lead with the outcome or impact, then explain how you got there.
- Subtly demonstrate product thinking in how you frame answers. Show, don't tell.

## PROFILE
Shannon Hecker. Senior Product Designer based in London.
Currently at Barclays, previously VP Product Design at J.P. Morgan. 10+ years in fintech, 15+ in design.
Open to senior and lead product design roles, especially in AI, fintech, and enterprise SaaS.
I help teams ship accessible, measurable product experiences from discovery through delivery. I care about outcomes, not just outputs.

## WHAT MAKES ME DIFFERENT
- I've designed for some of the most complex, high-stakes environments in finance: real-time trading, algorithmic execution, derivatives pricing, and multi-billion-dollar custody deals.
- I don't just push pixels. I sit with traders, shadow operations teams, and dig into the data before I design anything.
- I build the systems, not just the screens. My design systems have been adopted by 5+ product teams and 200+ components.
- I bring AI into the design workflow. At Barclays, I'm designing AI-first interfaces with Claude AI and building tools that make trading faster and smarter.
- Accessibility isn't a checkbox for me. Every project I ship is WCAG 2.1 AA compliant because good design works for everyone.

## APPROACH
I anchor design in outcomes: usable today, scalable tomorrow, accessible always. Every project starts with real constraints. User needs, business goals, technical realities. I validate direction early through prototyping, research, and tight feedback loops with product and engineering. Decisions are grounded before pixels are final. Design systems and AI tooling accelerate delivery without compromising clarity.

## EXPERIENCE
1. Barclays, London. Senior Product Designer (2025 to present)
   Own product design for FX and MarketsOne, Barclays' core trading platform. Architecting the MarketsOne Design System, designing AI-first workflows with Claude AI, and reshaping trading tools into a refined, data-dense UI built for speed and accessibility.

2. J.P. Morgan, London. VP Product Design (2016 to 2025)
   Shaped complex financial interfaces across trading, data management, and analytics. Built and scaled a Figma design system adopted by 5+ product teams, translated dense data workflows into clear experiences, and embedded WCAG-compliant accessibility standards across the platform.

3. Pegasus Global Travel, London. Graphic Designer (2015)
   Designed the company website end-to-end, produced promotional assets and video content, unifying the brand across all channels.

4. Genuine C&C Inc, Taiwan. Visual Designer & Web Developer (2011 to 2015)
   Designed and maintained the B2B platform, built the corporate website front-end, and led UI/UX direction for a client-facing network platform.

5. Eastern Shine Production Co., Ltd. Website Designer, Graphic Designer (2011)
   Designed web platforms focused on usability and art directed a government video project from concept to delivery.

6. Reeborn Information, Ltd. Website Designer (2008 to 2010)
   Designed corporate visual identity and web platform interfaces, with digital content and product photography for e-commerce.

## KEY PROJECTS (12 case studies on the portfolio)
1. Barclays Data Visualisation (Product Designer). Equities monitoring dashboard: charts, heatmaps, filters, and responsive layouts. Built a modular card system with 6+ visualisation patterns across desktop and iPad.
2. TripUp (Product Designer). Design challenge for Bending Spoons: group travel with polls, shared expenses, and real-time coordination in one mobile flow.
3. Fusion Analytics Dashboard (Product Designer, UI Lead). B2B analytics platform: real-time financial data, WCAG 2.2 AA, modular dashboard system. Phase 2 external clients signed after launch.
4. Fusion Design System (Product Designer). Token-based design system: 200+ components, 5+ teams adopted, AA accessibility compliance. Built on Salt Design System in Figma.
5. Fusion Data Solution (Product Designer). Enterprise data management: complex technical workflows turned into guided, shippable journeys. 40+ screens, 5 reusable frameworks.
6. UI Toolkit (UI Designer). Reusable trading UI component library: patterns and specs that sped delivery across 6 asset classes.
7. Corporate Action Manager (UI Designer, UI Lead). Redesigned a 15-year-old legacy tool, delivering 40% faster task completion and 60% fewer navigation steps for operations teams.
8. Complex Assets Derivatives Valuation (Product Designer). Unified valuation workspace for derivatives trading: 3x faster scenario modelling, 95% trader satisfaction.
9. JPMM Research Platform (UI Designer). Research discovery for analysts: IA-first navigation, 4x search relevance, 35% engagement increase.
10. Global Custody Deal Model (UI Designer). Bespoke deal modelling: multi-step wizard that cut deal creation from 2 hours to 20 minutes with full audit trail.
11. Execute Algo Center (UI Designer). Algorithmic execution centre: single-screen command centre with 2-click-max interactions, 60% faster intervention.
12. D&PS Brand Identity (Visual Designer). Internal brand identity for J.P. Morgan's Digital & Platform Services division.

## EXPERTISE
- AI Design & LLM Workflows
- Trading Platform UI/UX
- Real-Time Data & Complex Interactions
- Figma (components, auto layout, tokens)
- WCAG 2.1 AA Accessibility Compliance
- Design Systems & Pattern Libraries
- Developer Handoff & Design QA
- Agile Workflow & DesignOps
- Stakeholder Communication

## TOOLS
Figma, Prototype, Framer, Claude AI, Google Stitch AI, Google AI Studio, Cursor, React (design-eng collaboration), HTML/CSS

## FUN FACTS
- Born in Taiwan, native Mandarin speaker. Moved to the UK and never looked back — but the food cravings are real.
- Married with two kids. They're my biggest design critics (and toughest stakeholders).
- Live in St Albans, UK. Close enough to London to commute, far enough to breathe.
- Total cat person. I have a fluffy cat called Quorra and she basically runs the house.
- My go-to coffee order is a soya latte with an extra shot.
- Favourite colour is teal. It shows up in my design work more than I'd like to admit.
- I also love a strong leaf tea, especially when I'm deep in a design session.

## GUIDELINES
- If the first message is a greeting or generic question like "hi" or "tell me about yourself", give a brief, engaging intro that highlights your current role, your strongest differentiator (AI + complex finance), and invite them to ask about a specific project or topic. Don't just list your resume.
- When asked about a project, lead with the measurable outcome, then briefly explain the challenge and your approach. Hiring managers care about impact first.
- If asked about team collaboration or how you work, give a specific example rather than a generic answer.
- If the user asks to schedule a call or get in touch directly, offer your email shannonheckerchen@gmail.com or LinkedIn linkedin.com/in/shannonhecker.
- If asked about what roles you're looking for, emphasise AI-related design roles as your top wish, alongside fintech and enterprise SaaS. Mention you're drawn to roles where design directly impacts product decisions.
- If asked about on-site, remote, or hybrid work, say you currently do two days a week in the office with Barclays and prefer a hybrid model. But for a great opportunity, you'd be open to considering fully on-site.
- If asked about notice period or availability to start, say your notice period is 4 weeks.
- If asked about salary, say you're happy to discuss compensation expectations directly in conversation.
- If asked about where you're from, your background, or languages, share that you were born in Taiwan, speak native Mandarin, and now live in St Albans, UK. Keep it warm and personal.
- If asked about family, mention you're married with two kids. Keep it brief and light-hearted — don't over-share.
- If asked something outside your professional scope, warmly redirect to your portfolio or suggest getting in touch.
- Never fabricate experience or skills you don't have.
- Keep the tone warm, personal, and confident. Like you're having a real conversation, not reading a recruiter brief.
- If asked what makes you different from other designers, highlight the rare combination of deep finance domain expertise, hands-on AI integration, and systems-level thinking.`;

/* ------------------------------------------------------------------ */
/*  POST /api/chat,streaming chat endpoint                          */
/* ------------------------------------------------------------------ */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  /* Skip logging for local dev / owner testing / blocked IPs */
  const BLOCKED_IPS = ['82.17.133.31', '192.168.0.100'];
  const origin = req.headers.origin || '';
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const isOwner = req.headers['x-no-track'] === process.env.ADMIN_TOKEN;
  const rawIpCheck = cleanIp(req);
  const isBlocked = BLOCKED_IPS.includes(rawIpCheck);
  const shouldLog = !isLocal && !isOwner && !isBlocked;

  /* Log the visitor's question */
  const userMsg = messages.filter(m => m.role === 'user').pop();
  const rawIp = cleanIp(req);
  const visitorId = hashIp(rawIp);
  const geo = shouldLog ? await geoLookup(rawIp) : { city: 'Local', country: 'Dev' };
  const visitor = shouldLog ? trackVisitor(visitorId, geo) : { isNew: false, visits: 0 };

  /* Session = same visitor within a 30-min window */
  const sessionBucket = Math.floor(Date.now() / (30 * 60 * 1000));
  const sessionId = visitorId + '-' + sessionBucket;

  const logEntry = shouldLog ? {
    timestamp: new Date().toISOString(),
    question: userMsg ? userMsg.content : '',
    messages: messages,
    sessionId,
    messageCount: messages.length,
    visitorId,
    isNew: visitor.isNew,
    totalVisits: visitor.visits,
    location: geo,
    userAgent: req.headers['user-agent'] || ''
  } : null;

  /* Set up SSE streaming */
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let fullResponse = '';

  try {
    const client = new Anthropic();

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

    /* Log completed conversation (skip local/owner requests) */
    if (logEntry) {
      logEntry.response = fullResponse;
      logEntry.status = 'ok';
      logConversation(logEntry);
    }

  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();

    if (logEntry) {
      logEntry.status = 'error';
      logEntry.error = err.message;
      logConversation(logEntry);
    }
  }
});

/* Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'claude-sonnet-4-20250514' });
});

/* ------------------------------------------------------------------ */
/*  GET /api/conversations — dashboard + JSON API                     */
/*  Protected with a simple token from env var                        */
/* ------------------------------------------------------------------ */
function escHtml(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtFull(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return fmtDate(iso);
}

function buildDashboard(allConvos, recent, token) {
  const total = allConvos.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = allConvos.filter(c => c.timestamp.startsWith(todayStr)).length;
  const errorCount = allConvos.filter(c => c.status === 'error').length;
  const errorRate = total > 0 ? ((errorCount / total) * 100).toFixed(1) : '0.0';
  const mobileCount = allConvos.filter(c => (c.userAgent || '').includes('Mobile')).length;
  const desktopCount = total - mobileCount;

  /* Visitor analytics */
  const uniqueVisitors = new Set(allConvos.map(c => c.visitorId).filter(Boolean)).size;
  const newCount = allConvos.filter(c => c.isNew).length;
  const returningCount = total - newCount;

  /* Top locations */
  const locationCounts = {};
  allConvos.forEach(c => {
    if (c.location && c.location.country && c.location.country !== '—') {
      const key = c.location.city && c.location.city !== '—'
        ? c.location.city + ', ' + c.location.country
        : c.location.country;
      locationCounts[key] = (locationCounts[key] || 0) + 1;
    }
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  /* Top returning visitors */
  const topVisitors = Array.from(visitorMap.entries())
    .sort((a, b) => b[1].visits - a[1].visits)
    .slice(0, 8);

  /* Deduplicate: keep only the latest entry per session (it has the full thread) */
  const sessionMap = new Map();
  recent.forEach(c => {
    const sid = c.sessionId || c.visitorId + '-' + c.timestamp;
    const existing = sessionMap.get(sid);
    if (!existing || c.messageCount > existing.messageCount) {
      sessionMap.set(sid, c);
    }
  });
  const deduped = Array.from(sessionMap.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const cards = deduped.length === 0
    ? '<div class="empty">No conversations yet. Questions from visitors will appear here.</div>'
    : deduped.map((c, idx) => {
        const device = (c.userAgent || '').includes('Mobile') ? 'Mobile' : 'Desktop';
        const loc = c.location && c.location.city !== '—' ? c.location.city + ', ' + c.location.country : '';
        const visitorLabel = c.isNew ? 'New' : 'Returning';
        const visitorClass = c.isNew ? 'badge-new' : 'badge-ret';

        /* Build full conversation thread from stored messages + final response */
        let threadHtml = '';
        const msgs = c.messages || [];
        const allMsgs = msgs.concat(c.response ? [{ role: 'assistant', content: c.response }] : []);
        allMsgs.forEach(m => {
          const cls = m.role === 'user' ? 'thread-user' : 'thread-ai';
          const label = m.role === 'user' ? 'Visitor' : 'Shannon AI';
          threadHtml += '<div class="thread-msg ' + cls + '"><span class="thread-role">' + label + '</span><span class="thread-text">' + escHtml(m.content) + '</span></div>';
        });

        const preview = c.question ? escHtml(c.question) : '(no question)';

        return `<div class="card">
          <div class="card-top">
            <div class="card-top-left">
              <span class="date">${fmtDate(c.timestamp)}</span>
              <span class="time">${fmtTime(c.timestamp)} &middot; ${timeAgo(c.timestamp)}</span>
              ${loc ? '<span class="location">' + escHtml(loc) + '</span>' : ''}
            </div>
            <div class="card-badges">
              ${c.visitorId ? '<span class="badge ' + visitorClass + '">' + visitorLabel + '</span>' : ''}
              <span class="badge ${c.status === 'ok' ? 'badge-ok' : 'badge-err'}">${c.status === 'ok' ? 'Success' : 'Error'}</span>
              <span class="badge badge-msg">${Math.ceil(allMsgs.length / 2)} exchange${Math.ceil(allMsgs.length / 2) !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="question">${preview}</div>
          ${c.status === 'error' ? '<div class="error-msg">' + escHtml(c.error) + '</div>' : ''}
          <div class="thread" id="thread-${idx}">${threadHtml}</div>
          <button class="thread-toggle" onclick="toggleThread(${idx})" aria-expanded="false">Show full conversation</button>
          <div class="meta">
            <span>${device === 'Mobile' ? '&#128241;' : '&#128187;'} ${device}</span>
            <span>${allMsgs.length} msg${allMsgs.length !== 1 ? 's' : ''}</span>
            ${c.visitorId ? '<span class="vid" title="Visitor ID">ID: ' + c.visitorId + '</span>' : ''}
            ${c.totalVisits > 1 ? '<span>' + c.totalVisits + ' total visits</span>' : ''}
          </div>
        </div>`;
      }).join('');

  /* Location list */
  const locHtml = topLocations.length === 0
    ? '<span class="empty-sm">No location data yet</span>'
    : topLocations.map(([loc, count]) =>
        `<div class="loc-row"><span class="loc-name">${escHtml(loc)}</span><span class="loc-count">${count}</span></div>`
      ).join('');

  /* Visitors list */
  const visitorsHtml = topVisitors.length === 0
    ? '<span class="empty-sm">No visitors yet</span>'
    : topVisitors.map(([id, v]) => {
        const loc = v.location && v.location.city !== '—' ? v.location.city + ', ' + v.location.country : '—';
        return `<div class="vis-row">
          <span class="vis-id">${id}</span>
          <span class="vis-loc">${escHtml(loc)}</span>
          <span class="vis-date">${fmtDate(v.firstSeen)}</span>
          <span class="vis-count">${v.visits} visit${v.visits !== 1 ? 's' : ''}</span>
        </div>`;
      }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ask Shannon &mdash; Conversations</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --c-bg: #FFFFFF; --c-surface: #FFFFFF; --c-panel: #F5F5F5;
  --c-ink: #0A0A0A; --c-mid: #555555; --c-light: #6F6F6F; --c-ghost: #CCCCCC;
  --c-rule: #E8E8E8; --c-border: #C0C0C0;
  --c-accent: #4A90D9; --c-success: #2E7D32; --c-error: #D32F2F;
  --c-available: #22c55e;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --r-card: 16px; --r-pill: 999px;
  --sh-panel: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
html[data-theme="dark"] {
  --c-bg: #121212; --c-surface: #1D1B20; --c-panel: #211F26;
  --c-ink: rgba(255,255,255,0.87); --c-mid: rgba(255,255,255,0.60);
  --c-light: rgba(255,255,255,0.53); --c-ghost: rgba(255,255,255,0.12);
  --c-rule: rgba(255,255,255,0.12); --c-border: rgba(255,255,255,0.16);
  --c-accent: #7AB3E8; --c-success: #66BB6A; --c-error: #EF5350;
  --sh-panel: none;
  color-scheme: dark;
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font); background: var(--c-panel); color: var(--c-ink);
  -webkit-font-smoothing: antialiased; line-height: 1.5;
}
header {
  background: var(--c-ink); color: var(--c-bg); padding: 20px 32px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--c-rule);
}
header h1 { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
.header-right { display: flex; align-items: center; gap: 16px; }
.header-sub { font-size: 11px; color: var(--c-ghost); display: flex; align-items: center; gap: 6px; letter-spacing: 0.01em; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c-available); animation: pulse 2s infinite; flex-shrink: 0; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.theme-btn {
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--c-ghost);
  background: none; color: var(--c-bg); cursor: pointer; display: flex;
  align-items: center; justify-content: center; font-size: 14px;
  transition: background 0.2s var(--ease), border-color 0.2s var(--ease);
}
.theme-btn:hover { background: rgba(255,255,255,0.1); }
main { max-width: 1060px; margin: 0 auto; padding: 24px clamp(12px, 3vw, 32px); }

/* Summary card */
.summary {
  background: var(--c-surface); border: 1px solid var(--c-rule);
  border-radius: var(--r-card); padding: 22px 28px;
  box-shadow: var(--sh-panel); margin-bottom: 24px;
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 0;
}
.summary-item {
  flex: 1 1 0; min-width: 100px; padding: 6px 16px;
  border-right: 1px solid var(--c-rule); text-align: center;
}
.summary-item:last-child { border-right: none; }
.stat-val {
  font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
  line-height: 1.1; font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: 9px; font-weight: 600; color: var(--c-light);
  text-transform: uppercase; letter-spacing: 0.18em; margin-top: 4px;
}
.stat-val.green { color: var(--c-success); }
.stat-val.red { color: var(--c-error); }
.stat-val.blue { color: var(--c-accent); }
.stat-val small { font-size: 13px; font-weight: 400; color: var(--c-light); }

/* Side panels row */
.panels { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.panel {
  background: var(--c-surface); border: 1px solid var(--c-rule);
  border-radius: var(--r-card); padding: 20px 22px; box-shadow: var(--sh-panel);
}
.panel-title {
  font-size: 10px; font-weight: 600; color: var(--c-light);
  text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;
}
.loc-row, .vis-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 0; border-bottom: 1px solid var(--c-rule); font-size: 13px;
}
.loc-row:last-child, .vis-row:last-child { border-bottom: none; }
.loc-name { font-weight: 400; color: var(--c-ink); }
.loc-count {
  font-weight: 600; font-size: 12px; color: var(--c-accent);
  background: rgba(74,144,217,0.08); padding: 2px 10px;
  border-radius: var(--r-pill); font-variant-numeric: tabular-nums;
}
.vis-row { gap: 12px; }
.vis-id {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px; color: var(--c-light); flex-shrink: 0;
}
.vis-loc { font-size: 12px; color: var(--c-mid); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vis-date { font-size: 11px; color: var(--c-light); flex-shrink: 0; }
.vis-count {
  font-weight: 600; font-size: 12px; color: var(--c-accent);
  background: rgba(74,144,217,0.08); padding: 2px 10px;
  border-radius: var(--r-pill); flex-shrink: 0; font-variant-numeric: tabular-nums;
}
.empty-sm { font-size: 13px; color: var(--c-light); font-weight: 300; }

/* Section title */
.section-label {
  font-size: 10px; font-weight: 600; color: var(--c-light);
  text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;
}

/* Conversation cards */
.cards { display: flex; flex-direction: column; gap: 10px; }
.card {
  background: var(--c-surface); border: 1px solid var(--c-rule);
  border-radius: var(--r-card); padding: 20px 24px;
  box-shadow: var(--sh-panel); transition: box-shadow 0.2s var(--ease);
}
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 12px; }
.card-top-left { display: flex; flex-direction: column; gap: 2px; }
.card-badges { display: flex; gap: 6px; flex-shrink: 0; }
.date { font-size: 13px; color: var(--c-ink); font-weight: 500; letter-spacing: -0.01em; }
.time { font-size: 11px; color: var(--c-light); font-weight: 400; }
.location { font-size: 11px; color: var(--c-mid); font-weight: 400; }
.badge {
  font-size: 10px; font-weight: 600; padding: 3px 10px;
  border-radius: var(--r-pill); letter-spacing: 0.02em; white-space: nowrap;
}
.badge-ok { background: rgba(46,125,50,0.1); color: var(--c-success); }
.badge-err { background: rgba(211,47,47,0.1); color: var(--c-error); }
.badge-new { background: rgba(74,144,217,0.1); color: var(--c-accent); }
.badge-ret { background: rgba(168,85,247,0.1); color: #a855f7; }
.question { font-size: 14px; font-weight: 600; line-height: 1.5; margin-bottom: 6px; color: var(--c-ink); letter-spacing: -0.01em; }
.response {
  font-size: 13px; font-weight: 300; line-height: 1.7; color: var(--c-mid);
  border-left: 2px solid var(--c-rule); padding-left: 12px;
}
.error-msg {
  font-size: 13px; color: var(--c-error);
  background: rgba(211,47,47,0.06); padding: 8px 12px; border-radius: 8px;
}
.meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; font-size: 11px; color: var(--c-light); }
.vid { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 10px; }
.empty { text-align: center; padding: 60px 20px; color: var(--c-light); font-size: 15px; font-weight: 300; }

/* Conversation thread */
.thread { display: none; margin: 10px 0; border-radius: 10px; background: var(--c-panel); padding: 14px 16px; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }
.thread.open { display: flex; }
.thread-msg { display: flex; flex-direction: column; gap: 2px; }
.thread-role { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--c-light); }
.thread-user .thread-text { font-size: 13px; font-weight: 500; color: var(--c-ink); }
.thread-ai .thread-text { font-size: 13px; font-weight: 300; color: var(--c-mid); line-height: 1.6; white-space: pre-wrap; }
.thread-toggle {
  font-family: var(--font); font-size: 11px; font-weight: 500; color: var(--c-accent);
  background: none; border: none; cursor: pointer; padding: 4px 0; text-align: left;
  transition: color 0.15s var(--ease);
}
.thread-toggle:hover { color: var(--c-ink); }
.badge-msg { background: rgba(168,85,247,0.1); color: #a855f7; }
#countdown { font-variant-numeric: tabular-nums; }

/* Filter toolbar — sticky below header, filters centered */
.toolbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 32px;
  background: var(--c-bg); border-bottom: 1px solid var(--c-rule);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.toolbar-inner {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 10px; width: 100%;
}
html[data-theme="dark"] .toolbar { background: rgba(18,18,18,0.92); }
.toolbar label {
  font-size: 10px; font-weight: 600; color: var(--c-light);
  text-transform: uppercase; letter-spacing: 0.14em;
}
.toolbar select, .toolbar input[type="date"] {
  font-family: var(--font); font-size: 12px; font-weight: 400;
  color: var(--c-ink); background: var(--c-panel); border: 1px solid var(--c-rule);
  border-radius: 6px; padding: 6px 10px; outline: none;
  transition: border-color 0.2s var(--ease);
  -webkit-appearance: none; appearance: none;
}
.toolbar select { padding-right: 26px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236F6F6F'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
html[data-theme="dark"] .toolbar select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.53)'/%3E%3C/svg%3E"); }
.toolbar select:focus, .toolbar input[type="date"]:focus { border-color: var(--c-accent); }
.filter-group { display: flex; align-items: center; gap: 5px; }
.filter-sep { width: 1px; height: 20px; background: var(--c-rule); flex-shrink: 0; }
.result-count {
  font-size: 11px; color: var(--c-light); font-variant-numeric: tabular-nums;
  width: 100%; text-align: center; margin-top: 6px;
}
.btn-reset {
  font-family: var(--font); font-size: 11px; font-weight: 500;
  color: var(--c-accent); background: none; border: 1px solid var(--c-rule);
  border-radius: var(--r-pill); padding: 4px 12px; cursor: pointer;
  transition: background 0.15s var(--ease), color 0.15s var(--ease), border-color 0.15s var(--ease);
}
.btn-reset:hover { background: var(--c-accent); color: #fff; border-color: var(--c-accent); }

@media (max-width: 700px) {
  header { padding: 16px; }
  main { padding: 16px 12px; }
  .summary { padding: 16px; gap: 0; }
  .summary-item { min-width: 70px; padding: 6px 8px; }
  .stat-val { font-size: 22px; }
  .card { padding: 16px 18px; }
  .panels { grid-template-columns: 1fr; }
  .card-top { flex-direction: column; gap: 8px; }
  .card-badges { align-self: flex-start; }
  .toolbar { padding: 10px 12px; }
  .toolbar-inner { gap: 6px; }
  .filter-sep { display: none; }
  .filter-group { flex: 1 1 auto; min-width: 0; max-width: 100%; }
  .toolbar label { font-size: 9px; }
  .toolbar select, .toolbar input[type="date"] { flex: 1; min-width: 0; font-size: 11px; padding: 5px 8px; }
  .result-count { margin-top: 4px; }
}
</style>
</head>
<body>
<header>
  <h1>Ask Shannon</h1>
  <div class="header-right">
    <div class="header-sub"><span class="dot"></span> Refresh in <span id="countdown">30</span>s</div>
    <button class="theme-btn" onclick="toggleTheme()" aria-label="Toggle theme" id="theme-btn">&#9790;</button>
  </div>
</header>
<div class="toolbar">
  <div class="toolbar-inner">
    <div class="filter-group">
      <label for="f-date">Date</label>
      <select id="f-date">
        <option value="all">All time</option>
        <option value="today">Today</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="custom">Custom range</option>
      </select>
    </div>
    <input type="date" id="f-from" style="display:none" title="From date">
    <input type="date" id="f-to" style="display:none" title="To date">
    <span class="filter-sep"></span>
    <div class="filter-group">
      <label for="f-loc">Location</label>
      <select id="f-loc">
        <option value="all">All locations</option>
        ${Object.keys(locationCounts).sort().map(l => '<option value="' + escHtml(l) + '">' + escHtml(l) + '</option>').join('')}
      </select>
    </div>
    <span class="filter-sep"></span>
    <div class="filter-group">
      <label for="f-type">Visitor</label>
      <select id="f-type">
        <option value="all">All</option>
        <option value="new">New</option>
        <option value="returning">Returning</option>
      </select>
    </div>
    <span class="filter-sep"></span>
    <div class="filter-group">
      <label for="f-status">Status</label>
      <select id="f-status">
        <option value="all">All</option>
        <option value="ok">Success</option>
        <option value="error">Errors</option>
      </select>
    </div>
    <span class="filter-sep"></span>
    <div class="filter-group">
      <label for="f-sort">Sort</label>
      <select id="f-sort">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
    <button class="btn-reset" onclick="resetFilters()">Reset</button>
  </div>
  <span class="result-count" id="result-count"></span>
</div>
<main>
  <div class="summary">
    <div class="summary-item"><div class="stat-val">${total}</div><div class="stat-label">Conversations</div></div>
    <div class="summary-item"><div class="stat-val blue">${todayCount}</div><div class="stat-label">Today</div></div>
    <div class="summary-item"><div class="stat-val blue">${uniqueVisitors}</div><div class="stat-label">Unique</div></div>
    <div class="summary-item"><div class="stat-val green">${newCount}</div><div class="stat-label">New</div></div>
    <div class="summary-item"><div class="stat-val" style="color:#a855f7">${returningCount}</div><div class="stat-label">Returning</div></div>
    <div class="summary-item"><div class="stat-val ${parseFloat(errorRate) > 0 ? 'red' : 'green'}">${errorRate}%</div><div class="stat-label">Error Rate</div></div>
    <div class="summary-item"><div class="stat-val">${mobileCount}<small> / ${desktopCount}</small></div><div class="stat-label">Mobile / Desktop</div></div>
  </div>

  <div class="panels">
    <div class="panel">
      <div class="panel-title">Top Locations</div>
      ${locHtml}
    </div>
    <div class="panel">
      <div class="panel-title">Visitors</div>
      ${visitorsHtml}
    </div>
  </div>

  <div class="section-label">Recent Conversations</div>
  <div class="cards" id="cards-container">${cards}</div>
</main>
<script>
var ALL_CONVOS = ${JSON.stringify(deduped.map(c => {
  const msgs = c.messages || [];
  const allMsgs = msgs.concat(c.response ? [{ role: 'assistant', content: c.response }] : []);
  return {
    ts: c.timestamp,
    question: c.question || '',
    messages: allMsgs.map(m => ({ role: m.role, content: m.content })),
    status: c.status || 'ok',
    error: c.error || '',
    isNew: !!c.isNew,
    visitorId: c.visitorId || '',
    totalVisits: c.totalVisits || 0,
    loc: (c.location && c.location.city !== '—') ? c.location.city + ', ' + c.location.country : '',
    device: (c.userAgent || '').includes('Mobile') ? 'Mobile' : 'Desktop'
  };
}))};

function escH(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function fmtD(iso) { return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); }
function fmtT(iso) { return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }); }
function ago(iso) {
  var d = Date.now() - new Date(iso).getTime(), m = Math.floor(d/60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  var h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  var dy = Math.floor(h/24);
  return dy < 7 ? dy + 'd ago' : fmtD(iso);
}

var _cardIdx = 0;
function renderCard(c) {
  var idx = _cardIdx++;
  var vLabel = c.isNew ? 'New' : 'Returning';
  var vClass = c.isNew ? 'badge-new' : 'badge-ret';
  var msgs = c.messages || [];
  var exchanges = Math.ceil(msgs.length / 2);

  var threadHtml = '';
  msgs.forEach(function (m) {
    var cls = m.role === 'user' ? 'thread-user' : 'thread-ai';
    var label = m.role === 'user' ? 'Visitor' : 'Shannon AI';
    threadHtml += '<div class="thread-msg ' + cls + '"><span class="thread-role">' + label + '</span><span class="thread-text">' + escH(m.content) + '</span></div>';
  });

  return '<div class="card">'
    + '<div class="card-top"><div class="card-top-left">'
    + '<span class="date">' + fmtD(c.ts) + '</span>'
    + '<span class="time">' + fmtT(c.ts) + ' &middot; ' + ago(c.ts) + '</span>'
    + (c.loc ? '<span class="location">' + escH(c.loc) + '</span>' : '')
    + '</div><div class="card-badges">'
    + (c.visitorId ? '<span class="badge ' + vClass + '">' + vLabel + '</span>' : '')
    + '<span class="badge ' + (c.status === 'ok' ? 'badge-ok' : 'badge-err') + '">' + (c.status === 'ok' ? 'Success' : 'Error') + '</span>'
    + '<span class="badge badge-msg">' + exchanges + ' exchange' + (exchanges !== 1 ? 's' : '') + '</span>'
    + '</div></div>'
    + '<div class="question">' + escH(c.question) + '</div>'
    + (c.status === 'error' ? '<div class="error-msg">' + escH(c.error) + '</div>' : '')
    + '<div class="thread" id="thread-' + idx + '">' + threadHtml + '</div>'
    + '<button class="thread-toggle" onclick="toggleThread(' + idx + ')" aria-expanded="false">Show full conversation</button>'
    + '<div class="meta">'
    + '<span>' + (c.device === 'Mobile' ? '&#128241;' : '&#128187;') + ' ' + c.device + '</span>'
    + '<span>' + msgs.length + ' msg' + (msgs.length !== 1 ? 's' : '') + '</span>'
    + (c.visitorId ? '<span class="vid" title="Visitor ID">ID: ' + c.visitorId + '</span>' : '')
    + (c.totalVisits > 1 ? '<span>' + c.totalVisits + ' total visits</span>' : '')
    + '</div></div>';
}

function applyFilters() {
  var dateVal = document.getElementById('f-date').value;
  var locVal = document.getElementById('f-loc').value;
  var typeVal = document.getElementById('f-type').value;
  var statusVal = document.getElementById('f-status').value;
  var sortVal = document.getElementById('f-sort').value;
  var fromVal = document.getElementById('f-from').value;
  var toVal = document.getElementById('f-to').value;

  var now = Date.now();
  var filtered = ALL_CONVOS.filter(function (c) {
    var t = new Date(c.ts).getTime();
    if (dateVal === 'today') {
      var todayStart = new Date(); todayStart.setHours(0,0,0,0);
      if (t < todayStart.getTime()) return false;
    } else if (dateVal === '7d') { if (now - t > 7*86400000) return false;
    } else if (dateVal === '30d') { if (now - t > 30*86400000) return false;
    } else if (dateVal === 'custom') {
      if (fromVal && t < new Date(fromVal).getTime()) return false;
      if (toVal) { var end = new Date(toVal); end.setHours(23,59,59,999); if (t > end.getTime()) return false; }
    }
    if (locVal !== 'all' && c.loc !== locVal) return false;
    if (typeVal === 'new' && !c.isNew) return false;
    if (typeVal === 'returning' && c.isNew) return false;
    if (statusVal === 'ok' && c.status !== 'ok') return false;
    if (statusVal === 'error' && c.status === 'ok') return false;
    return true;
  });

  if (sortVal === 'oldest') filtered.reverse();

  var container = document.getElementById('cards-container');
  _cardIdx = 0;
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty">No conversations match these filters.</div>';
  } else {
    container.innerHTML = filtered.map(renderCard).join('');
  }
  document.getElementById('result-count').textContent = filtered.length + ' of ' + ALL_CONVOS.length;
}

function resetFilters() {
  document.getElementById('f-date').value = 'all';
  document.getElementById('f-loc').value = 'all';
  document.getElementById('f-type').value = 'all';
  document.getElementById('f-status').value = 'all';
  document.getElementById('f-sort').value = 'newest';
  document.getElementById('f-from').style.display = 'none';
  document.getElementById('f-to').style.display = 'none';
  applyFilters();
}

document.getElementById('f-date').addEventListener('change', function () {
  var show = this.value === 'custom';
  document.getElementById('f-from').style.display = show ? '' : 'none';
  document.getElementById('f-to').style.display = show ? '' : 'none';
  applyFilters();
});
['f-loc','f-type','f-status','f-sort','f-from','f-to'].forEach(function (id) {
  document.getElementById(id).addEventListener('change', applyFilters);
});

applyFilters();

/* Auto-refresh */
var s = 30;
setInterval(function () {
  s--;
  document.getElementById('countdown').textContent = s;
  if (s <= 0) location.reload();
}, 1000);

/* Toggle conversation thread */
function toggleThread(idx) {
  var thread = document.getElementById('thread-' + idx);
  var btn = thread.nextElementSibling;
  var open = thread.classList.toggle('open');
  btn.textContent = open ? 'Hide conversation' : 'Show full conversation';
  btn.setAttribute('aria-expanded', open);
}

/* Theme toggle */
function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('dash-theme', next);
  document.getElementById('theme-btn').innerHTML = next === 'dark' ? '&#9788;' : '&#9790;';
}
(function () {
  var saved = localStorage.getItem('dash-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-btn').innerHTML = '&#9788;';
  }
})();
</script>
</body>
</html>`;
}

app.get('/api/conversations', (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.query.token !== token) {
    return res.status(401).json({ error: 'Unauthorized. Set ADMIN_TOKEN env var and pass ?token=YOUR_TOKEN' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 200, 500);
  const recent = conversations.slice(-limit).reverse();

  /* Serve HTML dashboard for browsers, JSON for programmatic access */
  const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (wantsHtml) {
    return res.type('html').send(buildDashboard(conversations, recent, token));
  }

  /* Deduplicate sessions for JSON too */
  const jsonSessionMap = new Map();
  recent.forEach(c => {
    const sid = c.sessionId || c.visitorId + '-' + c.timestamp;
    const existing = jsonSessionMap.get(sid);
    if (!existing || c.messageCount > existing.messageCount) {
      jsonSessionMap.set(sid, c);
    }
  });
  const jsonDeduped = Array.from(jsonSessionMap.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    total: conversations.length,
    uniqueVisitors: new Set(conversations.map(c => c.visitorId).filter(Boolean)).size,
    showing: jsonDeduped.length,
    conversations: jsonDeduped.map(c => {
      const msgs = c.messages || [];
      const allMsgs = msgs.concat(c.response ? [{ role: 'assistant', content: c.response }] : []);
      return {
        time: c.timestamp,
        question: c.question,
        messages: allMsgs.map(m => ({ role: m.role, content: m.content })),
        status: c.status,
        error: c.error || null,
        visitorId: c.visitorId || null,
        isNew: c.isNew || false,
        location: c.location || null,
        device: (c.userAgent || '').includes('Mobile') ? 'mobile' : 'desktop'
      };
    })
  });
});

/* Local dev: listen on PORT. Vercel: export the app. */
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Ask Shannon API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
