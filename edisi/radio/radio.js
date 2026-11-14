const audio = document.querySelector("#broadcast");
const play = document.querySelector("#play");
const playLabel = document.querySelector("#play-label");
const stop = document.querySelector("#stop");
const status = document.querySelector("#player-status");
const frequency = document.querySelector("#frequency");
const volume = document.querySelector("#volume");
const presets = [...document.querySelectorAll(".presets button")];
const meter = document.querySelector(".meter");
const bars = [...meter.children];
const channels = {
  gobi: { name: "Sinyal Gobi", frequency: "88.7", file: "sinyal-gobi" },
  desk: { name: "Meja Kerja", frequency: "96.3", file: "meja-kerja" },
  night: { name: "Surat Malam", frequency: "105.4", file: "surat-malam" },
};

let current = channels.gobi;
let context;
let analyser;
let samples;
let meterFrame;
audio.volume = Number(volume.value);
audio.hidden = true;
document.querySelector(".custom-transport").hidden = false;
document.querySelector(".presets").hidden = false;

function updatePlayback() {
  const playing = !audio.paused;
  document.documentElement.dataset.signal = playing ? "playing" : "idle";
  playLabel.textContent = playing ? "Jeda" : "Putar";
  play.setAttribute("aria-label", playing ? "⏸ Jeda" : "▶ Putar");
  status.textContent = playing ? current.name : (audio.currentTime > 0 ? "Dijeda" : "Siap diputar");
  if (!playing && meterFrame) {
    cancelAnimationFrame(meterFrame);
    meterFrame = null;
  }
  if (playing && analyser && !meterFrame) meterFrame = requestAnimationFrame(updateMeter);
}

function updateMeter() {
  if (document.documentElement.dataset.motion === "on") {
    analyser.getByteFrequencyData(samples);
    for (const [index, bar] of bars.entries()) {
      const bin = Math.round((index + 2) ** 1.4);
      const level = Math.round(Math.max(...samples.subarray(bin, bin + 3)) / 32) / 8;
      bar.style.setProperty("--level", Math.max(.1, level));
    }
  }
  meterFrame = requestAnimationFrame(updateMeter);
}

async function start() {
  if (!context && window.AudioContext) {
    context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = .72;
    samples = new Uint8Array(analyser.frequencyBinCount);
    context.createMediaElementSource(audio).connect(analyser).connect(context.destination);
    meter.classList.add("live-meter");
  }
  try {
    if (context?.state === "suspended") await context.resume();
    await audio.play();
  } catch (error) {
    if (error.name !== "AbortError") status.textContent = "Audio gagal diputar.";
  }
}

play.addEventListener("click", () => {
  if (audio.paused) start();
  else audio.pause();
});
stop.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  updatePlayback();
});
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});
for (const button of presets) {
  button.addEventListener("click", () => {
    const channel = button.dataset.channel;
    if (channels[channel] === current) return;
    const resume = !audio.paused;
    current = channels[channel];
    document.documentElement.dataset.channel = channel;
    frequency.textContent = current.frequency;
    for (const preset of presets) preset.setAttribute("aria-pressed", String(preset === button));
    audio.src = `../assets/${current.file}.wav`;
    updatePlayback();
    if (resume) start();
  });
}
for (const event of ["play", "pause", "emptied"]) audio.addEventListener(event, updatePlayback);
