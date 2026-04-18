/**
 * Motion upgrades
 * 1. Subtle 3D tilt on .pcard-article (4.5deg max, cursor-tracking)
 * 2. Logo marquee pause-on-hover (CSS-driven, this just handles prefers-reduced-motion)
 * Uses Motion One (loaded globally as window.Motion) for the spring animation.
 */

(function () {
  'use strict';

  /* Abort if user prefers reduced motion */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  /* Motion One is optional. Fall back to CSS transitions if unavailable. */
  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

  /* ── 3D tilt on work cards ─────────────────────────────────────── */
  var MAX_TILT = 4.5; // degrees
  var tiltCards = document.querySelectorAll('.pcard-article');

  tiltCards.forEach(function (article) {
    var pcard = article.querySelector('.pcard');
    if (!pcard) return;

    /* Enable 3D stacking on the article and the card */
    article.style.perspective = '1100px';
    pcard.style.transformStyle = 'preserve-3d';
    pcard.style.willChange = 'transform';

    var lastX = 0;
    var lastY = 0;

    article.addEventListener('mousemove', function (e) {
      var rect = article.getBoundingClientRect();
      var nx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
      var ny = (e.clientY - rect.top)  / rect.height - 0.5;
      lastX =  nx * MAX_TILT * 2;  // rotateY (horizontal movement)
      lastY = -ny * MAX_TILT * 2;  // rotateX (vertical)

      if (animate) {
        animate(pcard, {
          rotate: [null, 0],
          transform: 'perspective(1100px) rotateY(' + lastX.toFixed(2) + 'deg) rotateX(' + lastY.toFixed(2) + 'deg)'
        }, { duration: 0.18, easing: [0.22, 1, 0.36, 1] });
      } else {
        pcard.style.transform = 'perspective(1100px) rotateY(' + lastX.toFixed(2) + 'deg) rotateX(' + lastY.toFixed(2) + 'deg)';
        pcard.style.transition = 'transform 180ms cubic-bezier(.22,1,.36,1)';
      }
    }, { passive: true });

    article.addEventListener('mouseleave', function () {
      if (animate) {
        animate(pcard, {
          transform: 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
        }, { duration: 0.55, easing: [0.34, 1.56, 0.64, 1] }); // spring-ish overshoot
      } else {
        pcard.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)';
        pcard.style.transition = 'transform 550ms cubic-bezier(.34,1.56,.64,1)';
      }
    }, { passive: true });
  });

  /* ── Marquee pause on focus (for keyboard users) ───────────────── */
  var marquee = document.querySelector('.seen-marquee');
  if (marquee) {
    var track = marquee.querySelector('.seen-marquee-track');
    if (track) {
      marquee.addEventListener('focusin',  function () { track.style.animationPlayState = 'paused';  });
      marquee.addEventListener('focusout', function () { track.style.animationPlayState = 'running'; });
    }
  }
})();
