const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
  ExtensionsContainer: document.getElementById("extentions-container"),
  removedTabNotif: document.querySelector("#filter-removed span"),
  emptyPageMsg: document.getElementById("empty-page-msg"),
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

function showEmptyDataMsg() {
  const tab = activeFilterTab.innerText;
  let msg;
  switch (tab) {
    case "All":
      msg = `There is nothing to show<br>
      You have removed <b>All</b> extensions! 🤨`;
      break;
    case "Active":
      msg = `No <b>Active</b> extension is available 🙄`;
      break;
    case "Inactive":
      msg = `Don't look! 🙈<br>
      Nothing to see here`;
      break;
    case "Removed":
      msg = `There isn't any <b>Removed</b> extension 🥳`;
      break;
  }
  elements.emptyPageMsg.innerHTML = msg;
  elements.emptyPageMsg.classList.remove("hide");
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
      if (elements.ExtensionsContainer.innerText === "") {
        showEmptyDataMsg();
      }
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
      if (elements.ExtensionsContainer.innerText === "") {
        showEmptyDataMsg();
      }
    });
    activeBtn.addEventListener("click", () => {
      appData[nodeIndex].isActive = !appData[nodeIndex].isActive;
      if ("Active-Inactive".includes(activeFilterTab.innerText)) {
        extensionNode.remove();
      }
      if (elements.ExtensionsContainer.innerText === "") {
        showEmptyDataMsg();
      }
    });
  });
}

function showFilteredData(data) {
  if (data.length === 0) {
    elements.ExtensionsContainer.innerHTML = "";
    showEmptyDataMsg();
    return;
  }
  elements.emptyPageMsg.classList.add("hide");

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
