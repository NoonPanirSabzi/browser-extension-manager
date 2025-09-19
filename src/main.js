const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
  ExtensionsContainer: document.getElementById("extentions-container"),
};
let activeFilterTab = document.querySelector(".filter-tab--selected");
let appData = null;

function showFilteredData(data) {
  let HTML = "";
  data.forEach((extension) => {
    const name = extension.name;
    const logo = extension.logo;
    const description = extension.description;
    const isActive = extension.isActive;
    HTML += `
<article class="ex-card">
  <div class="ex-card__info">
    <img
      src="${logo}"
      alt="${name} logo"
      class="ex-card__img"
    />
    <div class="flex-clmn">
      <h2 class="text-preset-2 ex-card__name">${name}</h2>
      <p class="text-preset-5 ex-card__description">
        ${description}
      </p>
    </div>
  </div>
  <div class="ex-card__actions">
    <button type="button" class="ex-card-remove-btn text-preset-6">
      Remove
    </button>
    <label class="toggle-switch">
      <input type="checkbox"${isActive ? "checked" : ""} />
      <span class="slider"></span>
    </label>
  </div>
</article>
    `;
  });
  elements.ExtensionsContainer.innerHTML = HTML;
}

function handleData() {
  switch (activeFilterTab.id) {
    case "filter-all":
      showFilteredData(appData.filter((extension) => !extension.isRemoved));
      break;
    case "filter-active":
      showFilteredData(appData.filter((extension) => extension.isActive));
      break;
    case "filter-inactive":
      showFilteredData(appData.filter((extension) => !extension.isActive));
      break;
    case "filter-removed":
      showFilteredData(appData.filter((extension) => extension.isRemoved));
      break;
  }
}

fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    appData = data;
    handleData();
  });

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
      handleData();
    }
  });
});
