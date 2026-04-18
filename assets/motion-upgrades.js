/**
 * Motion upgrades for the featured-work layer.
 *
 * 1. 3D tilt on every .pcard-article (cursor-tracking, 4.5deg, spring-back).
 * 2. CSS-keyframes marquee on .bento--scroll. At init, this script:
 *      - Wraps existing cards in a .bento-track flex container
 *      - Clones the full set for a seamless infinite loop
 *    The track animation is defined in CSS (pure keyframes, GPU-composited).
 *    Pauses on hover via CSS :hover. Reduced-motion respected in CSS.
 *
 * Uses Motion One (window.Motion) for tilt tweens when available, with a
 * CSS transition fallback. No external state, no rAF drift.
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

  /* ── Set up the marquee track (wrap + clone) ───────────────────── */
  var bento = document.querySelector('.bento--scroll');
  if (bento && !bento.querySelector('.bento-track')) {
    var track = document.createElement('div');
    track.className = 'bento-track';

    /* Move all existing cards into the track */
    while (bento.firstChild) {
      track.appendChild(bento.firstChild);
    }

    /* Clone the set once for the seamless loop second half */
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
  }

  /* ── 3D tilt on work cards (both originals and duplicates) ─────── */
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
})();
