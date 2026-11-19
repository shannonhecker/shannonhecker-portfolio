(function () {
  function savedTheme() {
    try {
      return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    } catch {
      return document.documentElement.dataset.theme || 'dark';
    }
  }

  function apply(theme) {
    var root = document.documentElement;
    var changed = root.dataset.theme !== theme;
    root.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(function (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#121212' : '#ffffff';
    if (changed) window.dispatchEvent(new CustomEvent('theme-changed'));
  }

  apply(savedTheme());
  document.addEventListener('DOMContentLoaded', function () {
    apply(savedTheme());
    document.querySelectorAll('.theme-toggle').forEach(function (button) {
      button.addEventListener('click', function () {
        var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        apply(next);
        try {
          localStorage.setItem('theme', next);
        } catch {
          // The current page still switches when browser storage is unavailable.
        }
      });
    });
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) apply(savedTheme());
  });
  window.addEventListener('storage', function (event) {
    if (event.key === 'theme' || event.key === null) apply(savedTheme());
  });
})();
