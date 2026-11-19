// Neon Coast Cover Studio — the program that hands the entry in (Node 22,
// standard library only). It copies this repository's app/ and screenshots/
// beside it into /output and writes /output/dossier.json with the vendored
// make.fun library, exactly as the kit's starter does. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The app itself is plain static files under app/: index.html plus ES modules,
// local OFL fonts and two sample photos, no build step and no network request.
// Screenshots are the app's own drawings: 1-cover.jpg is a landscape cover
// the app rendered, 2-editor.jpg is the editor with photos loaded, and the
// other two are exported covers at square and portrait sizes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps, from the kit's reference: at most 4 screenshots of 256 KiB
// each, app/ at most 993 entries and 48 MiB, and the dossier text at most
// 160 KiB. buildDossier writes the dossier from the copied files, and the
// gate rebuilds it with the same library and compares the two byte for byte,
// so this program writes nothing else into /output.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
