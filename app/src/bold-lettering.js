// bold-lettering.js — the cover's lettering.
//
// Three lettering voices: the title in Anton, set huge and fitted to its zone
// with a dark outline and a hard offset shadow; the subtitle in Pacifico, the
// neon script, glowing over the title; and the footer line in Bebas Neue. The
// star heat meter and the badge ribbon live here too, because they are drawn
// type, not images: five stars filled to the heat level, and a ribbon strip
// with the studio name.

export const TITLE_FONT = 'Anton';
export const SCRIPT_FONT = 'Pacifico';
export const LABEL_FONT = 'Bebas Neue';

// Shrinks a font until the text fits its zone, then returns the size. The
// title never drops below a readable floor: a caption that long simply wraps
// to a second line in the caller.
export function fitFont(ctx, text, maxWidth, startSize, family, weight = '') {
  let size = startSize;
  const prefix = weight ? `${weight} ` : '';
  ctx.font = `${prefix}${size}px ${family}, sans-serif`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${prefix}${size}px ${family}, sans-serif`;
  }
  return size;
}

// The title: white Anton capitals with a dark outline and a pink offset
// shadow, centred or left-aligned in its zone.
export function drawCoverTitle(ctx, text, zone, opts = {}) {
  const clean = (text ?? '').trim().toUpperCase();
  if (!clean) return 0;
  const size = fitFont(ctx, clean, zone.w * 0.94, zone.h * 0.62, TITLE_FONT, '400');
  ctx.save();
  ctx.textAlign = zone.align === 'left' ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  const cx = zone.align === 'left' ? zone.x + zone.w * 0.03 : zone.x + zone.w / 2;
  const cy = zone.y + zone.h * 0.52;
  ctx.font = `400 ${size}px ${TITLE_FONT}, sans-serif`;
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeStyle = opts.outline ?? '#160a24';
  ctx.lineJoin = 'round';
  ctx.strokeText(clean, cx, cy);
  ctx.shadowColor = opts.shadow ?? 'rgba(255,46,136,0.85)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = size * 0.05;
  ctx.shadowOffsetY = size * 0.05;
  ctx.fillStyle = opts.fill ?? '#ffffff';
  ctx.fillText(clean, cx, cy);
  ctx.restore();
  return size;
}

// The subtitle: Pacifico script in a hot neon colour, glowing. It sits above
// the title and is drawn smaller than the title on purpose — a whisper under
// the shout.
export function drawNeonSubtitle(ctx, text, zone, opts = {}) {
  const clean = (text ?? '').trim();
  if (!clean) return 0;
  const size = fitFont(ctx, clean, zone.w * 0.9, zone.h * 0.8, SCRIPT_FONT, '400');
  ctx.save();
  ctx.textAlign = zone.align === 'left' ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  const cx = zone.align === 'left' ? zone.x + zone.w * 0.03 : zone.x + zone.w / 2;
  const cy = zone.y + zone.h / 2;
  ctx.font = `400 ${size}px ${SCRIPT_FONT}, cursive`;
  const glow = opts.color ?? '#ff5db1';
  // A dark backing first, so the script stays readable over bright photos.
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(22,10,36,0.85)';
  ctx.fillText(clean, cx + size * 0.06, cy + size * 0.08);
  ctx.shadowColor = glow;
  ctx.shadowBlur = size * 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(clean, cx, cy);
  ctx.shadowBlur = size * 0.25;
  ctx.fillStyle = glow;
  ctx.fillText(clean, cx, cy);
  ctx.restore();
  return size;
}

// The heat meter: five stars in a row, filled gold up to the heat level and
// hollow after it, centred on (x, y). Heat is the cover's hype rating, 1 to 5.
export function drawStars(ctx, x, y, size, heat) {
  const gap = size * 1.5;
  const total = gap * 4;
  const startX = x - total / 2;
  ctx.save();
  for (let i = 0; i < 5; i += 1) {
    const cx = startX + i * gap;
    drawStarPath(ctx, cx, y, size);
    if (i < heat) {
      ctx.shadowColor = 'rgba(255,200,60,0.9)';
      ctx.shadowBlur = size * 0.4;
      ctx.fillStyle = '#ffc83c';
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = Math.max(1.5, size * 0.08);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawStarPath(ctx, cx, cy, size) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? size : size * 0.45;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// The badge ribbon: a hot-pink diagonal ribbon across a corner of the cover
// with the studio name in Bebas Neue capitals.
export function drawRibbon(ctx, W, H, corner, text) {
  const clean = (text ?? '').trim().toUpperCase();
  if (!clean) return;
  const band = Math.round(Math.min(W, H) * 0.055);
  const d = band * 2.0;
  const len = band * 5.4;
  const size = fitFont(ctx, clean, len * 0.82, band * 0.62, LABEL_FONT, '400');
  // The ribbon crosses one corner: its centre sits a distance d from the
  // corner along the diagonal, and the band runs perpendicular to that
  // diagonal, from past the top edge to past the side edge.
  const off = d / Math.SQRT2;
  ctx.save();
  if (corner === 'tl') ctx.translate(off, off);
  else ctx.translate(W - off, off);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = '#ff2e88';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = band * 0.3;
  ctx.fillRect(-len / 2, -band / 2, len, band);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = `400 ${size}px ${LABEL_FONT}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, 0, 2);
  ctx.restore();
}

// The footer line: small Bebas Neue capitals centred under the title, for
// the date line or the studio tag.
export function drawFooterLine(ctx, text, x, y, maxWidth, size) {
  const clean = (text ?? '').trim().toUpperCase();
  if (!clean) return;
  const fitted = fitFont(ctx, clean, maxWidth, size, LABEL_FONT, '400');
  ctx.save();
  ctx.font = `400 ${fitted}px ${LABEL_FONT}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(clean, x, y);
  ctx.restore();
}
