// photo-crop.js — per-panel photo crop and position.
//
// Every panel holds one photo plus a crop transform: a zoom level and a pan
// offset in panel pixels. The photo is drawn cover-fit inside its panel (the
// panel is always filled, the photo is never stretched), then zoomed about the
// panel centre and panned by the offsets. Dragging the preview pans the
// selected panel; the zoom slider zooms it. One photo can fill every panel,
// or each panel can hold a different photo.

export function defaultTransform() {
  return { photo: 0, zoom: 1, dx: 0, dy: 0 };
}

// Builds the slot list for a layout: one transform per panel, all starting on
// the first photo. When the layout changes the caller re-seeds the slots from
// this, keeping the photos the user already picked where the counts line up.
export function defaultSlots(count, photoCount) {
  const slots = [];
  for (let i = 0; i < count; i += 1) {
    slots.push({ photo: photoCount > 0 ? i % photoCount : 0, zoom: 1, dx: 0, dy: 0 });
  }
  return slots;
}

// Clamps a pan so the photo can never be dragged out of its panel: at the
// current zoom the photo must still cover the whole panel.
export function clampTransform(transform, photo, rect) {
  if (!photo || !photo.naturalWidth) return transform;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const pw = photo.naturalWidth * base * transform.zoom;
  const ph = photo.naturalHeight * base * transform.zoom;
  const maxDx = Math.max(0, (pw - rect.w) / 2);
  const maxDy = Math.max(0, (ph - rect.h) / 2);
  return {
    ...transform,
    zoom: Math.min(3, Math.max(1, transform.zoom)),
    dx: Math.min(maxDx, Math.max(-maxDx, transform.dx)),
    dy: Math.min(maxDy, Math.max(-maxDy, transform.dy)),
  };
}

// Draws one photo into its panel with the panel's crop transform. When there
// is no photo yet the panel is left as a deep plum placeholder with a thin
// frame, so an empty cover still reads as a poster grid.
export function drawCroppedPhoto(ctx, photo, rect, transform) {
  if (!photo || !photo.naturalWidth) {
    ctx.save();
    ctx.fillStyle = '#2b1838';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = Math.max(1, rect.w * 0.004);
    ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
    ctx.restore();
    return;
  }
  const t = clampTransform(transform, photo, rect);
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const pw = photo.naturalWidth * base * t.zoom;
  const ph = photo.naturalHeight * base * t.zoom;
  const dx = rect.x + (rect.w - pw) / 2 + t.dx;
  const dy = rect.y + (rect.h - ph) / 2 + t.dy;
  ctx.save();
  if (rect.rot) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(rect.rot);
    ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
  }
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.restore();
}

// Hit test: which panel contains a point in cover pixels. Rotation is ignored
// on purpose — the tilted frames are hit by their upright bounding box, which
// is what a finger expects.
export function panelAtPoint(panels, px, py) {
  for (let i = panels.length - 1; i >= 0; i -= 1) {
    const r = panels[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}
