(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const galleries = [...document.querySelectorAll('[data-stage-gallery]')];
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const scene = gallery.closest('.c-scene');
    const frames = [...gallery.querySelectorAll('.c-assembly__frame')];
    if (!scene || frames.length < 2) return;

    const interval = Number(gallery.dataset.stageInterval || 900);
    const hold = Number(gallery.dataset.stageHold || 2600);
    const startDelay = Number(gallery.dataset.stageStartDelay || 650);

    let timer;
    let current = 0;
    let ready = false;

    function show(index) {
      current = index;
      frames.forEach((frame, i) => frame.classList.toggle('is-current', i === index));
    }

    function stop() {
      window.clearTimeout(timer);
      timer = undefined;
    }

    function advance() {
      if (current === frames.length - 1) {
        timer = window.setTimeout(() => {
          show(0);
          timer = window.setTimeout(advance, startDelay);
        }, hold);
        return;
      }

      timer = window.setTimeout(() => {
        show(current + 1);
        advance();
      }, interval);
    }

    function sync() {
      stop();

      if (reducedMotion.matches) {
        show(frames.length - 1);
        return;
      }

      if (ready && scene.classList.contains('is-active') && !document.hidden) {
        show(0);
        timer = window.setTimeout(advance, startDelay);
      }
    }

    new MutationObserver(sync).observe(scene, {
      attributes: true,
      attributeFilter: ['class']
    });

    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);

    Promise.all(frames.map((frame) => frame.decode().catch(() => {}))).then(() => {
      ready = true;
      sync();
    });

    sync();
  });
})();