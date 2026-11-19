// Photo crop: which photo fills each panel, and how it sits inside it.
//
// A placement holds a photo index plus a zoom (1 to 3) and a pan offset
// (ox, oy in -1..1). The renderer cover-fits the photo into its panel, then
// zooms around the offset point; dragging the preview pans the photo, and
// the slider zooms the selected panel. At zoom 1 the photo already fills the
// panel edge to edge, so there is nothing to pan — by design.

/** Fresh placements for `count` panels: no photo yet, zoom 1, centred. */
export function createPlacements(count) {
  return Array.from({ length: count }, () => ({ photo: -1, zoom: 1, ox: 0, oy: 0 }));
}

/**
 * The source rectangle of a photo (in its own pixels) that cover-fits a
 * panel of panelW x panelH at the placement's zoom and pan. Draw it with
 * drawImage(img, sx, sy, sw, sh, panelX, panelY, panelW, panelH).
 */
export function coverSourceRect(photoW, photoH, panelW, panelH, placement) {
  const zoom = placement.zoom || 1;
  const scale = Math.max(panelW / photoW, panelH / photoH) * zoom;
  const sw = Math.min(photoW, panelW / scale);
  const sh = Math.min(photoH, panelH / scale);
  const slackX = Math.max(0, photoW - sw);
  const slackY = Math.max(0, photoH - sh);
  const sx = Math.min(Math.max(0, (photoW - sw) / 2 + (placement.ox || 0) * slackX * 0.5), slackX);
  // Faces sit in the upper half of most photos: while the user has not
  // panned, bias the window a little toward the top, fading to nothing as
  // they pan toward either edge, so a head is not the first thing cropped.
  const oy = placement.oy || 0;
  const topBias = 0.15 * (1 - Math.abs(oy));
  const sy = Math.min(Math.max(0, slackY * (0.5 + oy * 0.5 - topBias)), slackY);
  return { sx, sy, sw, sh };
}

/**
 * Pans a placement by a drag of dx, dy canvas pixels inside a panel of
 * panelW x panelH. The pan is scaled by the zoomed photo's slack, so a drag
 * across the whole panel pans the photo edge to edge.
 */
export function panPlacement(placement, dx, dy, panelW, panelH) {
  const zoom = placement.zoom || 1;
  placement.ox = clamp(placement.ox + (dx / panelW) * 2 * zoom, -1, 1);
  placement.oy = clamp(placement.oy + (dy / panelH) * 2 * zoom, -1, 1);
  return placement;
}

/** Points a panel at a photo (photoIndex -1 empties it). */
export function assignPhoto(placements, panelIndex, photoIndex) {
  if (placements[panelIndex]) placements[panelIndex].photo = photoIndex;
  return placements;
}

/** Fills every panel with the same photo, keeping each panel's zoom. */
export function fillAllWith(placements, photoIndex) {
  for (const p of placements) p.photo = photoIndex;
  return placements;
}

/** Grows placements to `count` panels (new panels start empty). */
export function resizePlacements(placements, count) {
  while (placements.length < count) placements.push({ photo: -1, zoom: 1, ox: 0, oy: 0 });
  placements.length = count;
  return placements;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
