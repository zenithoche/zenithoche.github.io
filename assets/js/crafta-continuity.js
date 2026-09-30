(() => {
  const scene = document.querySelector('#continuity');
  const stage = scene?.querySelector('.c-continuity__stage');
  const portraits = [...(scene?.querySelectorAll('[data-continuity-portrait]') || [])];
  if (!scene || !stage || portraits.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [];
  let cycleToken = 0;

  const later = (fn, delay, token) => {
    const id = window.setTimeout(() => {
      if (token === cycleToken) fn();
    }, delay);
    timers.push(id);
  };

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  };

  const selectPortrait = (index) => {
    portraits.forEach((portrait, i) => {
      portrait.classList.toggle('is-current', i === index);
      if (i !== index) {
        portrait.style.removeProperty('transition');
        portrait.style.removeProperty('transform');
        portrait.style.removeProperty('opacity');
      }
    });
  };

  const resetVisual = () => {
    stage.classList.remove('is-eye-dive', 'is-tunnel', 'is-returning');
    portraits.forEach((portrait) => {
      portrait.style.removeProperty('transition');
      portrait.style.removeProperty('transform');
      portrait.style.removeProperty('opacity');
    });
    selectPortrait(0);
  };

  const stop = () => {
    cycleToken += 1;
    clearTimers();
  };

  const run = () => {
    stop();
    resetVisual();

    if (
      reducedMotion.matches ||
      document.hidden ||
      !scene.classList.contains('is-active')
    ) return;

    const token = cycleToken;

    // Hold the exact final frame from the assembly panel first, then cycle
    // through the alternate companion imagery before returning to that frame.
    later(() => selectPortrait(1), 2200, token);
    later(() => selectPortrait(2), 4050, token);
    later(() => selectPortrait(0), 5900, token);

    // Push through the eye.
    later(() => stage.classList.add('is-eye-dive'), 7350, token);
    later(() => stage.classList.add('is-tunnel'), 8750, token);

    // Re-enter through the same eye and settle precisely on the source frame.
    later(() => {
      stage.classList.remove('is-eye-dive');
      selectPortrait(0);

      const home = portraits[0];
      home.style.transition = 'none';
      home.style.transform = 'scale(8.2)';
      home.style.opacity = '0';

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token !== cycleToken) return;
        stage.classList.add('is-returning');
        stage.classList.remove('is-tunnel');
        home.style.transition =
          'transform 1.75s cubic-bezier(.16,.76,.13,1), opacity .58s ease';
        home.style.transform = 'scale(1.035)';
        home.style.opacity = '1';
      }));
    }, 10100, token);

    later(() => {
      resetVisual();
      run();
    }, 12650, token);
  };

  const sync = () => {
    stop();
    resetVisual();
    if (
      !reducedMotion.matches &&
      !document.hidden &&
      scene.classList.contains('is-active')
    ) run();
  };

  new MutationObserver(sync).observe(scene, {
    attributes: true,
    attributeFilter: ['class']
  });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);

  Promise.all(portraits.map((portrait) => portrait.decode().catch(() => {})))
    .then(sync);
  sync();
})();
