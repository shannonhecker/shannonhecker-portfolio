(() => {
  const link = document.querySelector('[data-walkthrough-for]');
  if (!link) return;
  const video = document.getElementById(link.dataset.walkthroughFor);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = link.className;
  toggle.setAttribute('aria-controls', video.id);
  let userPaused = false;

  function updateLabel() {
    toggle.textContent = video.ended ? 'Replay demo' : video.paused ? 'Play demo' : 'Pause demo';
  }

  function play() {
    video.play().catch(error => {
      if (error.name === 'NotSupportedError') toggle.replaceWith(link);
      else updateLabel();
    });
  }

  toggle.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else play();
  });
  for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updateLabel);
  video.addEventListener('error', () => toggle.replaceWith(link));
  updateLabel();
  link.replaceWith(toggle);

  if (!video.hasAttribute('data-auto-preview') || !('IntersectionObserver' in window)) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  function sync() {
    if (!visible || document.hidden) video.pause();
    else if (!motion.matches && !userPaused && video.paused) play();
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= 0.4;
    sync();
  }, {threshold: [0, 0.4]}).observe(video);
  motion.addEventListener('change', () => {
    if (motion.matches) video.pause();
    else sync();
  });
  document.addEventListener('visibilitychange', sync);
})();
