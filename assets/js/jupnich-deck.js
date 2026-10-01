(() => {
  const scenes = [...document.querySelectorAll('.j-scene')];
  const stepper = document.querySelector('.j-stepper');
  if (!scenes.length || !stepper) return;

  const prev = stepper.querySelector('.j-stepper__prev');
  const next = stepper.querySelector('.j-stepper__next');
  const count = stepper.querySelector('.j-stepper__count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const indexForHash = (hash) => scenes.findIndex((scene) => scene.id === hash.slice(1) || (hash.length > 1 && scene.querySelector(`[id="${CSS.escape(hash.slice(1))}"]`)));
  let current = Math.max(0, indexForHash(location.hash));

  function syncVideo(video, active) {
    if (!active) {
      video.pause();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const play = video.play();
    if (play && typeof play.catch === 'function') play.catch(() => { video.controls = true; });
  }

  function show(index, updateUrl = true) {
    current = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, i) => {
      const active = i === current;
      scene.classList.toggle('is-active', active);
      scene.inert = !active;
      scene.setAttribute('aria-hidden', String(!active));
      scene.querySelectorAll('video').forEach((video) => syncVideo(video, active));
      if (active) scene.querySelectorAll('.j-scene__pocket,.j-pocket').forEach((pocket) => {
        pocket.scrollTop = 0;
        pocket.scrollLeft = 0;
      });
    });
    prev.disabled = current === 0;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    document.documentElement.classList.toggle('j-last', current === scenes.length - 1);
    if (updateUrl) history.replaceState(null, '', `#${scenes[current].id}`);
  }

  show(current, false);
  stepper.hidden = false;
  document.documentElement.classList.add('j-deck');
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const index = indexForHash(link.getAttribute('href'));
      if (index < 0) return;
      event.preventDefault();
      show(index);
      if (link.classList.contains('skip-link')) scenes[index].querySelector('.j-scene__pocket')?.focus();
    });
  });

  window.addEventListener('hashchange', () => {
    const index = indexForHash(location.hash);
    if (index >= 0 && index !== current) show(index, false);
  });

  reducedMotion.addEventListener('change', () => show(current, false));
  document.addEventListener('visibilitychange', () => {
    scenes[current]?.querySelectorAll('video').forEach((video) => {
      if (document.hidden) video.pause();
      else syncVideo(video, true);
    });
  });

  // Wheel, touch and page keys stay inside a content pocket; only controls change scenes.
  window.addEventListener('wheel', (event) => {
    const header = event.target.closest?.('.zeni-shell__inner');
    if (header && header.scrollWidth > header.clientWidth) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta) { header.scrollLeft += delta; event.preventDefault(); }
      return;
    }
    const pocket = event.target.closest?.('.j-pocket,.j-scene__pocket');
    if (pocket) {
      const delta = event.deltaY;
      const canMove = delta > 0 ? pocket.scrollTop < pocket.scrollHeight - pocket.clientHeight - 1 : pocket.scrollTop > 1;
      if (canMove) return;
      const outer = pocket.closest('.j-pocket') ? pocket.closest('.j-scene__pocket') : null;
      if (outer) {
        const outerCanMove = delta > 0 ? outer.scrollTop < outer.scrollHeight - outer.clientHeight - 1 : outer.scrollTop > 1;
        if (outerCanMove) { outer.scrollTop += delta; event.preventDefault(); return; }
      }
    }
    event.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (event) => {
    if (!event.target.closest?.('.zeni-shell__inner,.j-pocket,.j-scene__pocket')) event.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (event.target.closest?.('.j-pocket,.j-scene__pocket') || event.target.closest?.('button,a,input,textarea,select') || event.target.isContentEditable) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) event.preventDefault();
  });
})();