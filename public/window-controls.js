(() => {
  window.initWindowControls = () => {
    const windows = document.querySelectorAll(".box, article");

    windows.forEach((windowElement) => {
      const heading = windowElement.querySelector(".subheaders, h1, h2, h3, h4");
      if (!heading || heading.classList.contains("window-heading")) return;

      windowElement.classList.add("site-window");
      heading.classList.add("window-heading");
      heading.setAttribute("aria-label", heading.textContent.trim());

      const controls = document.createElement("span");
      controls.className = "window-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Window controls for ${heading.textContent.trim()}`);
      controls.innerHTML = [
        '<button type="button" data-window-action="minimize" aria-label="Minimize" title="Minimize">-</button>',
        '<button type="button" data-window-action="maximize" aria-label="Maximize" title="Maximize">+</button>',
        '<button type="button" data-window-action="close" aria-label="Close" title="Close">x</button>'
      ].join("");
      heading.append(controls);

      controls.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-window-action]");
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.windowAction;
        if (action === "minimize") {
          const minimized = windowElement.classList.toggle("is-minimized");
          button.setAttribute("aria-label", minimized ? "Restore" : "Minimize");
          button.title = minimized ? "Restore" : "Minimize";
          button.setAttribute("aria-expanded", String(!minimized));
        } else if (action === "maximize") {
          const maximized = windowElement.classList.toggle("is-maximized");
          if (maximized) windowElement.classList.remove("is-minimized");
          button.setAttribute("aria-pressed", String(maximized));
        } else if (action === "close") {
          windowElement.classList.add("is-closed");
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initWindowControls);
  } else {
    window.initWindowControls();
  }
})();
