(function () {
  const config = window.ZENITHOCHE_CONFIG || {};
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  }

  function setHref(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach((node) => {
      node.setAttribute("href", value);
      if (value.startsWith("http")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer");
      }
    });
  }

  function hydrateConfig() {
    const links = config.links || {};
    const pricing = config.pricing || {};

    setHref("[data-link='home']", links.home);
    setHref("[data-link='products']", links.products);
    setHref("[data-link='media']", links.media);
    setHref("[data-link='pricing']", links.pricing);
    setHref("[data-link='jupnich']", links.jupnich);
    setHref("[data-link='ashiko']", links.ashiko);
    setHref("[data-link='jupnich-install']", links.jupnichInstall);
    setHref("[data-link='ashiko-install']", links.ashikoInstall);
    setHref("[data-link='jupnich-topgg']", links.jupnichTopGG);
    setHref("[data-link='ashiko-topgg']", links.ashikoTopGG);
    setHref("[data-link='jupnich-discordbotlist']", links.jupnichDiscordBotList);
    setHref("[data-link='ashiko-discordbotlist']", links.ashikoDiscordBotList);
    setHref("[data-link='jupnich-store']", links.jupnichStore);
    setHref("[data-link='ashiko-store']", links.ashikoStore);
    setHref("[data-link='support']", links.support);
    setHref("[data-link='terms']", links.terms);
    setHref("[data-link='privacy']", links.privacy);

    setText("[data-price='jupnich-free']", pricing.jupnich && pricing.jupnich.free);
    setText("[data-price='jupnich-plus']", pricing.jupnich && pricing.jupnich.plus);
    setText("[data-price='jupnich-pro']", pricing.jupnich && pricing.jupnich.pro);
    setText("[data-note='jupnich-pricing']", pricing.jupnich && pricing.jupnich.note);

    setText("[data-price='ashiko-free']", pricing.ashiko && pricing.ashiko.free);
    setText("[data-price='ashiko-plus']", pricing.ashiko && pricing.ashiko.plus);
    setText("[data-price='ashiko-pro']", pricing.ashiko && pricing.ashiko.pro);
    setText("[data-note='ashiko-pricing']", pricing.ashiko && pricing.ashiko.note);
  }

  function surfaceCrafta() {
    const nav = document.querySelector(".nav-links");
    if (nav && !nav.querySelector("[data-link='crafta']")) {
      const link = document.createElement("a");
      link.href = "/products/craftacompanion/";
      link.dataset.link = "crafta";
      link.textContent = "CraftaCompanion";
      nav.appendChild(link);
    }

    const grid = document.querySelector("#products .product-grid");
    if (grid && !grid.querySelector("[data-product='crafta']")) {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.product = "crafta";
      card.setAttribute("data-tilt", "");
      card.setAttribute("data-reveal", "");
      card.innerHTML = `
        <div>
          <h3>CraftaCompanion</h3>
          <p><span class="homepage-subhead-strong">Create a persistent AI companion through normal choices instead of prompt engineering. Shape identity, personality, boundaries, continuity, appearance, and voice while Crafta handles the machinery underneath.</span></p>
          <div class="product-tags">
            <span class="tag">Companion builder</span><span class="tag">Continuity</span><span class="tag">Craft Helper</span><span class="tag">Live prototype</span>
          </div>
          <div class="product-visual" aria-hidden="true"></div>
        </div>
        <div class="card-actions">
          <a class="button primary" href="/products/craftacompanion/">Open CraftaCompanion</a>
          <a class="button ghost" href="https://crafta.zenithoche.com/">Launch Crafta</a>
        </div>
      `;
      grid.appendChild(card);
    }

    const ctaActions = document.querySelector(".cta-panel .hero-actions");
    if (ctaActions && !ctaActions.querySelector("[data-link='crafta-cta']")) {
      const link = document.createElement("a");
      link.className = "button ghost";
      link.href = "/products/craftacompanion/";
      link.dataset.link = "crafta-cta";
      link.textContent = "View CraftaCompanion";
      ctaActions.appendChild(link);
    }
  }

  function createSignalField() {
    const field = byId("signal-field");
    if (!field || prefersReducedMotion) return;

    const count = window.innerWidth < 720 ? 18 : 42;
    for (let i = 0; i < count; i += 1) {
      const mote = document.createElement("span");
      mote.className = "signal-mote";
      mote.style.setProperty("--x", `${Math.random() * 100}%`);
      mote.style.setProperty("--y", `${Math.random() * 100}%`);
      mote.style.setProperty("--delay", `${Math.random() * 8}s`);
      mote.style.setProperty("--duration", `${7 + Math.random() * 10}s`);
      mote.style.setProperty("--scale", `${0.5 + Math.random() * 1.4}`);
      field.appendChild(mote);
    }
  }

  function setupCursorGlow() {
    const glow = byId("cursor-glow");
    if (!glow || prefersReducedMotion) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    });

    function tick() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(tick);
    }

    tick();
  }

  function setupTiltCards() {
    if (prefersReducedMotion) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
        card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function setupMediaFallbacks() {
    document.querySelectorAll("video[data-media]").forEach((video) => {
      const key = video.getAttribute("data-media");
      const src = config.media && config.media[key];
      const card = video.closest(".media-card");
      if (src) video.setAttribute("src", src);
      video.addEventListener("error", () => {
        if (card) card.classList.add("media-missing");
      });
    });

    document.querySelectorAll("img[data-media]").forEach((img) => {
      const key = img.getAttribute("data-media");
      const src = config.media && config.media[key];
      const card = img.closest(".media-card");
      if (src) img.setAttribute("src", src);
      img.addEventListener("error", () => {
        if (card) card.classList.add("media-missing");
      });
    });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  hydrateConfig();
  surfaceCrafta();
  createSignalField();
  setupCursorGlow();
  setupTiltCards();
  setupMediaFallbacks();
  setupReveal();
})();
