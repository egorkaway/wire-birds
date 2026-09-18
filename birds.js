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

  const SUN_COLOR = "#f2c14e";
  const SUN_HORIZON = "#e85d04";
  const MOON_COLOR = "#f0e6c8";
  const SUNRISE = 0.25;
  const SUNSET = 0.75;

  const SKY_STOPS = [
    { t: 0.0, sky: "#0b1020", ink: "#e8e0d4", wire: "#d9cbb3", outline: "#f4ead8", night: true },
    { t: 0.18, sky: "#1a2744", ink: "#e8e0d4", wire: "#d9cbb3", outline: "#f4ead8", night: true },
    { t: 0.22, sky: "#c45c3e", ink: "#2c2a28", wire: "#3a2a28", outline: "#2a2724", night: false },
    { t: 0.25, sky: "#f4a261", ink: "#2c2a28", wire: "#3a2a28", outline: "#2a2724", night: false },
    { t: 0.3, sky: "#e7f2f8", ink: "#24323c", wire: "#24323c", outline: "#24323c", night: false },
    { t: 0.5, sky: "#d8eef8", ink: "#24323c", wire: "#24323c", outline: "#24323c", night: false },
    { t: 0.7, sky: "#e7f2f8", ink: "#24323c", wire: "#24323c", outline: "#24323c", night: false },
    { t: 0.74, sky: "#f4a261", ink: "#2c2a28", wire: "#3a2a28", outline: "#2a2724", night: false },
    { t: 0.77, sky: "#c45c3e", ink: "#2c2a28", wire: "#3a2a28", outline: "#2a2724", night: false },
    { t: 0.81, sky: "#2a2444", ink: "#e8e0d4", wire: "#d9cbb3", outline: "#f4ead8", night: true },
    { t: 0.88, sky: "#12182a", ink: "#e8e0d4", wire: "#d9cbb3", outline: "#f4ead8", night: true },
    { t: 1.0, sky: "#0b1020", ink: "#e8e0d4", wire: "#d9cbb3", outline: "#f4ead8", night: true },
  ];

  let seed = readSeed();
  let scene = null;
  let width = 0;
  let height = 0;
  let start = performance.now();
  let paintPass = "paint";
  let outlineColor = "#2a2724";
  let clock = {
    display: 0.42,
    from: 0.42,
    to: 0.42,
    startedAt: 0,
    duration: 0,
    ready: false,
  };

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

  function wrapUnit(t) {
    t %= 1;
    return t < 0 ? t + 1 : t;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpHex(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return rgbToHex({
      r: lerp(A.r, B.r, t),
      g: lerp(A.g, B.g, t),
      b: lerp(A.b, B.b, t),
    });
  }

  function themeAt(t) {
    t = wrapUnit(t);
    let i = 0;
    while (i < SKY_STOPS.length - 1 && SKY_STOPS[i + 1].t <= t) i += 1;
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    const span = b.t - a.t || 1;
    const u = Math.min(1, Math.max(0, (t - a.t) / span));
    return {
      sky: lerpHex(a.sky, b.sky, u),
      ink: lerpHex(a.ink, b.ink, u),
      wire: lerpHex(a.wire, b.wire, u),
      outline: lerpHex(a.outline, b.outline, u),
      night: u < 0.5 ? a.night : b.night,
    };
  }

  function dayProgress(t) {
    t = wrapUnit(t);
    if (t < SUNRISE || t > SUNSET) return null;
    return (t - SUNRISE) / (SUNSET - SUNRISE);
  }

  function nightProgress(t) {
    t = wrapUnit(t);
    const span = 1 - SUNSET + SUNRISE;
    if (t >= SUNSET) return (t - SUNSET) / span;
    if (t <= SUNRISE) return (t + 1 - SUNSET) / span;
    return null;
  }

  function bodyOnArc(progress, w, h, radius) {
    const x = w * (0.06 + 0.88 * progress);
    const horizonY = h * 0.5;
    const peakY = h * 0.13;
    const y = horizonY - Math.sin(Math.PI * progress) * (horizonY - peakY);
    return { x, y, r: radius };
  }

  function sunFill(altitude) {
    const warmth = Math.min(1, altitude / 0.28);
    return lerpHex(SUN_HORIZON, SUN_COLOR, warmth);
  }

  function crossesTwilight(from, to) {
    const steps = 24;
    for (let i = 0; i <= steps; i += 1) {
      const t = wrapUnit(from + ((to - from) * i) / steps);
      if ((t > 0.2 && t < 0.3) || (t > 0.7 && t < 0.82)) return true;
    }
    return false;
  }

  function tickClock(now) {
    if (!clock.duration) return wrapUnit(clock.display);
    const u = Math.min(1, (now - clock.startedAt) / clock.duration);
    const eased = u * u * (3 - 2 * u);
    const value = clock.from + (clock.to - clock.from) * eased;
    clock.display = wrapUnit(value);
    if (u >= 1) {
      clock.from = clock.display;
      clock.to = clock.display;
      clock.duration = 0;
    }
    return clock.display;
  }

  function ensureClock(currentSeed) {
    if (clock.ready) return;
    const t = mulberry32(currentSeed ^ 0x9e3779b9)();
    clock.display = t;
    clock.from = t;
    clock.to = t;
    clock.ready = true;
  }

  function advanceClock(now, rng) {
    const current = tickClock(now);
    const advance = range(rng, 0.16, 0.48);
    clock.from = current;
    clock.to = current + advance;
    clock.startedAt = now;
    clock.duration = 1600 + advance * 3600 + (crossesTwilight(clock.from, clock.to) ? 1100 : 0);
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

  function poly(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
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
      other.beakLen = range(rng, 14, 19);
      other.beakH = range(rng, 2.4, 3.2);
      other.tail = "fan";
      other.tailLen = range(rng, 22, 30);
      other.belly = false;
      other.pose = chance(rng, 0.55) ? "hunched" : "upright";
      other.bodyW = range(rng, 20, 26);
      other.bodyH = range(rng, 11, 15);
      other.scale *= 1.16;
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
    if (bird.species === "crow") {
      return s * (bird.bodyW * 2.2 + bird.tailLen * 0.7 + bird.beakLen * 0.7) + 22;
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
    const sizeMul = Math.min(1.2, Math.max(0.72, w / 920));
    const maxCount = Math.max(1, Math.min(8, Math.floor((w - 72) / 92)));
    const count = pickCount(rng, maxCount);
    const birds = Array.from({ length: count }, () => makeBird(rng, 0.5, sizeMul));
    assignSpecials(rng, birds);
    placeAlongWire(rng, birds, w);
    return {
      seed: currentSeed,
      wireY: h * 0.58,
      birds,
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

  function drawCrow(ctx, bird, time) {
    const { blinkOn, bodyX, bodyY } = beginPerch(ctx, bird, time);
    const hunched = bird.pose === "hunched" || bird.pose === "sleeping";
    const w = bird.bodyW;
    const h = bird.bodyH;
    const chest = [bodyX + w * 0.9, bodyY + h * 0.08];
    const nape = [bodyX - w * 0.05, bodyY - h * 1.05];
    const rump = [bodyX - w * 0.95, bodyY + h * 0.12];
    const belly = [bodyX + w * 0.05, bodyY + h * 0.95];

    paint(ctx, bird.colors.tail);
    poly(ctx, [rump, [bodyX - w * 1.55, bodyY - h * 0.7], [bodyX - w * 0.35, bodyY - h * 0.2]]);
    poly(ctx, [rump, [bodyX - w * 1.7, bodyY + h * 0.08], [bodyX - w * 0.4, bodyY + h * 0.32]]);
    poly(ctx, [rump, [bodyX - w * 1.35, bodyY + h * 0.7], belly]);

    drawFoot(ctx, -4.2, bird.colors, "side");

    paint(ctx, bird.colors.body);
    poly(ctx, [chest, nape, rump]);
    poly(ctx, [chest, rump, belly]);

    paint(ctx, bird.colors.wing);
    poly(ctx, [
      [bodyX - w * 0.05, bodyY - h * 0.15],
      [bodyX + w * 0.62, bodyY + h * 0.12],
      [bodyX - w * 0.45, bodyY + h * 0.72],
    ]);
    poly(ctx, [
      [bodyX + w * 0.15, bodyY + h * 0.05],
      [bodyX + w * 0.55, bodyY + h * 0.22],
      [bodyX - w * 0.1, bodyY + h * 0.5],
    ]);

    drawFoot(ctx, 3.6, bird.colors, "side");

    const hx = bodyX + w * 0.58;
    const hy = bodyY - h * (hunched ? 0.38 : 0.62);

    paint(ctx, bird.colors.head);
    poly(ctx, [
      [hx - bird.headR * 0.95, hy + bird.headR * 0.4],
      [hx - bird.headR * 0.08, hy - bird.headR * 1.15],
      [hx + bird.headR * 0.95, hy + bird.headR * 0.12],
    ]);
    poly(ctx, [
      [hx - bird.headR * 0.95, hy + bird.headR * 0.4],
      [hx + bird.headR * 0.95, hy + bird.headR * 0.12],
      [hx + bird.headR * 0.15, hy + bird.headR * 0.85],
    ]);

    paint(ctx, bird.colors.beak);
    poly(ctx, [
      [hx + bird.headR * 0.55, hy - 0.4],
      [hx + bird.headR * 0.55 + bird.beakLen * 1.15, hy + 2.2],
      [hx + bird.headR * 0.28, hy + 3.6],
    ]);

    const ex = hx + bird.headR * 0.22;
    const ey = hy - bird.headR * 0.05;
    if (paintPass !== "halo") {
      if (bird.pose === "sleeping" || blinkOn) {
        ctx.strokeStyle = bird.colors.eye;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ex - 2.4, ey);
        ctx.lineTo(ex, ey + 1.6);
        ctx.lineTo(ex + 2.4, ey);
        ctx.stroke();
      } else {
        paint(ctx, bird.colors.eye);
        poly(ctx, [
          [ex, ey - 2.3],
          [ex + 2.4, ey],
          [ex, ey + 2.3],
        ]);
        poly(ctx, [
          [ex, ey - 2.3],
          [ex, ey + 2.3],
          [ex - 2.4, ey],
        ]);
        paint(ctx, "#f0e6c8");
        poly(ctx, [
          [ex, ey - 1.1],
          [ex + 1.15, ey],
          [ex, ey + 1.1],
        ]);
        poly(ctx, [
          [ex, ey - 1.1],
          [ex, ey + 1.1],
          [ex - 1.15, ey],
        ]);
      }
    }
    ctx.restore();
  }

  function drawBirdShape(ctx, bird, time) {
    if (bird.species === "owl") {
      drawOwl(ctx, bird, time);
      return;
    }
    if (bird.species === "crow") {
      drawCrow(ctx, bird, time);
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

  function drawWire(ctx, theme, wireY) {
    ctx.strokeStyle = theme.wire;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(0, wireY);
    ctx.lineTo(width, wireY);
    ctx.stroke();
  }

  function drawCelestial(theme, tod) {
    const sunP = dayProgress(tod);
    const moonP = nightProgress(tod);

    if (sunP != null) {
      const pos = bodyOnArc(sunP, width, height, 30);
      const altitude = Math.sin(Math.PI * sunP);
      const glow = Math.max(0, 1 - altitude);
      if (glow > 0.05) {
        ctx.fillStyle = SUN_HORIZON;
        ctx.globalAlpha = 0.18 * glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r * (1.6 + glow * 0.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = sunFill(altitude);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (moonP != null) {
      const pos = bodyOnArc(moonP, width, height, 26);
      const fade = Math.min(1, Math.sin(Math.PI * moonP) / 0.18);
      ctx.globalAlpha = Math.max(0, fade);
      ctx.fillStyle = MOON_COLOR;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.sky;
      ctx.beginPath();
      ctx.arc(pos.x + pos.r * 0.38, pos.y - pos.r * 0.12, pos.r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawScene(animTime, tod) {
    if (!scene) return;
    const theme = themeAt(tod);
    applyTheme(theme);
    ctx.fillStyle = theme.sky;
    ctx.fillRect(0, 0, width, height);

    drawCelestial(theme, tod);
    drawWire(ctx, theme, scene.wireY);

    for (const bird of scene.birds) {
      ctx.save();
      ctx.translate(bird.t * width, scene.wireY);
      drawBird(ctx, bird, animTime, theme.outline);
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
    ensureClock(seed);
    scene = createScene(seed, width, height);
    applyTheme(themeAt(clock.display));
  }

  function applyTheme(theme) {
    document.body.style.background = theme.sky;
    caption.style.color = theme.ink;
    caption.style.mixBlendMode = theme.night ? "normal" : "multiply";
  }

  function shuffle() {
    const now = performance.now();
    seed = (Math.random() * 0xffffffff) >>> 0;
    history.replaceState(null, "", `#${seed}`);
    scene = createScene(seed, width, height);
    advanceClock(now, mulberry32(seed));
  }

  function loop(now) {
    const tod = tickClock(now);
    drawScene(now - start, tod);
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
  });

  history.replaceState(null, "", `#${seed}`);
  resize();
  requestAnimationFrame(loop);
})();
