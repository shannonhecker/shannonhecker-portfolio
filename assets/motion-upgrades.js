/**
 * Motion upgrades for the featured-work layer.
 *
 * 1. 3D tilt on .pcard-article (cursor-tracking, 4.5deg max, spring-back).
 * 2. Auto-drift marquee on .bento--scroll (right-to-left, ~60s loop).
 *    Pauses on hover/focus, resumes 600ms after mouse leaves.
 *    Manual scroll (wheel, arrows, touch) pauses for 2s.
 * 3. Seamless infinite loop via runtime-cloned cards + scrollLeft wrap.
 *
 * Uses Motion One (window.Motion) for tilt tweens when available, with
 * a CSS transition fallback. Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Motion One optional */
  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

  /* ── 3D tilt on every work card (homepage + work.html) ─────────── */
  if (!REDUCED) {
    var MAX_TILT = 4.5; // degrees
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

  /* ── Auto-drift horizontal marquee (homepage featured work) ───── */
  var bento = document.querySelector('.bento--scroll');
  if (!bento) return;

  /* Clone originals once to form the seamless-loop second half.
     Duplicates are aria-hidden so screen readers only see the real set. */
  var originals = Array.prototype.slice.call(bento.querySelectorAll('.bc-4'));
  originals.forEach(function (el) {
    var dup = el.cloneNode(true);
    dup.setAttribute('aria-hidden', 'true');
    dup.classList.add('bc-4--dup');
    /* Also remove any focusable children from the a11y tree within duplicates */
    dup.querySelectorAll('a, button').forEach(function (node) {
      node.setAttribute('tabindex', '-1');
    });
    bento.appendChild(dup);
  });

  /* Reduced motion: set up manual scroll only, no drift */
  if (REDUCED) return;

  var DURATION_MS = 60000;     // ~60s for full loop
  var IDLE_AFTER_MANUAL_MS = 2000;  // resume 2s after manual scroll
  var RESUME_AFTER_HOVER_MS = 600;  // resume 600ms after mouseleave

  var halfWidth = 0;
  function measure() {
    halfWidth = bento.scrollWidth / 2;
  }
  measure();
  window.addEventListener('resize', measure, { passive: true });

  var pxPerMs = halfWidth / DURATION_MS;
  function recalcSpeed() { pxPerMs = halfWidth / DURATION_MS; }
  window.addEventListener('resize', recalcSpeed, { passive: true });

  var paused = false;
  var resumeTimer = null;
  var manualTimer = null;
  var lastTs = 0;
  var rafId = null;

  function tick(now) {
    if (lastTs === 0) lastTs = now;
    var dt = now - lastTs;
    lastTs = now;

    if (!paused && dt < 200 /* ignore big gaps e.g. tab resume */) {
      bento.scrollLeft += pxPerMs * dt;
      if (bento.scrollLeft >= halfWidth) {
        bento.scrollLeft -= halfWidth;
      }
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  function pauseNow() {
    paused = true;
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
  }
  function resumeAfter(ms) {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { paused = false; lastTs = 0; }, ms);
  }

  /* Hover: pause immediately, resume after brief idle */
  bento.addEventListener('mouseenter', pauseNow);
  bento.addEventListener('mouseleave', function () { resumeAfter(RESUME_AFTER_HOVER_MS); });

  /* Keyboard focus inside row: pause while focused */
  bento.addEventListener('focusin',  pauseNow);
  bento.addEventListener('focusout', function () { resumeAfter(RESUME_AFTER_HOVER_MS); });

  /* Touch: pause on interaction, longer idle before resume */
  bento.addEventListener('touchstart', pauseNow, { passive: true });
  bento.addEventListener('touchend',   function () { resumeAfter(IDLE_AFTER_MANUAL_MS); });

  /* Manual scroll (wheel, drag, programmatic): pause for a beat */
  bento.addEventListener('wheel', function (e) {
    if (e.deltaY === 0) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    bento.scrollLeft += e.deltaY;
    pauseNow();
    if (manualTimer) clearTimeout(manualTimer);
    manualTimer = setTimeout(function () { paused = false; lastTs = 0; }, IDLE_AFTER_MANUAL_MS);
  }, { passive: false });

  /* Keyboard arrows */
  bento.addEventListener('keydown', function (e) {
    var step = (bento.querySelector('.bc-4') || {}).offsetWidth || 300;
    step += 20; // gap
    if (e.key === 'ArrowRight') { e.preventDefault(); bento.scrollLeft += step; pauseNow(); resumeAfter(IDLE_AFTER_MANUAL_MS); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); bento.scrollLeft -= step; pauseNow(); resumeAfter(IDLE_AFTER_MANUAL_MS); }
  });
})();
