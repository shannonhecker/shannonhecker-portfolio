(() => {
  const figure = document.querySelector('.about-avatar');
  const button = figure.querySelector('.avatar-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let loading = false;
  let visible = false;
  let paused = false;

  function sync() {
    button.hidden = reduced.matches || !figure.hasAttribute('data-ready');
    button.textContent = paused ? 'Resume motion' : 'Pause motion';
    figure.toggleAttribute('data-playing', visible && !document.hidden && !reduced.matches && !paused);
  }

  button.addEventListener('click', () => {
    paused = !paused;
    sync();
  });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
    if (!visible || loading) return;
    loading = true;
    const frames = [...figure.querySelectorAll('.avatar-poses img')];
    frames.forEach(image => { image.loading = 'eager'; });
    Promise.all(frames.map(image => image.decode()))
      .then(() => { figure.setAttribute('data-ready', ''); sync(); })
      .catch(() => { loading = false; });
  }).observe(figure);
})();
