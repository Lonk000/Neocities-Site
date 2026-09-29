(() => {
  const playerPath = "/webdeck-player/";
  const playerName = "WebDeckPlayer";
  const playerFeatures = "popup,width=600,height=250,resizable=no,scrollbars=no";
  const playerStateKey = "webDeckPlayerOpen";
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
    const launcher = event.target.closest("[data-open-webdeck]");
    if (launcher && window.openWebDeckPlayer()) event.preventDefault();
  });

  if (window.location.pathname.endsWith("/home.html")) {
    window.openWebDeckPlayer();
  }
})();