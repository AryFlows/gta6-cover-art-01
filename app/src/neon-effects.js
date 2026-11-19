// Neon effects: the finishing touches — film grain, a dusk vignette, the
// star heat meter and the badge ribbon. Grain is a pre-rendered noise tile
// stamped at low opacity; the vignette is a radial gradient darkening the
// edges; the ribbon is a slanted band in Bebas Neue; the heat meter is five
// stars, lit gold up to the chosen heat.

let noiseTile = null;

/** A 128 px tile of monochrome static, made once and reused for grain. */
export function makeNoiseTile() {
  if (noiseTile) return noiseTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const ctx = tile.getContext('2d');
  const frame = ctx.createImageData(128, 128);
  for (let i = 0; i < frame.data.length; i += 4) {
    const v = Math.floor(Math.random() * 256);
    frame.data[i] = v;
    frame.data[i + 1] = v;
    frame.data[i + 2] = v;
    frame.data[i + 3] = 255;
  }
  ctx.putImageData(frame, 0, 0);
  noiseTile = tile;
  return tile;
}

/** Stamps the noise tile across the cover at low opacity: film grain. */
export function drawGrain(ctx, W, H, amount = 0.07) {
  const tile = makeNoiseTile();
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Darkens the cover's corners and edges with a radial dusk vignette. */
export function drawVignette(ctx, W, H, strength = 0.42) {
  const glow = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  glow.addColorStop(0, 'rgba(10, 4, 24, 0)');
  glow.addColorStop(1, `rgba(10, 4, 24, ${strength})`);
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** A five-pointed star path centred at (cx, cy) with outer radius r. */
export function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.42;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * The star heat meter: five stars in a row centred at (cx, y). Stars up to
 * `heat` are lit gold with a warm glow; the rest are dark outlines.
 */
export function drawHeatMeter(ctx, cx, y, size, heat) {
  const gap = size * 2.3;
  const x0 = cx - (gap * 4) / 2;
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = x0 + i * gap;
    starPath(ctx, x, y, size);
    if (i < heat) {
      ctx.shadowColor = '#ffb300';
      ctx.shadowBlur = size * 0.9;
      ctx.fillStyle = '#ffd319';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(1, size * 0.12);
      ctx.strokeStyle = '#7a4d00';
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(20, 8, 34, 0.66)';
      ctx.fill();
      ctx.lineWidth = Math.max(1, size * 0.12);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * The badge ribbon: a slanted band of hot pink with Bebas Neue capitals,
 * anchored at (x, y) and tilted `angle` degrees. Width fits the text.
 */
export function drawBadgeRibbon(ctx, text, x, y, angle, height) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  const size = height * 0.62;
  ctx.save();
  ctx.font = `${size}px 'Bebas Neue', sans-serif`;
  const textW = ctx.measureText(words).width;
  const w = textW + height * 1.4;
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  const band = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  band.addColorStop(0, '#ff5da2');
  band.addColorStop(0.5, '#ff2e88');
  band.addColorStop(1, '#c40e5f');
  ctx.fillStyle = band;
  ctx.fillRect(-w / 2, -height / 2, w, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(-w / 2, -height / 2, w, height * 0.16);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(-w / 2, height / 2 - height * 0.16, w, height * 0.16);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, 0, height * 0.03);
  ctx.restore();
}
