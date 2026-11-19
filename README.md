# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/AryFlows/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/AryFlows/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Coast Cover Studio** — a GTA-style cover art maker: your photo and a caption become a multi-panel poster with a Vice City sunset or neon colour grade, exported as a PNG to share. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **4 layouts** — nine-panel grid with a halftone title band, hero-and-three, full-bleed, and tilted polaroid snapshots.
- **6 grades** — Vice Sunset, Neon Nights, Hot Pink, Teal Noir, Golden Hour, Midnight Mono gradient-map colour grades.
- **Any photo** — add your own photos, crop and position each panel (drag to pan, slider to zoom), fill several panels with one photo or several.
- **Lettering** — Anton title, Pacifico neon script subtitle, 1–5 star heat meter, badge ribbon, footer line.
- **Finish** — halftone title block, film grain, vignette, neon glow frame.
- **Export** — one click saves all three post sizes: 1080 × 1080, 1080 × 1350 and 1920 × 1080 PNG.

## Run it

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

No build step, no network: every script, font and sample photo is a file under `app/`, and your photos are read on your own machine, never uploaded.

## Originality

No Rockstar Games logo, wordmark, artwork, character or font. The fonts are Anton, Bebas Neue and Pacifico, all under the SIL Open Font License — see `app/fonts/OFL.txt`, `OFL-BebasNeue.txt` and `OFL-Pacifico.txt`. The two sample photos under `app/samples/` were made with an image model for make.fun and are free to use.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
