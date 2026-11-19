document.documentElement.classList.add('has-js');
const menu = document.getElementById('burger');
const drawer = document.getElementById('drawer');
function setMenu(open) {
  menu.classList.toggle('o', open);
  menu.setAttribute('aria-expanded', String(open));
  drawer.classList.toggle('o', open);
  drawer.inert = !open;
  drawer.setAttribute('aria-hidden', String(!open));
  if (open) drawer.querySelector('a').focus();
  else menu.focus();
}
menu.setAttribute('aria-controls', 'drawer');
menu.addEventListener('click', () => setMenu(drawer.inert));
document.addEventListener('keydown', event => {
  if (drawer.inert) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key !== 'Tab') return;
  const controls = [menu, ...drawer.querySelectorAll('a,button')];
  const index = controls.indexOf(document.activeElement);
  event.preventDefault();
  controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
});
matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches && !drawer.inert) setMenu(false);
});
