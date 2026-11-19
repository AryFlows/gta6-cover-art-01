// halftone-title.js — the print-shop halftone dot field. A grid of dots
// whose radius grows toward a focal point, the way old poster screens did
// it. Used as a fading dot field across the caption band and as a corner
// accent, so the title sits on texture instead of a flat wash.

export function drawHalftoneBand(ctx, x, y, w, h, opts = {}) {
  const spacing = opts.spacing ?? 14;
  const maxR = opts.maxR ?? 5.5;
  const colour = opts.colour ?? 'rgba(255, 255, 255, 0.5)';
  const fx = opts.fx ?? (x + w * 0.5);
  const fy = opts.fy ?? (y + h * 0.5);
  const falloff = opts.falloff ?? Math.max(w, h) * 0.75;

  ctx.save();
  ctx.fillStyle = colour;
  for (let gy = y + spacing / 2; gy < y + h; gy += spacing) {
    for (let gx = x + spacing / 2; gx < x + w; gx += spacing) {
      const d = Math.hypot(gx - fx, gy - fy);
      const t = Math.max(0, 1 - d / falloff);
      // Never let neighbouring dots merge into a blob.
      const r = Math.min(0.4 + t * t * maxR, spacing * 0.45);
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// A tight dot cluster for a corner accent: dots shrink away from the
// corner so the field dissolves into the photo.
export function drawHalftoneCorner(ctx, x, y, size, corner = 'tr') {
  const spacing = 12;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let gy = 0; gy < size; gy += spacing) {
    for (let gx = 0; gx < size; gx += spacing) {
      const px = corner.includes('r') ? x + size - gx : x + gx;
      const py = corner.includes('b') ? y + size - gy : y + gy;
      const d = Math.hypot(gx, gy);
      const r = Math.max(0.3, 4.5 - d / 22);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
