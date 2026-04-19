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

  /* ── Sticky-to-bottom scroll state ──────────────────────────────
     isFollowing is true when the user is (approximately) at the
     bottom of the messages pane. Only then do streaming chunks
     auto-scroll. If the user scrolls up to read earlier text, we
     stop yanking them down. When they scroll back within 40px of
     bottom, auto-scroll re-engages. */
  var AT_BOTTOM_THRESHOLD = 40;
  var isFollowing = true;
  var followBtn = null; // created lazily, shown when isFollowing is false during streaming

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
  /* Set 0 is hiring-conversation oriented: AI fluency, builder signal,
     enterprise depth, leadership. Sharpened from the user-testing readout. */
  var SUGGESTION_SETS = [
    [
      "How do you approach AI product design?",
      "Tell me about ausōs.ai",
      "Show me your trading platform work",
      "What's your leadership style?",
    ],
    [
      "Tell me about a hard design call you made",
      "How do you hire and mentor designers?",
      "How do you measure design impact?",
      "What's your take on AI in design?",
    ],
    [
      "Tell me about a favourite project",
      "How did you build the Fusion Design System?",
      "What was hardest about the Algo Center?",
      "How do you approach data-dense UI?",
    ],
    [
      "Where are you based?",
      "What languages do you speak?",
      "Tell me a fun fact about you",
      "How can I get in touch?",
    ],
  ];
  var currentSetIndex = 0;

  /* ── Initial greeting (renders before user interaction, not sent to API) ── */
  function addGreetingMessage() {
    var bubble = document.createElement('div');
    bubble.className = 'ask-msg ask-msg--ai';
    var textNode = document.createElement('p');
    textNode.textContent = "Hi, I'm Shannon's assistant. Ask me about her design leadership work, ausōs.ai, or the roles she's looking for next.";
    bubble.appendChild(textNode);
    messagesEl.appendChild(bubble);
  }

  /* ── Follow-stick scroll listener ───────────────────────────────
     Every time the user (or code) scrolls the messages pane, decide
     whether they're still at the bottom. This is the only signal
     that drives streaming auto-scroll. */
  messagesEl.addEventListener('scroll', function () {
    var distanceFromBottom =
      messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
    isFollowing = distanceFromBottom <= AT_BOTTOM_THRESHOLD;
    updateFollowButton();
  }, { passive: true });

  /* ── "New messages" follow button ────────────────────────────────
     Created lazily the first time we need to show it. Positioned by
     CSS (.ask-follow-btn) at the bottom of the chat area, visible
     only when the user has scrolled up during streaming. */
  function getFollowButton() {
    if (followBtn) return followBtn;
    followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'ask-follow-btn';
    followBtn.setAttribute('aria-label', 'Scroll to latest message');
    followBtn.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
        '<path d="M6 2v7m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span>New messages</span>';
    followBtn.addEventListener('click', function () {
      scrollToBottomForced();
    });
    /* Insert right after messagesEl so it can be absolute-positioned
       relative to the same flow parent. */
    messagesEl.parentNode.insertBefore(followBtn, messagesEl.nextSibling);
    return followBtn;
  }

  function updateFollowButton() {
    /* Show only when the stream is running AND user scrolled up. Hide
       otherwise (including when the stream completes and user is at
       the bottom). */
    var shouldShow = isTyping && !isFollowing;
    var btn = (followBtn || shouldShow) ? getFollowButton() : null;
    if (!btn) return;
    btn.classList.toggle('visible', shouldShow);
  }

  /* ── Init ── */
  addGreetingMessage();
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
    /* Sync the follow button's visibility to the new typing state.
       If user is already scrolled up when the stream starts, the
       button will appear. */
    updateFollowButton();

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
          scrollToBottomIfFollowing();
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
      /* Respect follow state: if the user scrolled up to read, don't
         yank them down when the stream finishes. */
      scrollToBottomIfFollowing();
      /* Hide the follow button; the stream is done. */
      updateFollowButton();
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

  /* ── Scroll-follow helpers ─────────────────────────────────────
     scrollToBottomForced: user-initiated moments (sending a message,
       receiving an error). Always snaps to bottom and re-engages the
       follow-stick.
     scrollToBottomIfFollowing: streaming chunks and idle updates.
       Only scrolls when the user is at the bottom; if they scrolled
       up to read, this is a no-op so they stay put. */
  function scrollToBottomForced() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
    isFollowing = true;
    updateFollowButton();
  }

  function scrollToBottomIfFollowing() {
    if (isFollowing) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  /* Backwards-compat alias used by older call sites that always
     want to scroll (user actions). Forwards to the forced variant. */
  function scrollToBottom() {
    scrollToBottomForced();
  }

  function debouncedScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollToBottomIfFollowing();
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
