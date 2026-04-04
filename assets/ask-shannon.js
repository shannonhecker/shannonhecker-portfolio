/**
 * Ask Shannon — Frontend chat client
 *
 * Connects to the chat proxy at ASK_API_URL and streams
 * Anthropic responses into the contact-section chat UI.
 * Toggles glow effects on the wrapper during streaming.
 */

(function () {
  'use strict';

  /* ── Config ── */
  const ASK_API_URL = window.ASK_API_URL || 'http://localhost:3001/api/chat';
  const FETCH_TIMEOUT_MS = 30000;

  /* ── DOM refs ── */
  const messagesEl     = document.getElementById('ask-messages');
  const formEl         = document.getElementById('ask-form');
  const inputEl        = document.getElementById('ask-input');
  const suggestionsEl  = document.getElementById('ask-suggestions');
  const sendBtn        = document.getElementById('ask-send');
  const glowWrap       = document.querySelector('.ask-glow-wrap');
  const micBtn         = document.getElementById('ask-mic');

  if (!messagesEl || !formEl) return;

  /* ── State ── */
  let history  = [];   // { role, content }[]
  let isTyping = false;

  /* ── Speech to text ── */
  var recognition = null;
  if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', function () {
      if (micBtn.classList.contains('listening')) {
        recognition.stop();
        return;
      }
      recognition.start();
      micBtn.classList.add('listening');
    });

    recognition.onresult = function (e) {
      var transcript = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      inputEl.value = transcript;
    };

    recognition.onend = function () {
      micBtn.classList.remove('listening');
      inputEl.focus();
    };

    recognition.onerror = function () {
      micBtn.classList.remove('listening');
    };
  } else if (micBtn) {
    micBtn.style.display = 'none';
  }

  /* ── Suggested questions (grouped into sets that rotate on click) ── */
  const SUGGESTION_SETS = [
    [
      "What's your experience?",
      "Tell me about your design systems work",
      "What tools do you use?",
      "Are you open to new roles?",
    ],
    [
      "What projects have you worked on?",
      "How do you approach accessibility?",
      "What's your design process like?",
      "Have you worked with AI tools?",
    ],
    [
      "Tell me about your work at Barclays",
      "What was your role at J.P. Morgan?",
      "Do you have leadership experience?",
      "Tell me a fun fact about you!",
    ],
    [
      "What's your coffee order?",
      "Do you have any pets?",
      "What's your favourite colour?",
      "How can I get in touch with you?",
    ],
  ];
  var currentSetIndex = 0;

  /* ── Init ── */
  renderSuggestions();

  /* ── Trap scroll inside chat messages — prevent page scroll leak ── */
  messagesEl.addEventListener('wheel', function (e) {
    var el = messagesEl;
    var atTop    = el.scrollTop <= 0;
    var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    /* Only block if scrolling would escape the container */
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  }, { passive: false });

  /* ── Event listeners ── */
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text || isTyping) return;
    sendMessage(text);
  });

  /* Allow Enter to submit, Shift+Enter for newline */
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.dispatchEvent(new Event('submit'));
    }
  });

  /* ── Render suggestion chips from current set ── */
  function renderSuggestions() {
    if (!suggestionsEl) return;
    suggestionsEl.innerHTML = '';
    var chips = SUGGESTION_SETS[currentSetIndex % SUGGESTION_SETS.length];
    chips.forEach(function (q) {
      var btn = document.createElement('button');
      btn.className = 'ask-chip';
      btn.type = 'button';
      btn.textContent = q;
      btn.addEventListener('click', function () {
        if (isTyping) return;
        sendMessage(q);
        /* Advance to next set of suggestions */
        currentSetIndex++;
        renderSuggestions();
      });
      suggestionsEl.appendChild(btn);
    });
  }

  /* ── Send a message ── */
  function sendMessage(text) {
    /* Keep suggestions visible — don't hide them */

    /* Render user bubble */
    addUserMessage(text);
    inputEl.value = '';

    /* Add to history */
    history.push({ role: 'user', content: text });

    /* Stream AI response */
    streamResponse();
  }

  /* ── Stream from API ── */
  async function streamResponse() {
    isTyping = true;
    sendBtn.disabled = true;

    /* Activate glow "thinking" state */
    if (glowWrap) glowWrap.classList.add('thinking');

    /* Create AI bubble (empty, will fill via streaming) */
    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai streaming';
    var textNode = document.createElement('p');
    bubble.appendChild(textNode);
    messagesEl.appendChild(bubble);
    scrollToBottom();

    var fullText = '';

    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

    try {
      /* Send only the last 10 messages to avoid exceeding context limits */
      var recentHistory = history.slice(-10);
      var res = await fetch(ASK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentHistory }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error('API returned ' + res.status);
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        clearTimeout(timeout);

        buffer += decoder.decode(chunk.value, { stream: true });

        /* Parse SSE lines */
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (!line.startsWith('data: ')) continue;
          var payload = line.slice(6).trim();

          if (payload === '[DONE]') continue;

          try {
            var data = JSON.parse(payload);
            if (data.error) throw new Error(data.error);
            if (data.text) {
              fullText += data.text;
              textNode.innerHTML = formatMarkdown(fullText);
              scrollToBottom();
            }
          } catch (parseErr) {
            if (parseErr.message && parseErr.message !== 'Unexpected token') throw parseErr;
          }
        }
      }

      /* Finalize */
      bubble.classList.remove('streaming');
      history.push({ role: 'assistant', content: fullText });

    } catch (err) {
      bubble.remove();
      var msg = err.name === 'AbortError'
        ? 'The request timed out — the AI took too long to respond.'
        : err.message;
      showError(msg);
    } finally {
      clearTimeout(timeout);
    }

    /* Deactivate glow "thinking" state */
    if (glowWrap) glowWrap.classList.remove('thinking');

    isTyping = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  /* ── Add a user message bubble ── */
  function addUserMessage(text) {
    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--user';
    bubble.innerHTML = '<p>' + escapeHtml(text) + '</p>';
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  /* ── Add an AI message bubble (instant, e.g. welcome) ── */
  function addAIMessage(text) {
    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai';
    bubble.innerHTML = '<p>' + formatMarkdown(text) + '</p>';
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  /* ── Show error with email fallback ── */
  function showError(msg) {
    var el = document.createElement('div');
    el.className = 'ask-error';
    el.innerHTML =
      'Couldn\'t reach the AI right now. ' +
      '<a href="mailto:shannonheckerchen@gmail.com?subject=Portfolio%20enquiry">Email Shannon directly</a> instead.';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  /* ── Scroll chat to bottom ── */
  function scrollToBottom() {
    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: 'smooth'
    });
  }

  /* ── Portfolio case study titles → project-*.html (matches KEY PROJECTS in api/server.js) ── */
  var PORTFOLIO_PROJECTS = [
    { name: 'Complex Assets Derivatives Valuation', href: 'project-complex-assets.html' },
    { name: 'Global Custody Deal Model', href: 'project-deal-model.html' },
    { name: 'Corporate Action Manager', href: 'project-corporate-action.html' },
    { name: 'Fusion Analytics Dashboard', href: 'project-analytics.html' },
    { name: 'Fusion Design System', href: 'project-design-system.html' },
    { name: 'Fusion Data Solution', href: 'project-data-solution.html' },
    { name: 'Barclays Data Visualisation', href: 'project-barclays-data-viz.html' },
    { name: 'JPMM Research Platform', href: 'project-research.html' },
    { name: 'Execute Algo Center', href: 'project-algo-center.html' },
    { name: 'UI Toolkit', href: 'project-ui-toolkit.html' },
    { name: 'TripUp', href: 'project-tripup.html' },
    { name: 'Digital & Platform Services Brand Identity', href: 'project-dps-brand.html' }
  ];

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Turn known project titles in plain text segments into same-origin links (longest titles first). */
  function injectPortfolioProjectAnchors(plain) {
    var sorted = PORTFOLIO_PROJECTS.slice().sort(function (a, b) {
      return b.name.length - a.name.length;
    });
    var out = plain;
    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      var re = new RegExp('\\b' + escapeRegExp(p.name) + '\\b', 'gi');
      out = out.replace(re, function (match) {
        return '<a href="' + p.href + '" class="ask-project-link">' + match + '</a>';
      });
    }
    return out;
  }

  function linkPortfolioProjectsInHtml(html) {
    var parts = html.split(/(<[^>]+>)/g);
    for (var j = 0; j < parts.length; j++) {
      if (parts[j].charAt(0) === '<') continue;
      parts[j] = injectPortfolioProjectAnchors(parts[j]);
    }
    return parts.join('');
  }

  /* ── Minimal markdown → HTML (bold, links, line breaks, auto-link) ── */
  function isSafeUrl(url) {
    return /^https?:\/\//i.test(url) || /^mailto:/i.test(url);
  }

  function formatMarkdown(text) {
    var html = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, function (match, label, url) {
        if (!isSafeUrl(url)) return label;
        return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
      })
      /* Auto-link emails */
      .replace(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>')
      /* Auto-link URLs (not already inside an href) */
      .replace(/((?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com)[^\s<,)]+[^\s<,).!?])/gi, function (url) {
        var href = url.match(/^https?:\/\//) ? url : 'https://' + url;
        return '<a href="' + href + '" target="_blank" rel="noopener">' + url + '</a>';
      })
      .replace(/\n/g, '<br>');
    return linkPortfolioProjectsInHtml(html);
  }

  /* ── Escape HTML ── */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

})();
