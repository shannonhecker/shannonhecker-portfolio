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

app.use(cors({ origin: true }));
app.use(express.json());

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
/*  GET /api/conversations — view recent visitor questions            */
/*  Protected with a simple token from env var                        */
/* ------------------------------------------------------------------ */
app.get('/api/conversations', (req, res) => {
  const token = process.env.ADMIN_TOKEN || 'shannon2026';
  if (req.query.token !== token) {
    return res.status(401).json({ error: 'Unauthorized. Add ?token=YOUR_TOKEN' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const recent = conversations.slice(-limit).reverse();

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
