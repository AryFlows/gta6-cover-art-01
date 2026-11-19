// Bold lettering: the GTA-style caption — heavy Anton capitals with a hard
// outline and a coloured drop shadow — plus the neon script subtitle in
// Pacifico with a cyan glow. Everything is measured and shrunk to fit its
// box, so a long title never spills off the cover.

export const TITLE_FONT = 'Anton';
export const SCRIPT_FONT = 'Pacifico';

/**
 * The largest font size (px) at which `text` fits `maxWidth`, starting from
 * `startSize` and shrinking. Returns the size; the caller sets the font.
 */
export function fitTitleFont(ctx, text, maxWidth, startSize, family = TITLE_FONT) {
  let size = startSize;
  ctx.font = `${size}px ${family}, sans-serif`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= Math.max(1, Math.floor(size * 0.04));
    ctx.font = `${size}px ${family}, sans-serif`;
  }
  return size;
}

/**
 * Draws the title centred at (cx, baselineY): a hot-pink drop shadow, a
 * thick near-black outline, then a white fill. Returns the size it used.
 */
export function drawTitle(ctx, text, cx, baselineY, maxWidth, startSize) {
  const words = text.trim().toUpperCase();
  if (!words) return 0;
  const size = fitTitleFont(ctx, words, maxWidth, startSize);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px ${TITLE_FONT}, sans-serif`;
  const shadow = size * 0.07;
  ctx.fillStyle = '#ff2e88';
  ctx.fillText(words, cx + shadow, baselineY + shadow);
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = '#14061f';
  ctx.lineJoin = 'round';
  ctx.strokeText(words, cx, baselineY);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, cx, baselineY);
  ctx.restore();
  return size;
}

/**
 * Draws the neon script subtitle centred at (cx, baselineY): Pacifico in
 * pale cyan with a glowing shadow, over a dark pill so it reads on any photo.
 */
export function drawNeonScript(ctx, text, cx, baselineY, maxWidth, startSize) {
  const words = text.trim();
  if (!words) return 0;
  const size = fitTitleFont(ctx, words, maxWidth, startSize, SCRIPT_FONT);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px ${SCRIPT_FONT}, cursive`;
  const w = ctx.measureText(words).width;
  const pad = size * 0.55;
  ctx.fillStyle = 'rgba(12, 4, 28, 0.72)';
  roundRect(ctx, cx - w / 2 - pad, baselineY - size * 1.05, w + pad * 2, size * 1.35, size * 0.5);
  ctx.fill();
  ctx.shadowColor = '#37e6ff';
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = '#c9f6ff';
  ctx.fillText(words, cx, baselineY);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, cx, baselineY);
  ctx.restore();
  return size;
}

/** Fills a rounded rectangle path on `ctx` (no fill call — the caller fills). */
export function roundRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
