const form = document.querySelector("#guest-form");
const list = document.querySelector("#guest-notes");
const status = document.querySelector("#guest-status");
const key = "vluu-zine-guestbook";
let notes = [];
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (Array.isArray(saved)) {
    notes = saved.filter(note => typeof note?.name === "string" && typeof note?.message === "string").slice(0, 20);
  }
} catch {
  // Start with an empty book if saved notes are unavailable.
}

function displayNotes() {
  list.replaceChildren();
  for (const note of notes) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const message = document.createElement("p");
    name.textContent = note.name;
    message.textContent = note.message;
    item.append(name, message);
    list.append(item);
  }
}

form.hidden = false;
displayNotes();
form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name").trim();
  const message = data.get("message").trim();
  if (!name || !message) {
    status.textContent = "Tulis nama dan pesan dulu.";
    return;
  }
  notes = [{ name, message }, ...notes].slice(0, 20);
  try {
    localStorage.setItem(key, JSON.stringify(notes));
    status.textContent = "Pesan disimpan di browser ini.";
  } catch {
    status.textContent = "Pesan tampil untuk kunjungan ini.";
  }
  displayNotes();
  form.reset();
});

const badgeRows = [...document.querySelectorAll(".badge-row")];
const badgePointer = matchMedia("(hover: hover) and (pointer: fine)");
const badgeMotion = document.documentElement;
let badgeTimer;

function updateBadgeMotion() {
  clearInterval(badgeTimer);
  if (badgeMotion.dataset.motion !== "on" || !badgePointer.matches || document.hidden) return;

  badgeTimer = setInterval(() => {
    for (const row of badgeRows) {
      if (row.matches(":hover, :focus-within")) continue;

      const end = row.scrollWidth - row.clientWidth;
      if (end <= 0) continue;

      const direction = row.dir === "rtl" ? -1 : 1;
      const offset = Math.abs(row.scrollLeft);
      row.scrollLeft = direction * (offset >= end - 1 ? 0 : offset + 1);
    }
  }, 38);
}

new MutationObserver(updateBadgeMotion).observe(badgeMotion, { attributeFilter: ["data-motion"] });
badgePointer.addEventListener("change", updateBadgeMotion);
document.addEventListener("visibilitychange", updateBadgeMotion);
setTimeout(updateBadgeMotion, 800);

const lamp = document.querySelector("#lamp-toggle");
lamp.hidden = false;
lamp.addEventListener("click", () => {
  const night = badgeMotion.dataset.lamp !== "night";
  badgeMotion.dataset.lamp = night ? "night" : "day";
  lamp.setAttribute("aria-pressed", String(night));
});

const music = document.querySelector("#zine-audio");
const musicControls = document.querySelector(".music-controls");
const musicToggle = document.querySelector("#music-toggle");
const musicVolume = document.querySelector("#music-volume");
const musicError = document.querySelector("#music-error");

music.volume = Number(musicVolume.value);
music.hidden = true;
musicControls.hidden = false;

function updateMusic() {
  const playing = !music.paused;
  badgeMotion.dataset.music = playing ? "playing" : "paused";
  musicToggle.textContent = playing ? "Ⅱ Jeda" : "▶ Putar";
}

musicToggle.addEventListener("click", async () => {
  if (!music.paused) {
    music.pause();
    return;
  }
  musicError.hidden = true;
  try {
    await music.play();
  } catch (error) {
    if (error.name !== "AbortError") musicError.hidden = false;
  }
});

musicVolume.addEventListener("input", () => { music.volume = Number(musicVolume.value); });
music.addEventListener("play", updateMusic);
music.addEventListener("pause", updateMusic);
music.addEventListener("error", () => {
  musicError.hidden = false;
  updateMusic();
});
