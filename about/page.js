(() => {
  const page = document.documentElement;
  const portrait = document.querySelector(".portrait");
  const still = portrait.getAttribute("src");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function updateMotion() {
    page.dataset.motion = reducedMotion.matches ? "off" : "on";
    portrait.src = reducedMotion.matches ? still : portrait.dataset.gif;
  }

  reducedMotion.addEventListener("change", updateMotion);
  updateMotion();

  const music = document.querySelector("#about-music");
  let starting = false;

  async function startMusic(event) {
    if (!event.isTrusted || starting) return;
    starting = true;
    try {
      await music.play();
      document.removeEventListener("click", startMusic, true);
    } catch {
      // Try again on the next gesture if playback was blocked.
    } finally {
      starting = false;
    }
  }

  document.addEventListener("click", startMusic, true);
})();
