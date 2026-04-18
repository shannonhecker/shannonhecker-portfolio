/**
 * Motion upgrades for the featured-work layer.
 *
 * 1. 3D tilt on every .pcard-article (cursor-tracking, 4.5deg, spring-back).
 * 2. Marquee on .bento--scroll:
 *      - Wraps existing cards in a .bento-track
 *      - Clones the full set once for seamless infinite loop
 *      - Starts PAUSED; an IntersectionObserver watches the section and
 *        adds .drift-active (animation-play-state: running) after the
 *        row is 30% visible for 2 seconds
 *      - Fires once, observer disconnects after triggering
 *
 * CSS defines the actual keyframes animation. JS only toggles the class.
 * prefers-reduced-motion handled entirely in CSS.
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

  /* ── Set up the marquee track (wrap + clone) ───────────────────── */
  var bento = document.querySelector('.bento--scroll');
  var track = null;
  if (bento && !bento.querySelector('.bento-track')) {
    track = document.createElement('div');
    track.className = 'bento-track';

    /* Move all existing cards into the track */
    while (bento.firstChild) {
      track.appendChild(bento.firstChild);
    }

    /* Clone the full set once for the seamless-loop second half */
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (el) {
      var dup = el.cloneNode(true);
      dup.setAttribute('aria-hidden', 'true');
      dup.classList.add('bc-4--dup');
      dup.querySelectorAll('a, button').forEach(function (node) {
        node.setAttribute('tabindex', '-1');
      });
      track.appendChild(dup);
    });

    bento.appendChild(track);
  } else if (bento) {
    track = bento.querySelector('.bento-track');
  }

  /* ── 3D tilt on every work card (originals and duplicates) ─────── */
  if (!REDUCED) {
    var MAX_TILT = 4.5;
    document.querySelectorAll('.pcard-article').forEach(function (article) {
      var pcard = article.querySelector('.pcard');
      if (!pcard) return;

      article.style.perspective = '1100px';
      pcard.style.transformStyle = 'preserve-3d';
      pcard.style.willChange = 'transform';

      article.addEventListener('mousemove', function (e) {
        var rect = article.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width  - 0.5;
        var ny = (e.clientY - rect.top)  / rect.height - 0.5;
        var rY =  nx * MAX_TILT * 2;
        var rX = -ny * MAX_TILT * 2;
        var t  = 'perspective(1100px) rotateY(' + rY.toFixed(2) + 'deg) rotateX(' + rX.toFixed(2) + 'deg)';

        if (animate) {
          animate(pcard, { transform: t }, { duration: 0.18, easing: [0.22, 1, 0.36, 1] });
        } else {
          pcard.style.transform = t;
          pcard.style.transition = 'transform 180ms cubic-bezier(.22,1,.36,1)';
        }
      }, { passive: true });

      article.addEventListener('mouseleave', function () {
        var t = 'perspective(1100px) rotateY(0deg) rotateX(0deg)';
        if (animate) {
          animate(pcard, { transform: t }, { duration: 0.55, easing: [0.34, 1.56, 0.64, 1] });
        } else {
          pcard.style.transform = t;
          pcard.style.transition = 'transform 550ms cubic-bezier(.34,1.56,.64,1)';
        }
      }, { passive: true });
    });
  }

  /* ── Scroll-triggered drift start (2s delay after 30% visible) ── */
  if (REDUCED || !bento || !track) return;

  /* IntersectionObserver not universally supported on very old
     browsers. If missing, just start the drift immediately. */
  if (typeof IntersectionObserver === 'undefined') {
    setTimeout(function () { track.classList.add('drift-active'); }, 2000);
    return;
  }

  var TRIGGER_THRESHOLD = 0.3;
  var DELAY_MS = 2000;
  var fired = false;
  var pendingTimer = null;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (fired) return;
      if (entry.isIntersecting && entry.intersectionRatio >= TRIGGER_THRESHOLD) {
        if (pendingTimer) return; // already waiting
        pendingTimer = setTimeout(function () {
          fired = true;
          track.classList.add('drift-active');
          io.disconnect();
        }, DELAY_MS);
      } else {
        /* User scrolled back up before the timer fired → cancel */
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          pendingTimer = null;
        }
      }
    });
  }, { threshold: [0, TRIGGER_THRESHOLD, 1] });

  io.observe(bento);
})();
