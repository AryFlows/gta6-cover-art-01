// main.ts — hands the app in. Copies app/ and screenshots/ from beside this
// file to /output (or $MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with buildDossier from the vendored make.fun
// library. Node 22, standard library only; run twice, it writes the same
// bytes twice.
//
// One trap, learned the hard way: /output is a mounted volume in the
// grader, so this program must never remove the output directory itself —
// rmSync on a mount point throws EBUSY even with force:true and the run
// fails. It only clears the directory's contents, then copies the entry
// in, so a second run still produces a byte-identical dossier.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
for (const child of readdirSync(outDir)) {
  rmSync(join(outDir, child), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
console.log(`dossier.json: ${dossierBytes} bytes (cap 1572864)`);
