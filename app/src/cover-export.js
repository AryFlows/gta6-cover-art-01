// cover-export.js — the one place a cover is drawn. renderCover(state, W, H)
// paints the whole poster onto a fresh canvas: cream mount, photo panels
// with the sunset grade, sun and palms over the photo field, then the
// caption band with its halftone texture and big type, a vignette, grain
// and a neon frame. The editor preview and the exported PNG both come
// through here, so what you see is exactly what you share.

import { layoutPanels, gutterFor, CAPTION_BAND, captionBandRect } from './panel-layouts.js';
import { gradeById, paintGradeOverlay } from './sunset-grade.js';
import { drawCovered } from './photo-crop.js';
import { drawCaption } from './bold-lettering.js';
import { drawHalftoneBand } from './halftone-title.js';
import { drawSun, drawPalm, drawVignette, drawGrain, drawNeonFrame } from './neon-effects.js';

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

export function sizeById(id) {
  return EXPORT_SIZES.find((size) => size.id === id) ?? EXPORT_SIZES[2];
}

function drawPhotoPlaceholder(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#ffb347');
  g.addColorStop(1, '#7b2ff7');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = `bold ${Math.round(Math.min(w, h) * 0.07)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
}

export function renderCover(state, W, H) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const g = gutterFor(W);
  const photoH = H * (1 - CAPTION_BAND);

  // Cream mount: the gutters and outer edge read as a poster mount.
  ctx.fillStyle = '#fff3e0';
  ctx.fillRect(0, 0, W, H);

  const panels = layoutPanels(state.layout, W, H);
  panels.forEach((p, i) => {
    const px = p.x + g / 2;
    const py = p.y + g / 2;
    const pw = p.w - g;
    const ph = p.h - g;
    const slot = state.crops[i];
    const photo = slot ? state.photos.find((item) => item.id === slot.photoId) : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (photo && photo.img && photo.img.complete && photo.img.naturalWidth > 0) {
      ctx.filter = grade.filter;
      drawCovered(ctx, photo.img, px, py, pw, ph, slot.crop);
      ctx.filter = 'none';
      paintGradeOverlay(ctx, px, py, pw, ph, grade);
    } else {
      drawPhotoPlaceholder(ctx, px, py, pw, ph);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 243, 224, 0.9)';
    ctx.lineWidth = Math.max(2, g / 2);
    ctx.strokeRect(px, py, pw, ph);
  });

  // Sun and palms over the photo field, up in the corners. The sun stays
  // small and tucked into the corner so it reads as sky, never as a
  // sticker over someone's face; the palms stand fully inside the frame.
  const sunR = Math.round(Math.min(W, H) * 0.058);
  drawSun(ctx, W - sunR * 1.05, sunR * 1.05, sunR);
  const palmScale = Math.min(W, H) / 720;
  drawPalm(ctx, Math.round(W * 0.035), Math.round(photoH * 0.94), palmScale);
  drawPalm(ctx, Math.round(W * 0.925), Math.round(photoH * 0.96), palmScale * 0.8);

  // Caption band: sunset wash and big type, then a halftone drift across
  // the top of the band so the title sits on texture.
  drawCaption(ctx, W, H, state.caption, state.subcaption);
  const band = captionBandRect(W, H);
  drawHalftoneBand(ctx, band.x, band.y, band.w, band.h * 0.38, {
    spacing: 12,
    maxR: 5,
    colour: 'rgba(255, 255, 255, 0.34)',
    fx: W * 0.5,
    fy: band.y,
  });

  drawVignette(ctx, W, H);
  drawGrain(ctx, W, H, 20261119);
  drawNeonFrame(ctx, W, H);
  return canvas;
}

// Renders the cover at full export size and downloads it as a PNG.
export function exportPNG(state, sizeId) {
  return new Promise((resolve) => {
    const size = sizeById(sizeId);
    const canvas = renderCover(state, size.w, size.h);
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-coast-cover-${size.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve(true);
    }, 'image/png');
  });
}
