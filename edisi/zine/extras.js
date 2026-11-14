(() => {
  const page = document.documentElement;
  const lamp = document.querySelector("#lamp-toggle");

  lamp.hidden = false;
  lamp.addEventListener("click", () => {
    const night = page.dataset.lamp !== "night";
    page.dataset.lamp = night ? "night" : "day";
    lamp.setAttribute("aria-pressed", String(night));
  });

  const music = document.querySelector("#zine-audio");
  const sound = document.querySelector("#music-toggle");
  const errorLink = document.querySelector("#music-error");
  let starting = false;

  function updateSound() {
    page.dataset.music = music.muted ? "muted" : "playing";
    sound.hidden = false;
    sound.textContent = music.muted ? "Nyalakan suara" : "Bisukan";
    sound.setAttribute("aria-pressed", String(music.muted));
  }

  async function startOnClick(event) {
    if (!event.isTrusted || starting) return;
    starting = true;
    try {
      await music.play();
      document.removeEventListener("click", startOnClick, true);
    } catch (error) {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") showAudioLink();
    } finally {
      starting = false;
    }
  }

  function showAudioLink() {
    document.removeEventListener("click", startOnClick, true);
    errorLink.hidden = false;
    sound.hidden = true;
  }

  document.addEventListener("click", startOnClick, true);
  music.addEventListener("playing", updateSound);
  music.addEventListener("error", showAudioLink);
  sound.addEventListener("click", () => {
    music.muted = !music.muted;
    updateSound();
  });
})();
