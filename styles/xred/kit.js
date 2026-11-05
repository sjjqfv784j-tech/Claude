// =====================================================================
//  styles/xred/kit.js — "xred": premium dark product ad. Near-black ground with a faint grid and red dust,
//  one red accent (a glossy gradient), tight heavy sans type, rounded glass cards with a hairline border,
//  red glows. Measured from the xsearcher.cc landing page (ground #090809 / #130a0b, red #f13c38..#fc665b,
//  white #eeeef2, card #0e0e10). Motion on 1s, springs, no boil.
//  Prefixed `xr...`; needs from the piece head: CX.
// =====================================================================
const XR = {
  ground: '#090809', ground2: '#130a0b', card: '#0e0e10', cardHi: '#17171b',
  ink: '#eeeef2', grey: '#8d8c94', greyD: '#4a494f',
  red: '#f13c38', redHi: '#fc665b', redLo: '#c8231f', redDeep: '#5a0f0d',
};
const XR_FONT = '"Inter", "Helvetica Neue", "Segoe UI", "Liberation Sans", "DejaVu Sans", Arial, sans-serif';

function xrRR(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
const xrRgb = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const xrRedGrad = (x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, XR.redHi); g.addColorStop(1, XR.redLo); return g; };

// the stage: ground, a red bloom (cx, cy in 0..1 of the frame, k strength), a faint grid, drifting red dust
function xrBg(o = {}) {
  ctx.save(); screen();
  ctx.fillStyle = XR.ground; ctx.fillRect(0, 0, W, H);
  const k = o.glow ?? 0.5, gx = (o.cx ?? 0.5) * W, gy = (o.cy ?? 0.55) * H;
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, (o.r ?? 0.95) * W);
  g.addColorStop(0, xrRgb(XR.red, 0.22 * k)); g.addColorStop(0.45, xrRgb(XR.redDeep, 0.30 * k)); g.addColorStop(1, 'rgba(9,8,9,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.grid !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= W; x += 90) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += 90) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }
  const n = o.dust ?? 26;
  for (let i = 0; i < n; i++) {
    const R = RNG('xrdust', i), sp = R.r(6, 22), x = R.r(0, W), y0 = R.r(0, H), r = R.r(1.5, 4);
    const y = mod(y0 - TT * sp, H), tw = 0.5 + 0.5 * Math.sin(TT * R.r(1, 3) + i);
    ctx.fillStyle = xrRgb(XR.redHi, 0.18 + 0.4 * tw * (o.dustK ?? 1)); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// text: heavy, tight. o: weight, align, frac (write-on 0..1), color | grad (a red gradient), spacing (em), glow, alpha
function xrText(str, x, y, size, o = {}) {
  ctx.save();
  ctx.font = `${o.weight ?? 800} ${size}px ${XR_FONT}`; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${(o.spacing ?? -0.035) * size}px`;
  const w = ctx.measureText(str).width, ax = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  const frac = clamp(o.frac ?? 1);
  ctx.globalAlpha = clamp(o.alpha ?? 1);
  if (frac < 1) { ctx.beginPath(); ctx.rect(ax - 8, y - size * 1.2, w * frac + 8, size * 1.6); ctx.clip(); }
  if (o.glow) { ctx.shadowColor = xrRgb(XR.red, 0.8); ctx.shadowBlur = o.glow; }
  ctx.fillStyle = o.grad ? xrRedGrad(ax, y - size, ax + w, y) : (o.color ?? XR.ink);
  if (frac > 0) ctx.fillText(str, x, y);
  ctx.restore(); return w;
}
const xrTextW = (str, size, weight = 800, spacing = -0.035) => { ctx.save(); ctx.font = `${weight} ${size}px ${XR_FONT}`; if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * size}px`; const w = ctx.measureText(str).width; ctx.restore(); return w; };

// a glass card. o: fill, stroke (colour), glow (0..1 red halo), s (scale about its centre), rot, alpha
function xrCard(x, y, w, h, r = 36, o = {}) {
  const s = o.s ?? 1; if (s <= 0.001) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.rot ?? 0); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  ctx.globalAlpha = clamp(o.alpha ?? 1);
  if (o.glow) { ctx.shadowColor = xrRgb(XR.red, 0.55 * o.glow); ctx.shadowBlur = 60 * o.glow; }
  xrRR(0, 0, w, h, r); ctx.fillStyle = o.fill ?? XR.card; ctx.fill();
  ctx.shadowBlur = 0;
  xrRR(0, 0, w, h, r); ctx.lineWidth = o.lw ?? 2; ctx.strokeStyle = o.stroke ?? 'rgba(255,255,255,0.12)'; ctx.stroke();
  ctx.restore();
}
// the red pill button with an arrow
function xrButton(label, cx, cy, w, h, o = {}) {
  const s = o.s ?? 1; if (s <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.shadowColor = xrRgb(XR.red, 0.6); ctx.shadowBlur = 50;
  xrRR(-w / 2, -h / 2, w, h, h * 0.22); ctx.fillStyle = xrRedGrad(-w / 2, -h / 2, w / 2, h / 2); ctx.fill();
  ctx.shadowBlur = 0;
  xrRR(-w / 2, -h / 2, w, h, h * 0.22); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  xrText(label, -w / 2 + h * 0.5, h * 0.17, h * 0.4, { weight: 700, spacing: -0.01, color: '#fff' });
  // the arrow
  ctx.strokeStyle = '#fff'; ctx.lineWidth = h * 0.06; ctx.lineCap = 'round'; ctx.beginPath();
  const ax = w / 2 - h * 0.5, ay = 0, a = h * 0.13; ctx.moveTo(ax - a, ay + a); ctx.lineTo(ax + a, ay - a); ctx.moveTo(ax - a * 0.1, ay - a); ctx.lineTo(ax + a, ay - a); ctx.lineTo(ax + a, ay + a * 0.1); ctx.stroke();
  ctx.restore();
}
// a model chip: dot + name
function xrChip(str, x, y, o = {}) {
  const size = o.size ?? 44, w = xrTextW(str, size, 700, -0.01) + size * 1.9, h = size * 1.9;
  ctx.save(); ctx.globalAlpha = clamp(o.alpha ?? 1);
  xrCard(x - w / 2, y - h / 2, w, h, h / 2, { fill: o.hot ? XR.redDeep : XR.card, stroke: o.hot ? xrRgb(XR.redHi, 0.7) : 'rgba(255,255,255,0.13)', glow: o.hot ? 0.8 : 0 });
  ctx.fillStyle = o.hot ? XR.redHi : XR.red; ctx.beginPath(); ctx.arc(x - w / 2 + size * 0.85, y, size * 0.17, 0, TAU); ctx.fill();
  xrText(str, x - w / 2 + size * 1.25, y + size * 0.34, size, { weight: 700, spacing: -0.01, color: XR.ink });
  ctx.restore(); return w;
}

// the hero: a glossy red orb with a halo ring and an idle bob. Sets SPARK_AT for the anchor check.
function xrHero(x, y, r, o = {}) {
  const key = o.key ?? 'hero', s = o.s ?? 1; if (s <= 0.01) return;
  y += Math.sin(TT * TAU * 0.45 + key.length) * r * 0.05; r *= s;
  SPARK_AT = toScreen(x, y);
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * (3.2 + (o.pulse ?? 0)));
  halo.addColorStop(0, xrRgb(XR.red, 0.42)); halo.addColorStop(1, 'rgba(241,60,56,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * (3.2 + (o.pulse ?? 0)), 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffb3a8'); g.addColorStop(0.28, XR.redHi); g.addColorStop(0.75, XR.red); g.addColorStop(1, XR.redLo);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = xrRgb(XR.redHi, 0.5); ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.beginPath(); ctx.arc(x, y, r * (1.35 + 0.05 * Math.sin(TT * 2)), 0, TAU); ctx.stroke();
  ctx.restore();
}
// a burst of thin red rays (an idea landing)
function xrRays(x, y, r0, r1, k, n = 14) {
  if (k <= 0) return; ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = xrRgb(XR.redHi, 1 - 0.7 * k);
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, ra = lerp(r0, r1, EZ.o3(k)), rb = lerp(r0, r1, EZ.o3(clamp(k * 1.3))) + 30 * (1 - k); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); ctx.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); ctx.stroke(); }
  ctx.restore();
}

// captions: drawn after the camera at screen size (DEFER)
const xrTag = (str) => { const f = () => xrText(str, 70, 330, 40, { weight: 700, spacing: 0.12, color: XR.redHi }); if (DEFER) DEFER.push(f); else f(); };

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'xred',
  paper: '#090809',
  backdrop(c) { fillAll(c); },
  window(P, key, src) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 4; ctx.strokeStyle = XR.redHi; ctx.stroke(); ctx.restore();
  },
  blob(P, c, key) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r, o) { xrHero(x, y, r * 0.6, o); },
  heroColor: '#f13c38',
  post() {},
  ones: true,
};
