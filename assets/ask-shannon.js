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
  var ASK_API_URL = window.ASK_API_URL || 'http://localhost:3001/api/chat';
  var FETCH_TIMEOUT_MS = 30000;
  var CHUNK_TIMEOUT_MS = 15000; /* max wait between chunks */

  /* ── DOM refs ── */
  var messagesEl     = document.getElementById('ask-messages');
  var formEl         = document.getElementById('ask-form');
  var inputEl        = document.getElementById('ask-input');
  var suggestionsEl  = document.getElementById('ask-suggestions');
  var sendBtn        = document.getElementById('ask-send');
  var glowWrap       = document.querySelector('.ask-glow-wrap');
  var micBtn         = document.getElementById('ask-mic');

  if (!messagesEl || !formEl) return;

  /* ── Feature detection ── */
  var hasAbortController = typeof AbortController !== 'undefined';
  var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  /* ── State ── */
  var history  = [];   // { role, content }[]
  var isTyping = false;
  var scrollRaf = 0;

  /* ── Escape HTML via string replacement (no DOM churn) ── */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
      /* Only focus on desktop — avoids iOS keyboard jump */
      if (!isMobile) inputEl.focus();
    };

    recognition.onerror = function () {
      micBtn.classList.remove('listening');
    };
  } else if (micBtn) {
    micBtn.style.display = 'none';
  }

  /* ── Suggested questions (grouped into sets that rotate on click) ── */
  var SUGGESTION_SETS = [
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

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  }, { passive: false });

  /* Touch scroll trapping for mobile */
  var touchStartY = 0;
  messagesEl.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  messagesEl.addEventListener('touchmove', function (e) {
    var el = messagesEl;
    var touchY = e.touches[0].clientY;
    var delta = touchStartY - touchY;
    var atTop = el.scrollTop <= 0;
    var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      e.preventDefault();
    }
  }, { passive: false });

  /* ── Auto-grow textarea ── */
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

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
        currentSetIndex++;
        renderSuggestions();
      });
      suggestionsEl.appendChild(btn);
    });
  }

  /* ── Send a message ── */
  function sendMessage(text) {
    addUserMessage(text);
    inputEl.value = '';
    inputEl.style.height = 'auto';

    history.push({ role: 'user', content: text });

    /* Trim history to prevent unbounded growth */
    if (history.length > 20) {
      history = history.slice(-20);
    }

    streamResponse();
  }

  /* ── Stream from API ── */
  function streamResponse() {
    isTyping = true;
    sendBtn.disabled = true;

    if (glowWrap) glowWrap.classList.add('thinking');

    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai streaming';
    var textNode = document.createElement('p');
    bubble.appendChild(textNode);
    messagesEl.appendChild(bubble);
    scrollToBottom();

    var fullText = '';
    var controller = hasAbortController ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timeoutId = null;

    function resetTimeout(ms) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!controller) return;
      timeoutId = setTimeout(function () { controller.abort(); }, ms);
    }

    resetTimeout(FETCH_TIMEOUT_MS);

    var recentHistory = history.slice(-10);

    fetch(ASK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: recentHistory }),
      signal: signal
    }).then(function (res) {
      if (!res.ok) {
        throw new Error('API returned ' + res.status);
      }

      /* Guard against null body (some polyfills / opaque responses) */
      if (!res.body || typeof res.body.getReader !== 'function') {
        return res.text().then(function (text) {
          /* Fallback: try to parse as non-streaming response */
          try {
            var lines = text.split('\n');
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i];
              if (!line.startsWith('data: ') || line.indexOf('[DONE]') !== -1) continue;
              var data = JSON.parse(line.slice(6).trim());
              if (data.text) fullText += data.text;
            }
          } catch (e) {
            fullText = text;
          }
          textNode.innerHTML = formatMarkdown(fullText);
          bubble.classList.remove('streaming');
          history.push({ role: 'assistant', content: fullText });
          scrollToBottom();
        });
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function read() {
        return reader.read().then(function (result) {
          if (result.done) return;

          /* Reset per-chunk timeout */
          resetTimeout(CHUNK_TIMEOUT_MS);

          buffer += decoder.decode(result.value, { stream: true });

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
                debouncedScroll();
              }
            } catch (parseErr) {
              /* Only throw if it's a real API error, not a partial JSON chunk */
              if (parseErr.message && parseErr.message.indexOf('Unexpected') === -1) {
                throw parseErr;
              }
              /* Partial chunk — will be completed in next read */
            }
          }

          return read();
        });
      }

      return read().then(function () {
        bubble.classList.remove('streaming');
        history.push({ role: 'assistant', content: fullText });
      });
    }).catch(function (err) {
      bubble.remove();
      var msg;
      if (err.name === 'AbortError') {
        msg = 'The request timed out. The AI server may be waking up, please try again in a moment.';
      } else if (err.message === 'Failed to fetch' || err.message === 'Load failed') {
        msg = 'Could not connect to the AI. Please check your internet connection and try again.';
      } else {
        msg = err.message || 'Something went wrong. Please try again.';
      }
      showError(msg);

      /* Remove the unanswered user message from history so retry works cleanly */
      if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.pop();
      }
    }).then(function () {
      /* finally — runs after success or catch */
      if (timeoutId) clearTimeout(timeoutId);
      if (glowWrap) glowWrap.classList.remove('thinking');
      isTyping = false;
      sendBtn.disabled = false;
      /* Only auto-focus on desktop to avoid iOS keyboard jump */
      if (!isMobile) inputEl.focus();
      scrollToBottom();
    });
  }

  /* ── Add a user message bubble ── */
  function addUserMessage(text) {
    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--user';
    bubble.innerHTML = '<p>' + escapeHtml(text) + '</p>';
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  /* ── Show error with specific message and email fallback ── */
  function showError(msg) {
    var el = document.createElement('div');
    el.className = 'ask-error';
    el.innerHTML =
      escapeHtml(msg) + ' ' +
      '<a href="mailto:shannonheckerchen@gmail.com?subject=Portfolio%20enquiry">Email Shannon directly</a> instead.';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  /* ── Scroll chat to bottom (debounced for streaming perf) ── */
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function debouncedScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollToBottom();
      scrollRaf = 0;
    });
  }

  /* ── Minimal markdown → HTML (bold, links, line breaks, auto-link) ── */
  function isSafeUrl(url) {
    return /^https?:\/\//i.test(url) || /^mailto:/i.test(url);
  }

  function formatMarkdown(text) {
    return escapeHtml(text)
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
  }

})();
