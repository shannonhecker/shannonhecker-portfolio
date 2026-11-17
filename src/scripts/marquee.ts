// Pause toggle for the two marquees (WCAG 2.2.2). The accessible name stays
// "Pause scrolling"; aria-pressed carries the state, so it is never announced
// as both a changed label and a changed state.
document.querySelectorAll<HTMLButtonElement>('.mq-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const paused = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(paused));
    btn.closest('.marquee')?.classList.toggle('paused', paused);
  });
});

// Print / Save as PDF: lazy images below the fold would print as empty boxes.
addEventListener('beforeprint', () => {
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
});
