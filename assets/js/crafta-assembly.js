(() => {
  const scene = document.querySelector('#how');
  const frames = [...document.querySelectorAll('.c-assembly__frame')];
  if (!scene || frames.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
        timer = window.setTimeout(advance, 700);
      }, 2600);
      return;
    }
    timer = window.setTimeout(() => {
      show(current + 1);
      advance();
    }, 820);
  }

  function sync() {
    stop();
    if (reducedMotion.matches) {
      show(frames.length - 1);
    } else if (ready && scene.classList.contains('is-active') && !document.hidden) {
      show(0);
      timer = window.setTimeout(advance, 700);
    }
  }

  new MutationObserver(sync).observe(scene, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  Promise.all(frames.map((frame) => frame.decode().catch(() => {}))).then(() => {
    ready = true;
    sync();
  });
  sync();
})();
