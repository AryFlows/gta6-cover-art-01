// cover-export.js — renders the cover and exports the PNGs.
//
// renderCover is the one function that paints a cover: it takes the editor
// state and a canvas at any size, and draws the layout's panels, the grade,
// the halftone title block, the lettering, the heat meter, the ribbon and the
// print finish, in that order. The live preview calls it at preview size; the
// export calls it at 1080 x 1080, 1080 x 1350 and 1920 x 1080, so what the
// screenshots show is exactly what the PNGs hold.

import { layoutGeometry } from './panel-layouts.js';
import { gradeById, paintGradeSky, applySunsetGrade, gradePanel } from './sunset-grade.js';
import { drawHalftoneTitleBlock, drawTitleScrim } from './halftone-title.js';
import { drawCoverTitle, drawNeonSubtitle, drawStars, drawRibbon, drawFooterLine } from './bold-lettering.js';
import { drawCroppedPhoto } from './photo-crop.js';
import { drawGrain, drawVignette, drawGlowFrame } from './neon-effects.js';

export const SIZES = [
  { id: 'square', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
];

// Which photo a slot shows: in fill-one mode every slot shows the first photo;
// in per-panel mode each slot shows its own assigned photo.
export function resolvePhoto(state, slotIndex) {
  if (!state.photos || state.photos.length === 0) return null;
  if (state.fillOne) return state.photos[0].img;
  const slot = state.slots[slotIndex];
  const index = slot ? slot.photo % state.photos.length : 0;
  return state.photos[index].img;
}

// Draws one polaroid frame: a white border rotated with the panel, the photo
// inset inside it, and a small caption strip along the bottom.
function drawPolaroid(ctx, photo, rect, transform, caption) {
  const b = rect.border || 0;
  ctx.save();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate(rect.rot || 0);
  ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
  ctx.fillStyle = '#fdfbf7';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = b * 0.9;
  ctx.shadowOffsetY = b * 0.35;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  const inner = {
    x: rect.x + b,
    y: rect.y + b,
    w: rect.w - b * 2,
    h: rect.h - b * 3.4,
    rot: rect.rot || 0,
  };
  drawCroppedPhoto(ctx, photo, inner, transform);
  if (caption) {
    ctx.save();
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(rect.rot || 0);
    ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    ctx.fillStyle = '#2b2b33';
    ctx.font = `400 ${Math.max(12, b * 1.1)}px "Bebas Neue", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(caption.toUpperCase(), rect.x + rect.w / 2, rect.y + rect.h - b * 1.25);
    ctx.restore();
  }
}

// Paints the whole cover onto the canvas at its own size. The order matters:
// sky, panels, per-panel grade, whole-cover grade, title scrim or halftone
// band, lettering, ribbon, then the print finish (grain, vignette, glow frame).
export function renderCover(canvas, state, W, H) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const geo = layoutGeometry(state.layout, W, H);
  paintGradeSky(ctx, grade, W, H);
  geo.panels.forEach((panel, i) => {
    const slot = state.slots[i] ?? { photo: 0, zoom: 1, dx: 0, dy: 0 };
    const photo = resolvePhoto(state, i);
    if (panel.border) {
      const name = photo && state.photos[slot.photo % state.photos.length]
        ? state.photos[slot.photo % state.photos.length].name.replace(/\.[^.]+$/, '')
        : '';
      drawPolaroid(ctx, photo, panel, slot, name);
    } else {
      drawCroppedPhoto(ctx, photo, panel, slot);
    }
    if (photo) gradePanel(ctx, grade, panel);
  });
  if (geo.frame) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.strokeRect(geo.frame.x, geo.frame.y, geo.frame.w, geo.frame.h);
    ctx.restore();
  }
  applySunsetGrade(ctx, grade, W, H);
  if (geo.scrim) {
    drawTitleScrim(ctx, W, H, Math.round(H * 0.62));
  } else {
    drawHalftoneTitleBlock(ctx, geo.title);
  }
  drawNeonSubtitle(ctx, state.subtitle, geo.subtitle);
  drawCoverTitle(ctx, state.title, geo.title);
  drawStars(ctx, geo.stars.x, geo.stars.y, geo.stars.size, state.heat);
  if (state.layout === 'nine' || state.layout === 'hero') {
    drawFooterLine(ctx, state.footer, geo.title.x + geo.title.w / 2, geo.title.y + geo.title.h * 0.90, geo.title.w * 0.8, Math.round(H * 0.016));
  }
  if (state.badge) drawRibbon(ctx, W, H, geo.ribbon.corner, geo.ribbon.text);
  if (state.grain) drawGrain(ctx, W, H, 0.07);
  if (state.vignette) drawVignette(ctx, W, H, 0.42);
  drawGlowFrame(ctx, W, H);
  return canvas;
}

// Renders one size offscreen and returns its PNG blob.
export function exportPNG(state, size) {
  const canvas = document.createElement('canvas');
  renderCover(canvas, state, size.w, size.h);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('export failed'))), 'image/png');
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Exports one size as a PNG download.
export async function exportSize(state, sizeId) {
  const size = SIZES.find((entry) => entry.id === sizeId) ?? SIZES[0];
  const blob = await exportPNG(state, size);
  downloadBlob(blob, `neon-coast-${size.id}-${size.w}x${size.h}.png`);
  return blob;
}

// Exports all three post sizes at once: the one-click path from a photo to
// share-ready PNGs.
export async function exportAllSizes(state, onEach) {
  const made = [];
  for (const size of SIZES) {
    const blob = await exportPNG(state, size);
    downloadBlob(blob, `neon-coast-${size.id}-${size.w}x${size.h}.png`);
    made.push({ size, blob });
    if (onEach) onEach(size, blob);
  }
  return made;
}
