// neon-effects.js — grain, vignette and glow.
//
// The print finish of a poster: a fine grain over everything, a vignette that
// pulls the eye to the middle, and the neon glow the subtitle uses. Grain is
// a small tiled noise canvas made once per cover size, so the effect costs one
// pattern fill instead of thousands of random dots per frame.

let grainTile = null;
let grainTileSize = 0;

// A 128-pixel tile of monochrome noise. Seeded per call so the grain differs
// between exports instead of repeating one fixed pattern.
export function makeGrainTile(size = 128) {
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  const image = tctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  tctx.putImageData(image, 0, 0);
  return tile;
}

// Dusts grain over the whole cover at a low alpha, in overlay blend so the
// darks stay dark and the brights stay bright.
export function drawGrain(ctx, W, H, amount = 0.07) {
  if (!grainTile || grainTileSize !== 128) {
    grainTile = makeGrainTile(128);
    grainTileSize = 128;
  }
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(grainTile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Darkens the corners so the middle of the cover holds the eye.
export function drawVignette(ctx, W, H, strength = 0.42) {
  const radius = Math.hypot(W, H) / 2;
  const grad = ctx.createRadialGradient(W / 2, H / 2, radius * 0.45, W / 2, H / 2, radius);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// A neon edge frame: a thin bright line just inside the cover's edge with a
// soft glow, the poster's finishing border. Drawn last, over the grain.
export function drawGlowFrame(ctx, W, H, color = '#ff5db1') {
  const inset = Math.max(6, Math.round(Math.min(W, H) * 0.012));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.004);
  ctx.shadowColor = color;
  ctx.shadowBlur = Math.max(8, Math.min(W, H) * 0.02);
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.restore();
}
