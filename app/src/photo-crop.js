// photo-crop.js — how a photo sits inside a panel. Every panel keeps its
// own crop: a zoom factor and a pan offset in panel pixels. The photo is
// drawn cover-fit (it always fills the panel, never letterboxes), then the
// zoom and pan are applied, clamped so the photo can never be dragged far
// enough to show empty panel behind it.

export function defaultCrop() {
  // focusY biases the first framing toward the top of the photo (0 is the
  // very top, 0.5 is centred): faces usually sit in the upper half, and a
  // short wide panel would otherwise cut them off.
  return { scale: 1, ox: 0, oy: 0, focusY: 0.3 };
}

export function clampCrop(crop) {
  return {
    scale: Math.min(4, Math.max(1, crop.scale || 1)),
    ox: Math.min(10000, Math.max(-10000, crop.ox || 0)),
    oy: Math.min(10000, Math.max(-10000, crop.oy || 0)),
    focusY: Math.min(1, Math.max(0, crop.focusY ?? 0.3)),
  };
}

export function drawCovered(ctx, img, x, y, w, h, crop) {
  const safe = clampCrop(crop);
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * safe.scale;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  let dx = x + (w - dw) / 2 + safe.ox;
  let dy = y + (h - dh) * safe.focusY + safe.oy;
  // Keep the photo covering the panel on every side.
  dx = Math.min(x, Math.max(x + w - dw, dx));
  dy = Math.min(y, Math.max(y + h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}
