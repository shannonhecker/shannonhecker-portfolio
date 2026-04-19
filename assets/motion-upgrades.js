/**
 * Motion upgrades for the featured-work layer.
 *
 * 1. 3D tilt on every .pcard-article (cursor-tracking, 4.5deg, spring-back).
 *
 * That is it. The homepage used to also run a CSS-keyframes marquee and
 * a scroll-triggered drift-active switch. Both were removed when the
 * featured-work layout changed from an auto-drift row to a static bento
 * grid with a 2×2 hero card. Hover and click interactions now carry
 * all the motion the section needs.
 *
 * Uses Motion One (window.Motion) for tween easing when available,
 * with a CSS transition fallback. Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var animate = (window.Motion && window.Motion.animate) ? window.Motion.animate : null;

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
})();
