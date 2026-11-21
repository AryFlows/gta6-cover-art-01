// embed-fonts.mjs — embeds the three cover fonts as base64 data URIs in
// app/fonts/fonts-embedded.css so the repo ships no binary .ttf files.
// Reads the fonts from /tmp/r6-fonts/ (downloaded from the google/fonts
// repository) and writes exactly one @font-face rule per font, each base64
// payload on a single unbroken line. Deterministic: the same input bytes
// always produce the same output bytes.

import { readFileSync, writeFileSync } from 'node:fs';

const FONT_DIR = '/tmp/r6-fonts';
const OUT = '/home/hatch/workspace/makefun/gta6-cover-art-01/app/fonts/fonts-embedded.css';

const FONTS = [
  { family: 'BebasNeue', file: 'BebasNeue-Regular.ttf' },
  { family: 'Anton', file: 'Anton-Regular.ttf' },
  { family: 'Pacifico', file: 'Pacifico-Regular.ttf' },
];

const blocks = FONTS.map(({ family, file }) => {
  const base64 = readFileSync(`${FONT_DIR}/${file}`).toString('base64');
  return `@font-face {\n  font-family: '${family}';\n  src: url(data:font/ttf;base64,${base64}) format('truetype');\n  font-display: swap;\n}`;
});

writeFileSync(OUT, blocks.join('\n') + '\n');
console.log(`wrote ${OUT}`);
