// neon-effects.js — the Vice City night dressing: a low sun disc, palm
// silhouettes, a neon frame, a vignette and a deterministic film grain.
// Every effect is drawn from numbers, never from a random call at render
// time, so the same state always renders the same pixels — the export and
// the preview agree, and two runs of the dossier agree.

// A small seeded generator, so the grain is identical on every render.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawSun(ctx, x, y, r) {
  const glow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2.0);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.6)');
  glow.addColorStop(0.4, 'rgba(255, 122, 89, 0.22)');
  glow.addColorStop(1, 'rgba(255, 122, 89, 0)');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
  const disc = ctx.createLinearGradient(x, y - r, x, y + r);
  disc.addColorStop(0, '#ffe66d');
  disc.addColorStop(1, '#ff5e62');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// One stylised palm: a leaning trunk and seven fronds, drawn as a flat
// silhouette. Two or three of these at the caption band's ends read as
// Vice City at a glance.
export function drawPalm(ctx, x, y, s, colour = 'rgba(22, 11, 46, 0.9)') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  // Trunk, leaning right, thicker at the base.
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(12, -55, 28, -96);
  ctx.stroke();
  // Fronds arc down from the crown like an umbrella: every frond leaves
  // the crown heading up-and-out and droops to a tip below the crown.
  ctx.translate(28, -96);
  const fronds = [-168, -138, -108, -78, -48, -18];
  for (const deg of fronds) {
    const a = (deg * Math.PI) / 180;
    const len = 58 + ((deg + 168) % 3) * 8;
    const cx = Math.cos(a) * len * 0.55;
    const cy = Math.sin(a) * len * 0.55;
    const ex = Math.cos(a) * len;
    const ey = Math.sin(a) * len + 30;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.lineWidth = 6;
    ctx.stroke();
  }
  // Two coconuts under the crown.
  ctx.beginPath();
  ctx.arc(-4, 6, 5, 0, Math.PI * 2);
  ctx.arc(7, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  // Coconuts.
  ctx.beginPath();
  ctx.arc(-5, 4, 5, 0, Math.PI * 2);
  ctx.arc(6, 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.72);
  g.addColorStop(0, 'rgba(10, 4, 28, 0)');
  g.addColorStop(1, 'rgba(10, 4, 28, 0.38)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function drawNeonFrame(ctx, W, H) {
  const t = Math.max(3, Math.round(W / 320));
  ctx.save();
  ctx.strokeStyle = '#ffe66d';
  ctx.lineWidth = t;
  ctx.shadowColor = '#ff2e63';
  ctx.shadowBlur = t * 4;
  ctx.strokeRect(t, t, W - t * 2, H - t * 2);
  ctx.restore();
}

// Deterministic grain: the same seed always paints the same specks. Kept
// faint on purpose — a whisper of film, never static.
export function drawGrain(ctx, W, H, seed = 20261119) {
  const rand = mulberry32(seed);
  const step = Math.max(4, Math.round(W / 300));
  ctx.save();
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const v = rand();
      if (v < 0.035) {
        ctx.fillStyle = v < 0.018 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y, step, step);
      }
    }
  }
  ctx.restore();
}
