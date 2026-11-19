// bold-lettering.js — the big GTA-style caption. The main caption is set
// in BebasNeue, all caps, white with a dark outline and a hot-pink drop
// shadow, tilted a couple of degrees like a poster title. The sub-caption
// runs underneath in Pacifico script. Everything is drawn into the caption
// band the layouts reserve at the bottom of the cover, so the lettering
// never fights the photos.

export function fitCaptionFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

// Draws the caption centred in the band. Returns the baseline y of the
// main caption, so callers can stack more type under it.
export function drawCaption(ctx, W, H, caption, subcaption) {
  const bandTop = H * (1 - 0.24);
  const bandH = H - bandTop;
  const cx = W / 2;

  // Sunset wash behind the type: orange into magenta into purple, with a
  // thin gold rule where the band meets the photos.
  const wash = ctx.createLinearGradient(0, bandTop, W, H);
  wash.addColorStop(0, '#ff7a18');
  wash.addColorStop(0.45, '#ff2e63');
  wash.addColorStop(1, '#5b2a86');
  ctx.fillStyle = wash;
  ctx.fillRect(0, bandTop, W, bandH);
  ctx.fillStyle = '#ffe66d';
  ctx.fillRect(0, bandTop, W, Math.max(2, Math.round(H / 360)));

  const main = (caption || 'VICE COAST').toUpperCase();
  const mainSize = fitCaptionFont(ctx, main, W * 0.92, Math.round(bandH * 0.52), 'BebasNeue, "Arial Narrow", sans-serif');
  const mainY = bandTop + bandH * 0.52;

  ctx.save();
  ctx.translate(cx, mainY);
  ctx.rotate(-0.035);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${Math.max(2, Math.round(mainSize * 0.04))}px`; } catch { /* older canvas: no letter spacing */ }
  ctx.font = `${mainSize}px BebasNeue, "Arial Narrow", sans-serif`;
  ctx.shadowColor = 'rgba(255, 46, 99, 0.9)';
  ctx.shadowBlur = Math.round(mainSize * 0.12);
  ctx.shadowOffsetY = Math.round(mainSize * 0.05);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, Math.round(mainSize * 0.09));
  ctx.strokeStyle = '#160b2e';
  ctx.strokeText(main, 0, 0);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(main, 0, 0);
  ctx.restore();

  if (subcaption) {
    const subSize = Math.max(18, Math.round(bandH * 0.16));
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = '#ffe66d';
    ctx.shadowColor = 'rgba(22, 11, 46, 0.85)';
    ctx.shadowBlur = Math.round(subSize * 0.15);
    ctx.fillText(subcaption, cx, bandTop + bandH * 0.86);
    ctx.restore();
  }
  return mainY;
}
