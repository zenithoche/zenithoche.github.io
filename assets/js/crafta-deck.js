(() => {
  const scenes = [...document.querySelectorAll('.c-scene')];
  const stepper = document.querySelector('.c-stepper');
  if (!scenes.length || !stepper) return;

  const prev = stepper.querySelector('.c-stepper__prev');
  const next = stepper.querySelector('.c-stepper__next');
  const count = stepper.querySelector('.c-stepper__count');
  const indexForHash = (hash) => scenes.findIndex((scene) => scene.id === hash.slice(1));
  let current = Math.max(0, indexForHash(location.hash));

  function show(index, updateUrl = true) {
    current = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, i) => {
      const active = i === current;
      scene.classList.toggle('is-active', active);
      scene.inert = !active;
      scene.setAttribute('aria-hidden', String(!active));
      if (active) scene.querySelector('.c-pocket')?.scrollTo(0, 0);
    });
    prev.disabled = current === 0;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    if (updateUrl) history.replaceState(null, '', `#${scenes[current].id}`);
  }

  show(current, false);
  document.documentElement.classList.add('c-deck');
  stepper.hidden = false;
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const index = indexForHash(link.getAttribute('href'));
      if (index < 0) return;
      event.preventDefault();
      show(index);
    });
  });
  window.addEventListener('hashchange', () => {
    const index = indexForHash(location.hash);
    if (index >= 0 && index !== current) show(index, false);
  });

  // A wheel/gesture may scroll a content pocket or the sideways gallery, never advance a panel.
  window.addEventListener('wheel', (event) => {
    const header = event.target.closest?.('.zeni-shell__inner');
    if (header && header.scrollWidth > header.clientWidth) {
      header.scrollLeft += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      event.preventDefault();
      return;
    }
    const gallery = event.target.closest?.('.c-flow');
    if (gallery && gallery.scrollWidth > gallery.clientWidth) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const canMove = delta > 0 ? gallery.scrollLeft < gallery.scrollWidth - gallery.clientWidth - 1 : gallery.scrollLeft > 1;
      if (canMove) { gallery.scrollLeft += delta; event.preventDefault(); return; }
    }
    const pocket = event.target.closest?.('.c-pocket');
    if (pocket) {
      const canMove = event.deltaY > 0 ? pocket.scrollTop < pocket.scrollHeight - pocket.clientHeight - 1 : pocket.scrollTop > 1;
      if (canMove) return;
    }
    event.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', (event) => {
    if (!event.target.closest?.('.zeni-shell__inner,.c-flow,.c-pocket')) event.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (event.target.closest?.('.c-pocket,.c-flow,button,a,input,textarea,select') || event.target.isContentEditable) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) event.preventDefault();
  });
})();
