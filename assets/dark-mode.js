/* Dark mode – runs synchronously in <head> to prevent FOWT */
(function() {
  var stored = localStorage.getItem('theme');
  var theme;
  if (stored === 'dark' || stored === 'light') {
    /* Saved preference always wins */
    theme = stored;
  } else {
    /* No saved preference → default to dark for first-time visitors */
    theme = 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
})();

/* Toggle – after DOM ready */
document.addEventListener('DOMContentLoaded', function() {
  var toggles = document.querySelectorAll('.theme-toggle');
  /* Reflect theme state for assistive tech (WCAG 4.1.2): pressed = dark mode */
  function syncPressed(isDark) {
    toggles.forEach(function(btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }
  syncPressed(document.documentElement.getAttribute('data-theme') === 'dark');
  toggles.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      syncPressed(next === 'dark');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#121212' : '#ffffff');
      /* Notify canvas code to rebuild gradients */
      window.dispatchEvent(new CustomEvent('theme-changed'));
    });
  });
});
