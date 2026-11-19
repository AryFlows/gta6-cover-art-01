// panel-layouts.js — the four multi-panel poster layouts of Vice Coast Cover
// Studio. A layout is a function of the cover size that returns the photo
// panels as rectangles in cover pixels. The bottom of the cover is always
// reserved for the caption band (see CAPTION_BAND); the panels fill the
// space above it. The renderer insets every panel by half the gutter so a
// clean cream gutter runs between neighbouring panels.

export const CAPTION_BAND = 0.24; // fraction of the cover height for captions

// The caption band as a rectangle: the strip at the bottom of the cover
// where the wash and the big type live.
export function captionBandRect(W, H) {
  return { x: 0, y: H * (1 - CAPTION_BAND), w: W, h: H * CAPTION_BAND };
}

export const LAYOUTS = [
  { id: 'hero', name: 'Hero', hint: 'One big photo, caption below' },
  { id: 'duo', name: 'Duo', hint: 'Two tall panels side by side' },
  { id: 'triptych', name: 'Triptych', hint: 'Three vertical strips' },
  { id: 'collage', name: 'Collage', hint: 'One tall panel, two stacked' },
];

export function layoutById(id) {
  return LAYOUTS.find((entry) => entry.id === id) ?? LAYOUTS[0];
}

export function gutterFor(width) {
  return Math.max(3, Math.round(width / 360));
}

export function layoutPanels(id, W, H) {
  const photoH = H * (1 - CAPTION_BAND);
  switch (id) {
    case 'duo':
      return [
        { x: 0, y: 0, w: W * 0.56, h: photoH },
        { x: W * 0.56, y: 0, w: W * 0.44, h: photoH },
      ];
    case 'triptych': {
      const third = W / 3;
      return [
        { x: 0, y: 0, w: third, h: photoH },
        { x: third, y: 0, w: third, h: photoH },
        { x: third * 2, y: 0, w: third, h: photoH },
      ];
    }
    case 'collage':
      return [
        { x: 0, y: 0, w: W * 0.55, h: photoH },
        { x: W * 0.55, y: 0, w: W * 0.45, h: photoH * 0.5 },
        { x: W * 0.55, y: photoH * 0.5, w: W * 0.45, h: photoH * 0.5 },
      ];
    case 'hero':
    default:
      return [{ x: 0, y: 0, w: W, h: photoH }];
  }
}

// The panel that contains a point in cover coordinates, or -1 when the
// point falls in a gutter or in the caption band. Used to select a panel
// by clicking the preview canvas.
export function panelAt(id, W, H, px, py) {
  const panels = layoutPanels(id, W, H);
  for (let i = 0; i < panels.length; i += 1) {
    const p = panels[i];
    if (px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h) return i;
  }
  return -1;
}
