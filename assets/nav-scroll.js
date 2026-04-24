/* Shared nav-glass scroll handler. Replaces the inline
 * `window.addEventListener('scroll', () => nav.classList.toggle('s', scrollY > 40))`
 * that used to live in every page's script block. Loaded with `defer`
 * so the `#nav` element is guaranteed to exist when this runs. */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var onScroll = function () {
    nav.classList.toggle('s', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  if (window.__portfolio && typeof window.__portfolio.register === 'function') {
    window.__portfolio.register(function () {
      window.removeEventListener('scroll', onScroll);
    });
  }
  onScroll();
})();
