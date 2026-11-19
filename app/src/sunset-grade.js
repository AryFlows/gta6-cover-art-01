// sunset-grade.js — the sunset and neon colour grades.
//
// A grade is a small palette: a sky gradient for bare backgrounds, a warm wash
// that rises from the bottom of the cover, and an overlay tint that pushes the
// photos toward the grade's mood. Grades are applied as canvas gradients with
// blend modes, never as a filter on the photo itself, so the export stays fast
// at 1920 x 1080 and the same code grades the preview and the PNG.

export const GRADES = [
  {
    id: 'vice', name: 'Vice Sunset', swatch: 'linear-gradient(135deg,#2b1055,#ff7e5f,#feb47b)',
    skyTop: '#2b1055', skyBottom: '#ff7e5f',
    washTop: 'rgba(255,126,95,0)', washBottom: 'rgba(255,94,98,0.55)',
    tint: 'rgba(255,110,90,0.20)', tintMode: 'overlay', warm: 0.5,
  },
  {
    id: 'neon', name: 'Neon Nights', swatch: 'linear-gradient(135deg,#0f0524,#ff2e88,#00e5ff)',
    skyTop: '#0f0524', skyBottom: '#3b0a6e',
    washTop: 'rgba(255,46,136,0)', washBottom: 'rgba(255,46,136,0.5)',
    tint: 'rgba(0,229,255,0.16)', tintMode: 'overlay', warm: 0.35,
  },
  {
    id: 'pink', name: 'Hot Pink', swatch: 'linear-gradient(135deg,#3d0a3d,#ff2e88,#ff8ac2)',
    skyTop: '#3d0a3d', skyBottom: '#ff2e88',
    washTop: 'rgba(255,46,136,0)', washBottom: 'rgba(255,46,136,0.55)',
    tint: 'rgba(255,46,136,0.22)', tintMode: 'soft-light', warm: 0.45,
  },
  {
    id: 'teal', name: 'Teal Noir', swatch: 'linear-gradient(135deg,#04263b,#0e7c86,#f2c14e)',
    skyTop: '#04263b', skyBottom: '#0e7c86',
    washTop: 'rgba(14,124,134,0)', washBottom: 'rgba(242,193,78,0.4)',
    tint: 'rgba(14,124,134,0.20)', tintMode: 'overlay', warm: 0.3,
  },
  {
    id: 'gold', name: 'Golden Hour', swatch: 'linear-gradient(135deg,#3b1d05,#ff9a3d,#ffd76e)',
    skyTop: '#3b1d05', skyBottom: '#ff9a3d',
    washTop: 'rgba(255,154,61,0)', washBottom: 'rgba(255,154,61,0.55)',
    tint: 'rgba(255,180,80,0.22)', tintMode: 'soft-light', warm: 0.6,
  },
  {
    id: 'mono', name: 'Midnight Mono', swatch: 'linear-gradient(135deg,#0a0a0f,#3a3a4a,#c9c9d6)',
    skyTop: '#0a0a0f', skyBottom: '#3a3a4a',
    washTop: 'rgba(120,120,150,0)', washBottom: 'rgba(120,120,150,0.4)',
    tint: 'rgba(90,90,120,0.18)', tintMode: 'overlay', warm: 0.15,
  },
];

export function gradeById(id) {
  return GRADES.find((entry) => entry.id === id) ?? GRADES[0];
}

// Paints a grade's sky behind a layout that leaves background showing
// (the tilted snapshots) or behind an empty photo panel.
export function paintGradeSky(ctx, grade, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.skyTop);
  sky.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
}

// Pushes the finished photo layer toward the grade: a warm wash rising from
// the bottom, then the grade tint blended over the whole cover.
export function applySunsetGrade(ctx, grade, W, H) {
  const wash = ctx.createLinearGradient(0, H * 0.35, 0, H);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = grade.tintMode;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Grades a single panel rect instead of the whole cover: the same wash and
// tint, clipped to the panel, so a grid keeps one consistent mood even when
// its photos come from different places. The cover-level pass in
// applySunsetGrade still runs after, at a lighter hand, to tie the panels
// together with the title band.
export function gradePanel(ctx, grade, rect) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const wash = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = grade.tintMode;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
