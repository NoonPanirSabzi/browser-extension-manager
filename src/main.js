const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
  ExtensionsContainer: document.getElementById("extentions-container"),
};
let activeFilterTab = document.querySelector(".filter-tab--selected");
let appData = null;
let cardTemplate = null;

function showFilteredData(data) {
  let HTML = "";
  data.forEach((extension) => {
    let extensionHTML = cardTemplate
      .replaceAll("name-here", extension.name)
      .replaceAll("logo-here", extension.logo)
      .replaceAll("description-here", extension.description)
      .replaceAll("isActive-here", extension.isActive ? " checked" : "");
    HTML += extensionHTML;
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

const dataPromise = fetch("./assets/data.json").then((r) => r.json());
const templatePromise = fetch("./assets/card-template.html").then((r) =>
  r.text()
);

Promise.all([dataPromise, templatePromise]).then(([data, template]) => {
  appData = data;
  cardTemplate = template;
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
