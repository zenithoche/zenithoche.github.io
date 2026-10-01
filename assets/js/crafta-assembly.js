(() => {
  const galleries = [...document.querySelectorAll('[data-stage-gallery]')];
  if (!galleries.length) return;

  const loadFrame = async (frame) => {
    frame.loading = 'eager';
    if (!frame.getAttribute('src') && frame.dataset.src) {
      frame.setAttribute('src', frame.dataset.src);
    }
    if (!frame.getAttribute('src')) return;
    try {
      if (frame.decode) {
        await Promise.race([
          frame.decode(),
          new Promise((resolve) => window.setTimeout(resolve, 8000))
        ]);
      }
    } catch (_) {}
  };

  galleries.forEach((gallery) => {
    const scene = gallery.closest('.c-scene');
    const frames = [...gallery.querySelectorAll('.c-assembly__frame')];
    if (!scene || frames.length < 2) return;

    const interval = Number(gallery.dataset.stageInterval || 900);
    const hold = Number(gallery.dataset.stageHold || 2600);
    const startDelay = Number(gallery.dataset.stageStartDelay || 650);

    let timer;
    let current = 0;
    let loading;
    let ready = false;
    let run = 0;

    function show(index) {
      current = index;
      frames.forEach((frame, i) => frame.classList.toggle('is-current', i === index));
    }

    function stop() {
      window.clearTimeout(timer);
      timer = undefined;
    }

    function advance() {
      if (!scene.classList.contains('is-active') || document.hidden) {
        stop();
        return;
      }
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

    async function prepare() {
      if (ready) return;
      if (!loading) {
        loading = Promise.all(frames.map(loadFrame)).then(() => {
          ready = true;
          show(0);
        });
      }
      await loading;
    }

    async function sync() {
      const thisRun = ++run;
      stop();

      if (!scene.classList.contains('is-active') || document.hidden) return;

      await prepare();

      if (thisRun !== run || !scene.classList.contains('is-active') || document.hidden) return;

      show(0);
      timer = window.setTimeout(advance, startDelay);
    }

    new MutationObserver(sync).observe(scene, {
      attributes: true,
      attributeFilter: ['class']
    });

    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    sync();
  });
})();