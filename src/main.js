const elements = {
  filterTabs: document.querySelectorAll(".filters-container > .filter-tab"),
  ExtensionsContainer: document.getElementById("extentions-container"),
  removedTabNotif: document.querySelector("#filter-removed span"),
  emptyPageMsg: document.getElementById("empty-page-msg"),
  tglThemeBtn: document.querySelector(".tgl-theme-btn"),
  confirmDialog: document.getElementById("confirm-dialog"),
  confirmDialogTxt: document.getElementById("confirm-dialog-txt"),
  noBtn: document.getElementById("no-btn"),
  yesBtn: document.getElementById("yes-btn"),
  root: document.documentElement,
};
let activeFilterTab = null;
let activeTabnode = null;
let appData = null;
let cardTemplate = null;
let removedCardTemplate = null;
let removedCount = null;
let action = {
  extension: null,
  do: null,
};

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
  localStorage.setItem("removedCount", removedCount);
}

function showEmptyDataMsg() {
  let msg;
  switch (activeFilterTab) {
    case "filter-all":
      msg = `There is nothing to show<br>
      You have removed <b>All</b> extensions! 🤨`;
      break;
    case "filter-active":
      msg = `No <b>Active</b> extension is available 🙄`;
      break;
    case "filter-inactive":
      msg = `Don't look! 🙈<br>
      Nothing to see here`;
      break;
    case "filter-removed":
      msg = `There isn't any <b>Removed</b> extension 🥳`;
      break;
  }
  elements.emptyPageMsg.innerHTML = msg;
  elements.emptyPageMsg.classList.remove("hide");
}

function handleRemoveExtension(extension) {
  const name = extension.querySelector(".ex-card__name").innerText;
  extension.remove();
  updateRemovedTabNotif("increment");
  if (elements.ExtensionsContainer.innerText === "") {
    showEmptyDataMsg();
  }
  const nodeIndex = appData.findIndex((elm) => elm.name === name);
  appData[nodeIndex].isRemoved = true;
  localStorage.setItem("appData", JSON.stringify(appData));
}

function handleInstallExtension(extension) {
  const name = extension.querySelector(".ex-card__name").innerText;
  const nodeIndex = appData.findIndex((elm) => elm.name === name);
  appData[nodeIndex].isRemoved = false;
  updateRemovedTabNotif("decrement");
  extension.remove();
  if (elements.ExtensionsContainer.innerText === "") {
    showEmptyDataMsg();
  }
  localStorage.setItem("appData", JSON.stringify(appData));
}

function handleToggleExtension(extension) {
  const name = extension.querySelector(".ex-card__name").innerText;
  const nodeIndex = appData.findIndex((elm) => elm.name === name);
  appData[nodeIndex].isActive = !appData[nodeIndex].isActive;

  if (
    activeFilterTab === "filter-active" ||
    activeFilterTab === "filter-inactive"
  ) {
    extension.remove();
  }

  if (elements.ExtensionsContainer.innerText === "") {
    showEmptyDataMsg();
  }
  localStorage.setItem("appData", JSON.stringify(appData));
}

function handleContainerClick(e) {
  const target = e.target;
  const extension = target.closest(".ex-card");
  const extensionName = extension?.querySelector(".ex-card__name").innerText;
  if (target.matches(".ex-card-remove-btn")) {
    elements.confirmDialogTxt.innerText = `Remove ${extensionName}? 😭`;
    elements.confirmDialog.showModal();
    action.extension = extension;
    action.do = "remove";
  } else if (target.matches(".toggle-switch .slider")) {
    handleToggleExtension(target.closest(".ex-card"));
  } else if (target.matches(".ex-card-install-btn")) {
    elements.confirmDialogTxt.innerText = `Install ${extensionName}? 😀`;
    elements.confirmDialog.showModal();
    action.extension = extension;
    action.do = "install";
  }
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
      activeFilterTab === "filter-removed" ? removedCardTemplate : cardTemplate;
    extensionHTML = extensionHTML
      .replaceAll("name-here", extension.name)
      .replaceAll("logo-here", extension.logo)
      .replaceAll("description-here", extension.description)
      .replaceAll("isActive-here", extension.isActive ? " checked" : "");
    HTML += extensionHTML;
  });
  elements.ExtensionsContainer.innerHTML = HTML;
}

function handleData() {
  switch (activeFilterTab) {
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

function updateThemePictures(theme) {
  const pictures = document.querySelectorAll("picture");
  pictures.forEach((picture) => {
    const pictureSrc = picture.querySelector("source[data-theme]");
    const darkSrc = picture
      .querySelector("source[media]")
      .getAttribute("srcset");
    const lightSrc = picture.querySelector("img").getAttribute("src");
    if (theme === "light") {
      pictureSrc.srcset = lightSrc;
    } else {
      pictureSrc.srcset = darkSrc;
    }
  });
}

function main() {
  const dataPromise = fetch("./assets/data.json").then((r) => r.json());
  const templatePromise = fetch("./assets/card-template.html").then((r) =>
    r.text()
  );
  const removedTemplatePromise = fetch(
    "./assets/removed-card-template.html"
  ).then((r) => r.text());

  Promise.all([dataPromise, templatePromise, removedTemplatePromise]).then(
    ([data, template, removedTemplate]) => {
      cardTemplate = template;
      removedCardTemplate = removedTemplate;
      // load data from localStorage if available:
      appData = JSON.parse(localStorage.getItem("appData")) ?? data;
      activeFilterTab = localStorage.getItem("activeFilterTab") ?? "filter-all";
      activeTabnode = document.getElementById(activeFilterTab);
      activeTabnode.classList.add("filter-tab--selected");
      activeTabnode.classList.remove("text-preset-3");
      activeTabnode.classList.add("text-preset-4");
      removedCount = Number(localStorage.getItem("removedCount")) ?? 0;
      if (removedCount != 0) {
        elements.removedTabNotif.classList.remove("hide");
        elements.removedTabNotif.innerText = removedCount;
      }
      handleData();
      elements.ExtensionsContainer.addEventListener(
        "click",
        handleContainerClick
      );
    }
  );

  elements.noBtn.addEventListener("click", () => {
    elements.confirmDialog.close();
  });

  elements.yesBtn.addEventListener("click", () => {
    elements.confirmDialog.close();
    if (action.do === "remove") {
      handleRemoveExtension(action.extension);
    } else {
      handleInstallExtension(action.extension);
    }
  });

  // Components Logic
  elements.filterTabs.forEach((filterTab) => {
    filterTab.addEventListener("click", () => {
      if (filterTab.id === activeFilterTab) {
        return;
      } else {
        [activeTabnode, filterTab].forEach((tab) => {
          tab.classList.toggle("filter-tab--selected");
          tab.classList.toggle("text-preset-3");
          tab.classList.toggle("text-preset-4");
        });
        activeTabnode = filterTab;
        activeFilterTab = filterTab.id;
        localStorage.setItem("activeFilterTab", filterTab.id);
        handleData();
      }
    });
  });

  /* ---------- Theme --------- */
  elements.tglThemeBtn.addEventListener("click", () => {
    const current =
      localStorage.getItem("theme") ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "light" ? "dark" : "light";

    localStorage.setItem("theme", next);
    updateThemePictures(next);
    elements.root.setAttribute("data-theme", next);
  });

  // on Load check theme
  const loadTheme = localStorage.getItem("theme");
  if (loadTheme) {
    updateThemePictures(loadTheme);
    elements.root.setAttribute("data-theme", loadTheme);
  }
}

main();
