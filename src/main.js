const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
};
let activeFilterTab = document.querySelector(".filter-tab--selected");

// Components Logic
elements.filterTabs.forEach((filterTab) => {
  filterTab.addEventListener("click", () => {
    if (filterTab === activeFilterTab) {
      return;
    } else {
      [activeFilterTab, filterTab].forEach((tab) => {
        tab.classList.toggle("filter-tab--selected");
        tab.classList.toggle("text-preset-3");
        tab.classList.toggle("text-preset-4");
      });
      activeFilterTab = filterTab;
      /* To be implemented: 
      showTabContent(activeFilterTab.id); */
    }
  });
});
