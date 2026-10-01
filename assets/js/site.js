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

    setText("[data-price='crafta-everyday']", pricing.crafta && pricing.crafta.everyday);
    setText("[data-price='crafta-enhanced']", pricing.crafta && pricing.crafta.enhanced);
    setText("[data-price='crafta-deep']", pricing.crafta && pricing.crafta.deep);
    setText("[data-note='crafta-pricing']", pricing.crafta && pricing.crafta.note);

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

    const film = Array.from(entrance.querySelectorAll(".bloom-entrance__idle"));
    const sink = byId("bloom-sink");
    const trigger = byId("bloom-trigger");
    const skip = byId("bloom-skip");
    const page = document.querySelector(".page-shell");
    const pageVideos = page ? Array.from(page.querySelectorAll("video")) : [];
    const activePageVideos = () => page ? Array.from(page.querySelectorAll(".journey-scene.is-deck-active video, .plane-section.is-deck-active video")) : [];
    const previousOverflow = document.body.style.overflow;
    let active = false;
    let revealing = false;
    let currentSegment = Math.max(0, film.findIndex((video) => video.classList.contains("is-current")));
    let fallbackTimer;
    let idleRecoveryTimer;

    document.body.style.overflow = "hidden";
    if (page) page.inert = true;
    pageVideos.forEach((video) => video.pause());

    film.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
    });

    function playIdleSegment() {
      if (active || entrance.hidden || !film.length) return;
      const current = film[currentSegment] || film[0];
      if (!current) return;
      if (!current.classList.contains("is-current")) {
        film.forEach((video) => video.classList.remove("is-current"));
        current.classList.add("is-current");
      }
      const playback = current.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          // A later visibility/user-gesture recovery attempt will retry.
        });
      }
    }

    function recoverIdlePlayback() {
      if (active || entrance.hidden) return;
      const current = film[currentSegment] || film[0];
      if (!current) return;
      if (current.paused && !current.ended) playIdleSegment();
    }

    // Start the actual film explicitly instead of relying on browser autoplay policy.
    playIdleSegment();
    window.setTimeout(() => {
      if (!active && film.length > 1) film[(currentSegment + 1) % film.length].preload = "auto";
    }, 4000);
    idleRecoveryTimer = window.setInterval(recoverIdlePlayback, 1800);
    window.addEventListener("pageshow", recoverIdlePlayback);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) recoverIdlePlayback();
    });
    entrance.addEventListener("pointerdown", recoverIdlePlayback, { passive: true });

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
      clearInterval(idleRecoveryTimer);
      film.forEach((video) => video.pause());
      sink.pause();
      document.documentElement.classList.remove("bloom-enabled");
      entrance.hidden = true;
      document.body.style.overflow = previousOverflow;
      if (page) page.inert = false;
      if (!prefersReducedMotion) activePageVideos().forEach((video) => {
        video.preload = "auto";
        video.play().catch(() => {});
      });
      document.querySelector(".zeni-shell__brand")?.focus({ preventScroll: true });
    }

    function startSink() {
      if (active) return;
      active = true;
      clearInterval(idleRecoveryTimer);
      trigger.disabled = true;
      entrance.classList.add("is-entering");
      // Keep the current film frame visible until the sink can actually play.
      // No black veil, alignment seek, or ten-second wait after a click.
      film.forEach((video) => video.pause());
      fallbackTimer = setTimeout(enter, 4500);
      sink.playbackRate = 4;
      sink.addEventListener("playing", () => {
        if (entrance.hidden) { sink.pause(); return; }
        entrance.classList.add("is-sinking");
      }, { once: true });
      sink.play().catch(enter);
    }

    trigger.addEventListener("click", startSink);
    skip.addEventListener("click", enter);
    sink.addEventListener("timeupdate", () => {
      if (active && !revealing && sink.currentTime >= (Number.isFinite(sink.duration) ? sink.duration - 1.4 : 8.8)) {
        revealing = true;
        if (!prefersReducedMotion) activePageVideos().forEach((video) => {
          video.preload = "auto";
          video.play().catch(() => {});
        });
        entrance.classList.add("is-revealing");
      }
    });
    sink.addEventListener("ended", enter);
    sink.addEventListener("error", () => { if (active) enter(); });
  }

  hydrateConfig();
  createSignalField();
  setupCursorGlow();
  setupTiltCards();
  setupMediaFallbacks();
  setupReveal();
  setupBloomEntrance();
})();
