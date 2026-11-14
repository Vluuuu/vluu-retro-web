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
