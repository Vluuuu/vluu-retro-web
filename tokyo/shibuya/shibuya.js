const lights = document.querySelector("#sign-lights");
const photo = document.querySelector("#foto-shibuya");
lights.hidden = false;
lights.addEventListener("click", () => {
  const on = lights.getAttribute("aria-pressed") !== "true";
  lights.setAttribute("aria-pressed", String(on));
  photo.dataset.light = on ? "on" : "off";
  lights.textContent = on ? "Redupkan foto" : "Terangkan foto";
});
lights.textContent = "Redupkan foto";
