# Wire Birds

A small generative sketch: colorful, minimal birds perched on a straight wire. Each shuffle builds a new flock in vanilla JavaScript on a `<canvas>` — no build step, no libraries.

Open `index.html` locally, or drop the repo on [Netlify](https://www.netlify.com/). Click or press space for a new lineup.

## What’s on the wire

- **Flock size** from a single owl up to several birds, with uneven gaps so they never overlap.
- **One owl**, always, looking at you.
- **A crow or a seagull** when there is more than one bird. The crow is assembled from triangles; seagulls come in three looks — herring, hooded, and black-backed.
- Some of the others face the viewer.
- **Sun and moon** travel east → west. Shuffle always moves time forward, so day turning into night goes through sunset, and night turning into day goes through sunrise. The sun stays gold, warming only as it nears the horizon.

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
