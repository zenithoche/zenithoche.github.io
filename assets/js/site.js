(function () {
  if (location.pathname === "/" && !location.hash) document.documentElement.classList.add("bloom-enabled");
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

  function createSignalField() {
    const field = byId("signal-field");
    if (!field || prefersReducedMotion) return;

    const count = window.innerWidth < 720 ? 12 : 26;
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
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
        card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateY(-2px)`;
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

  function setupBloomEntrance() {
    const entrance = byId("bloom-entrance");
    if (!entrance || !document.documentElement.classList.contains("bloom-enabled")) return;

    const idle = byId("bloom-idle");
    const film = Array.from(entrance.querySelectorAll(".bloom-entrance__idle"));
    const sink = byId("bloom-sink");
    const trigger = byId("bloom-trigger");
    const skip = byId("bloom-skip");
    const page = document.querySelector(".page-shell");
    const pageVideos = page ? Array.from(page.querySelectorAll("video[autoplay]")) : [];
    const previousOverflow = document.body.style.overflow;
    const sinkAxis = 17;
    let active = false;
    let revealing = false;
    let currentSegment = 0;
    let fallbackTimer;
    let seekTimer;

    document.body.style.overflow = "hidden";
    if (page) page.inert = true;
    pageVideos.forEach((video) => video.pause());

    // The four contiguous files contain every frame of the 201.8-second film.
    film.forEach((video, index) => {
      video.addEventListener("ended", () => {
        if (active || currentSegment !== index) return;
        const nextIndex = (index + 1) % film.length;
        const next = film[nextIndex];
        next.currentTime = 0;
        next.play().then(() => {
          if (active || entrance.hidden) { next.pause(); return; }
          video.classList.remove("is-current");
          next.classList.add("is-current");
          currentSegment = nextIndex;
          film[(nextIndex + 1) % film.length].preload = "auto";
        }).catch(() => {
          // The skip control remains available if a browser refuses playback.
        });
      });
    });

    function enter() {
      if (!document.documentElement.classList.contains("bloom-enabled")) return;
      active = true;
      clearTimeout(fallbackTimer);
      clearTimeout(seekTimer);
      film.forEach((video) => video.pause());
      sink.pause();
      document.documentElement.classList.remove("bloom-enabled");
      entrance.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (page) page.inert = false;
      pageVideos.forEach((video) => video.play().catch(() => {}));
      document.querySelector(".zeni-shell__brand")?.focus({ preventScroll: true });
    }

    function startSink() {
      if (active) return;
      active = true;
      if (prefersReducedMotion) {
        enter();
        return;
      }
      trigger.disabled = true;
      film.forEach((video) => video.pause());
      entrance.classList.add("is-aligning");
      fallbackTimer = setTimeout(enter, 16000);

      // The opening frame of the sink matches this point in the complete film.
      // Cover the seek briefly so clicks from either side of the axis feel continuous.
      setTimeout(() => {
        if (entrance.hidden) return;
        film.forEach((video) => video.classList.remove("is-current"));
        idle.classList.add("is-current");
        if (idle.readyState === 0) idle.load();
        let started = false;
        const playSink = () => {
          if (started || entrance.hidden) return;
          started = true;
          clearTimeout(seekTimer);
          sink.currentTime = 0;
          entrance.classList.add("is-sinking");
          sink.play().then(() => {
            requestAnimationFrame(() => entrance.classList.remove("is-aligning"));
          }).catch(enter);
        };
        seekTimer = setTimeout(playSink, 1800);
        const align = () => {
          if (started || entrance.hidden) return;
          idle.addEventListener("seeked", playSink, { once: true });
          try {
            idle.currentTime = sinkAxis;
            if (Math.abs(idle.currentTime - sinkAxis) < 0.05 && idle.readyState >= 2) playSink();
          } catch (_) {
            playSink();
          }
        };
        if (idle.readyState >= 1) align();
        else idle.addEventListener("loadedmetadata", align, { once: true });
      }, 260);
    }

    trigger.addEventListener("click", startSink);
    skip.addEventListener("click", enter);
    sink.addEventListener("timeupdate", () => {
      if (active && !revealing && sink.currentTime >= (Number.isFinite(sink.duration) ? sink.duration - 1.1 : 9.1)) {
        revealing = true;
        pageVideos.forEach((video) => video.play().catch(() => {}));
        entrance.classList.add("is-revealing");
      }
    });
    sink.addEventListener("ended", enter);
    sink.addEventListener("error", enter);
  }

  hydrateConfig();
  createSignalField();
  setupCursorGlow();
  setupTiltCards();
  setupMediaFallbacks();
  setupReveal();
  setupBloomEntrance();
})();
