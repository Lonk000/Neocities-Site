(() => {
  // If we are inside the standalone webdeck-player or on the boot splash screen, don't mount the dock
  const path = window.location.pathname;
  if (
    /\/webdeck-player\/(?:index\.html)?$/.test(path) ||
    path === "/" ||
    /\/index\.html$/.test(path)
  ) {
    window.openWebDeckPlayer = () => true;
    window.toggleWebDeckPlayer = () => true;
    return;
  }

  const DOCK_STORAGE_KEY = "webdeck_dock_state";
  const clickAudio = document.getElementById("click-audio") ?? new Audio("/sounds/click.mp3");
  const clickTargetSelector = "a[href], button, input:not([type='hidden']), select, textarea, summary, [role='button'], [data-window-action]";

  // Global sound synthesizer functions for hover and click
  window.playHoverSound = window.playHoverSound || function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  window.playClickSound = window.playClickSound || function() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  // Delegated sound effect for interactive clicks
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest(clickTargetSelector)) return;
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }, true);

  // =========================================
  // WEBDECK DOCK CONTROLLER
  // =========================================
  function ensureDock() {
    let dock = document.getElementById("webdeck-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "webdeck-dock";
      dock.className = "webdeck-dock dock-hidden-init";
      dock.setAttribute("aria-label", "WebDeck Audio Player");
      dock.innerHTML = `
        <div class="webdeck-dock-header" id="webdeck-dock-toggle" role="button" tabindex="0" aria-expanded="true" title="Click to minimize player">
          <div class="dock-title-group">
            <span class="dock-indicator" aria-hidden="true"></span>
            <span class="dock-label">AUDIO DECK</span>
            <span class="dock-sublabel">// ALTIMIT OS</span>
          </div>
          <div class="dock-actions">
            <button type="button" class="dock-btn-toggle" id="webdeck-dock-btn" aria-label="Minimize Player" title="Minimize">−</button>
          </div>
        </div>
        <div class="webdeck-dock-body">
          <iframe id="webdeck-iframe" src="/webdeck-player/index.html?v=altimit" title="WebDeck Player" allow="autoplay"></iframe>
        </div>
      `;
      document.body.appendChild(dock);
    }
    return dock;
  }

  function setDockState(dock, isMinimized) {
    const toggleBtn = dock.querySelector("#webdeck-dock-btn");
    const header = dock.querySelector(".webdeck-dock-header");
    const isMobile = window.matchMedia && window.matchMedia("(max-width: 750px)").matches;

    dock.classList.remove("dock-hidden-init");

    if (isMinimized) {
      dock.classList.remove("dock-expanded");
      dock.classList.add("dock-minimized");
      if (toggleBtn) {
        toggleBtn.textContent = isMobile ? "◀" : "▲";
        toggleBtn.setAttribute("aria-label", "Restore Player");
        toggleBtn.title = "Restore";
      }
      header?.setAttribute("aria-expanded", "false");
      header?.setAttribute("title", "Click to restore player");
      try {
        localStorage.setItem(DOCK_STORAGE_KEY, "minimized");
      } catch (e) {}
    } else {
      dock.classList.remove("dock-minimized");
      dock.classList.add("dock-expanded");
      if (toggleBtn) {
        toggleBtn.textContent = isMobile ? "▶" : "−";
        toggleBtn.setAttribute("aria-label", "Minimize Player");
        toggleBtn.title = "Minimize";
      }
      header?.setAttribute("aria-expanded", "true");
      header?.setAttribute("title", "Click to minimize player");
      try {
        localStorage.setItem(DOCK_STORAGE_KEY, "expanded");
      } catch (e) {}
    }
  }

  function tagInitialHeadStyles() {
    document.head.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
      const href = node.getAttribute("href") || "";
      if (!href.includes("site-overrides.css") && !href.includes("window-controls.css") && !href.includes("fonts.googleapis.com")) {
        node.setAttribute("data-pjax-head", "true");
      }
    });
  }

  function initDock() {
    tagInitialHeadStyles();
    const dock = ensureDock();
    let savedState = null;
    try {
      savedState = localStorage.getItem(DOCK_STORAGE_KEY);
    } catch (e) {}

    if (savedState === "minimized") {
      setDockState(dock, true);
    } else {
      // Smooth slide-up transition from off-screen
      dock.classList.add("dock-hidden-init");
      setTimeout(() => {
        setDockState(dock, false);
      }, 300);
    }
  }

  window.openWebDeckPlayer = () => {
    const dock = ensureDock();
    setDockState(dock, false);
    return true;
  };

  window.minimizeWebDeckPlayer = () => {
    const dock = ensureDock();
    setDockState(dock, true);
    return true;
  };

  window.toggleWebDeckPlayer = () => {
    const dock = ensureDock();
    const isMinimized = dock.classList.contains("dock-minimized");
    setDockState(dock, !isMinimized);
    return true;
  };

  // Delegated click handler for Dock header, minimize button, and sidebar launcher
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    // Check if clicked the minimize button or dock header bar
    const dockToggle = target.closest("#webdeck-dock-btn, #webdeck-dock-toggle");
    if (dockToggle) {
      event.preventDefault();
      event.stopPropagation();
      window.toggleWebDeckPlayer();
      return;
    }

    // Check if clicked the sidebar [data-open-webdeck] launcher
    const launcher = target.closest("[data-open-webdeck]");
    if (launcher) {
      event.preventDefault();
      event.stopPropagation();
      window.toggleWebDeckPlayer();
      return;
    }
  });

  // Keyboard support (Enter/Space on dock header)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("#webdeck-dock-toggle, #webdeck-dock-btn")) {
        event.preventDefault();
        window.toggleWebDeckPlayer();
      }
    }
  });

  // Responsive button icon update on screen resize/orientation change
  window.addEventListener("resize", () => {
    const dock = document.getElementById("webdeck-dock");
    if (dock) {
      const isMinimized = dock.classList.contains("dock-minimized");
      const toggleBtn = dock.querySelector("#webdeck-dock-btn");
      const isMobile = window.matchMedia && window.matchMedia("(max-width: 750px)").matches;
      if (toggleBtn) {
        if (isMinimized) {
          toggleBtn.textContent = isMobile ? "◀" : "▲";
        } else {
          toggleBtn.textContent = isMobile ? "▶" : "−";
        }
      }
    }
  });

  // =========================================
  // PJAX PERSISTENT NAVIGATION
  // =========================================
  function isInternalPjaxLink(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;
    if (anchor.getAttribute("href")?.startsWith("#")) return false;
    if (anchor.hasAttribute("data-no-pjax") || anchor.closest("[data-no-pjax]")) return false;
    if (anchor.hasAttribute("data-open-webdeck") || anchor.closest("[data-open-webdeck]")) return false;
    if (anchor.classList.contains("reboot-control")) return false;

    try {
      const url = new URL(anchor.href, window.location.href);

      // Support local testing and Neocities production domain
      const isSameHost = url.host === window.location.host;
      const isProdOnLocal = (url.host === "lonkofhyrool.neocities.org");
      if (!isSameHost && !isProdOnLocal) return false;

      let pathname = url.pathname;
      if (pathname === "" || pathname === "/") pathname = "/home.html";

      // Allow full page reload for the bootloader sequence or standalone player
      if (pathname.endsWith("/index.html") || pathname.includes("/webdeck-player/")) {
        return false;
      }

      // Ignore asset downloads
      if (/\.(pdf|zip|mp3|ogg|png|jpg|jpeg|gif|svg|xml|txt)$/i.test(pathname)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  async function pjaxNavigate(targetHref, push = true) {
    const url = new URL(targetHref, window.location.href);
    if (url.host === "lonkofhyrool.neocities.org" && window.location.host !== "lonkofhyrool.neocities.org") {
      url.protocol = window.location.protocol;
      url.host = window.location.host;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return;
    }

    const currentContent = document.getElementById("main-content")
      || document.getElementById("container")
      || document.querySelector(".container");

    if (currentContent) {
      currentContent.classList.add("pjax-loading");
    }

    try {
      let response = await fetch(url.href);
      if (!response.ok && !url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) {
        const fallbackUrl = new URL(url.pathname + ".html" + url.search, url.origin);
        const fallbackRes = await fetch(fallbackUrl.href);
        if (fallbackRes.ok) {
          response = fallbackRes;
          url.pathname = fallbackUrl.pathname;
        }
      }

      if (!response.ok) throw new Error("HTTP " + response.status);

      const htmlText = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, "text/html");

      const newContent = newDoc.getElementById("main-content")
        || newDoc.getElementById("container")
        || newDoc.querySelector(".container");

      if (!newContent) {
        window.location.href = url.href;
        return;
      }

      // 1. Swap content
      if (currentContent) {
        currentContent.replaceWith(newContent);
      } else {
        document.body.prepend(newContent);
      }

      // 2. Update page title and body attributes
      if (newDoc.title) {
        document.title = newDoc.title;
      }
      document.body.className = newDoc.body.className;
      if (newDoc.body.getAttribute("style")) {
        document.body.setAttribute("style", newDoc.body.getAttribute("style"));
      } else {
        document.body.removeAttribute("style");
      }

      // 3. Update page-specific styles from newDoc head with resolved absolute URLs
      document.querySelectorAll("[data-pjax-head]").forEach((el) => el.remove());

      newDoc.head.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
        const rawHref = node.getAttribute("href");
        if (rawHref && (rawHref.includes("site-overrides.css") || rawHref.includes("window-controls.css") || rawHref.includes("fonts.googleapis.com"))) {
          return;
        }
        const clone = node.cloneNode(true);
        clone.setAttribute("data-pjax-head", "true");
        if (rawHref) {
          clone.setAttribute("href", new URL(rawHref, url.href).href);
        }
        document.head.appendChild(clone);
      });

      // 4. Update history URL
      if (push) {
        window.history.pushState({ pjax: true, href: url.href }, "", url.href);
      }

      // 5. Scroll to top
      window.scrollTo(0, 0);

      // 6. Re-run page controls & scripts
      if (typeof window.initWindowControls === "function") {
        window.initWindowControls();
      }
      if (typeof window.initChangelog === "function") {
        window.initChangelog();
      }

      // Background audio: if the new page has #bg-audio (e.g. home.html), play it
      const bgAudio = document.getElementById("bg-audio");
      if (bgAudio) {
        bgAudio.play().catch(() => {});
      }

      window.dispatchEvent(new CustomEvent("pjax:navigated", { detail: { url: url.href } }));
    } catch (err) {
      console.warn("PJAX navigation failed, falling back to full load:", err);
      window.location.href = url.href;
    }
  }

  // Intercept all internal navigation link clicks
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || !isInternalPjaxLink(anchor)) return;

    event.preventDefault();
    pjaxNavigate(anchor.href);
  });

  // Handle browser Back / Forward buttons
  window.addEventListener("popstate", () => {
    pjaxNavigate(window.location.href, false);
  });

  // Mount and slide-up dock when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDock);
  } else {
    initDock();
  }
})();