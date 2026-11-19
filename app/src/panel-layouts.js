// Panel layouts: where each photo panel sits on the cover.
//
// A layout is a list of panels in unit coordinates (x, y, w, h from 0 to 1).
// Each panel may carry a rotation in degrees (the tilted snapshots) and a
// role: 'hero' panels anchor the title block, 'backdrop' panels sit behind
// the snapshots in the tilted layout. Pixel rects come from panelsForLayout;
// panelAt answers "which panel is under this point" for click-to-select.

export const LAYOUTS = [
  { id: 'nine', label: 'Nine-panel grid' },
  { id: 'hero', label: 'Hero + three' },
  { id: 'bleed', label: 'Full-bleed' },
  { id: 'tilted', label: 'Tilted snapshots' },
];

const GUTTER = 0.014;

// Nine-panel grid: a 3 x 3 comic grid with thin white gutters.
function ninePanels() {
  const cells = [];
  const step = (1 - GUTTER * 4) / 3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      cells.push({
        x: GUTTER + col * (step + GUTTER),
        y: GUTTER + row * (step + GUTTER),
        w: step,
        h: step,
        role: row === 0 && col === 0 ? 'hero' : 'cell',
        rotate: 0,
      });
    }
  }
  return cells;
}

// Hero + three: one wide hero shot on top, three panels in a row below.
function heroPanels() {
  const third = (1 - GUTTER * 4) / 3;
  return [
    { x: GUTTER, y: GUTTER, w: 1 - GUTTER * 2, h: 0.6, role: 'hero', rotate: 0 },
    { x: GUTTER, y: 0.6 + GUTTER * 2, w: third, h: 1 - 0.6 - GUTTER * 3, role: 'cell', rotate: 0 },
    { x: GUTTER * 2 + third, y: 0.6 + GUTTER * 2, w: third, h: 1 - 0.6 - GUTTER * 3, role: 'cell', rotate: 0 },
    { x: GUTTER * 3 + third * 2, y: 0.6 + GUTTER * 2, w: third, h: 1 - 0.6 - GUTTER * 3, role: 'cell', rotate: 0 },
  ];
}

// Full-bleed: a single photo edge to edge; the title floats over it.
function bleedPanels() {
  return [{ x: 0, y: 0, w: 1, h: 1, role: 'hero', rotate: 0 }];
}

// Tilted snapshots: a dimmed full-bleed backdrop with four overlapping
// polaroid-style snapshots tossed across it at jaunty angles.
function tiltedPanels() {
  return [
    { x: 0, y: 0, w: 1, h: 1, role: 'backdrop', rotate: 0 },
    { x: 0.05, y: 0.06, w: 0.42, h: 0.44, role: 'snap', rotate: -6 },
    { x: 0.52, y: 0.04, w: 0.43, h: 0.42, role: 'snap', rotate: 5 },
    { x: 0.08, y: 0.52, w: 0.44, h: 0.42, role: 'snap', rotate: 4 },
    { x: 0.55, y: 0.54, w: 0.4, h: 0.4, role: 'snap', rotate: -5 },
  ];
}

const BUILDERS = { nine: ninePanels, hero: heroPanels, bleed: bleedPanels, tilted: tiltedPanels };

/** Unit panels for a layout id (falls back to the nine-panel grid). */
export function unitPanels(layoutId) {
  return (BUILDERS[layoutId] ?? ninePanels)();
}

/** Pixel rects for a layout on a canvas of W x H, in draw order. */
export function panelsForLayout(layoutId, W, H) {
  return unitPanels(layoutId).map((p) => ({
    x: p.x * W,
    y: p.y * H,
    w: p.w * W,
    h: p.h * H,
    role: p.role,
    rotate: p.rotate,
  }));
}

/** Index of the topmost panel containing point (px, py), or -1. */
export function panelAt(layoutId, px, py, W, H) {
  const panels = panelsForLayout(layoutId, W, H);
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const rad = (-p.rotate * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
    if (Math.abs(lx) <= p.w / 2 && Math.abs(ly) <= p.h / 2) return i;
  }
  return -1;
}
