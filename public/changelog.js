(() => {
  const changelog = document.querySelector("[data-changelog]");
  if (!changelog) return;

  const entries = [...changelog.querySelectorAll(".updates-list > li")];
  const pageSizeSelect = changelog.querySelector("[data-page-size]");
  const previousButton = changelog.querySelector("[data-page-previous]");
  const nextButton = changelog.querySelector("[data-page-next]");
  const pageStatus = changelog.querySelector("[data-page-status]");
  let currentPage = 1;

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

  pageSizeSelect.addEventListener("change", () => {
    currentPage = 1;
    renderPage();
  });

  previousButton.addEventListener("click", () => {
    currentPage -= 1;
    renderPage();
  });

  nextButton.addEventListener("click", () => {
    currentPage += 1;
    renderPage();
  });

  renderPage();
})();
