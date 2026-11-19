(() => {
  document.documentElement.classList.add('has-js');
  const menu = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  let scrollTop = 0;

  function setMenu(open) {
    if (open === !drawer.inert) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('o', open);
    drawer.classList.toggle('o', open);
    if (!open) menu.focus({ preventScroll: true });
    drawer.inert = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) {
      scrollTop = window.scrollY;
      document.body.style.top = '-' + scrollTop + 'px';
      document.body.classList.add('menu-open');
      drawer.querySelector('a').focus({ preventScroll: true });
    } else {
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      window.scrollTo({ top: scrollTop, behavior: 'instant' });
    }
  }

  menu.setAttribute('aria-controls', 'drawer');
  menu.addEventListener('click', () => setMenu(drawer.inert));
  drawer.addEventListener('click', event => {
    if (event.target.closest('a[href]')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (drawer.inert) return;
    if (event.key === 'Escape') setMenu(false);
    if (event.key !== 'Tab') return;
    const controls = [menu, ...drawer.querySelectorAll('a[href],button:not([disabled])')];
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

  const skip = document.querySelector('.skip-link');
  skip?.addEventListener('click', event => {
    const target = document.getElementById(skip.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
})();
