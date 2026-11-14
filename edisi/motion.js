const preference = matchMedia("(prefers-reduced-motion: reduce)");
const toggle = document.querySelector("[data-motion-toggle]");
const pictures = [...document.querySelectorAll("img[data-gif]")].map(image => ({
  image,
  still: image.getAttribute("src"),
}));
const root = document.documentElement;

let choice;
try {
  choice = localStorage.getItem("vluu-editions-motion");
} catch {
  // The system preference is still available.
}

function updatePictures() {
  for (const { image, still } of pictures) {
    const canPlay = !image.hasAttribute("data-signal-gif") || root.dataset.signal === "playing";
    const source = root.dataset.motion === "on" && canPlay ? image.dataset.gif : still;
    if (source !== image.getAttribute("src")) image.setAttribute("src", source);
  }
}

function update() {
  const playing = choice === "on" || (choice !== "off" && !preference.matches);
  root.dataset.motion = playing ? "on" : "off";
  updatePictures();
  toggle.setAttribute("aria-pressed", String(playing));
  toggle.textContent = playing ? "Jeda animasi" : "Putar animasi";
}

toggle.hidden = false;
toggle.addEventListener("click", () => {
  choice = root.dataset.motion === "on" ? "off" : "on";
  try {
    localStorage.setItem("vluu-editions-motion", choice);
  } catch {
    // Keep the choice for the current page.
  }
  update();
});
preference.addEventListener("change", update);
if (pictures.some(({ image }) => image.hasAttribute("data-signal-gif"))) {
  new MutationObserver(updatePictures).observe(root, { attributeFilter: ["data-signal"] });
}
update();
