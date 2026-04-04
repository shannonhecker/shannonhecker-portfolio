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
const fs   = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'conversations.log');
const conversations = []; /* in-memory for the /api/conversations endpoint */

function logConversation(entry) {
  conversations.push(entry);
  /* Keep only last 500 in memory */
  if (conversations.length > 500) conversations.shift();
  /* Append to log file */
  const line = JSON.stringify(entry) + '\n';
  fs.appendFile(LOG_FILE, line, () => {});
}

/* ------------------------------------------------------------------ */
/*  SYSTEM PROMPT,Shannon's complete professional profile            */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `You are Shannon Hecker, a Senior Product Designer responding directly to visitors on your portfolio site. Speak in the first person ("I", "my", "me") with a warm, friendly, conversational tone, like chatting with a recruiter over coffee. Keep answers concise (2-4 sentences) unless the visitor asks for more detail. You're friendly, approachable, and genuinely enthusiastic about your work.

IMPORTANT STYLE RULES:
- NEVER use em dashes (—) or en dashes (–) in your responses. Use commas, full stops, or just start a new sentence instead.
- Write naturally and warmly, like texting a friend. Avoid formal or corporate-sounding language.
- Use simple punctuation. Commas and full stops are your friends.

## PROFILE
Shannon Hecker,Senior Product Designer based in London.
Open to lead and senior product design roles,especially in AI, with fintech and enterprise SaaS also a strong fit.
She helps teams ship accessible, measurable product experiences from discovery through delivery.

## APPROACH
Shannon anchors design in outcomes: usable today, scalable tomorrow, accessible always. Every project begins with real constraints,user needs, business goals, and technical realities. She validates direction early through prototyping, research, and tight feedback loops with product and engineering, so decisions are grounded before pixels are final. Design systems and modern tooling (including AI where it genuinely adds value) accelerate delivery without compromising clarity.

## EXPERIENCE
1. Barclays, London,Senior Product Designer (2025 – Present)
   Owns product design for FX and MarketsOne, Barclays' core trading platform. Architecting the MarketsOne Design System, designing AI-first workflows with Claude AI, and reshaping trading tools into a refined, data-dense UI built for speed and accessibility.

2. J.P. Morgan, London,VP Product Design (2016 – 2025)
   Shaped complex financial interfaces across trading, data management, and analytics. Built and scaled a Figma design system adopted by 5+ product teams, translated dense data workflows into clear experiences, and embedded WCAG-compliant accessibility standards across the platform.

3. Pegasus Global Travel, London,Graphic Designer (2015)
   Designed the company website end-to-end, produced promotional assets and video content, unifying the brand across all channels.

4. Genuine C&C Inc, Taiwan,Visual Designer & Web Developer (2011 – 2015)
   Designed and maintained the B2B platform, built the corporate website front-end, and led UI/UX direction for a client-facing network platform.

5. Eastern Shine Production Co., Ltd.,Website Designer, Graphic Designer (2011)
   Designed web platforms focused on usability and art directed a government video project from concept to delivery.

6. Reeborn Information, Ltd,Website Designer (2008 – 2010)
   Designed corporate visual identity and web platform interfaces, with digital content and product photography for e-commerce.

## KEY PROJECTS (11 case studies)
1. Barclays Data Visualisation,Equities monitoring dashboard: charts, heatmaps, filters, and responsive layouts in a Barclays-aligned shell.
2. TripUp,Product design challenge for Bending Spoons: group travel, polls, and shared expenses in one mobile flow.
3. Fusion Analytics Dashboard,B2B analytics platform: real-time financial data, WCAG 2.2 AA, and a modular dashboard system.
4. Fusion Design System,Token-based design system: 200+ components for enterprise finance products, specified in Figma.
5. Fusion Data Solution,End-to-end UX: complex technical workflows turned into guided, shippable journeys.
6. UI Toolkit,Reusable UI component library: patterns and specs that speed delivery across product squads.
7. Corporate Action Manager,Redesigned a legacy corporate actions tool, delivering 40% faster task completion.
8. Complex Assets Derivatives Valuation,Derivatives pricing and risk analytics: data-dense valuation interfaces for complex asset classes.
9. JPMM Research Platform,Research discovery for analysts: IA-first navigation through content-heavy institutional research.
10. Global Custody Deal Model,Bespoke deal modelling for custodian teams: multi-step flows, progressive disclosure, clear visual hierarchy.
11. Execute Algo Center,Algorithmic execution centre: streamlined order routing and real-time trade monitoring.

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
- Total cat person. I have a fluffy cat called Quorra and she basically runs the house.
- My go-to coffee order is a soya latte with an extra shot.
- Favourite colour is teal. It shows up in my design work more than I'd like to admit.
- I also love a strong leaf tea, especially when I'm deep in a design session.

## GUIDELINES
- If the user asks to schedule a call or get in touch directly, offer your email shannonheckerchen@gmail.com or LinkedIn linkedin.com/in/shannonhecker.
- If asked about what roles you're looking for, emphasise AI-related design roles as your top wish, alongside fintech and enterprise SaaS.
- If asked about on-site, remote, or hybrid work, say you currently do two days a week in the office with Barclays and prefer a hybrid model. But for a great opportunity, you'd be open to considering fully on-site.
- If asked about notice period or availability to start, say your notice period is 90 days.
- If asked about salary, say you're happy to discuss compensation expectations directly in conversation.
- If asked something outside your professional scope, warmly redirect to your portfolio or suggest getting in touch.
- Never fabricate experience or skills you don't have.
- Keep the tone warm, personal, and confident,like you're having a real conversation, not reading a recruiter brief.`;

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

  /* Log the visitor's question */
  const userMsg = messages.filter(m => m.role === 'user').pop();
  const logEntry = {
    timestamp: new Date().toISOString(),
    question: userMsg ? userMsg.content : '',
    messageCount: messages.length,
    ip: req.headers['x-forwarded-for'] || req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || ''
  };

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

    /* Log completed conversation */
    logEntry.response = fullResponse;
    logEntry.status = 'ok';
    logConversation(logEntry);

  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();

    logEntry.status = 'error';
    logEntry.error = err.message;
    logConversation(logEntry);
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

function fmtTime(iso) {
  return new Date(iso).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function buildDashboard(allConvos, recent, token) {
  const total = allConvos.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = allConvos.filter(c => c.timestamp.startsWith(todayStr)).length;
  const errorCount = allConvos.filter(c => c.status === 'error').length;
  const errorRate = total > 0 ? ((errorCount / total) * 100).toFixed(1) : '0.0';
  const mobileCount = allConvos.filter(c => c.userAgent.includes('Mobile')).length;
  const desktopCount = total - mobileCount;

  const cards = recent.length === 0
    ? '<div class="empty">No conversations yet. Questions from visitors will appear here.</div>'
    : recent.map(c => {
        const device = c.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
        const resp = c.response ? c.response.substring(0, 200) + (c.response.length > 200 ? '...' : '') : '';
        return `<div class="card">
          <div class="card-top">
            <span class="time">${fmtTime(c.timestamp)}</span>
            <span class="badge ${c.status === 'ok' ? 'ok' : 'err'}">${c.status === 'ok' ? 'Success' : 'Error'}</span>
          </div>
          <div class="question">${escHtml(c.question)}</div>
          ${c.status === 'error' ? `<div class="error-msg">${escHtml(c.error)}</div>` : `<div class="response">${escHtml(resp)}</div>`}
          <div class="meta">
            <span class="device">${device === 'Mobile' ? '&#128241;' : '&#128187;'} ${device}</span>
            <span class="msgs">${c.messageCount} msg${c.messageCount !== 1 ? 's' : ''} in thread</span>
          </div>
        </div>`;
      }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ask Shannon - Conversations</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#F5F5F5;color:#0A0A0A;-webkit-font-smoothing:antialiased}
header{background:#0A0A0A;color:#fff;padding:24px 32px;display:flex;align-items:center;justify-content:space-between}
header h1{font-size:20px;font-weight:600;letter-spacing:-.02em}
header .sub{font-size:12px;color:#999;display:flex;align-items:center;gap:8px}
header .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
main{max-width:960px;margin:0 auto;padding:24px 16px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.stat{background:#fff;border-radius:16px;padding:22px 24px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.stat-val{font-size:34px;font-weight:700;letter-spacing:-.03em;line-height:1.1}
.stat-label{font-size:11px;font-weight:500;color:#999;text-transform:uppercase;letter-spacing:.14em;margin-top:6px}
.stat-val.green{color:#2E7D32}
.stat-val.red{color:#D32F2F}
.stat-val.blue{color:#4A90D9}
.cards{display:flex;flex-direction:column;gap:12px}
.card{background:#fff;border-radius:16px;padding:22px 26px;box-shadow:0 2px 10px rgba(0,0,0,.06);transition:box-shadow .2s}
.card:hover{box-shadow:0 4px 20px rgba(0,0,0,.1)}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.time{font-size:12px;color:#999;font-weight:400}
.badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;letter-spacing:.02em}
.badge.ok{background:rgba(46,125,50,.1);color:#2E7D32}
.badge.err{background:rgba(211,47,47,.1);color:#D32F2F}
.question{font-size:15px;font-weight:600;line-height:1.5;margin-bottom:8px;color:#0A0A0A}
.response{font-size:13px;font-weight:300;line-height:1.7;color:#555;border-left:2px solid #E8E8E8;padding-left:12px}
.error-msg{font-size:13px;color:#D32F2F;background:rgba(211,47,47,.06);padding:8px 12px;border-radius:8px}
.meta{display:flex;gap:16px;margin-top:12px;font-size:11px;color:#999}
.empty{text-align:center;padding:60px 20px;color:#999;font-size:15px;font-weight:300}
#countdown{font-variant-numeric:tabular-nums}
@media(max-width:600px){header{padding:18px 16px}main{padding:16px 12px}.stat{padding:16px 18px}.stat-val{font-size:28px}.card{padding:18px 20px}}
</style>
</head>
<body>
<header>
  <div>
    <h1>Ask Shannon &mdash; Conversations</h1>
  </div>
  <div class="sub"><span class="dot"></span> Auto-refresh <span id="countdown">30</span>s</div>
</header>
<main>
  <div class="stats">
    <div class="stat"><div class="stat-val">${total}</div><div class="stat-label">Total Conversations</div></div>
    <div class="stat"><div class="stat-val blue">${todayCount}</div><div class="stat-label">Today</div></div>
    <div class="stat"><div class="stat-val ${parseFloat(errorRate) > 0 ? 'red' : 'green'}">${errorRate}%</div><div class="stat-label">Error Rate</div></div>
    <div class="stat"><div class="stat-val">${mobileCount}<small style="font-size:14px;font-weight:400;color:#999"> / ${desktopCount}</small></div><div class="stat-label">Mobile / Desktop</div></div>
  </div>
  <div class="cards">${cards}</div>
</main>
<script>
var s=30;setInterval(function(){s--;document.getElementById('countdown').textContent=s;if(s<=0)location.reload()},1000);
</script>
</body>
</html>`;
}

app.get('/api/conversations', (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.query.token !== token) {
    return res.status(401).json({ error: 'Unauthorized. Set ADMIN_TOKEN env var and pass ?token=YOUR_TOKEN' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const recent = conversations.slice(-limit).reverse();

  /* Serve HTML dashboard for browsers, JSON for programmatic access */
  const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html');

  if (wantsHtml) {
    return res.type('html').send(buildDashboard(conversations, recent, token));
  }

  res.json({
    total: conversations.length,
    showing: recent.length,
    conversations: recent.map(c => ({
      time: c.timestamp,
      question: c.question,
      response: c.response ? c.response.substring(0, 200) + (c.response.length > 200 ? '...' : '') : null,
      status: c.status,
      error: c.error || null,
      device: c.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
    }))
  });
});

/* Local dev: listen on PORT. Vercel: export the app. */
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Ask Shannon API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
