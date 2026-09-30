(() => {
  const scene = document.querySelector('#plans');
  const carousel = scene?.querySelector('.c-plans__carousel');
  const cards = [...(scene?.querySelectorAll('.c-plan-card') || [])];
  const prev = scene?.querySelector('.c-plans__arrow--prev');
  const next = scene?.querySelector('.c-plans__arrow--next');
  const dots = [...(scene?.querySelectorAll('[data-plan-index]') || [])];
  if (!scene || !carousel || cards.length < 2 || !prev || !next) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 1;
  let scrollTimer;

  function cardLeft(index) {
    const card = cards[index];
    return card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
  }

  function syncUi(index) {
    active = Math.max(0, Math.min(cards.length - 1, index));
    cards.forEach((card, i) => card.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => {
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  }

  function goTo(index, behavior) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    syncUi(target);
    carousel.scrollTo({
      left: cardLeft(target),
      behavior: behavior || (reduced.matches ? 'auto' : 'smooth')
    });
  }

  function nearestCard() {
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const nextDistance = Math.abs(center - cardCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = i;
      }
    });
    return nearest;
  }

  carousel.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => syncUi(nearestCard()), 70);
  }, { passive: true });

  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(active + 1);
    }
  });

  const centerEnhanced = () => {
    if (!scene.classList.contains('is-active')) return;
    requestAnimationFrame(() => requestAnimationFrame(() => goTo(1, 'auto')));
  };

  new MutationObserver(centerEnhanced).observe(scene, {
    attributes: true,
    attributeFilter: ['class']
  });
  window.addEventListener('resize', () => goTo(active, 'auto'));
  centerEnhanced();
})();