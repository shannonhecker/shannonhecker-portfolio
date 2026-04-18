/**
 * Motion upgrades for the featured-work layer.
 *
 * 1. 3D tilt on .pcard-article (cursor-tracking, 4.5deg max, spring-back).
 * 2. Wheel → horizontal scroll on .bento--scroll (desktop).
 * 3. Scroll-driven parallax: each card's vertical offset is a sine
 *    function of the row's horizontal scroll progress.
 *
 * Uses Motion One (window.Motion) for smooth tween easing where
 * available, falls back to CSS transitions otherwise. Respects
 * prefers-reduced-motion.
 */

(function () {
  'use strict';

  /* Abort entirely if user prefers reduced motion */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  /* Motion One is optional. Fall back to CSS transitions. */
  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

  /* ── 3D tilt on work cards ─────────────────────────────────────── */
  var MAX_TILT = 4.5; // degrees
  var tiltCards = document.querySelectorAll('.pcard-article');

  tiltCards.forEach(function (article) {
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

  /* ── Horizontal scroll row (homepage featured work) ────────────── */
  var bento = document.querySelector('.bento--scroll');
  if (!bento) return;

  var cards = bento.querySelectorAll('.pcard-article');

  /* Wheel → horizontal. Convert vertical scroll wheel to horizontal
     scrollLeft when the user's pointer is over the row. Only kicks in
     when horizontal delta is near zero (avoids double-hijacking
     trackpad horizontal swipes). */
  bento.addEventListener('wheel', function (e) {
    if (e.deltaY === 0) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    /* Only hijack if the row can actually scroll further in that direction */
    var canScrollRight = bento.scrollLeft + bento.clientWidth < bento.scrollWidth;
    var canScrollLeft  = bento.scrollLeft > 0;
    if (e.deltaY > 0 && !canScrollRight) return;
    if (e.deltaY < 0 && !canScrollLeft)  return;

    e.preventDefault();
    bento.scrollLeft += e.deltaY;
  }, { passive: false });

  /* Keyboard: ←/→ when the row is focused */
  bento.addEventListener('keydown', function (e) {
    var cardWidth = cards[0] ? cards[0].offsetWidth + 20 : 300;
    if (e.key === 'ArrowRight') { e.preventDefault(); bento.scrollLeft += cardWidth; }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); bento.scrollLeft -= cardWidth; }
  });

  /* Scroll-driven parallax. Each card gets a small vertical offset
     that follows a sine of its position in the scroll range. Creates
     a liquid wave as the row scrolls. */
  var AMPLITUDE = 6; // pixels
  var rafId = null;

  function updateParallax() {
    var max = bento.scrollWidth - bento.clientWidth;
    if (max <= 0) return;
    var progress = bento.scrollLeft / max; // 0 → 1
    cards.forEach(function (card, i) {
      var phase = progress * Math.PI * 2 + (i * 0.45);
      var y = Math.sin(phase) * AMPLITUDE;
      card.style.setProperty('--parallax-y', y.toFixed(2) + 'px');
    });
    rafId = null;
  }

  bento.addEventListener('scroll', function () {
    if (rafId) return;
    rafId = requestAnimationFrame(updateParallax);
  }, { passive: true });

  /* Run once on load so initial state isn't flat */
  updateParallax();
})();
