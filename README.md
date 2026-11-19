# Vice Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/AryFlows/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/AryFlows/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A GTA 6-style cover art maker for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01). Drop in your own photo, pick a multi-panel layout and a Vice City sunset grade, write your caption, and export a share-ready PNG — entirely offline, in your browser.

## What it does

- **Any photo** — add your own photos from your machine, or start from the two included samples. Click a photo to put it in the selected panel; click a panel to select it, drag to move its photo, zoom with the slider.
- **Four layouts** — Hero (one big photo), Duo (two tall panels), Triptych (three strips) and Collage (one tall panel, two stacked). One photo can fill every panel, or each panel can hold a different one.
- **Six sunset grades** — Vice Sunset, Neon Pink, Palm Gold, Midnight Neon, Teal Heat and Bubblegum. Each grade is a saturation/contrast filter plus a diagonal gradient wash, drawn on the canvas so the preview and the export match exactly.
- **Bold lettering** — a big BebasNeue caption with a dark outline and hot-pink glow, a Pacifico sub-caption, halftone dots, a low sun, palm silhouettes and a neon frame.
- **Fast and easy** — five steps from a photo to a PNG in 1080×1080, 1080×1350 or 1920×1080. The PNG is drawn fresh at full size.

## How it is built

- `app/index.html` + `app/style.css` — the bright, warm editor (light theme on purpose: the cover art does the shouting).
- `app/src/main.js` — boot, photo library, panel selection and drag-to-pan.
- `app/src/panel-layouts.js` — the four layouts and the caption band they reserve.
- `app/src/sunset-grade.js` — the six grades (filter + gradient wash).
- `app/src/photo-crop.js` — cover-fit drawing with per-panel zoom and pan.
- `app/src/bold-lettering.js` — the big caption and the script sub-caption.
- `app/src/halftone-title.js` — halftone dot fields behind the title.
- `app/src/neon-effects.js` — sun, palms, vignette, deterministic grain, neon frame.
- `app/src/cover-export.js` — `renderCover`, the one place a cover is drawn, and the PNG export.
- `app/src/shots.js` — screenshot mode: the four screenshots are driven by URL params, so they are the app's own drawing.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. It clears only the output directory's contents, never the directory itself (the grader mounts it).

## Run it

Serve `app/` with any static server and open `index.html` — no build step, no network:

```sh
node serve.ts
# open http://localhost:8080
```

Hand the entry in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

The four screenshots are the app's own drawing, driven by URL params
(`app/src/shots.js`) — never an edit or a composite:

1. `1-cover.jpg` — the wide 1920×1080 cover: Collage layout, Pier photo, Vice Sunset grade.
2. `2-editor.jpg` — the editor at work: Duo layout, Boulevard photo, Neon Pink grade, caption being edited.
3. `3-cover-square.jpg` — the square 1080×1080 cover: Triptych layout, Palm Gold grade.
4. `4-cover-portrait.jpg` — the portrait 1080×1350 cover: Hero layout, Midnight Neon grade.

## Fonts

Bebas Neue, Anton and Pacifico, all under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`). No Rockstar logo, artwork or font is used anywhere.
