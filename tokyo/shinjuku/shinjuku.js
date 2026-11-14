const clocks = [...document.querySelectorAll("time[data-zone]")].map(element => ({
  element,
  format: new Intl.DateTimeFormat("en-GB", {
    timeZone: element.dataset.zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }),
}));

function updateClock() {
  const now = new Date();
  for (const { element, format } of clocks) {
    element.textContent = format.format(now);
    element.dateTime = now.toISOString();
  }
}

updateClock();
document.querySelector(".clock").hidden = false;
setInterval(updateClock, 1000);

const rain = document.querySelector("#rain-toggle");
rain.hidden = false;
rain.addEventListener("click", () => {
  const on = rain.getAttribute("aria-pressed") !== "true";
  rain.setAttribute("aria-pressed", String(on));
  document.documentElement.dataset.rain = on ? "on" : "off";
  rain.textContent = on ? "Hujan nyala" : "Hujan mati";
});
