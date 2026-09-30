(() => {
  const playerPath = "/webdeck-player/";
  const playerName = "WebDeckPlayer";
  const playerFeatures = "popup,width=640,height=340,resizable=no,scrollbars=no";
  const playerStateKey = "webDeckPlayerOpen";
  const sidebarClickAudio = document.getElementById("click-audio")
    ?? new Audio("/sounds/click.mp3");
  const channel = "BroadcastChannel" in window
    ? new BroadcastChannel("webDeckPlayer")
    : null;

  if (/\/webdeck-player\/(?:index\.html)?$/.test(window.location.pathname)) {
    localStorage.setItem(playerStateKey, "open");
    window.addEventListener("pagehide", () => {
      localStorage.removeItem(playerStateKey);
    }, { once: true });
    channel?.addEventListener("message", (event) => {
      if (event.data === "focus") window.focus();
    });
    return;
  }

  window.openWebDeckPlayer = () => {
    if (localStorage.getItem(playerStateKey) === "open") {
      channel?.postMessage("focus");
      return true;
    }

    const playerWindow = window.open(playerPath, playerName, playerFeatures);
    if (!playerWindow) return false;

    return true;
  };

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest(".side1 a")) return;

    sidebarClickAudio.currentTime = 0;
    sidebarClickAudio.play().catch(() => {});
  });

  document.addEventListener("click", (event) => {
    const launcher = event.target.closest("[data-open-webdeck]");
    if (launcher && window.openWebDeckPlayer()) event.preventDefault();
  });

  if (window.location.pathname.endsWith("/home.html")) {
    window.openWebDeckPlayer();
  }
})();