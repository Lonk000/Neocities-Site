(() => {
  window.initChangelog = () => {
    const changelog = document.querySelector("[data-changelog]");
    if (!changelog) return;

    const updatesList = changelog.querySelector("[data-updates-list]");
    const pageSizeSelect = changelog.querySelector("[data-page-size]");
    const previousButton = changelog.querySelector("[data-page-previous]");
    const nextButton = changelog.querySelector("[data-page-next]");
    const pageStatus = changelog.querySelector("[data-page-status]");
    if (!updatesList || !pageSizeSelect || !previousButton || !nextButton || !pageStatus) return;

    let currentPage = 1;
    let entries = [];

    const renderPage = () => {
      const pageSize = Number(pageSizeSelect.value);
      const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
      currentPage = Math.min(currentPage, pageCount);
      const firstEntry = (currentPage - 1) * pageSize;
      const lastEntry = firstEntry + pageSize;

      entries.forEach((entry, index) => {
        entry.hidden = index < firstEntry || index >= lastEntry;
      });

      previousButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === pageCount;
      pageStatus.textContent = `Page ${currentPage} of ${pageCount} · ${entries.length} updates`;
    };

    pageSizeSelect.onchange = () => {
      currentPage = 1;
      renderPage();
    };

    previousButton.onclick = () => {
      currentPage -= 1;
      renderPage();
    };

    nextButton.onclick = () => {
      currentPage += 1;
      renderPage();
    };

    const loadEntries = async () => {
      try {
        const response = await fetch("/updates.md");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const markdown = await response.text();
        const fragment = document.createDocumentFragment();

        markdown.split(/\r?\n/).forEach((line) => {
          const match = line.match(/^\s*-\s+(\d{2})\/(\d{2})\/(\d{4}):\s+(.+?)\s*$/);
          if (!match) return;

          const [, month, day, year, description] = match;
          const item = document.createElement("li");
          const date = document.createElement("time");
          const text = document.createElement("p");

          date.dateTime = `${year}-${month}-${day}`;
          date.textContent = `${month}/${day}/${year}`;
          text.textContent = description;
          item.append(date, text);
          fragment.append(item);
        });

        entries = [...fragment.children];
        if (!entries.length) throw new Error("No valid changelog entries found");

        updatesList.replaceChildren(fragment);
        renderPage();
      } catch (error) {
        const item = document.createElement("li");
        item.textContent = "Recent updates could not be loaded.";
        updatesList.replaceChildren(item);
        previousButton.disabled = true;
        nextButton.disabled = true;
        pageStatus.textContent = "Updates unavailable";
        console.error("Unable to load Recent Updates.", error);
      }
    };

    loadEntries();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initChangelog);
  } else {
    window.initChangelog();
  }
})();
