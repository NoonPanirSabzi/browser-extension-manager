const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
  ExtensionsContainer: document.getElementById("extentions-container"),
  removedTabNotif: document.querySelector("#filter-removed span"),
};
let activeFilterTab = document.querySelector(".filter-tab--selected");
let appData = null;
let cardTemplate = null;
let removedCardTemplate = null;
let removedCount = 0;

function updateRemovedTabNotif(change) {
  if (
    (removedCount === 0 && change === "increment") ||
    (removedCount === 1 && change === "decrement")
  ) {
    elements.removedTabNotif.classList.toggle("hide");
  }
  if (change === "increment") {
    removedCount += 1;
    elements.removedTabNotif.innerText = removedCount;
  } else if (change === "decrement") {
    removedCount -= 1;
    elements.removedTabNotif.innerText = removedCount;
  }
}

function addInstallerHandlers() {
  const extensionNodes = document.querySelectorAll(".ex-card");
  extensionNodes.forEach((extensionNode) => {
    const nodeName = extensionNode.querySelector(".ex-card__name").innerText;
    const installBtn = extensionNode.querySelector(".ex-card-install-btn");
    const nodeIndex = appData.findIndex((elm) => elm.name === nodeName);

    installBtn.addEventListener("click", () => {
      appData[nodeIndex].isRemoved = false;
      updateRemovedTabNotif("decrement");
      extensionNode.remove();
    });
  });
}

function addOptionsHandler() {
  const extensionNodes = document.querySelectorAll(".ex-card");
  extensionNodes.forEach((extensionNode) => {
    const nodeName = extensionNode.querySelector(".ex-card__name").innerText;
    const removeBtn = extensionNode.querySelector(".ex-card-remove-btn");
    const activeBtn = extensionNode.querySelector(".toggle-switch .slider");
    const nodeIndex = appData.findIndex((elm) => elm.name === nodeName);

    removeBtn.addEventListener("click", () => {
      appData[nodeIndex].isRemoved = true;
      updateRemovedTabNotif("increment");
      extensionNode.remove();
    });
    activeBtn.addEventListener("click", () => {
      appData[nodeIndex].isActive = !appData[nodeIndex].isActive;
      if ("Active-Inactive".includes(activeFilterTab.innerText)) {
        extensionNode.remove();
      }
    });
  });
}

function showFilteredData(data) {
  let HTML = "";
  data.forEach((extension) => {
    let extensionHTML =
      activeFilterTab.id === "filter-removed"
        ? removedCardTemplate
        : cardTemplate;
    extensionHTML = extensionHTML
      .replaceAll("name-here", extension.name)
      .replaceAll("logo-here", extension.logo)
      .replaceAll("description-here", extension.description)
      .replaceAll("isActive-here", extension.isActive ? " checked" : "");
    HTML += extensionHTML;
  });
  elements.ExtensionsContainer.innerHTML = HTML;
  if (activeFilterTab.id === "filter-removed") {
    addInstallerHandlers();
  } else {
    addOptionsHandler();
  }
}

function handleData() {
  switch (activeFilterTab.id) {
    case "filter-all":
      showFilteredData(appData.filter((extension) => !extension.isRemoved));
      break;
    case "filter-active":
      showFilteredData(
        appData.filter(
          (extension) => extension.isActive && !extension.isRemoved
        )
      );
      break;
    case "filter-inactive":
      showFilteredData(
        appData.filter(
          (extension) => !extension.isActive && !extension.isRemoved
        )
      );
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
const removedTemplatePromise = fetch(
  "./assets/removed-card-template.html"
).then((r) => r.text());

Promise.all([dataPromise, templatePromise, removedTemplatePromise]).then(
  ([data, template, removedTemplate]) => {
    appData = data;
    cardTemplate = template;
    removedCardTemplate = removedTemplate;
    handleData();
  }
);

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
