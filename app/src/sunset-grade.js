// sunset-grade.js — the six Vice City colour grades. A grade is two things:
// a CSS filter string applied while the photo is drawn (saturation,
// contrast, warmth) and a two-or-three-stop gradient washed over the photo
// afterwards with a blend mode, which is what gives the cover its sunset
// or neon feel. Both parts run in the canvas, so the editor preview and
// the exported PNG are graded exactly the same way.

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.4) contrast(1.1) brightness(1.03)',
    stops: [[0, '#ffb347'], [0.5, '#ff5e62'], [1, '#7b2ff7']],
    mode: 'soft-light',
    alpha: 0.58,
  },
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    filter: 'saturate(1.6) contrast(1.12) hue-rotate(-12deg)',
    stops: [[0, '#ff2e63'], [1, '#08d9d6']],
    mode: 'overlay',
    alpha: 0.5,
  },
  {
    id: 'palm-gold',
    name: 'Palm Gold',
    filter: 'saturate(1.25) contrast(1.05) sepia(0.25)',
    stops: [[0, '#f7b733'], [1, '#fc4a1a']],
    mode: 'soft-light',
    alpha: 0.5,
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    filter: 'saturate(1.5) contrast(1.15) brightness(0.94) hue-rotate(18deg)',
    stops: [[0, '#2b1055'], [1, '#7597de']],
    mode: 'overlay',
    alpha: 0.5,
  },
  {
    id: 'teal-heat',
    name: 'Teal Heat',
    filter: 'saturate(1.35) contrast(1.1)',
    stops: [[0, '#11998e'], [1, '#f857a6']],
    mode: 'soft-light',
    alpha: 0.5,
  },
  {
    id: 'bubblegum',
    name: 'Bubblegum',
    filter: 'saturate(1.7) contrast(1.05) brightness(1.05)',
    stops: [[0, '#ff9a9e'], [1, '#a18cd1']],
    mode: 'overlay',
    alpha: 0.4,
  },
];

export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) ?? GRADES[0];
}

// The diagonal wash a grade lays over a photo: warm at the top-left,
// cool at the bottom-right, so the sunset reads across the whole cover.
export function paintGradeOverlay(ctx, x, y, w, h, grade) {
  const wash = ctx.createLinearGradient(x, y, x + w, y + h);
  for (const [stop, colour] of grade.stops) wash.addColorStop(stop, colour);
  ctx.save();
  ctx.globalCompositeOperation = grade.mode;
  ctx.globalAlpha = grade.alpha;
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
