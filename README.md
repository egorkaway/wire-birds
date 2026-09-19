# Wire Birds

A small generative sketch: colorful, minimal birds perched on a straight wire. Each shuffle builds a new flock in vanilla JavaScript on a `<canvas>` — no build step, no libraries.

Open `index.html` locally, or drop the repo on [Netlify](https://www.netlify.com/). Click or press space for a new lineup. [catalog.html](catalog.html) shows every kind at once, on several wires.

## What’s on the wire

- **Diverse Avian Species**:
  - **The Owl**, always, front-facing watcher with expressive irises and tufts.
  - **Seagulls**, aerodynamic silhouette with yellow/red hooked bill, gonys spot, and black wingtips with white mirror spots (herring, blackback, and hooded looks).
  - **The Puffin**, tuxedo body with heart-shaped eye mask and rainbow-banded triangular bill.
  - **The Cockatoo / Parrot**, expressive fanning crest, hooked parrot bill, and cheek blush.
  - **The Robin / Bluebird**, plump songbird with a warm orange breast bib and white eye ring.
  - **The Kingfisher (Woodpecker)**, stout with a sharp spear beak, dagger crest, and white collar.
  - **The Pigeon (Dove)**, deep breast with iridescent neck sheen and wing bars.
  - **The Borb (Wren/Chickadee)**, ultra-round with a cocked-up tail and contrast cheek patch.
- **Minimal Straight Wire**: Clean, horizontal perch geometry where birds sit with dynamic individual hop & chirp physics.
- **Avian Micro-Animations**: Snap-action saccadic head twitches, gentle breathing fluff, tail twitches, and floating concentric chirp ripples on singing birds.
- **Interactive on Mobile & Desktop**: Tap individual birds to make them chirp and hop; tap the sky or press space to shuffle the flock.
- **Sun, Moon & Twilight Shading**: East → west progression with sunrise/sunset golden hour.

## Run locally

```bash
# any static server, for example:
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Opening `index.html` from disk works too.

## Deploy on Netlify

This is a static site. In the Netlify UI:

1. Import [egorkaway/wire-birds](https://github.com/egorkaway/wire-birds).
2. Leave the **build command** empty.
3. Set the **publish directory** to `.` (also set in `netlify.toml`).

## Files

| File | Role |
| --- | --- |
| `index.html` | Homepage: one wire, random flock |
| `catalog.html` | Every species on several scrollable wires |
| `birds.js` | Seeded generator, drawing, and day/night clock |
| `netlify.toml` | Publish the repo root as-is |

The hash in the URL (`#123`) is the flock seed. The sky keeps moving forward from whatever time you were already in.
