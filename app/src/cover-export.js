// Cover export: draws the whole cover and writes the PNGs.
//
// renderCover(canvas, state, photos) paints one cover at the canvas's own
// size: panels first (each photo graded, cropped and positioned), then the
// halftone title block, neon subtitle, heat meter and badge ribbon, then
// grain and vignette. exportCover renders offscreen at an exact post size
// and returns a PNG Blob; exportAllCovers renders all three post sizes at
// once, so one click gives the square, portrait and wide PNGs.

import { panelsForLayout } from './panel-layouts.js';
import { gradedPhoto } from './sunset-grade.js';
import { coverSourceRect } from './photo-crop.js';
import { drawTitleBlock } from './halftone-title.js';
import { drawNeonScript } from './bold-lettering.js';
import { drawGrain, drawVignette, drawHeatMeter, drawBadgeRibbon } from './neon-effects.js';

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

/** Paints one photo (already graded) into a panel rect, honouring rotation. */
function drawPanelPhoto(ctx, panel, graded, placement) {
  const src = coverSourceRect(graded.width, graded.height, panel.w, panel.h, placement);
  ctx.save();
  ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
  if (panel.rotate) ctx.rotate((panel.rotate * Math.PI) / 180);
  ctx.drawImage(graded, src.sx, src.sy, src.sw, src.sh, -panel.w / 2, -panel.h / 2, panel.w, panel.h);
  ctx.restore();
}

/** Fills an empty panel with a dusk gradient and a faint plus mark. */
function drawEmptyPanel(ctx, panel) {
  const g = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
  g.addColorStop(0, '#3a1c5e');
  g.addColorStop(1, '#7a1e5e');
  ctx.save();
  ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
  if (panel.rotate) ctx.rotate((panel.rotate * Math.PI) / 180);
  ctx.fillStyle = g;
  ctx.fillRect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);
  const arm = Math.min(panel.w, panel.h) * 0.16;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(3, arm * 0.14);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-arm, 0);
  ctx.lineTo(arm, 0);
  ctx.moveTo(0, -arm);
  ctx.lineTo(0, arm);
  ctx.stroke();
  ctx.restore();
}

/** The white polaroid frame around a tilted snapshot (photo already drawn). */
function drawSnapFrame(ctx, panel) {
  const frame = Math.max(4, Math.min(panel.w, panel.h) * 0.045);
  const chin = Math.max(8, Math.min(panel.w, panel.h) * 0.16);
  ctx.save();
  ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
  if (panel.rotate) ctx.rotate((panel.rotate * Math.PI) / 180);
  ctx.fillStyle = '#f8f2e8';
  ctx.fillRect(-panel.w / 2 - frame, -panel.h / 2 - frame, panel.w + frame * 2, panel.h + frame + chin);
  ctx.restore();
  // The photo sits on top of the frame's top part; redraw it inset so the
  // white border shows around it.
  ctx.save();
  ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
  if (panel.rotate) ctx.rotate((panel.rotate * Math.PI) / 180);
  ctx.fillStyle = '#f8f2e8';
  ctx.fillRect(-panel.w / 2 - frame, panel.h / 2, panel.w + frame * 2, chin);
  ctx.restore();
}

/**
 * Paints the whole cover onto `canvas` at its own size.
 * `state`: { layout, grade, title, subtitle, badge, heat, grain, vignette, placements }
 * `photos`: array of HTMLImageElement (or null) indexed by placement.photo.
 */
export function renderCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const panels = panelsForLayout(state.layout, W, H);

  // White gutters: the comic-book seams between panels.
  ctx.fillStyle = '#f5ecff';
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const placement = state.placements[i] ?? { photo: -1, zoom: 1, ox: 0, oy: 0 };
    const photo = placement.photo >= 0 ? photos[placement.photo] : null;
    if (panel.role === 'backdrop') {
      // The tilted layout's backdrop: dimmed, so the snapshots pop.
      if (photo) {
        const graded = gradedPhoto(photo, state.grade);
        ctx.save();
        ctx.globalAlpha = 0.55;
        drawPanelPhoto(ctx, panel, graded, placement);
        ctx.restore();
        ctx.fillStyle = 'rgba(16, 5, 32, 0.35)';
        ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      } else {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#2b0f45');
        g.addColorStop(1, '#12081f');
        ctx.fillStyle = g;
        ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      }
      continue;
    }
    if (panel.role === 'snap') drawSnapFrame(ctx, panel);
    if (photo) {
      const graded = gradedPhoto(photo, state.grade);
      drawPanelPhoto(ctx, panel, graded, placement);
    } else {
      drawEmptyPanel(ctx, panel);
    }
    // A crisp white seam around every panel.
    ctx.save();
    ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
    if (panel.rotate) ctx.rotate((panel.rotate * Math.PI) / 180);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.004);
    ctx.strokeRect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);
    ctx.restore();
  }

  // Lettering and effects float over the panels, poster-style.
  const minSide = Math.min(W, H);
  const titleSize = minSide * 0.115;
  const blockH = drawTitleBlock(ctx, W / 2, H - minSide * 0.245, W * 0.9, state.title, titleSize);
  const subSize = minSide * 0.042;
  drawNeonScript(ctx, state.subtitle, W / 2, H - minSide * 0.245 - minSide * 0.028, W * 0.86, subSize);
  drawHeatMeter(ctx, W * 0.1, H * 0.055, minSide * 0.02, state.heat);
  drawBadgeRibbon(ctx, state.badge, W * 0.87, H * 0.055, -8, minSide * 0.045);
  if (state.grain) drawGrain(ctx, W, H, 0.07);
  if (state.vignette) drawVignette(ctx, W, H, 0.42);
  return blockH;
}

/** Renders one cover at an exact post size and returns its PNG Blob. */
export function exportCover(state, photos, sizeKey) {
  const size = SIZES[sizeKey];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas, state, photos);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encode failed'))), 'image/png');
  });
}

/**
 * Renders all three post sizes at once. Returns [{ key, name, blob, width,
 * height }] and records the run on window.__lastExport for verification.
 */
export async function exportAllCovers(state, photos) {
  const out = [];
  for (const key of Object.keys(SIZES)) {
    const size = SIZES[key];
    const blob = await exportCover(state, photos, key);
    out.push({ key, name: `vice-coast-cover-${size.w}x${size.h}.png`, blob, width: size.w, height: size.h });
  }
  window.__lastExport = out.map(({ key, name, width, height, blob }) => ({
    key, name, width, height, bytes: blob.size,
  }));
  // The Blob objects themselves, so a test harness can read the PNG bytes
  // back and check their true dimensions from the IHDR chunk.
  window.__lastExportBlobs = out;
  return out;
}

/** Triggers a browser download of a Blob under `name`. */
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
