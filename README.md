# Wire Birds

A small generative sketch: colorful, minimal birds perched on a straight wire. Each shuffle builds a new flock in vanilla JavaScript on a `<canvas>` — no build step, no libraries.

Open `index.html` locally, or drop the repo on [Netlify](https://www.netlify.com/). Click or press space for a new lineup.

## What’s on the wire

- **Diverse Species Archetypes**:
  - **One Owl**, always, front-facing with large expressive eyes and ear tufts.
  - **The Crow**, assembled from sharp origami triangles with raven posture.
  - **Seagulls** in three looks — herring, hooded, and black-backed.
  - **The Borb (Wren/Chickadee)**, ultra-round with a cocked-up tail and contrast cheek patch.
  - **The Swallow (Swift)**, aerodynamic with scissor streamer tails and rust throat bib.
  - **The Kingfisher (Woodpecker)**, stout with a sharp spear beak, dagger crest, and white collar.
  - **The Pigeon (Dove)**, deep breast with iridescent neck sheen and wing bars.
- **Minimal Straight Wire**: Clean, horizontal perch geometry where birds sit with dynamic individual hop & chirp physics.
- **Avian Micro-Animations**: Snap-action saccadic head twitches, gentle breathing fluff, tail twitches, and floating concentric chirp ripples on singing birds.
- **Interactive on Mobile & Desktop**: Tap individual birds to make them chirp and hop; tap the sky or press space to shuffle the flock.
- **Sun, Moon & Twilight Shading**: East → west progression with sunrise/sunset golden hour and moonlight rim highlights on bird silhouettes.

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
| `index.html` | Full-viewport page and caption |
| `birds.js` | Seeded generator, drawing, and day/night clock |
| `netlify.toml` | Publish the repo root as-is |

The hash in the URL (`#123`) is the flock seed. The sky keeps moving forward from whatever time you were already in.
