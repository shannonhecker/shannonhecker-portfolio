/* View Transition lifecycle registry.
 *
 * Cross-document view transitions can keep the outgoing document in
 * memory briefly. If rAF loops / window listeners aren't cancelled
 * before the transition commits, they keep running against the stale
 * document — stacking handlers over time and burning battery.
 *
 * Usage from per-page scripts:
 *   window.__portfolio.register(function () { cancelAnimationFrame(raf); });
 *   window.__portfolio.register(function () { window.removeEventListener('scroll', fn); });
 *
 * Cleanups run on `pagehide` (which fires before the VT commits and
 * also covers bfcache eviction). Failures are isolated so one broken
 * cleanup can't block the others. */
(function () {
  var cleanups = [];
  window.__portfolio = window.__portfolio || {
    register: function (fn) {
      if (typeof fn === 'function') cleanups.push(fn);
    }
  };
  window.addEventListener('pagehide', function () {
    var pending = cleanups.splice(0);
    for (var i = 0; i < pending.length; i++) {
      try { pending[i](); } catch (e) { /* swallow */ }
    }
  });
})();
