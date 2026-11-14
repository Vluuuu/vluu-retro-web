(() => {
  const canvas = document.querySelector("#night");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    canvas.hidden = true;
    return;
  }

  const layerNames = ["mountains", "shore", "village", "palms", "monas", "gwk"];
  const layers = layerNames.map((name) => {
    const image = new Image();
    image.src = `./art/${name}.png`;
    return image;
  });
  const root = document.documentElement;
  const compactView = matchMedia("(max-width: 1130px)");
  const twinkles = ["#283039", "#47525a", "#8ba6aa", "#d9c89b"];
  const stars = Array.from({ length: 90 }, (_, index) => ({
    x: ((index * 127 + 19) % 881) / 881,
    y: ((index * 89 + 47) % 509) / 509,
    phase: index * 1.51,
    depth: index % 3,
  }));

  let lastDraw = 0;
  let frame = 0;
  let time = 0;
  let pointer = 0;

  function tile(image, width, offset, y, scale) {
    if (!image.naturalWidth) return;
    const stride = Math.floor(image.naturalWidth * scale);
    const height = Math.floor(image.naturalHeight * scale);
    const start = -((Math.floor(offset) % stride + stride) % stride);
    for (let x = start; x < width; x += stride) {
      ctx.drawImage(image, x, Math.floor(y), stride, height);
    }
  }

  function place(image, center, baseline, scale) {
    const width = Math.floor(image.naturalWidth * scale);
    const height = Math.floor(image.naturalHeight * scale);
    ctx.drawImage(image, Math.floor(center - width / 2), Math.floor(baseline - height), width, height);
  }

  function draw() {
    const { width, height } = canvas;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
      const drift = time * (2 + star.depth * 3);
      const x = Math.floor(((star.x * width - drift) % width + width) % width);
      const y = Math.floor(height * (.26 + star.y * .52) + pointer * star.depth);
      const glow = Math.floor((Math.sin(time * 2.1 + star.phase) + 1) * 1.95);
      ctx.fillStyle = twinkles[glow];
      ctx.fillRect(x, y, 1, 1);
      if (star.depth === 2 && glow > 1) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 2, 1, 5);
      }
    }

    const compact = compactView.matches;
    const scale = compact ? .44 : Math.max(.76, Math.min(1.18, height / 445));
    const scroll = compact ? 0 : Math.min(window.scrollY / 20, height * .12);
    tile(layers[0], width, 95 + time * 4, height * .57 - scroll * .35 + pointer, scale);
    tile(layers[1], width, 46 + time * 8, height * .7 - scroll * .5 + pointer * 2, scale);
    tile(layers[2], width, -32 + time * 15, height * .59 - scroll * .45 + pointer * 3, scale);
    const gutter = (width - 420) / 2;
    const landmarkScale = compact ? .45 : Math.min(1.1, gutter / 77);
    const sway = Math.sin(time * .55) * Math.min(gutter * .06, 6);
    const baseline = compact ? height - 3 : height * .84 - scroll * .23 + pointer * 2;
    place(layers[4], compact ? width * .26 : gutter / 2 + sway, baseline, landmarkScale);
    place(layers[5], compact ? width * .74 : width - gutter / 2 - sway, baseline, landmarkScale);
    tile(layers[3], width, 137 + time * 24, height * .84 - scroll * .2 + pointer * 4, scale);

    for (let i = 0; i < 22; i++) {
      const drift = ((i * 97 + time * (7 + i % 4)) % width + width) % width;
      const x = Math.floor(drift);
      const y = Math.floor(height * (.72 + (i * 19 % 25) / 100) + 3 * Math.sin(time * .8 + i));
      const glow = Math.sin(time * 2 + i * 1.9);
      if (glow > .05) {
        ctx.fillStyle = glow > .78 ? "#e7bd6f" : "#817650";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(box.width / 2));
    canvas.height = Math.max(1, Math.round(box.height / 2));
    ctx.imageSmoothingEnabled = false;
    draw();
  }

  function animate(now) {
    if (now - lastDraw >= 32) {
      time += Math.min((now - lastDraw) / 1000, .1);
      lastDraw = now;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    if (root.dataset.motion === "on" && !document.hidden) {
      lastDraw = performance.now();
      frame = requestAnimationFrame(animate);
    } else {
      draw();
    }
  }

  // Keep the CSS landscape visible until all art layers are available.
  Promise.all(layers.map((image) => image.decode())).then(() => {
    canvas.hidden = false;
    resize();
    updateMotion();
    new MutationObserver(updateMotion).observe(root, { attributeFilter: ["data-motion"] });
    addEventListener("resize", resize);
    addEventListener("scroll", () => {
      if (root.dataset.motion === "on") draw();
    }, { passive: true });
    addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse" && root.dataset.motion === "on") {
        pointer = (event.clientY / window.innerHeight - .5) * 5;
      }
    }, { passive: true });
    document.addEventListener("visibilitychange", updateMotion);
  }).catch(() => {
    // The still landscape remains available if any art layer fails to load.
  });
})();
