// halftone-title.js — the halftone title block.
//
// GTA poster art inks its title over a field of halftone dots, so the title
// block here is a dark band whose top edge dissolves into dots: big dots where
// the band is solid, shrinking to nothing as the band fades into the photos.
// The dots are drawn with plain canvas arcs, no image asset, so the block
// scales cleanly from the preview to a 1920-pixel export.

const INK = '#160a24';

// Paints the title band: a solid dark rectangle with a halftone dot field
// along its top edge, fading upward into the panels above it.
export function drawHalftoneTitleBlock(ctx, zone, opts = {}) {
  const { x, y, w, h } = zone;
  const dotColor = opts.dotColor ?? INK;
  const gap = opts.gap ?? Math.max(10, Math.round(h * 0.09));
  const fadeH = opts.fadeH ?? Math.round(h * 0.42);
  const bandTop = y + fadeH;
  ctx.save();
  ctx.fillStyle = dotColor;
  ctx.fillRect(x, bandTop, w, h - fadeH);
  // Dot rows: radius grows as the row nears the solid band, so the edge reads
  // as print dots rather than a hard line.
  const rows = Math.max(2, Math.floor(fadeH / gap));
  for (let row = 0; row < rows; row += 1) {
    const cy = y + (row + 0.5) * (fadeH / rows);
    const depth = 1 - row / rows;
    const radius = Math.max(0.6, (gap * 0.42) * depth);
    const offset = row % 2 === 0 ? 0 : gap / 2;
    for (let cx = x + offset + gap / 2; cx < x + w; cx += gap) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// A scrim for the full-bleed layout: the photo fades to dark along the bottom
// third so the title stays readable without a solid band.
export function drawTitleScrim(ctx, W, H, fromY) {
  const scrim = ctx.createLinearGradient(0, fromY, 0, H);
  scrim.addColorStop(0, 'rgba(10,4,20,0)');
  scrim.addColorStop(0.55, 'rgba(10,4,20,0.55)');
  scrim.addColorStop(1, 'rgba(10,4,20,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, fromY, W, H - fromY);
}

// A standalone halftone strip, used as a divider under the title or above the
// footer line: one row of dots shrinking left to right, like a print fade.
export function drawHalftoneStrip(ctx, x, y, w, gap, color) {
  const n = Math.max(2, Math.floor(w / gap));
  ctx.save();
  ctx.fillStyle = color ?? '#ffffff';
  for (let i = 0; i < n; i += 1) {
    const depth = 1 - i / n;
    const radius = Math.max(0.7, (gap * 0.4) * depth);
    ctx.beginPath();
    ctx.arc(x + i * gap + gap / 2, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
