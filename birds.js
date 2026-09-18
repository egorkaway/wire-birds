(() => {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const caption = document.querySelector(".caption");
  const credit = document.querySelector(".credit");

  const CURATED = [
    { body: "#f45b69", belly: "#ffd4c2", head: "#e23d4d", wing: "#c81d4e", wingBar: "#ffffff", tail: "#2ec4b6", crest: "#ffd166", beak: "#ff9f1c", feet: "#e76f51", eye: "#1d1a17", cheek: "#ffe3d8", throat: "#ffd166" },
    { body: "#2ec4b6", belly: "#cbf3f0", head: "#1b9aaa", wing: "#147a8a", wingBar: "#f4d35e", tail: "#ff9f1c", crest: "#f4d35e", beak: "#e76f51", feet: "#c0563a", eye: "#14222a", cheek: "#e0fbf8", throat: "#ff9f1c" },
    { body: "#7b2d8e", belly: "#f4d35e", head: "#5c1a6e", wing: "#9b59b6", wingBar: "#ffffff", tail: "#f4d35e", crest: "#ef476f", beak: "#f79d65", feet: "#c97c5d", eye: "#1a1020", cheek: "#f8e1fa", throat: "#f4d35e" },
    { body: "#1d3557", belly: "#f1faee", head: "#1d3557", wing: "#457b9d", wingBar: "#a8dadc", tail: "#e63946", crest: "#a8dadc", beak: "#f4a261", feet: "#bc6c39", eye: "#0b1320", cheek: "#f1faee", throat: "#e63946" },
    { body: "#ffb703", belly: "#fff3c4", head: "#fb8500", wing: "#e09f3e", wingBar: "#219ebc", tail: "#219ebc", crest: "#8ecae6", beak: "#d62828", feet: "#bc6c25", eye: "#2b1d0e", cheek: "#fffce8", throat: "#d62828" },
    { body: "#06d6a0", belly: "#f8ffe5", head: "#118ab2", wing: "#073b4c", wingBar: "#ffd166", tail: "#ef476f", crest: "#ffd166", beak: "#ffd166", feet: "#c0563a", eye: "#06222c", cheek: "#e0faf2", throat: "#ffd166" },
    { body: "#ef476f", belly: "#ffd6e0", head: "#d90429", wing: "#9d0208", wingBar: "#ffffff", tail: "#073b4c", crest: "#ffd166", beak: "#f4a261", feet: "#9b2226", eye: "#1b0a10", cheek: "#ffe8ee", throat: "#ffd166" },
    { body: "#4cc9f0", belly: "#f8f9fa", head: "#4361ee", wing: "#3a0ca3", wingBar: "#4cc9f0", tail: "#f72585", crest: "#4cc9f0", beak: "#ff9e00", feet: "#b5651d", eye: "#12081f", cheek: "#eaf8ff", throat: "#f72585" },
    { body: "#fae588", belly: "#fffceb", head: "#f1c453", wing: "#f9a620", wingBar: "#ffffff", tail: "#43aa8b", crest: "#f94144", beak: "#f9844a", feet: "#bc6c25", eye: "#2a1f0a", cheek: "#fffbe6", throat: "#f94144" },
    { body: "#22223b", belly: "#c9ada7", head: "#4a4e69", wing: "#22223b", wingBar: "#f2e9e4", tail: "#9a8c98", crest: "#f2e9e4", beak: "#c9ada7", feet: "#6d597a", eye: "#f2e9e4", cheek: "#f2e9e4", throat: "#c9ada7" },
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
  let springs = [];
  let chirpRipples = [];

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
    if (chance(rng, 0.45)) return { ...pick(rng, CURATED) };
    const h = rng() * 360;
    const accent = h + range(rng, 130, 210);
    const sat = range(rng, 58, 86);
    const light = range(rng, 40, 58);
    return {
      body: hsl(h, sat, light),
      belly: hsl(h, sat * 0.42, range(rng, 78, 92)),
      head: hsl(h + range(rng, -10, 18), Math.min(90, sat + 6), light - 6),
      wing: hsl(h - 14, sat, light - 12),
      wingBar: hsl(accent, sat * 0.6, range(rng, 80, 95)),
      tail: hsl(accent, sat, light + 2),
      crest: hsl(accent + 20, Math.min(90, sat + 8), light + 8),
      beak: hsl(range(rng, 22, 42), range(rng, 68, 82), range(rng, 50, 60)),
      feet: hsl(range(rng, 14, 28), range(rng, 48, 62), range(rng, 38, 48)),
      eye: hsl(h, 18, 10),
      cheek: hsl(h, sat * 0.35, range(rng, 84, 94)),
      throat: hsl(accent, sat, light),
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
      { body: "#c4a574", belly: "#efe3c8", head: "#b08968", wing: "#7f5539", wingBar: "#efe3c8", tail: "#9c6644", crest: "#6f4518", beak: "#e9c46a", feet: "#c9a227", eye: "#1d1a17", disc: "#f3e9d7", iris: "#d4a017", cheek: "#f3e9d7", throat: "#efe3c8" },
      { body: "#8d99ae", belly: "#edf2f4", head: "#7b8799", wing: "#2b2d42", wingBar: "#edf2f4", tail: "#8d99ae", crest: "#2b2d42", beak: "#e9c46a", feet: "#c9a227", eye: "#1a1a1a", disc: "#f8f7f4", iris: "#3d5a80", cheek: "#edf2f4", throat: "#edf2f4" },
      { body: "#6d4c41", belly: "#d7ccc8", head: "#5d4037", wing: "#4e342e", wingBar: "#d7ccc8", tail: "#8d6e63", crest: "#3e2723", beak: "#f4a261", feet: "#e9c46a", eye: "#1b120c", disc: "#f5ebe0", iris: "#e76f51", cheek: "#f5ebe0", throat: "#d7ccc8" },
      { body: "#4895ef", belly: "#eef4ff", head: "#4361ee", wing: "#3a0ca3", wingBar: "#ffffff", tail: "#4cc9f0", crest: "#f72585", beak: "#ffd166", feet: "#f4a261", eye: "#1a1020", disc: "#fff6e5", iris: "#f72585", cheek: "#eef4ff", throat: "#ffd166" },
    ]);
  }

  function crowPalette() {
    return {
      body: "#1c1c22",
      belly: "#2a2a32",
      head: "#141418",
      wing: "#2c2c38",
      wingBar: "#3a3a48",
      tail: "#111114",
      crest: "#1c1c22",
      beak: "#0e0e10",
      feet: "#2a241c",
      eye: "#f0e6c8",
      cheek: "#1c1c22",
      throat: "#141418",
    };
  }

  function seagullLook(kind) {
    if (kind === "hooded") {
      return {
        body: "#f4f1ea",
        belly: "#ffffff",
        head: "#3d2914",
        wing: "#c5ced6",
        wingBar: "#ffffff",
        tail: "#dfe4ea",
        crest: "#3d2914",
        beak: "#d62828",
        feet: "#d62828",
        eye: "#1d1a17",
        cheek: "#ffffff",
        throat: "#3d2914",
        beakSpot: false,
        wingTip: false,
      };
    }
    if (kind === "blackback") {
      return {
        body: "#2b2d42",
        belly: "#f4f1ea",
        head: "#f7f4ee",
        wing: "#16161d",
        wingBar: "#ffffff",
        tail: "#1a1a22",
        crest: "#2b2d42",
        beak: "#f4a261",
        feet: "#e9c46a",
        eye: "#1d1a17",
        cheek: "#f4f1ea",
        throat: "#f4f1ea",
        beakSpot: true,
        wingTip: false,
      };
    }
    return {
      body: "#f4f1ea",
      belly: "#ffffff",
      head: "#f7f4ee",
      wing: "#9aa7b5",
      wingBar: "#ffffff",
      tail: "#c5ced6",
      crest: "#9aa7b5",
      beak: "#f4a261",
      feet: "#e9c46a",
      eye: "#1d1a17",
      cheek: "#ffffff",
      throat: "#ffffff",
      beakSpot: true,
      wingTip: true,
    };
  }

  function kingfisherPalette(rng) {
    return pick(rng, [
      { body: "#0077b6", belly: "#f77f00", head: "#023e8a", wing: "#03045e", wingBar: "#90e0ef", tail: "#0096c7", crest: "#03045e", beak: "#1b263b", feet: "#d62828", eye: "#0d1b2a", cheek: "#ffffff", throat: "#ffffff" },
      { body: "#06d6a0", belly: "#ef476f", head: "#118ab2", wing: "#073b4c", wingBar: "#ffd166", tail: "#118ab2", crest: "#073b4c", beak: "#1b1b1e", feet: "#ef476f", eye: "#073b4c", cheek: "#ffffff", throat: "#ffffff" },
    ]);
  }

  function swallowPalette(rng) {
    return pick(rng, [
      { body: "#1d3557", belly: "#f1faee", head: "#1d3557", wing: "#0b1d3a", wingBar: "#457b9d", tail: "#0b1d3a", crest: "#1d3557", beak: "#1a1a1a", feet: "#4a4e69", eye: "#0a0a10", cheek: "#f1faee", throat: "#c1121f" },
      { body: "#2b2d42", belly: "#edf2f4", head: "#1a1a24", wing: "#16161f", wingBar: "#8d99ae", tail: "#16161f", crest: "#2b2d42", beak: "#111111", feet: "#3a3a44", eye: "#111111", cheek: "#edf2f4", throat: "#d90429" },
    ]);
  }

  function pigeonPalette(rng) {
    return pick(rng, [
      { body: "#8d99ae", belly: "#c5ced6", head: "#6c757d", wing: "#495057", wingBar: "#212529", tail: "#343a40", crest: "#6c757d", beak: "#ffb703", feet: "#e63946", eye: "#e63946", cheek: "#8d99ae", throat: "#52b788" },
      { body: "#b08968", belly: "#e6ccb2", head: "#9c6644", wing: "#7f5539", wingBar: "#ddb892", tail: "#582f0e", crest: "#9c6644", beak: "#f4a261", feet: "#d62828", eye: "#e76f51", cheek: "#e6ccb2", throat: "#b56576" },
    ]);
  }

  function borbPalette(rng) {
    return pick(rng, [
      { body: "#6c757d", belly: "#f8f9fa", head: "#212529", wing: "#495057", wingBar: "#e9ecef", tail: "#343a40", crest: "#212529", beak: "#212529", feet: "#495057", eye: "#101010", cheek: "#ffffff", throat: "#212529" },
      { body: "#c97a3e", belly: "#fae1dd", head: "#9d4e15", wing: "#743a0e", wingBar: "#ffffff", tail: "#582806", crest: "#9d4e15", beak: "#3c2007", feet: "#854516", eye: "#1d1205", cheek: "#fff1e6", throat: "#f4a261" },
      { body: "#4895ef", belly: "#eef4ff", head: "#3f37c9", wing: "#3a0ca3", wingBar: "#ffffff", tail: "#4cc9f0", crest: "#3f37c9", beak: "#1b1b1e", feet: "#c0563a", eye: "#111111", cheek: "#ffffff", throat: "#f72585" },
    ]);
  }

  function makeBird(rng, t, sizeMul) {
    const colors = palette(rng);
    const pose = chance(rng, 0.12)
      ? "sleeping"
      : chance(rng, 0.15)
        ? "singing"
        : chance(rng, 0.16)
          ? "lookingUp"
          : chance(rng, 0.18)
            ? "hunched"
            : "upright";
    const view = chance(rng, 0.28) ? "front" : "side";

    return {
      t,
      species: "generic",
      view,
      facing: view === "front" ? 1 : chance(rng, 0.5) ? 1 : -1,
      scale: range(rng, 0.95, 1.38) * sizeMul,
      weight: 1.0,
      colors,
      pose: view === "front" && pose === "lookingUp" ? "upright" : pose,
      bodyW: range(rng, 18, 25),
      bodyH: range(rng, 13, 18),
      lean: range(rng, -0.18, -0.04),
      headR: range(rng, 8.5, 12),
      headNudge: range(rng, 0.48, 0.62),
      beakLen: range(rng, 7, 13),
      beakH: range(rng, 2.4, 3.6),
      beakHook: chance(rng, 0.2),
      tail: pick(rng, ["fan", "fork", "stub", "long", "plume"]),
      tailLen: range(rng, 14, 25),
      tailAngle: 0,
      crest: chance(rng, 0.35) ? pick(rng, ["mohawk", "tuft"]) : "none",
      belly: chance(rng, 0.78),
      eyeRing: chance(rng, 0.28),
      spots: chance(rng, 0.2),
      wingBars: chance(rng, 0.35) ? 1 : 0,
      cheekPatch: chance(rng, 0.4),
      throatBib: chance(rng, 0.25),
      neckRing: false,
      neckSheen: false,
      tufts: false,
      gullKind: null,
      beakSpot: false,
      wingTip: false,
      phase: rng() * Math.PI * 2,
      blinkEvery: range(rng, 2200, 5200),
      blinkOffset: rng() * 4000,
      // Micro-behaviors
      saccadeAngle: 0,
      targetSaccadeAngle: 0,
      saccadeStartTime: 0,
      nextSaccadeTime: range(rng, 1500, 4200),
      tailTwitchTime: range(rng, 2500, 6000),
      hopOffset: 0,
      hopVelocity: 0,
      lastChirpTime: 0,
    };
  }

  function assignSpecials(rng, birds) {
    const order = birds.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    // Always 1 owl
    const owl = birds[order[0]];
    owl.species = "owl";
    owl.view = "front";
    owl.facing = 1;
    owl.scale *= 1.18;
    owl.weight = 1.8;
    owl.bodyW = range(rng, 16, 20);
    owl.bodyH = range(rng, 14, 18);
    owl.headR = range(rng, 13, 16);
    owl.pose = chance(rng, 0.12) ? "sleeping" : "upright";
    owl.tufts = chance(rng, 0.82);
    owl.colors = owlPalette(rng);

    if (birds.length < 2) return;

    // Second special bird
    const specialPool = ["crow", "seagull", "kingfisher", "swallow", "pigeon", "borb"];
    const chosen = pick(rng, specialPool);
    const b2 = birds[order[1]];
    configureSpecies(rng, b2, chosen);

    // If 4+ birds, add a chance for a 3rd distinct species
    if (birds.length >= 4 && chance(rng, 0.75)) {
      const b3 = birds[order[2]];
      const remaining = specialPool.filter((s) => s !== chosen);
      configureSpecies(rng, b3, pick(rng, remaining));
    }
  }

  function configureSpecies(rng, bird, species) {
    bird.species = species;
    bird.view = "side";
    bird.facing = chance(rng, 0.5) ? 1 : -1;
    bird.crest = "none";
    bird.spots = false;
    bird.wingBars = 0;
    bird.cheekPatch = false;
    bird.throatBib = false;
    bird.neckRing = false;
    bird.neckSheen = false;

    if (species === "crow") {
      bird.colors = crowPalette();
      bird.weight = 1.5;
      bird.beakHook = true;
      bird.beakLen = range(rng, 14, 19);
      bird.beakH = range(rng, 2.4, 3.2);
      bird.tail = "fan";
      bird.tailLen = range(rng, 22, 30);
      bird.belly = false;
      bird.pose = chance(rng, 0.55) ? "hunched" : "upright";
      bird.bodyW = range(rng, 20, 26);
      bird.bodyH = range(rng, 11, 15);
      bird.scale *= 1.15;
    } else if (species === "seagull") {
      bird.weight = 1.4;
      bird.gullKind = pick(rng, ["herring", "hooded", "blackback"]);
      const look = seagullLook(bird.gullKind);
      bird.colors = look;
      bird.beakSpot = look.beakSpot;
      bird.wingTip = look.wingTip;
      bird.beakHook = false;
      bird.belly = true;
      bird.eyeRing = true;
      bird.pose = "upright";
      if (bird.gullKind === "hooded") {
        bird.beakLen = range(rng, 9, 12);
        bird.beakH = range(rng, 1.8, 2.4);
        bird.tail = "fork";
        bird.tailLen = range(rng, 16, 22);
        bird.bodyW = range(rng, 16, 20);
        bird.bodyH = range(rng, 11, 14);
        bird.headR = range(rng, 7.5, 9.5);
        bird.scale *= 0.92;
      } else if (bird.gullKind === "blackback") {
        bird.beakLen = range(rng, 13, 17);
        bird.beakH = range(rng, 2.6, 3.4);
        bird.tail = "stub";
        bird.bodyW = range(rng, 22, 28);
        bird.bodyH = range(rng, 14, 18);
        bird.scale *= 1.22;
      } else {
        bird.beakLen = range(rng, 11, 15);
        bird.beakH = range(rng, 2.2, 3);
        bird.tail = "stub";
        bird.bodyW = range(rng, 20, 26);
      }
    } else if (species === "kingfisher") {
      bird.weight = 1.15;
      bird.colors = kingfisherPalette(rng);
      bird.beakLen = range(rng, 20, 28);
      bird.beakH = range(rng, 3.4, 4.6);
      bird.beakHook = false;
      bird.crest = "dagger";
      bird.neckRing = true;
      bird.tail = "stub";
      bird.tailLen = range(rng, 10, 14);
      bird.bodyW = range(rng, 18, 22);
      bird.bodyH = range(rng, 14, 17);
      bird.headR = range(rng, 10, 12.5);
      bird.lean = -0.05;
      bird.belly = true;
    } else if (species === "swallow") {
      bird.weight = 0.65;
      bird.colors = swallowPalette(rng);
      bird.beakLen = range(rng, 5.5, 8);
      bird.beakH = range(rng, 1.8, 2.3);
      bird.beakHook = false;
      bird.tail = "scissor";
      bird.tailLen = range(rng, 26, 36);
      bird.bodyW = range(rng, 21, 26);
      bird.bodyH = range(rng, 9, 12);
      bird.headR = range(rng, 7.5, 9.2);
      bird.lean = -0.26;
      bird.throatBib = true;
      bird.wingBars = 1;
      bird.belly = true;
    } else if (species === "pigeon") {
      bird.weight = 1.6;
      bird.colors = pigeonPalette(rng);
      bird.beakLen = range(rng, 7, 10);
      bird.beakH = range(rng, 2.2, 3.0);
      bird.bodyW = range(rng, 23, 29);
      bird.bodyH = range(rng, 16, 21);
      bird.headR = range(rng, 8.5, 10.5);
      bird.tail = "fan";
      bird.tailLen = range(rng, 18, 24);
      bird.neckSheen = true;
      bird.wingBars = 2;
      bird.belly = true;
    } else if (species === "borb") {
      bird.weight = 0.7;
      bird.colors = borbPalette(rng);
      bird.bodyW = range(rng, 16, 19);
      bird.bodyH = range(rng, 15, 18);
      bird.headR = range(rng, 9.5, 12);
      bird.beakLen = range(rng, 5, 7.5);
      bird.beakH = range(rng, 1.8, 2.4);
      bird.tail = "cocked";
      bird.tailLen = range(rng, 14, 18);
      bird.tailAngle = -1.15;
      bird.cheekPatch = true;
      bird.wingBars = 1;
      bird.belly = true;
      bird.scale *= 0.95;
    }
  }

  function estimatedWidth(bird) {
    const s = bird.scale;
    if (bird.species === "owl" || bird.view === "front") {
      return s * Math.max(bird.headR * 2.6, bird.bodyW * 1.7) + 20;
    }
    if (bird.species === "crow") {
      return s * (bird.bodyW * 2.2 + bird.tailLen * 0.7 + bird.beakLen * 0.7) + 22;
    }
    if (bird.species === "kingfisher") {
      return s * (bird.bodyW * 1.9 + bird.beakLen * 0.8) + 22;
    }
    if (bird.species === "swallow") {
      return s * (bird.bodyW * 1.8 + bird.tailLen * 0.6) + 22;
    }
    return s * (bird.bodyW * 1.8 + bird.tailLen * 0.4 + bird.beakLen * 0.45) + 20;
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

  function nightAmount(t) {
    t = wrapUnit(t);
    if (t >= 0.3 && t <= 0.7) return 0;
    if (t > 0.7 && t < 0.84) return (t - 0.7) / 0.14;
    if (t >= 0.84 || t <= 0.16) return 1;
    return 1 - (t - 0.16) / 0.14;
  }

  function makeWeather(rng, w, h) {
    const stars = [];
    const starCount = 32 + Math.floor(rng() * 36);
    for (let i = 0; i < starCount; i += 1) {
      stars.push({
        x: rng() * w,
        y: h * 0.48 * rng() ** 1.35,
        r: 0.55 + rng() * 1.55,
        tw: rng() * Math.PI * 2,
        bright: 0.4 + rng() * 0.6,
      });
    }

    const clouds = [];
    if (chance(rng, 0.55)) {
      const n = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < n; i += 1) {
        const s = range(rng, 0.75, 1.45);
        const puffs = [];
        const puffCount = 3 + Math.floor(rng() * 3);
        for (let p = 0; p < puffCount; p += 1) {
          puffs.push({
            dx: range(rng, -30, 30) * s,
            dy: range(rng, -11, 8) * s,
            rx: range(rng, 15, 28) * s,
            ry: range(rng, 9, 16) * s,
          });
        }
        clouds.push({
          x: range(rng, w * 0.08, w * 0.92),
          y: range(rng, h * 0.08, h * 0.36),
          puffs,
        });
      }
    }

    return { stars, clouds };
  }

  function triggerSpring(xRatio, amp = 14) {
    springs.push({
      startT: performance.now(),
      xRatio: Math.max(0.1, Math.min(0.9, xRatio)),
      amp,
      freq: 0.012,
      decay: 0.0028,
    });
    if (springs.length > 5) springs.shift();
  }

  function createScene(currentSeed, w, h) {
    const rng = mulberry32(currentSeed);
    const sizeMul = Math.min(1.2, Math.max(0.72, w / 920));
    const maxCount = Math.max(1, Math.min(8, Math.floor((w - 72) / 92)));
    const count = pickCount(rng, maxCount);
    const birds = Array.from({ length: count }, () => makeBird(rng, 0.5, sizeMul));
    assignSpecials(rng, birds);
    placeAlongWire(rng, birds, w);
    const weather = makeWeather(rng, w, h);
    chirpRipples = [];
    triggerSpring(0.5, 12);

    return {
      seed: currentSeed,
      baseWireY: h * 0.58,
      birds,
      stars: weather.stars,
      clouds: weather.clouds,
    };
  }

  // --- Dynamic Wire Sag & Spring Physics ---
  function getWireDeflection(x, w, birds, animTime, now) {
    const u = x / Math.max(1, w);
    // Baseline natural catenary sag across the span
    let sag = 8 * Math.sin(Math.PI * u);

    // Local sag from perched bird weights
    if (birds) {
      for (const b of birds) {
        const bx = b.t * w;
        const dx = x - bx;
        const weight = (b.weight || 1.0) * (b.scale || 1.0);
        sag += weight * 4.2 * Math.exp(-(dx * dx) / (90 * 90));
      }
    }

    // Dynamic spring harmonic oscillations
    for (let i = springs.length - 1; i >= 0; i -= 1) {
      const sp = springs[i];
      const elapsed = now - sp.startT;
      if (elapsed > 2400) {
        springs.splice(i, 1);
        continue;
      }
      const envelope = Math.exp(-sp.decay * elapsed);
      const wave = Math.sin(Math.PI * u) * Math.cos(sp.freq * elapsed);
      // secondary harmonic
      const wave2 = 0.35 * Math.sin(2 * Math.PI * u) * Math.sin(sp.freq * 1.5 * elapsed);
      sag += sp.amp * envelope * (wave + wave2);
    }

    return sag;
  }

  function getWireY(x, w, baseWireY, birds, animTime, now) {
    return baseWireY + getWireDeflection(x, w, birds, animTime, now);
  }

  function drawWire(ctx, theme, w, baseWireY, birds, animTime, now) {
    ctx.strokeStyle = theme.wire;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();

    const segments = Math.max(30, Math.floor(w / 20));
    for (let i = 0; i <= segments; i += 1) {
      const x = (i / segments) * w;
      const y = getWireY(x, w, baseWireY, birds, animTime, now);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // --- Micro-Animations & Behaviors ---
  function updateBirdBehaviors(bird, now, animTime, wireY, tod) {
    // Saccadic head twitching
    if (now > bird.nextSaccadeTime) {
      bird.saccadeStartTime = now;
      bird.targetSaccadeAngle = bird.pose === "sleeping" ? 0 : (Math.random() - 0.5) * 0.48;
      bird.nextSaccadeTime = now + 1600 + Math.random() * 3200;
    }
    const saccadeElapsed = now - bird.saccadeStartTime;
    if (saccadeElapsed < 60) {
      const u = saccadeElapsed / 60;
      bird.saccadeAngle = lerp(bird.saccadeAngle, bird.targetSaccadeAngle, u);
    } else {
      bird.saccadeAngle = bird.targetSaccadeAngle;
    }

    // Tail twitch
    if (now > bird.tailTwitchTime) {
      bird.tailTwitchTime = now + 2400 + Math.random() * 4500;
      bird.lastTwitchStart = now;
    }

    // Hop physics on touch/interact
    if (bird.hopVelocity !== 0 || bird.hopOffset !== 0) {
      bird.hopOffset += bird.hopVelocity;
      bird.hopVelocity += 0.45; // gravity
      if (bird.hopOffset >= 0) {
        bird.hopOffset = 0;
        bird.hopVelocity = 0;
      }
    }

    // Singing ripple emitter
    if (bird.pose === "singing" && now - bird.lastChirpTime > 1100 + (bird.phase % 600)) {
      bird.lastChirpTime = now;
      const flip = bird.view === "front" ? 1 : bird.facing;
      const bx = bird.t * width + flip * bird.scale * (bird.bodyW * 0.6 + bird.beakLen);
      const by = wireY - bird.scale * (bird.bodyH * 1.2);
      chirpRipples.push({
        x: bx,
        y: by,
        born: now,
        duration: 1300,
        maxR: 20 * bird.scale,
      });
    }
  }

  function drawChirpRipples(ctx, now, theme) {
    if (!chirpRipples.length) return;
    ctx.save();
    for (let i = chirpRipples.length - 1; i >= 0; i -= 1) {
      const r = chirpRipples[i];
      const elapsed = now - r.born;
      if (elapsed > r.duration) {
        chirpRipples.splice(i, 1);
        continue;
      }
      const u = elapsed / r.duration;
      const currentR = r.maxR * Math.sqrt(u);
      const alpha = (1 - u) * (1 - u) * 0.75;
      const dy = -22 * u;

      ctx.strokeStyle = theme.ink;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(r.x, r.y + dy, currentR, -Math.PI * 0.45, Math.PI * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.x, r.y + dy, currentR * 0.6, -Math.PI * 0.4, Math.PI * 0.25);
      ctx.stroke();
    }
    ctx.restore();
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

  function rangeSpread(i, n, span) {
    return -span / 2 + (n === 1 ? 0 : (i / (n - 1)) * span);
  }

  function drawTail(ctx, bird, bodyX, bodyY, now) {
    const { colors, tail, tailLen, bodyW, bodyH } = bird;
    paint(ctx, colors.tail);
    const ax = bodyX - bodyW * 0.72;
    const ay = bodyY - bodyH * 0.08;

    // Tail twitch dynamic angle
    let twitchAngle = 0;
    if (bird.lastTwitchStart && now - bird.lastTwitchStart < 140) {
      twitchAngle = Math.sin(((now - bird.lastTwitchStart) / 140) * Math.PI * 2) * 0.16;
    }
    const back = Math.PI + 0.22 + (bird.tailAngle || 0) + twitchAngle;

    if (tail === "scissor") {
      // Swallow scissor tail
      teardrop(ctx, ax, ay, tailLen * 0.95, 2.4, back + 0.28);
      teardrop(ctx, ax, ay, tailLen * 0.95, 2.4, back - 0.22);
      teardrop(ctx, ax, ay, tailLen * 0.55, 3.2, back + 0.03);
    } else if (tail === "cocked") {
      // Borb / wren cocked tail
      teardrop(ctx, ax + 2, ay - 2, tailLen * 0.85, 3.8, back);
      teardrop(ctx, ax + 2, ay - 2, tailLen * 0.7, 3.0, back - 0.2);
    } else if (tail === "fan") {
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
      // stub
      teardrop(ctx, ax, ay, tailLen * 0.38, 4.4, back);
    }
  }

  function drawCrest(ctx, bird, hx, hy) {
    if (bird.crest === "none") return;
    paint(ctx, bird.colors.crest);
    if (bird.crest === "dagger") {
      // Kingfisher dagger crest
      teardrop(ctx, hx - bird.headR * 0.4, hy - bird.headR * 0.7, bird.headR * 1.25, 3.2, -2.4);
      teardrop(ctx, hx - bird.headR * 0.1, hy - bird.headR * 0.8, bird.headR * 1.05, 2.6, -2.1);
      teardrop(ctx, hx - bird.headR * 0.6, hy - bird.headR * 0.5, bird.headR * 0.85, 2.4, -2.6);
    } else if (bird.crest === "mohawk") {
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

  function beginPerch(ctx, bird, now, time) {
    const blinkOn =
      bird.pose !== "sleeping" && (time + bird.blinkOffset) % bird.blinkEvery < 140;
    ctx.save();
    const flip = bird.view === "front" ? 1 : bird.facing;
    
    // Breathing & resting fluff scale
    const breath = 1 + 0.015 * Math.sin(time * 0.003 + bird.phase);
    const fluff = bird.pose === "sleeping" ? 1.08 : 1.0;
    const sy = bird.scale * breath * fluff;
    const sx = flip * bird.scale * fluff;

    ctx.translate(0, bird.hopOffset || 0);
    ctx.scale(sx, sy);
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
    ctx.rotate((bird.pose === "lookingUp" ? -0.7 : bird.beakHook ? 0.28 : 0.08) + (bird.saccadeAngle || 0) * 0.5);
    
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
    if (bird.beakSpot && paintPass !== "halo") {
      paint(ctx, "#e63946");
      ellipse(ctx, bird.beakLen * 0.72, bird.beakH * 0.15, 1.15, 1.15);
    }
    ctx.restore();
  }

  function drawLayeredWing(ctx, bird, bodyX, bodyY) {
    const w = bird.bodyW;
    const h = bird.bodyH;

    // Base wing covert
    paint(ctx, bird.colors.wing);
    ellipse(ctx, bodyX + 1, bodyY + 1, w * 0.58, h * 0.36, 0.35);

    if (paintPass === "halo") return;

    // Wing bars (graphic stripes / coverts)
    if (bird.wingBars > 0 && bird.colors.wingBar) {
      paint(ctx, bird.colors.wingBar);
      ellipse(ctx, bodyX - w * 0.08, bodyY - 1, w * 0.22, 1.4, 0.38);
      if (bird.wingBars > 1) {
        ellipse(ctx, bodyX - w * 0.02, bodyY + 2.5, w * 0.26, 1.3, 0.38);
      }
    }

    // Wing tip accent
    if (bird.wingTip) {
      paint(ctx, "#2b2d42");
      ellipse(ctx, bodyX + w * 0.42, bodyY + 2, 3.2, 2.1, 0.2);
    }
  }

  function drawCheekAndMarkings(ctx, bird, hx, hy, bodyX, bodyY) {
    if (paintPass === "halo") return;

    // Neck ring (Kingfisher style)
    if (bird.neckRing) {
      paint(ctx, "#ffffff");
      ellipse(ctx, hx - bird.headR * 0.1, hy + bird.headR * 0.75, bird.headR * 0.82, 2.4, 0.15);
    }

    // Iridescent Neck Sheen (Pigeon style)
    if (bird.neckSheen) {
      paint(ctx, bird.colors.throat);
      ellipse(ctx, hx - bird.headR * 0.15, hy + bird.headR * 0.7, bird.headR * 0.7, 2.8, 0.25);
    }

    // Throat Bib (Swallow rust bib)
    if (bird.throatBib) {
      paint(ctx, bird.colors.throat);
      ellipse(ctx, hx + bird.headR * 0.25, hy + bird.headR * 0.65, bird.headR * 0.5, bird.headR * 0.5, 0.2);
    }

    // Cheek Patch (Borb / Chickadee white cheek)
    if (bird.cheekPatch) {
      paint(ctx, bird.colors.cheek);
      ellipse(ctx, hx + bird.headR * 0.15, hy + bird.headR * 0.2, bird.headR * 0.48, bird.headR * 0.36, 0.1);
    }
  }

  function drawSideBird(ctx, bird, now, time) {
    const { blinkOn, bodyX, bodyY } = beginPerch(ctx, bird, now, time);
    drawTail(ctx, bird, bodyX, bodyY, now);
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

    drawLayeredWing(ctx, bird, bodyX, bodyY);
    drawFoot(ctx, 4.2, bird.colors, "side");

    const hunched = bird.pose === "hunched" || bird.pose === "sleeping";
    const hx = bodyX + bird.bodyW * (bird.species === "crow" ? 0.42 : bird.headNudge);
    const hy = bodyY - bird.bodyH * (hunched ? 0.28 : 0.48) + (bird.pose === "lookingUp" ? -4 : 0);

    drawCrest(ctx, bird, hx, hy);

    paint(ctx, bird.colors.head);
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(bird.saccadeAngle || 0);
    ellipse(ctx, 0, 0, bird.headR * (bird.species === "crow" ? 0.88 : 1), bird.headR * 0.96);

    if (bird.gullKind === "hooded") {
      paint(ctx, bird.colors.head);
      ellipse(ctx, -1.5, bird.headR * 0.55, bird.headR * 0.9, bird.headR * 0.72);
    }

    drawCheekAndMarkings(ctx, bird, 0, 0, bodyX - hx, bodyY - hy);
    drawSideBeak(ctx, bird, 0, 0);
    drawSideEye(ctx, bird.headR * 0.28, -bird.headR * 0.12, bird, blinkOn);
    ctx.restore();

    ctx.restore();
  }

  function drawFrontBird(ctx, bird, now, time) {
    const { blinkOn, bodyY } = beginPerch(ctx, bird, now, time);
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
    
    ctx.save();
    ctx.translate(0, hy);
    ctx.rotate(bird.saccadeAngle || 0);
    ellipse(ctx, 0, 0, bird.headR * 1.02, bird.headR * 0.98);
    drawFrontEyes(ctx, -1, bird.headR * 0.38, 2.6, bird, blinkOn);
    drawFrontBeak(ctx, 0, bird);
    ctx.restore();

    ctx.restore();
  }

  function drawOwl(ctx, bird, now, time) {
    const { blinkOn, bodyY } = beginPerch(ctx, bird, now, time);
    paint(ctx, bird.colors.body);
    ellipse(ctx, 0, bodyY + 6, bird.bodyW * 0.95, bird.bodyH * 1.08);
    if (paintPass !== "halo") {
      paint(ctx, bird.colors.belly);
      ellipse(ctx, 0, bodyY + 10, bird.bodyW * 0.52, bird.bodyH * 0.62);
    }

    drawFoot(ctx, -7.5, bird.colors, "front");
    drawFoot(ctx, 7.5, bird.colors, "front");

    const hy = bodyY - bird.bodyH * 0.22;
    
    ctx.save();
    ctx.translate(0, hy);
    ctx.rotate((bird.saccadeAngle || 0) * 0.7);

    if (bird.tufts) {
      paint(ctx, bird.colors.crest);
      teardrop(ctx, -bird.headR * 0.62, -bird.headR * 0.5, 13, 3.4, -2.25);
      teardrop(ctx, bird.headR * 0.62, -bird.headR * 0.5, 13, 3.4, -0.9);
    }

    paint(ctx, bird.colors.head);
    ellipse(ctx, 0, 0, bird.headR * 1.18, bird.headR * 1.08);
    if (paintPass !== "halo") {
      paint(ctx, bird.colors.disc);
      ellipse(ctx, 0, 1.2, bird.headR * 1.02, bird.headR * 0.88);
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
          ctx.arc(side * span, 0, 3.2, 0.2, Math.PI - 0.2);
          ctx.stroke();
          continue;
        }
        paint(ctx, "#1a1a1a");
        ellipse(ctx, side * span, 0, eyeR + 0.5, eyeR + 0.5);
        paint(ctx, bird.colors.iris);
        ellipse(ctx, side * span, 0, eyeR - 0.35, eyeR - 0.35);
        paint(ctx, "#161616");
        ellipse(ctx, side * span, 0, 2.15, 2.15);
        paint(ctx, "#ffffff");
        ellipse(ctx, side * span - 1.3, -1.5, 1, 1);
      }
    }

    paint(ctx, bird.colors.beak);
    ctx.beginPath();
    ctx.moveTo(-2.4, 3.5);
    ctx.lineTo(0, 12);
    ctx.lineTo(2.4, 3.5);
    ctx.closePath();
    finish(ctx);

    ctx.restore();
    ctx.restore();
  }

  function drawCrow(ctx, bird, now, time) {
    const { blinkOn, bodyX, bodyY } = beginPerch(ctx, bird, now, time);
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

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate((bird.saccadeAngle || 0) * 0.6);

    paint(ctx, bird.colors.head);
    poly(ctx, [
      [-bird.headR * 0.95, bird.headR * 0.4],
      [-bird.headR * 0.08, -bird.headR * 1.15],
      [bird.headR * 0.95, bird.headR * 0.12],
    ]);
    poly(ctx, [
      [-bird.headR * 0.95, bird.headR * 0.4],
      [bird.headR * 0.95, bird.headR * 0.12],
      [bird.headR * 0.15, bird.headR * 0.85],
    ]);

    paint(ctx, bird.colors.beak);
    poly(ctx, [
      [bird.headR * 0.55, -0.4],
      [bird.headR * 0.55 + bird.beakLen * 1.15, 2.2],
      [bird.headR * 0.28, 3.6],
    ]);

    const ex = bird.headR * 0.22;
    const ey = -bird.headR * 0.05;
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
    ctx.restore();
  }

  function drawBirdShape(ctx, bird, now, time) {
    if (bird.species === "owl") {
      drawOwl(ctx, bird, now, time);
      return;
    }
    if (bird.species === "crow") {
      drawCrow(ctx, bird, now, time);
      return;
    }
    if (bird.view === "front") {
      drawFrontBird(ctx, bird, now, time);
      return;
    }
    drawSideBird(ctx, bird, now, time);
  }

  function drawBird(ctx, bird, now, time, outline, theme, tod) {
    outlineColor = outline;
    paintPass = "halo";
    drawBirdShape(ctx, bird, now, time);
    paintPass = "paint";
    drawBirdShape(ctx, bird, now, time);

    // Atmospheric rim lighting for sunrise/sunset or moonlit silhouettes
    const sunP = dayProgress(tod);
    const moonP = nightProgress(tod);
    const isTwilight = sunP != null && Math.sin(Math.PI * sunP) < 0.35;
    const isNight = moonP != null;

    if (isTwilight || isNight) {
      ctx.save();
      const flip = bird.view === "front" ? 1 : bird.facing;
      ctx.scale(flip * bird.scale, bird.scale);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = isTwilight ? 0.32 : 0.22;
      ctx.fillStyle = isTwilight ? "#ffba08" : "#d8e2dc";
      ctx.beginPath();
      ctx.arc(0, -bird.bodyH * 1.5, bird.headR * 0.85, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = isTwilight ? "#ffba08" : "#d8e2dc";
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawStars(stars, tod, animTime, moon) {
    const night = nightAmount(tod);
    if (night < 0.06 || !stars) return;
    for (const star of stars) {
      if (moon) {
        const dx = star.x - moon.x;
        const dy = star.y - moon.y;
        if (dx * dx + dy * dy < (moon.r + 18) ** 2) continue;
      }
      const twinkle = 0.72 + 0.28 * Math.sin(animTime / 480 + star.tw);
      ctx.globalAlpha = night * star.bright * twinkle;
      ctx.fillStyle = "#f7f1e1";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function cloudFill(tod) {
    const sunP = dayProgress(tod);
    if (sunP != null) {
      const alt = Math.sin(Math.PI * sunP);
      if (alt < 0.38) return lerpHex("#f4c9a0", "#f7f4ef", alt / 0.38);
      return "#f7f4ef";
    }
    return lerpHex("#d9cbb3", "#c9b8a6", nightAmount(tod));
  }

  function drawClouds(clouds, tod) {
    const night = nightAmount(tod);
    if (night > 0.7 || !clouds || !clouds.length) return;
    const alpha = night < 0.15 ? 0.9 : 0.9 * (1 - (night - 0.15) / 0.55);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = cloudFill(tod);
    for (const cloud of clouds) {
      for (const puff of cloud.puffs) {
        ctx.beginPath();
        ctx.ellipse(cloud.x + puff.dx, cloud.y + puff.dy, puff.rx, puff.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
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

  function drawScene(animTime, tod, now) {
    if (!scene) return;
    const theme = themeAt(tod);
    applyTheme(theme);
    ctx.fillStyle = theme.sky;
    ctx.fillRect(0, 0, width, height);

    const moonP = nightProgress(tod);
    let moon = null;
    if (moonP != null) {
      moon = bodyOnArc(moonP, width, height, 26);
    }

    drawStars(scene.stars, tod, animTime, moon);
    drawCelestial(theme, tod);
    drawClouds(scene.clouds, tod);
    drawWire(ctx, theme, width, scene.baseWireY, scene.birds, animTime, now);

    for (const bird of scene.birds) {
      const birdX = bird.t * width;
      const wireY = getWireY(birdX, width, scene.baseWireY, scene.birds, animTime, now);
      updateBirdBehaviors(bird, now, animTime, wireY, tod);

      ctx.save();
      ctx.translate(birdX, wireY);
      drawBird(ctx, bird, now, animTime, theme.outline, theme, tod);
      ctx.restore();
    }

    drawChirpRipples(ctx, now, theme);
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
    const blend = theme.night ? "normal" : "multiply";
    caption.style.color = theme.ink;
    caption.style.mixBlendMode = blend;
    credit.style.color = theme.ink;
    credit.style.mixBlendMode = blend;
  }

  function shuffle() {
    const now = performance.now();
    seed = (Math.random() * 0xffffffff) >>> 0;
    history.replaceState(null, "", `#${seed}`);
    scene = createScene(seed, width, height);
    advanceClock(now, mulberry32(seed));
  }

  // --- Touch & Click Hit Testing ---
  function handlePointerTap(clientX, clientY) {
    if (!scene) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const now = performance.now();

    // Hit test against birds
    for (const bird of scene.birds) {
      const bx = bird.t * width;
      const by = getWireY(bx, width, scene.baseWireY, scene.birds, now - start, now);
      const s = bird.scale;
      const hitW = 34 * s;
      const hitTop = by - 52 * s;
      const hitBottom = by + 16 * s;

      if (px >= bx - hitW && px <= bx + hitW && py >= hitTop && py <= hitBottom) {
        // Tapped a bird!
        bird.hopVelocity = -4.5;
        bird.pose = bird.pose === "sleeping" ? "upright" : "singing";
        bird.lastChirpTime = 0; // trigger immediate chirp ripple
        triggerSpring(bird.t, 10);
        return;
      }
    }

    // Tapped sky / wire -> shuffle
    shuffle();
  }

  function loop(now) {
    const tod = tickClock(now);
    drawScene(now - start, tod, now);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  canvas.tabIndex = 0;

  // Touch and click handlers for mobile & desktop
  let touchMoved = false;
  canvas.addEventListener("touchstart", () => { touchMoved = false; }, { passive: true });
  canvas.addEventListener("touchmove", () => { touchMoved = true; }, { passive: true });
  canvas.addEventListener("touchend", (e) => {
    if (!touchMoved && e.changedTouches && e.changedTouches.length > 0) {
      e.preventDefault();
      const t = e.changedTouches[0];
      handlePointerTap(t.clientX, t.clientY);
    }
  });

  canvas.addEventListener("click", (e) => {
    handlePointerTap(e.clientX, e.clientY);
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

