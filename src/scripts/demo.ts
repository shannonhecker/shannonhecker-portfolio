// Winking Star tick demo, ported from the prototype. Six routines, four pet
// stages. Works with motion off; only the sparks and pops are skipped.
const demo = document.getElementById('demo');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (demo) {
  const btns = Array.from(demo.querySelectorAll<HTMLButtonElement>('.rt'));
  const stars = document.getElementById('demo-stars')!;
  const egg = document.getElementById('egg')!;
  const fill = document.getElementById('egg-fill')!;
  const pet = document.getElementById('egg-pet')!;
  const msg = document.getElementById('demo-msg')!;
  const stg = Array.from(document.querySelectorAll<HTMLElement>('#stages span'));
  // The app's own palette, as in the prototype.
  const colors = ['#f3a414', '#a9d5b2', '#ffe0d2', '#12351f', '#b9cee3'];
  const faces = ['🥚', '🐣', '🐱', '😺'];
  let lastStage = 0;

  const burst = (btn: HTMLElement) => {
    if (reduce) return;
    const r = btn.getBoundingClientRect();
    const d = demo.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const sp = document.createElement('i');
      sp.className = 'spark';
      const a = (Math.PI * 2 * i) / 10;
      sp.style.left = r.left - d.left + r.width / 2 + 'px';
      sp.style.top = r.top - d.top + r.height / 2 + 'px';
      sp.style.background = colors[i % colors.length];
      sp.style.setProperty('--dx', Math.cos(a) * 70 + 'px');
      sp.style.setProperty('--dy', Math.sin(a) * 70 + 'px');
      demo.appendChild(sp);
      setTimeout(() => sp.remove(), 850);
    }
  };

  const update = () => {
    const n = btns.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    stars.textContent = n + ' of 6 stars';
    fill.style.height = (n / 6) * 100 + '%';
    const stage = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : 3;
    pet.textContent = faces[stage];
    stg.forEach((s, i) => s.classList.toggle('on', i === stage));
    if (stage !== lastStage) {
      egg.classList.remove('grow');
      void egg.offsetWidth;
      egg.classList.add('grow');
      lastStage = stage;
    }
    msg.textContent =
      stage === 3
        ? 'Grown in this preview. In the app, stars unlock growth during the week; the weekly rollover starts a new pet.'
        : stage === 0
          ? 'This is a simplified four-stage illustration. The current app grows the pet at star thresholds across the week. Tick all six routines here to preview the idea.'
          : 6 - n + ' more to fully grow in this preview. You can correct a tick here and in the app.';
  };

  btns.forEach((b) =>
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', on ? 'false' : 'true');
      if (!on) burst(b);
      update();
    }),
  );
}
