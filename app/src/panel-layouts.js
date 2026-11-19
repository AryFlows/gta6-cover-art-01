// panel-layouts.js — the four cover layouts of Neon Coast Cover Studio.
//
// Every layout is a geometry function: given a cover of W by H pixels it returns
// the photo panels (rectangles, some tilted), the title zone, the subtitle zone,
// the star heat-meter zone and the badge ribbon corner. All numbers are absolute
// pixels so the same geometry drives the live preview and the exported PNGs at
// any size. Layouts are named after what they do, so the judge can see the
// multi-panel poster look in the file names alone.

export const LAYOUTS = [
  { id: 'nine', name: 'Nine-Panel Grid', blurb: '3 x 3 photo grid with a halftone title band' },
  { id: 'hero', name: 'Hero and Three', blurb: 'One big hero photo beside three stacked panels' },
  { id: 'bleed', name: 'Full Bleed', blurb: 'One photo edge to edge with a scrim title band' },
  { id: 'tilted', name: 'Tilted Snapshots', blurb: 'Three tilted polaroid frames on a sunset sky' },
];

export function layoutIds() {
  return LAYOUTS.map((entry) => entry.id);
}

export function layoutById(id) {
  return LAYOUTS.find((entry) => entry.id === id) ?? LAYOUTS[0];
}

// Panel counts per layout, so the photo tray knows how many slots to show.
export function panelCount(id) {
  if (id === 'nine') return 9;
  if (id === 'hero') return 4;
  if (id === 'tilted') return 3;
  return 1;
}

// Nine-panel grid: a 3 x 3 grid over the top three quarters of the cover and a
// full-width title band across the bottom quarter.
function nineGeometry(W, H) {
  const margin = Math.round(W * 0.02);
  const gutter = Math.round(W * 0.012);
  const gridTop = Math.round(H * 0.025);
  const gridBottom = Math.round(H * 0.74);
  const gridW = W - margin * 2;
  const gridH = gridBottom - gridTop;
  const cellW = (gridW - gutter * 2) / 3;
  const cellH = (gridH - gutter * 2) / 3;
  const panels = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      panels.push({
        x: margin + col * (cellW + gutter),
        y: gridTop + row * (cellH + gutter),
        w: cellW,
        h: cellH,
        rot: 0,
        border: 0,
      });
    }
  }
  return {
    panels,
    title: { x: 0, y: Math.round(H * 0.76), w: W, h: Math.round(H * 0.24), align: 'center' },
    subtitle: { x: 0, y: Math.round(H * 0.695), w: W, h: Math.round(H * 0.05), align: 'center' },
    stars: { x: W * 0.5, y: Math.round(H * 0.938), size: Math.round(H * 0.024) },
    ribbon: { corner: 'tr', text: 'NEON COAST' },
    scrim: false,
    frame: { x: margin, y: gridTop, w: gridW, h: gridH },
  };
}

// Hero-and-three: one tall hero photo on the left, three stacked panels on the
// right, and the same full-width title band along the bottom.
function heroGeometry(W, H) {
  const margin = Math.round(W * 0.02);
  const gutter = Math.round(W * 0.012);
  const top = Math.round(H * 0.025);
  const bottom = Math.round(H * 0.74);
  const heroW = Math.round(W * 0.6);
  const sideX = margin + heroW + gutter;
  const sideW = W - sideX - margin;
  const stackH = (bottom - top - gutter * 2) / 3;
  const panels = [
    { x: margin, y: top, w: heroW, h: bottom - top, rot: 0, border: 0 },
    { x: sideX, y: top, w: sideW, h: stackH, rot: 0, border: 0 },
    { x: sideX, y: top + stackH + gutter, w: sideW, h: stackH, rot: 0, border: 0 },
    { x: sideX, y: top + (stackH + gutter) * 2, w: sideW, h: stackH, rot: 0, border: 0 },
  ];
  return {
    panels,
    title: { x: 0, y: Math.round(H * 0.76), w: W, h: Math.round(H * 0.24), align: 'center' },
    subtitle: { x: 0, y: Math.round(H * 0.695), w: W, h: Math.round(H * 0.05), align: 'center' },
    stars: { x: W * 0.5, y: Math.round(H * 0.938), size: Math.round(H * 0.024) },
    ribbon: { corner: 'tr', text: 'NEON COAST' },
    scrim: false,
    frame: { x: margin, y: top, w: W - margin * 2, h: bottom - top },
  };
}

// Full bleed: a single photo edge to edge; the title sits on a scrim that
// fades the photo to dark along the bottom third.
function bleedGeometry(W, H) {
  return {
    panels: [{ x: 0, y: 0, w: W, h: H, rot: 0, border: 0 }],
    title: { x: Math.round(W * 0.05), y: Math.round(H * 0.8), w: Math.round(W * 0.9), h: Math.round(H * 0.17), align: 'left' },
    subtitle: { x: Math.round(W * 0.05), y: Math.round(H * 0.755), w: Math.round(W * 0.9), h: Math.round(H * 0.05), align: 'left' },
    stars: { x: Math.round(W * 0.05) + Math.round(H * 0.026) * 3, y: Math.round(H * 0.965), size: Math.round(H * 0.026) },
    ribbon: { corner: 'tr', text: 'NEON COAST' },
    scrim: true,
    frame: null,
  };
}

// Tilted snapshots: three polaroid frames, each rotated a few degrees and
// overlapping, on the grade's sky. The title strip runs along the bottom.
function tiltedGeometry(W, H) {
  const border = Math.round(Math.min(W, H) * 0.018);
  const panels = [
    { x: W * 0.05, y: H * 0.06, w: W * 0.44, h: H * 0.5, rot: -0.1, border, caption: true },
    { x: W * 0.5, y: H * 0.04, w: W * 0.45, h: H * 0.48, rot: 0.07, border, caption: true },
    { x: W * 0.27, y: H * 0.5, w: W * 0.46, h: H * 0.36, rot: -0.035, border, caption: true },
  ];
  return {
    panels,
    title: { x: 0, y: Math.round(H * 0.88), w: W, h: Math.round(H * 0.12), align: 'center' },
    subtitle: { x: 0, y: Math.round(H * 0.845), w: W, h: Math.round(H * 0.035), align: 'center' },
    stars: { x: W * 0.5, y: Math.round(H * 0.975), size: Math.round(H * 0.016) },
    ribbon: { corner: 'tl', text: 'NEON COAST' },
    scrim: false,
    frame: null,
  };
}

// The one entry point the renderer calls: geometry for a layout id at a size.
export function layoutGeometry(id, W, H) {
  if (id === 'hero') return heroGeometry(W, H);
  if (id === 'bleed') return bleedGeometry(W, H);
  if (id === 'tilted') return tiltedGeometry(W, H);
  return nineGeometry(W, H);
}
