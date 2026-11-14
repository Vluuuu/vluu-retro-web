const desktop = document.querySelector(".desktop");
const smallScreen = matchMedia("(max-width: 690px)");
const windows = [...desktop.querySelectorAll(".window")];
const taskButtons = [...document.querySelectorAll(".tasks button[data-open]")];
let depth = 4;

function raise(window) {
  for (const item of windows) item.classList.toggle("active-window", item === window);
  for (const task of taskButtons) {
    task.setAttribute("aria-pressed", String(task.dataset.open === window.id));
  }
  window.style.zIndex = ++depth;
  if (depth < 990) return;
  windows.sort((first, second) =>
    (Number(first.style.zIndex) || 0) - (Number(second.style.zIndex) || 0));
  depth = 3;
  for (const item of windows) item.style.zIndex = ++depth;
}

document.addEventListener("click", event => {
  const open = event.target.closest("[data-open]");
  if (open) {
    const window = document.getElementById(open.dataset.open);
    window.hidden = false;
    raise(window);
    window.focus({ preventScroll: !smallScreen.matches });
    const menu = open.closest(".start-menu");
    if (menu) menu.open = false;
    return;
  }
  const close = event.target.closest("[data-close]");
  if (close) {
    const window = close.closest(".window");
    window.hidden = true;
    const next = windows.filter(item => !item.hidden).sort((a, b) =>
      Number(getComputedStyle(b).zIndex) - Number(getComputedStyle(a).zIndex))[0];
    if (next) raise(next);
    else {
      for (const task of taskButtons) {
        task.setAttribute("aria-pressed", "false");
      }
    }
    desktop.querySelector(`.icons [data-open="${window.id}"]`).focus();
  }
});

for (const window of windows) {
  window.addEventListener("focusin", () => raise(window));
  window.addEventListener("pointerdown", event => {
    raise(window);
    const bar = event.target.closest(".titlebar");
    if (!bar || event.target.closest("button") || event.button !== 0 || smallScreen.matches) return;
    const bounds = desktop.getBoundingClientRect();
    const box = window.getBoundingClientRect();
    const offsetX = event.clientX - box.left;
    const offsetY = event.clientY - box.top;
    bar.setPointerCapture(event.pointerId);

    function move(pointer) {
      const x = Math.max(0, Math.min(bounds.width - box.width, pointer.clientX - bounds.left - offsetX));
      const y = Math.max(0, Math.min(bounds.height - 29, pointer.clientY - bounds.top - offsetY));
      window.style.left = `${x}px`;
      window.style.top = `${y}px`;
    }
    bar.addEventListener("pointermove", move);
    bar.addEventListener("lostpointercapture", () => bar.removeEventListener("pointermove", move), { once: true });
  });
}
raise(document.querySelector("#welcome"));

const fallbackFiles = document.querySelector(".file-list");
const explorer = document.querySelector(".explorer");
const fileIcons = explorer.querySelector(".file-icons");
const filePreview = explorer.querySelector(".file-preview");
const toolbar = document.querySelector(".explorer-toolbar");
const views = [...toolbar.querySelectorAll("[data-view]")];
const artwork = ["gobi", "kalarya", "pisgo", "karaga", "jedain", "lock"];
const files = [...fallbackFiles.querySelectorAll("details")].map((file, index) => {
  const name = file.querySelector("summary").textContent;
  const description = file.querySelector("p").textContent;
  const button = document.createElement("button");
  const icon = document.createElement("img");
  icon.src = index === 0 ? "../assets/folder-icon.png" : "../assets/paper-icon.png";
  icon.alt = "";
  icon.width = 27;
  icon.height = 27;
  const label = document.createElement("span");
  label.textContent = name;
  button.type = "button";
  button.append(icon, label);
  fileIcons.append(button);
  button.addEventListener("click", () => selectFile(index));
  return { name, description, button };
});
const explorerStatus = document.querySelector(".explorer-status");
const selectedFile = document.querySelector("#selected-file");

function selectFile(index) {
  const file = files[index];
  for (const item of files) item.button.setAttribute("aria-pressed", String(item === file));
  const thumb = document.createElement("img");
  thumb.src = `../assets/clip-${artwork[index]}.png`;
  thumb.alt = "";
  thumb.width = 58;
  thumb.height = 43;
  const name = document.createElement("strong");
  name.textContent = file.name;
  const description = document.createElement("p");
  description.textContent = file.description;
  filePreview.replaceChildren(thumb, name, description);
  selectedFile.textContent = file.name;
}

for (const button of views) {
  button.addEventListener("click", () => {
    explorer.dataset.view = button.dataset.view;
    for (const item of views) item.setAttribute("aria-pressed", String(item === button));
  });
}
selectFile(0);
fallbackFiles.hidden = true;
toolbar.hidden = false;
explorer.hidden = false;
explorerStatus.hidden = false;

const wallpaper = document.querySelector("#wallpaper-switch");
wallpaper.hidden = false;
wallpaper.addEventListener("click", () => {
  const usePattern = desktop.classList.toggle("wallpaper-pattern");
  wallpaper.setAttribute("aria-pressed", String(usePattern));
});

const clock = document.querySelector("#desk-clock");
const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
function updateClock() {
  clock.textContent = time.format(new Date()).replace(".", ":");
}
updateClock();
setInterval(updateClock, 1000);
