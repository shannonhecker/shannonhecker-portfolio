/* Dark mode – runs synchronously in <head> to prevent FOWT */
(function() {
  var stored = localStorage.getItem('theme');
  var theme;
  if (stored === 'dark' || stored === 'light') {
    theme = stored;
  } else {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
})();

/* Toggle + system-preference listener – after DOM ready */
document.addEventListener('DOMContentLoaded', function() {
  var toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#121212' : '#ffffff');
      /* Notify canvas code to rebuild gradients */
      window.dispatchEvent(new CustomEvent('theme-changed'));
    });
  });

  /* Auto-follow system preference if user hasn't manually chosen */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      var t = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t);
      window.dispatchEvent(new CustomEvent('theme-changed'));
    }
  });
});
