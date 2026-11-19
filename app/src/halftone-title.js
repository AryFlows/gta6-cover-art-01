// Halftone title block: the title sits on a dark band edged with halftone
// dots that dissolve into the photo — the print-poster look. Each dot's
// radius follows its distance from the band and from the band's centre, so
// the dots fade out at the edges instead of stopping in a hard line.

import { drawTitle, fitTitleFont, roundRect, TITLE_FONT } from './bold-lettering.js';

/**
 * Rows of dots across (x, y, w): `rows` rows above `y`, each row `spacing`
 * higher than the last and shrinking, so the field dissolves upward. The
 * radius also swells toward the centre of the band and shrinks at its ends.
 */
export function drawHalftoneDots(ctx, x, y, w, rows, spacing, maxRadius, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let row = 0; row < rows; row++) {
    const rowY = y - row * spacing;
    const rowFade = 1 - row / rows;
    const step = spacing;
    for (let px = x + step / 2; px < x + w; px += step) {
      const centreFade = Math.sin((Math.PI * (px - x)) / w);
      const radius = Math.max(0.4, maxRadius * rowFade * (0.35 + 0.65 * centreFade));
      ctx.beginPath();
      ctx.arc(px, rowY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * The title block: a dark rounded band holding the title, with a halftone
 * field dissolving upward from its top edge. The title is drawn with the
 * bold-lettering treatment. Returns the block's height in px, so the caller
 * can stack the subtitle and heat meter below it.
 *
 * `cx` is the band's centre x, `topY` its top edge, `maxW` its width cap,
 * `startSize` the title's starting font size.
 */
export function drawTitleBlock(ctx, cx, topY, maxW, title, startSize) {
  const words = title.trim().toUpperCase();
  if (!words) return 0;
  const size = fitTitleFont(ctx, words, maxW * 0.92, startSize, TITLE_FONT);
  const pad = size * 0.45;
  const bandH = size * 1.55;
  const bandW = Math.min(maxW, ctx.measureText(words).width + pad * 2);
  const bandX = cx - bandW / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(16, 5, 32, 0.84)';
  roundRect(ctx, bandX, topY, bandW, bandH, size * 0.18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 211, 25, 0.9)';
  ctx.lineWidth = Math.max(2, size * 0.035);
  roundRect(ctx, bandX, topY, bandW, bandH, size * 0.18);
  ctx.stroke();
  ctx.restore();
  drawHalftoneDots(ctx, bandX, topY - size * 0.1, bandW, 4, size * 0.22, size * 0.085, '#ff2e88');
  drawTitle(ctx, words, cx, topY + bandH * 0.72, maxW * 0.92, startSize);
  return bandH;
}
