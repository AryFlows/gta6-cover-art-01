// Sunset grades: gradient-map colour grades for the Vice City look.
//
// Each grade is a ramp of [luminance, red, green, blue] stops. A pixel's
// luminance is mapped through the ramp, so shadows take the deep colour and
// highlights the hot one — the classic duotone sunset treatment. Grades are
// baked once per photo into a graded canvas (gradedPhoto), which the panel
// renderer then crops and positions for free.

export const GRADES = [
  { id: 'vice', label: 'Vice Sunset' },
  { id: 'neon', label: 'Neon Nights' },
  { id: 'pink', label: 'Hot Pink' },
  { id: 'dusk', label: 'Palm Dusk' },
  { id: 'drive', label: 'Ocean Drive' },
  { id: 'chrome', label: 'Midnight Chrome' },
];

// [luminance 0..1, red, green, blue] — shadows first, highlights last.
const RAMPS = {
  vice: [
    [0.0, 26, 8, 46],
    [0.3, 94, 22, 96],
    [0.55, 214, 46, 120],
    [0.78, 255, 128, 64],
    [1.0, 255, 222, 138],
  ],
  neon: [
    [0.0, 6, 4, 28],
    [0.3, 58, 16, 120],
    [0.55, 178, 32, 190],
    [0.78, 255, 64, 160],
    [1.0, 190, 240, 255],
  ],
  pink: [
    [0.0, 40, 6, 42],
    [0.3, 122, 18, 92],
    [0.55, 232, 48, 130],
    [0.78, 255, 140, 130],
    [1.0, 255, 244, 230],
  ],
  dusk: [
    [0.0, 14, 18, 52],
    [0.3, 26, 84, 96],
    [0.55, 214, 130, 52],
    [0.78, 255, 178, 96],
    [1.0, 255, 240, 200],
  ],
  drive: [
    [0.0, 6, 34, 52],
    [0.3, 14, 110, 128],
    [0.55, 64, 190, 178],
    [0.78, 255, 120, 92],
    [1.0, 255, 228, 178],
  ],
  chrome: [
    [0.0, 22, 24, 34],
    [0.3, 70, 84, 112],
    [0.55, 150, 168, 196],
    [0.78, 214, 226, 238],
    [1.0, 244, 250, 255],
  ],
};

/** A 256-step lookup table for a grade: { r, g, b } Uint8Arrays. */
export function lutForGrade(gradeId) {
  const ramp = RAMPS[gradeId] ?? RAMPS.vice;
  const r = new Uint8Array(256);
  const g = new Uint8Array(256);
  const b = new Uint8Array(256);
  for (let level = 0; level < 256; level++) {
    const t = level / 255;
    let seg = 0;
    while (seg < ramp.length - 2 && t > ramp[seg + 1][0]) seg++;
    const [t0, r0, g0, b0] = ramp[seg];
    const [t1, r1, g1, b1] = ramp[seg + 1];
    const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    r[level] = Math.round(r0 + (r1 - r0) * f);
    g[level] = Math.round(g0 + (g1 - g0) * f);
    b[level] = Math.round(b0 + (b1 - b0) * f);
  }
  return { r, g, b };
}

/** Maps every pixel of `data` through the grade's lookup table, in place. */
export function applyGradeToPixels(data, gradeId) {
  const { r, g, b } = lutForGrade(gradeId);
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = r[lum];
    data[i + 1] = g[lum];
    data[i + 2] = b[lum];
  }
}

const gradedCache = new Map();

/**
 * The photo re-graded through `gradeId`, as a canvas capped at 1600 px on
 * its long side (grading a full 4000 px phone photo would stall the editor).
 * Cached per photo + grade, so a redraw only re-crops, never re-grades.
 */
export function gradedPhoto(img, gradeId) {
  const key = `${img.src}::${gradeId}`;
  const hit = gradedCache.get(key);
  if (hit) return hit;
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  applyGradeToPixels(frame.data, gradeId);
  ctx.putImageData(frame, 0, 0);
  if (gradedCache.size > 24) gradedCache.clear();
  gradedCache.set(key, canvas);
  return canvas;
}
