(() => {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const caption = document.querySelector(".caption");

  const CURATED = [
    { body: "#f45b69", belly: "#ffd4c2", head: "#e23d4d", wing: "#c81d4e", tail: "#2ec4b6", crest: "#ffd166", beak: "#ff9f1c", feet: "#e76f51", eye: "#1d1a17" },
    { body: "#2ec4b6", belly: "#cbf3f0", head: "#1b9aaa", wing: "#147a8a", tail: "#ff9f1c", crest: "#f4d35e", beak: "#e76f51", feet: "#c0563a", eye: "#14222a" },
    { body: "#7b2d8e", belly: "#f4d35e", head: "#5c1a6e", wing: "#9b59b6", tail: "#f4d35e", crest: "#ef476f", beak: "#f79d65", feet: "#c97c5d", eye: "#1a1020" },
    { body: "#1d3557", belly: "#f1faee", head: "#1d3557", wing: "#457b9d", tail: "#e63946", crest: "#a8dadc", beak: "#f4a261", feet: "#bc6c39", eye: "#0b1320" },
    { body: "#ffb703", belly: "#fff3c4", head: "#fb8500", wing: "#e09f3e", tail: "#219ebc", crest: "#8ecae6", beak: "#d62828", feet: "#bc6c25", eye: "#2b1d0e" },
    { body: "#06d6a0", belly: "#f8ffe5", head: "#118ab2", wing: "#073b4c", tail: "#ef476f", crest: "#ffd166", beak: "#ffd166", feet: "#c0563a", eye: "#06222c" },
    { body: "#ef476f", belly: "#ffd6e0", head: "#d90429", wing: "#9d0208", tail: "#073b4c", crest: "#ffd166", beak: "#f4a261", feet: "#9b2226", eye: "#1b0a10" },
    { body: "#4cc9f0", belly: "#f8f9fa", head: "#4361ee", wing: "#3a0ca3", tail: "#f72585", crest: "#4cc9f0", beak: "#ff9e00", feet: "#b5651d", eye: "#12081f" },
    { body: "#fae588", belly: "#fffceb", head: "#f1c453", wing: "#f9a620", tail: "#43aa8b", crest: "#f94144", beak: "#f9844a", feet: "#bc6c25", eye: "#2a1f0a" },
    { body: "#22223b", belly: "#c9ada7", head: "#4a4e69", wing: "#22223b", tail: "#9a8c98", crest: "#f2e9e4", beak: "#c9ada7", feet: "#6d597a", eye: "#f2e9e4" },
  ];

  const SKIES = [
    { sky: "#f4efe6", ink: "#2c2a28", wire: "#2c2a28", sun: "#f2c14e", night: false, outline: "#2a2724" },
    { sky: "#e7f2f8", ink: "#24323c", wire: "#24323c", sun: "#ffe08a", night: false, outline: "#24323c" },
    { sky: "#f8ebe7", ink: "#3a2a28", wire: "#3a2a28", sun: "#ff8a65", night: false, outline: "#3a2a28" },
    { sky: "#e8f0ea", ink: "#24332a", wire: "#24332a", sun: "#ffe08a", night: false, outline: "#24332a" },
    { sky: "#ede8f4", ink: "#2d2740", wire: "#2d2740", sun: "#f7c1dd", night: false, outline: "#2d2740" },
    { sky: "#1a2332", ink: "#e8e0d4", wire: "#d9cbb3", sun: "#f0e6c8", night: true, outline: "#f4ead8" },
    { sky: "#241b2e", ink: "#f0e6dc", wire: "#e2d3c0", sun: "#f6d7a1", night: true, outline: "#f4ead8" },
  ];

  let seed = readSeed();
  let scene = null;
  let width = 0;
  let height = 0;
  let start = performance.now();
  let paintPass = "paint";
  let outlineColor = "#2a2724";

  function paint(ctx, color) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (paintPass === "halo") {
      ctx.fillStyle = outlineColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.6;
    } else {
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.lineWidth = 0;
    }
  }

  function finish(ctx) {
    ctx.fill();
    if (paintPass === "halo") ctx.stroke();
  }

  function readSeed() {
    const raw = location.hash.replace("#", "").trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n >>> 0 : (Math.random() * 0xffffffff) >>> 0;
  }

  function mulberry32(a) {
    return function rng() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const range = (rng, a, b) => a + rng() * (b - a);
  const chance = (rng, p) => rng() < p;

  function hsl(h, s, l) {
    return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
  }

  function palette(rng) {
    if (chance(rng, 0.42)) return { ...pick(rng, CURATED) };
    const h = rng() * 360;
    const accent = h + range(rng, 130, 210);
    const sat = range(rng, 58, 86);
    const light = range(rng, 40, 58);
    return {
      body: hsl(h, sat, light),
      belly: hsl(h, sat * 0.42, range(rng, 78, 90)),
      head: hsl(h + range(rng, -10, 18), Math.min(90, sat + 6), light - 6),
      wing: hsl(h - 14, sat, light - 12),
      tail: hsl(accent, sat, light + 2),
      crest: hsl(accent + 20, Math.min(90, sat + 8), light + 8),
      beak: hsl(range(rng, 22, 42), range(rng, 68, 82), range(rng, 50, 60)),
      feet: hsl(range(rng, 14, 28), range(rng, 48, 62), range(rng, 38, 48)),
      eye: hsl(h, 18, 10),
    };
  }

  function teardrop(ctx, x, y, length, width, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.35, -width, length, 0);
    ctx.quadraticCurveTo(length * 0.35, width, 0, 0);
    ctx.closePath();
    finish(ctx);
    ctx.restore();
  }

  function ellipse(ctx, x, y, rx, ry, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    finish(ctx);
  }

  function owlPalette(rng) {
    return pick(rng, [
      { body: "#c4a574", belly: "#efe3c8", head: "#b08968", wing: "#7f5539", tail: "#9c6644", crest: "#6f4518", beak: "#e9c46a", feet: "#c9a227", eye: "#1d1a17", disc: "#f3e9d7", iris: "#d4a017" },
      { body: "#8d99ae", belly: "#edf2f4", head: "#7b8799", wing: "#2b2d42", tail: "#8d99ae", crest: "#2b2d42", beak: "#e9c46a", feet: "#c9a227", eye: "#1a1a1a", disc: "#f8f7f4", iris: "#3d5a80" },
      { body: "#6d4c41", belly: "#d7ccc8", head: "#5d4037", wing: "#4e342e", tail: "#8d6e63", crest: "#3e2723", beak: "#f4a261", feet: "#e9c46a", eye: "#1b120c", disc: "#f5ebe0", iris: "#e76f51" },
      { body: "#4895ef", belly: "#eef4ff", head: "#4361ee", wing: "#3a0ca3", tail: "#4cc9f0", crest: "#f72585", beak: "#ffd166", feet: "#f4a261", eye: "#1a1020", disc: "#fff6e5", iris: "#f72585" },
    ]);
  }

  function crowPalette() {
    return {
      body: "#1c1c22",
      belly: "#2a2a32",
      head: "#141418",
      wing: "#2c2c38",
      tail: "#111114",
      crest: "#1c1c22",
      beak: "#0e0e10",
      feet: "#2a241c",
      eye: "#f0e6c8",
    };
  }

  function seagullPalette() {
    return {
      body: "#f4f1ea",
      belly: "#ffffff",
      head: "#f7f4ee",
      wing: "#9aa7b5",
      tail: "#c5ced6",
      crest: "#9aa7b5",
      beak: "#f4a261",
      feet: "#e9c46a",
      eye: "#1d1a17",
    };
  }

  function makeBird(rng, t, sizeMul) {
    const colors = palette(rng);
    const pose = chance(rng, 0.12)
      ? "sleeping"
      : chance(rng, 0.14)
        ? "singing"
        : chance(rng, 0.16)
          ? "lookingUp"
          : chance(rng, 0.18)
            ? "hunched"
            : "upright";
    const view = chance(rng, 0.34) ? "front" : "side";

    return {
      t,
      species: "generic",
      view,
      facing: view === "front" ? 1 : chance(rng, 0.5) ? 1 : -1,
      scale: range(rng, 0.95, 1.42) * sizeMul,
      colors,
      pose: view === "front" && pose === "lookingUp" ? "upright" : pose,
      bodyW: range(rng, 18, 26),
      bodyH: range(rng, 13, 19),
      lean: range(rng, -0.18, -0.04),
      headR: range(rng, 8.5, 12),
      headNudge: range(rng, 0.48, 0.62),
      beakLen: range(rng, 7, 14),
      beakH: range(rng, 2.4, 3.8),
      beakHook: chance(rng, 0.22),
      tail: pick(rng, ["fan", "fork", "stub", "long", "plume"]),
      tailLen: range(rng, 14, 26),
      crest: chance(rng, 0.38) ? pick(rng, ["mohawk", "tuft"]) : "none",
      belly: chance(rng, 0.78),
      eyeRing: chance(rng, 0.28),
      spots: chance(rng, 0.22),
      tufts: false,
      phase: rng() * Math.PI * 2,
      blinkEvery: range(rng, 2200, 5400),
      blinkOffset: rng() * 4000,
    };
  }

  function assignSpecials(rng, birds) {
    const order = birds.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const owl = birds[order[0]];
    owl.species = "owl";
    owl.view = "front";
    owl.facing = 1;
    owl.scale *= 1.18;
    owl.bodyW = range(rng, 16, 20);
    owl.bodyH = range(rng, 14, 18);
    owl.headR = range(rng, 13, 16);
    owl.pose = chance(rng, 0.12) ? "sleeping" : "upright";
    owl.tufts = chance(rng, 0.8);
    owl.colors = owlPalette(rng);

    if (birds.length < 2) return;

    const other = birds[order[1]];
    other.species = chance(rng, 0.5) ? "crow" : "seagull";
    other.view = "side";
    other.facing = chance(rng, 0.5) ? 1 : -1;
    other.crest = "none";
    other.spots = false;
    if (other.species === "crow") {
      other.colors = crowPalette();
      other.beakHook = true;
      other.beakLen = range(rng, 12, 17);
      other.beakH = range(rng, 2.6, 3.4);
      other.tail = "fan";
      other.tailLen = range(rng, 18, 26);
      other.belly = false;
      other.pose = chance(rng, 0.45) ? "hunched" : "upright";
      other.scale *= 1.08;
    } else {
      other.colors = seagullPalette();
      other.beakHook = false;
      other.beakLen = range(rng, 11, 15);
      other.beakH = range(rng, 2.2, 3);
      other.tail = "stub";
      other.belly = true;
      other.eyeRing = true;
      other.pose = "upright";
      other.bodyW = range(rng, 20, 26);
    }
  }

  function pickCount(rng, maxCount) {
    if (maxCount <= 1) return 1;
    const peak = Math.min(4, maxCount);
    const weights = Array.from({ length: maxCount }, (_, i) => {
      const n = i + 1;
      let w = 1 / (1 + Math.abs(n - peak) * 0.4);
      if (n === 1) w *= 1.2;
      return w;
    });
    let roll = rng() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < weights.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return i + 1;
    }
    return maxCount;
  }

  function estimatedWidth(bird) {
    const s = bird.scale;
    if (bird.species === "owl" || bird.view === "front") {
      return s * Math.max(bird.headR * 2.6, bird.bodyW * 1.7) + 20;
    }
    return s * (bird.bodyW * 1.8 + bird.tailLen * 0.4 + bird.beakLen * 0.45) + 20;
  }

  function placeAlongWire(rng, birds, w) {
    const margin = 40;
    const usable = Math.max(80, w - margin * 2);
    const widths = birds.map(estimatedWidth);
    const n = birds.length;

    if (n === 1) {
      const left = margin + widths[0] / 2;
      const right = w - margin - widths[0] / 2;
      birds[0].t = range(rng, left, Math.max(left + 1, right)) / w;
      return;
    }

    const minGap = 28;
    const widthSum = widths.reduce((a, b) => a + b, 0);
    const minBetweens = minGap * (n - 1);
    const leftover = Math.max(12, usable - widthSum - minBetweens);
    const raw = Array.from({ length: n + 1 }, () => Math.pow(rng(), 2.1) + 0.05);
    if (n >= 2) {
      raw[1 + Math.floor(rng() * (n - 1))] *= range(rng, 2.2, 4.5);
    }
    const rawSum = raw.reduce((a, b) => a + b, 0);
    const gaps = raw.map((v, i) => {
      const extra = leftover * (v / rawSum);
      return (i === 0 || i === n ? 0 : minGap) + extra;
    });

    let x = margin + gaps[0];
    for (let i = 0; i < n; i += 1) {
      x += widths[i] / 2;
      birds[i].t = x / w;
      x += widths[i] / 2 + gaps[i + 1];
    }
  }

  function createScene(currentSeed, w, h) {
    const rng = mulberry32(currentSeed);
    const theme = pick(rng, SKIES);
    const sizeMul = Math.min(1.2, Math.max(0.72, w / 920));
    const maxCount = Math.max(1, Math.min(8, Math.floor((w - 72) / 92)));
    const count = pickCount(rng, maxCount);
    const birds = Array.from({ length: count }, () => makeBird(rng, 0.5, sizeMul));
    assignSpecials(rng, birds);
    placeAlongWire(rng, birds, w);
    return {
      seed: currentSeed,
      theme,
      wireY: h * 0.58,
      birds,
      sun: {
        x: range(rng, w * 0.12, w * 0.88),
        y: range(rng, h * 0.12, h * 0.28),
        r: range(rng, 18, 36),
      },
    };
  }

  function drawFoot(ctx, x, colors, kind) {
    const halo = paintPass === "halo";
    ctx.strokeStyle = halo ? outlineColor : colors.feet;
    ctx.fillStyle = halo ? outlineColor : colors.feet;
    ctx.lineWidth = halo ? 3.8 : 1.7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x, -5.4);
    ctx.lineTo(x, -1.35);
    ctx.stroke();

    if (kind === "front") {
      ctx.beginPath();
      ctx.arc(x, 0.15, 3.7, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - 1.6, 0.15, 2.5, Math.PI * 0.15, Math.PI * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 1.6, 0.15, 2.5, Math.PI * 0.05, Math.PI * 0.85);
      ctx.stroke();
      return;
    }

    ctx.beginPath();
    ctx.arc(x + 1.5, 0.15, 3.4, Math.PI * -0.05, Math.PI * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 3.1, 0.15, 2.6, Math.PI * -0.12, Math.PI * 0.72);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 1.8, 0.15, 2.7, Math.PI * 0.55, Math.PI * 1.55);
    ctx.stroke();
  }

  function drawTail(ctx, bird, bodyX, bodyY) {
    const { colors, tail, tailLen, bodyW, bodyH } = bird;
    paint(ctx, colors.tail);
    const ax = bodyX - bodyW * 0.72;
    const ay = bodyY - bodyH * 0.08;
    const back = Math.PI + 0.22;
    if (tail === "fan") {
      const n = 4;
      for (let i = 0; i < n; i += 1) {
        teardrop(ctx, ax, ay, tailLen * 0.62, 3.2, back + rangeSpread(i, n, 0.55));
      }
    } else if (tail === "fork") {
      teardrop(ctx, ax, ay, tailLen * 0.82, 2.8, back + 0.32);
      teardrop(ctx, ax, ay, tailLen * 0.82, 2.8, back - 0.18);
    } else if (tail === "long") {
      teardrop(ctx, ax, ay, tailLen * 0.95, 3.4, back);
    } else if (tail === "plume") {
      teardrop(ctx, ax, ay, tailLen * 0.78, 5, back - 0.08);
      paint(ctx, colors.crest);
      teardrop(ctx, ax, ay + 2, tailLen * 0.58, 3, back + 0.28);
    } else {
      teardrop(ctx, ax, ay, tailLen * 0.38, 4.4, back);
    }
  }

  function rangeSpread(i, n, span) {
    return -span / 2 + (n === 1 ? 0 : (i / (n - 1)) * span);
  }

  function drawCrest(ctx, bird, hx, hy) {
    if (bird.crest === "none") return;
    paint(ctx, bird.colors.crest);
    if (bird.crest === "mohawk") {
      for (let i = 0; i < 4; i += 1) {
        const a = -2.55 + i * 0.38;
        teardrop(
          ctx,
          hx + Math.cos(a) * bird.headR * 0.7,
          hy + Math.sin(a) * bird.headR * 0.7,
          bird.headR * 0.95,
          2.3,
          a,
        );
      }
    } else {
      teardrop(ctx, hx - bird.headR * 0.15, hy - bird.headR * 0.62, bird.headR * 1.15, 2.8, -2.15);
      teardrop(ctx, hx + bird.headR * 0.05, hy - bird.headR * 0.72, bird.headR * 0.95, 2.2, -1.85);
    }
  }

  function beginPerch(ctx, bird, time) {
    const blinkOn =
      bird.pose !== "sleeping" && (time + bird.blinkOffset) % bird.blinkEvery < 140;
    ctx.save();
    const flip = bird.view === "front" ? 1 : bird.facing;
    ctx.scale(flip * bird.scale, bird.scale);
    return { blinkOn, bodyX: 0, bodyY: -bird.bodyH - 5.5 };
  }

  function drawSideEye(ctx, ex, ey, bird, blinkOn) {
    if (paintPass === "halo") return;
    if (bird.eyeRing) {
      paint(ctx, bird.colors.belly);
      ellipse(ctx, ex, ey, 3.6, 3.6);
    }
    if (bird.pose === "sleeping" || blinkOn) {
      ctx.strokeStyle = bird.colors.eye;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(ex, ey, 2.1, 0.15, Math.PI - 0.15);
      ctx.stroke();
      return;
    }
    paint(ctx, bird.species === "crow" ? "#1a1a1a" : "#f7f4ef");
    ellipse(ctx, ex, ey, bird.species === "crow" ? 2.2 : 2.7, bird.species === "crow" ? 2.2 : 2.7);
    paint(ctx, bird.colors.eye);
    ellipse(ctx, ex + 0.35, ey + 0.15, bird.species === "crow" ? 1.1 : 1.45, bird.species === "crow" ? 1.1 : 1.45);
    paint(ctx, "#ffffff");
    ellipse(ctx, ex - 0.55, ey - 0.7, 0.7, 0.7);
  }

  function drawFrontEyes(ctx, hy, spacing, radius, bird, blinkOn) {
    if (paintPass === "halo") return;
    for (const side of [-1, 1]) {
      const ex = side * spacing;
      const ey = hy;
      if (bird.pose === "sleeping" || blinkOn) {
        ctx.strokeStyle = bird.colors.eye;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(ex, ey, radius * 0.7, 0.2, Math.PI - 0.2);
        ctx.stroke();
        continue;
      }
      paint(ctx, "#f7f4ef");
      ellipse(ctx, ex, ey, radius, radius);
      paint(ctx, bird.colors.eye);
      ellipse(ctx, ex, ey + 0.2, radius * 0.52, radius * 0.52);
      paint(ctx, "#ffffff");
      ellipse(ctx, ex - radius * 0.28, ey - radius * 0.32, radius * 0.22, radius * 0.22);
    }
  }

  function drawFrontBeak(ctx, hy, bird) {
    paint(ctx, bird.colors.beak);
    ctx.beginPath();
    ctx.moveTo(-2.4, hy + 3.2);
    ctx.lineTo(0, hy + 3.2 + bird.beakH * 1.6);
    ctx.lineTo(2.4, hy + 3.2);
    ctx.closePath();
    finish(ctx);
  }

  function drawSideBeak(ctx, bird, hx, hy) {
    const beakX = hx + bird.headR * 0.82;
    const beakY = hy + (bird.pose === "lookingUp" ? -2.2 : 1.4);
    paint(ctx, bird.colors.beak);
    ctx.save();
    ctx.translate(beakX, beakY);
    ctx.rotate(bird.pose === "lookingUp" ? -0.7 : bird.beakHook ? 0.28 : 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -bird.beakH);
    ctx.lineTo(bird.beakLen, bird.pose === "singing" ? -0.8 : bird.beakH * 0.2);
    ctx.lineTo(0, bird.beakH);
    ctx.closePath();
    finish(ctx);
    if (bird.pose === "singing") {
      ctx.beginPath();
      ctx.moveTo(0, bird.beakH * 0.15);
      ctx.lineTo(bird.beakLen * 0.78, bird.beakH * 1.15);
      ctx.lineTo(0, bird.beakH * 1.05);
      ctx.closePath();
      finish(ctx);
    }
    if (bird.beakHook) {
      ctx.beginPath();
      ctx.moveTo(bird.beakLen * 0.7, 0);
      ctx.quadraticCurveTo(bird.beakLen * 1.05, bird.beakH * 1.4, bird.beakLen * 0.55, bird.beakH * 1.5);
      ctx.quadraticCurveTo(bird.beakLen * 0.85, bird.beakH * 0.7, bird.beakLen * 0.55, 0);
      finish(ctx);
    }
    if (bird.species === "seagull" && paintPass !== "halo") {
      paint(ctx, "#e63946");
      ellipse(ctx, bird.beakLen * 0.72, bird.beakH * 0.15, 1.15, 1.15);
    }
    ctx.restore();
  }

  function drawSideBird(ctx, bird, time) {
    const { blinkOn, bodyX, bodyY } = beginPerch(ctx, bird, time);
    drawTail(ctx, bird, bodyX, bodyY);
    drawFoot(ctx, -5.5, bird.colors, "side");

    paint(ctx, bird.colors.body);
    ellipse(ctx, bodyX, bodyY, bird.bodyW, bird.bodyH, bird.lean);

    if (bird.belly && paintPass !== "halo") {
      paint(ctx, bird.colors.belly);
      ellipse(ctx, bodyX + 2, bodyY + bird.bodyH * 0.32, bird.bodyW * 0.58, bird.bodyH * 0.5, bird.lean + 0.05);
    }

    if (bird.spots && paintPass !== "halo") {
      paint(ctx, bird.colors.wing);
      for (let i = 0; i < 4; i += 1) {
        ellipse(ctx, bodyX - 3 + i * 3.4, bodyY - 1 + (i % 2) * 3.2, 1.6, 1.2);
      }
    }

    paint(ctx, bird.colors.wing);
    ellipse(ctx, bodyX + 1, bodyY + 1, bird.bodyW * 0.58, bird.bodyH * 0.36, 0.35);
    if (bird.species === "seagull" && paintPass !== "halo") {
      paint(ctx, "#2b2d42");
      ellipse(ctx, bodyX + bird.bodyW * 0.42, bodyY + 2, 3.2, 2.1, 0.2);
    }

    drawFoot(ctx, 4.2, bird.colors, "side");

    const hunched = bird.pose === "hunched" || bird.pose === "sleeping";
    const hx = bodyX + bird.bodyW * (bird.species === "crow" ? 0.42 : bird.headNudge);
    const hy = bodyY - bird.bodyH * (hunched ? 0.28 : 0.48) + (bird.pose === "lookingUp" ? -4 : 0);

    drawCrest(ctx, bird, hx, hy);

    paint(ctx, bird.colors.head);
    ellipse(ctx, hx, hy, bird.headR * (bird.species === "crow" ? 0.88 : 1), bird.headR * 0.96);

    drawSideBeak(ctx, bird, hx, hy);
    drawSideEye(ctx, hx + bird.headR * 0.28, hy - bird.headR * 0.12, bird, blinkOn);
    ctx.restore();
  }

  function drawFrontBird(ctx, bird, time) {
    const { blinkOn, bodyY } = beginPerch(ctx, bird, time);
    paint(ctx, bird.colors.tail);
    ellipse(ctx, 0, bodyY + bird.bodyH * 0.55, 4.5, 6.5);

    paint(ctx, bird.colors.body);
    ellipse(ctx, 0, bodyY, bird.bodyW * 0.72, bird.bodyH * 1.05);

    if (bird.belly && paintPass !== "halo") {
      paint(ctx, bird.colors.belly);
      ellipse(ctx, 0, bodyY + bird.bodyH * 0.28, bird.bodyW * 0.42, bird.bodyH * 0.55);
    }

    paint(ctx, bird.colors.wing);
    ellipse(ctx, -bird.bodyW * 0.55, bodyY + 1, bird.bodyW * 0.32, bird.bodyH * 0.55, -0.35);
    ellipse(ctx, bird.bodyW * 0.55, bodyY + 1, bird.bodyW * 0.32, bird.bodyH * 0.55, 0.35);

    drawFoot(ctx, -7, bird.colors, "front");
    drawFoot(ctx, 7, bird.colors, "front");

    const hy = bodyY - bird.bodyH * 0.55;
    drawCrest(ctx, bird, 0, hy);
    paint(ctx, bird.colors.head);
    ellipse(ctx, 0, hy, bird.headR * 1.02, bird.headR * 0.98);
    drawFrontEyes(ctx, hy - 1, bird.headR * 0.38, 2.6, bird, blinkOn);
    drawFrontBeak(ctx, hy, bird);
    ctx.restore();
  }

  function drawOwl(ctx, bird, time) {
    const { blinkOn, bodyY } = beginPerch(ctx, bird, time);
    paint(ctx, bird.colors.body);
    ellipse(ctx, 0, bodyY + 6, bird.bodyW * 0.95, bird.bodyH * 1.08);
    if (paintPass !== "halo") {
      paint(ctx, bird.colors.belly);
      ellipse(ctx, 0, bodyY + 10, bird.bodyW * 0.52, bird.bodyH * 0.62);
    }

    drawFoot(ctx, -7.5, bird.colors, "front");
    drawFoot(ctx, 7.5, bird.colors, "front");

    const hy = bodyY - bird.bodyH * 0.22;
    if (bird.tufts) {
      paint(ctx, bird.colors.crest);
      teardrop(ctx, -bird.headR * 0.62, hy - bird.headR * 0.5, 13, 3.4, -2.25);
      teardrop(ctx, bird.headR * 0.62, hy - bird.headR * 0.5, 13, 3.4, -0.9);
    }

    paint(ctx, bird.colors.head);
    ellipse(ctx, 0, hy, bird.headR * 1.18, bird.headR * 1.08);
    if (paintPass !== "halo") {
      paint(ctx, bird.colors.disc);
      ellipse(ctx, 0, hy + 1.2, bird.headR * 1.02, bird.headR * 0.88);
    }

    const span = 5.6;
    const eyeR = 4.8;
    if (paintPass !== "halo") {
      for (const side of [-1, 1]) {
        if (bird.pose === "sleeping" || blinkOn) {
          ctx.strokeStyle = bird.colors.eye;
          ctx.lineWidth = 1.8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(side * span, hy, 3.2, 0.2, Math.PI - 0.2);
          ctx.stroke();
          continue;
        }
        paint(ctx, "#1a1a1a");
        ellipse(ctx, side * span, hy, eyeR + 0.5, eyeR + 0.5);
        paint(ctx, bird.colors.iris);
        ellipse(ctx, side * span, hy, eyeR - 0.35, eyeR - 0.35);
        paint(ctx, "#161616");
        ellipse(ctx, side * span, hy, 2.15, 2.15);
        paint(ctx, "#ffffff");
        ellipse(ctx, side * span - 1.3, hy - 1.5, 1, 1);
      }
    }

    paint(ctx, bird.colors.beak);
    ctx.beginPath();
    ctx.moveTo(-2.4, hy + 3.5);
    ctx.lineTo(0, hy + 12);
    ctx.lineTo(2.4, hy + 3.5);
    ctx.closePath();
    finish(ctx);
    ctx.restore();
  }

  function drawBirdShape(ctx, bird, time) {
    if (bird.species === "owl") {
      drawOwl(ctx, bird, time);
      return;
    }
    if (bird.view === "front") {
      drawFrontBird(ctx, bird, time);
      return;
    }
    drawSideBird(ctx, bird, time);
  }

  function drawBird(ctx, bird, time, outline) {
    outlineColor = outline;
    paintPass = "halo";
    drawBirdShape(ctx, bird, time);
    paintPass = "paint";
    drawBirdShape(ctx, bird, time);
  }

  function drawWire(ctx, scene) {
    ctx.strokeStyle = scene.theme.wire;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(0, scene.wireY);
    ctx.lineTo(width, scene.wireY);
    ctx.stroke();
  }

  function drawScene(time) {
    if (!scene) return;
    const { theme, birds, wireY, sun } = scene;
    ctx.fillStyle = theme.sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = theme.sun;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    ctx.fill();
    if (theme.night) {
      ctx.fillStyle = theme.sky;
      ctx.beginPath();
      ctx.arc(sun.x + sun.r * 0.38, sun.y - sun.r * 0.12, sun.r * 0.82, 0, Math.PI * 2);
      ctx.fill();
    }

    drawWire(ctx, scene);

    for (const bird of birds) {
      ctx.save();
      ctx.translate(bird.t * width, wireY);
      drawBird(ctx, bird, time, theme.outline);
      ctx.restore();
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene = createScene(seed, width, height);
    applyTheme();
  }

  function applyTheme() {
    document.body.style.background = scene.theme.sky;
    caption.style.color = scene.theme.ink;
    caption.style.mixBlendMode = scene.theme.night ? "normal" : "multiply";
  }

  function shuffle() {
    seed = (Math.random() * 0xffffffff) >>> 0;
    history.replaceState(null, "", `#${seed}`);
    scene = createScene(seed, width, height);
    applyTheme();
  }

  function loop(now) {
    drawScene(now - start);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  canvas.tabIndex = 0;
  canvas.addEventListener("click", () => {
    canvas.focus();
    shuffle();
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
      shuffle();
    }
  });
  window.addEventListener("hashchange", () => {
    seed = readSeed();
    scene = createScene(seed, width, height);
    applyTheme();
  });

  history.replaceState(null, "", `#${seed}`);
  resize();
  requestAnimationFrame(loop);
})();
