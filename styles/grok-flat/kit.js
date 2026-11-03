// =====================================================================
//  styles/grok-flat/kit.js — flat 2D vector night room: aplats only, no outlines on characters, no volume shading.
//  Measured on a clay-3D explainer (references/grok, local). Built on kit/core.js. Helpers are prefixed gf.
//  Needs from the piece head: HAND (caption font), CX, VOICE (optional), SPK (line id -> 'C' | 'G').
// =====================================================================
const GF = {
  night: '#1a1834', night2: '#1a152e', floor: '#1d1940', base: '#272250', rug: '#231e45', frame: '#2c2650', glass: '#17194d',
  cream: '#fceedd', ink: '#2a2446', red: '#d9534f', brick: '#c4573a', brickD: '#a64a31', mustard: '#e3b93c', mustardD: '#c99d2d',
  mint: '#a0e0c5', mintD: '#3f9f87', coral: '#f08a80', skin: '#dba984', hair: '#4b3029', purple: '#2d2750', wood: '#b59a6b',
  woodD: '#8d7650', gray: '#a7a4a8', grayL: '#cfcad0', violet: '#3a3366', pink: '#d9606a', book: ['#d97c8c', '#e3b93c', '#4a3d6e', '#d9a27c', '#7fd6c0'],
};
const GF_FONT = '"Poppins","Montserrat","Nunito Sans","DejaVu Sans","Liberation Sans","Helvetica Neue",Arial,sans-serif';
const GF_KEYS = ['GROK', 'BOT', 'COLLÈGUE', 'TÂCHE', 'EXACTEMENT', 'CONNECTE', 'APPREND', 'SEUL', 'BESOIN', 'IA', 'AGIT', 'OUTILS', 'CLOUD', 'ÉTEINT', 'ORDINATEUR', 'SUPPORT', 'COMPTES', 'FOIS', 'ÉQUIPE', 'PARALLÈLE', 'NUIT', 'ACCORD', 'VALIDER', 'VIDÉO'];

function gfFillStroke(fill, line, lw) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (line) { ctx.lineWidth = lw || 4; ctx.strokeStyle = line; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function gfRR(x, y, w, h, r, fill, line, lw) { ctx.beginPath(); ctx.roundRect(x, y, Math.max(0.01, w), Math.max(0.01, h), r); gfFillStroke(fill, line, lw); }
function gfEl(x, y, rx, ry, fill, line, lw, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); gfFillStroke(fill, line, lw); }
function gfPoly(P, fill, line, lw) { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); gfFillStroke(fill, line, lw); }
function gfLine(x1, y1, x2, y2, color, lw, dash) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.restore();
}
function gfText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? GF_FONT}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y); const w = ctx.measureText(str).width; ctx.restore(); return w;
}
const gfBlink = (key = 0) => (B + key * 11) % 38 < 2;

// ---------------------------------------------------------------------
//  the room: night wall, floor, string lights, window with moon, curtain, shelf, plant, book stack
// ---------------------------------------------------------------------
const GF_DY = 150;
function gfLights() {
  // string lights
  ctx.save(); ctx.beginPath(); for (let i = 0; i <= 10; i++) { const x = 40 + i * 100, y = 82 + Math.sin(i * 0.9) * 8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 4; ctx.strokeStyle = '#2f2a55'; ctx.stroke(); ctx.restore();
  const LC = ['#f3e7c9', '#7fd6c0', '#f08a80'];
  for (let i = 0; i < 10; i++) {
    const x = 90 + i * 100, y = 100 + Math.sin(i * 0.9) * 8, on = (B + i * 3) % 16 < 11;
    gfEl(x, y, 31, 31, '#3a3563'); ctx.save(); ctx.globalAlpha = on ? 1 : 0.55; gfEl(x, y, 20, 20, LC[i % 3]); ctx.restore();
  }
}
function gfRoom(o = {}) {
  fillAll(GF.night);
  gfLights();
  ctx.translate(0, GF_DY);
  ctx.fillStyle = GF.floor; ctx.fillRect(-10, 1092, W + 20, H);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = GF.night2; ctx.fillRect(-10, 1180 + i * 120 + i * i * 8, W + 20, 4); }
  gfEl(540, 1560, 700, 190, GF.rug); gfEl(540, 1560, 600, 150, '#2a2450'); gfEl(540, 1560, 470, 110, GF.rug);
  ctx.fillStyle = GF.base; ctx.fillRect(-10, 1074, W + 20, 18);
  gfEl(540, 1330, 560, 90, GF.rug);
  gfEl(80, 1290, 130, 28, GF.rug);
  // window with moon and twinkling stars
  gfRR(500, 190, 700, 570, 70, GF.frame);
  gfRR(530, 220, 640, 510, 48, GF.glass);
  ctx.save(); ctx.beginPath(); ctx.roundRect(530, 220, 640, 510, 48); ctx.clip();
  const R = RNG('gfstars');
  for (let i = 0; i < 26; i++) { const x = R.r(545, 1160), y = R.r(235, 700), s = R.r(7, 12); if ((B + i * 5) % 17 < 12) { ctx.fillStyle = i % 5 ? '#dcd6e8' : GF.cream; ctx.fillRect(x, y, s, s); } }
  gfEl(1030, 470, 64, 64, GF.cream); gfEl(1004, 452, 60, 60, GF.glass);
  ctx.restore();
  // curtain (gray strips) and rod
  gfRR(318, 172, 770, 14, 7, GF.frame);
  for (let i = 0; i < 5; i++) gfRR(352 + i * 24, 196, 24, 560 + (i % 2) * 14, 6, i % 2 ? GF.gray : GF.grayL);
  // shelf with books and a small plant
  gfRR(0, 640, 300, 16, 4, '#a58b66');
  const bh = [76, 62, 84, 70, 58]; let bx = 14;
  bh.forEach((h, i) => { gfRR(bx, 640 - h, 30 + (i % 2) * 8, h, 3, GF.book[i]); bx += 34 + (i % 2) * 8; });
  gfRR(226, 596, 46, 44, 6, '#8a5a4a'); gfEl(249, 586, 24, 18, GF.mintD); gfEl(238, 574, 12, 20, GF.mint, null, 0, -0.4);
  // big plant, gently swaying
  const sw = Math.sin(TT * 1.3) * 5;
  [[-34, 120, -0.35, GF.mintD], [-8, 170, -0.1, '#2f7f6d'], [22, 150, 0.2, GF.mintD], [48, 110, 0.45, '#2f7f6d'], [8, 100, 0.05, GF.mint]].forEach(([dx, h, rot, c]) => {
    gfEl(212 + dx + sw * (h / 170), 1000 - h / 2, 26, h / 2 + 10, c, null, 0, rot);
  });
  gfPoly([[150, 1040], [274, 1040], [260, 1172], [164, 1172]], '#8a5a4a'); gfRR(142, 1028, 140, 26, 8, '#9c6a58');
  // book stack and mug
  gfRR(196, 1204, 222, 26, 4, '#e8e6ea'); gfRR(186, 1230, 242, 28, 4, GF.grayL); gfRR(200, 1258, 214, 26, 4, '#e8e6ea');
  gfRR(278, 1146, 70, 58, 8, '#e0766a'); gfEl(356, 1176, 20, 18, null, '#e0766a', 9);
}

// ---------------------------------------------------------------------
//  Claude: round head with glasses, mustard sweater, no outlines. o.s scale, o.pose 'rest'|'talk'|'shrug', o.talk
// ---------------------------------------------------------------------
function gfClaude(cx, baseY, o = {}) {
  const s = o.s ?? 0.95, pose = o.pose ?? 'rest', talk = !!o.talk, bob = Math.sin(TT * 2.2) * 3 * s;
  const X = (dx) => cx + dx * s, Y = (dy) => baseY - dy * s + bob;
  gfEl(cx, baseY + 4, 190 * s, 22 * s, '#15122c');
  // legs and shoes
  for (const sx of [-1, 1]) { gfRR(X(sx * 56 - 31), Y(112), 62 * s, 100 * s, 10 * s, GF.purple); gfRR(X(sx * 58 - 42), Y(32), 84 * s, 32 * s, 14 * s, '#14122b'); gfRR(X(sx * 58 - 42), Y(10), 84 * s, 9 * s, 4 * s, '#e8e6ea'); }
  // sleeves and arms
  const up = pose === 'talk' ? 1 : pose === 'shrug' ? 2 : 0;
  for (const sx of [-1, 1]) {
    const raised = (up === 2) || (up === 1 && sx === 1), ay = raised ? 410 : 250 + Math.sin(TT * 2 + sx) * 4, ax = sx * (raised ? 232 : 205);
    gfEl(X(sx * 176), Y(332), 50 * s, 48 * s, GF.mustard);
    gfEl(X(ax), Y(ay), 34 * s, 62 * s, GF.skin, null, 0, sx * (raised ? -0.5 : 0.12)); gfEl(X(ax + sx * 8), Y(ay - (raised ? 52 : 62)), 38 * s, 36 * s, GF.skin);
  }
  // sweater
  gfRR(X(-170), Y(392), 340 * s, 300 * s, 120 * s, GF.mustard);
  gfRR(X(-92), Y(305), 52 * s, 58 * s, 8 * s, GF.mustardD); gfRR(X(-80), Y(318), 7 * s, 22 * s, 3 * s, GF.red);
  gfEl(X(-16), Y(330), 8 * s, 8 * s, GF.cream); gfEl(X(12), Y(300), 8 * s, 8 * s, GF.cream);
  gfRR(X(-170), Y(106), 340 * s, 16 * s, 8 * s, GF.violet);
  gfEl(cx, Y(392), 74 * s, 24 * s, '#d8d4d8');
  // head
  const hy = Y(528);
  gfEl(X(-176), hy + 10 * s, 28 * s, 30 * s, GF.skin); gfEl(X(176), hy + 10 * s, 28 * s, 30 * s, GF.skin);
  gfEl(cx, hy - 22 * s, 190 * s, 152 * s, GF.hair);
  gfPoly([[X(-14), hy - 168 * s], [X(10), hy - 205 * s], [X(30), hy - 164 * s]], GF.hair);
  gfEl(cx, hy + 14 * s, 174 * s, 148 * s, GF.skin);
  for (let i = 0; i < 6; i++) gfEl(X(-132 + i * 53), hy - 112 * s + (i % 2) * 8 * s, 34 * s, 34 * s, GF.hair);
  for (const sx of [-1, 1]) {
    const ex = X(sx * 62), ey = hy + 6 * s, bl = gfBlink();
    gfEl(ex, ey, 40 * s, 40 * s, GF.cream); gfEl(ex, ey + 2 * s, 20 * s, bl ? 3 * s : 20 * s, GF.ink); if (!bl) gfEl(ex + 6 * s, ey - 6 * s, 6 * s, 6 * s, GF.cream);
    gfEl(ex, ey, 44 * s, 44 * s, null, GF.hair, 7 * s);
    gfEl(X(sx * 112), hy + 62 * s, 22 * s, 13 * s, 'rgba(240,138,128,0.7)');
    ctx.save(); ctx.beginPath(); ctx.arc(X(sx * 62), hy - 66 * s, 30 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = 6 * s; ctx.strokeStyle = GF.hair; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  }
  gfLine(X(-20), hy + 6 * s, X(20), hy + 6 * s, GF.hair, 6 * s);
  const mo = talk ? [0.15, 1, 0.55][B % 3] : 0;
  if (mo) gfEl(cx, hy + 72 * s, 22 * s, (6 + 20 * mo) * s, '#7a2f2f');
  else { ctx.save(); ctx.beginPath(); ctx.arc(cx, hy + 56 * s, 26 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.lineWidth = 6 * s; ctx.strokeStyle = GF.hair; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
}

// ---------------------------------------------------------------------
//  Grok Bot: a blocky brick-red creature, two slot eyes, four legs, side nubs. Returns the pointer anchor.
// ---------------------------------------------------------------------
function gfGrok(x, baseY, o = {}) {
  const s = o.s ?? 1, talk = !!o.talk, walk = !!o.walk, bob = talk ? (B % 2) * 4 * s : Math.sin(TT * 2.4) * 2 * s;
  const bw = 400 * s, bh = 220 * s, lh = 72 * s, top = baseY - lh - bh - bob, left = x - bw / 2;
  gfEl(x, baseY + 6, 250 * s, 20 * s, '#15122c');
  [-165, -58, 58, 165].forEach((dx, i) => { const h = lh - (walk ? ((B + i) % 2) * 14 * s : 0) + bob; gfRR(x + dx * s - 31 * s, baseY - h, 62 * s, h, 3, GF.brickD); });
  gfRR(left - 40 * s, top + 100 * s, 44 * s, 52 * s, 3, GF.brick);
  gfRR(left + bw - 4 * s, top + (o.arm ? 10 : 84) * s, 44 * s, (o.arm ? 130 : 70) * s, 3, GF.brick);
  gfRR(left, top, bw, bh, 8 * s, GF.brick);
  const bl = gfBlink(3);
  for (const ex of [left + 125 * s, left + 295 * s]) gfRR(ex - 15 * s, top + 52 * s, 30 * s, (bl ? 6 : 62) * s, 3, GF.night);
  return [left + bw + 40 * s, top + 100 * s];
}
function gfPointer(from, to, k = 1) {
  const x = lerp(from[0], to[0], k), y = lerp(from[1], to[1], k);
  gfLine(from[0], from[1], x, y, GF.wood, 11); gfEl(x, y, 17, 17, GF.pink);
}

// ---------------------------------------------------------------------
//  whiteboard on legs, with its lamp pole. The cream sheet is board-local x 108..972, y 330..830
// ---------------------------------------------------------------------
const GFB = { x: 108, y: 330, w: 864, h: 500 };
const GFS = { k: 0.72, tx: 227, ty: 232 };                        // board-local -> world: x*k+tx, y*k+ty
const gfBW = (x, y) => [x * GFS.k + GFS.tx, y * GFS.k + GFS.ty];
function gfBoard() {
  const [x0, y0] = gfBW(GFB.x, GFB.y), w = GFB.w * GFS.k, h = GFB.h * GFS.k;
  gfRR(x0 + 40, y0 + h, 14, 1300 - (y0 + h), 4, GF.woodD); gfRR(x0 + w - 56, y0 + h, 14, 1300 - (y0 + h), 4, GF.woodD);
  gfRR(x0 - 16, y0 - 16, w + 32, h + 50, 12, GF.wood);
  gfRR(x0, y0, w, h, 6, GF.cream);
  gfRR(x0 - 16, y0 + h + 4, w + 32, 22, 6, GF.woodD);
}
function gfBoardIn(fn) { ctx.save(); ctx.translate(GFS.tx, GFS.ty); ctx.scale(GFS.k, GFS.k); fn(); ctx.restore(); }
function gfBoardIcon(cx, cy, size, kind, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  const h = size / 2;
  if (kind === 'mail') { gfRR(-h, -h, size, size, 18, GF.ink); gfRR(-h * 0.62, -h * 0.4, h * 1.24, h * 0.84, 6, GF.cream); gfLine(-h * 0.62, -h * 0.34, 0, h * 0.08, GF.ink, 6); gfLine(h * 0.62, -h * 0.34, 0, h * 0.08, GF.ink, 6); }
  if (kind === 'cal') { gfRR(-h, -h, size, size, 18, GF.ink); gfRR(-h * 0.7, -h * 0.5, h * 1.4, h * 1.2, 6, GF.cream); gfRR(-h * 0.7, -h * 0.5, h * 1.4, h * 0.3, 6, GF.coral); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) gfRR(-h * 0.5 + c * h * 0.4, -h * 0.05 + r * h * 0.34, h * 0.24, h * 0.2, 3, GF.ink); }
  if (kind === 'support') { gfRR(-h, -h, size, size, 18, GF.mint); gfRR(-h * 0.2, -h * 0.55, h * 0.8, h * 0.28, 12, GF.cream); gfRR(-h * 0.2, -h * 0.08, h * 0.8, h * 0.28, 12, GF.coral); gfEl(-h * 0.35, 0, h * 0.42, h * 0.46, null, GF.ink, 6); gfRR(-h * 0.68, -h * 0.05, h * 0.22, h * 0.34, 5, GF.ink); gfRR(-h * 0.14, -h * 0.05, h * 0.22, h * 0.34, 5, GF.ink); }
  if (kind === 'toggles') { gfRR(-h, -h, size, size, 18, GF.mustard); for (let r = 0; r < 3; r++) { gfEl(-h * 0.55, -h * 0.5 + r * h * 0.5, h * 0.12, h * 0.12, GF.ink); gfRR(-h * 0.3, -h * 0.5 + r * h * 0.5 - 5, h * 0.4, 10, 5, GF.cream); gfRR(h * 0.2, -h * 0.5 + r * h * 0.5 - h * 0.14, h * 0.5, h * 0.28, h * 0.14, r ? GF.ink : GF.mintD); gfEl(r ? h * 0.32 : h * 0.58, -h * 0.5 + r * h * 0.5, h * 0.1, h * 0.1, GF.cream); } }
  if (kind === 'add') { ctx.save(); ctx.setLineDash([9, 8]); gfRR(-h, -h, size, size, 18, null, GF.ink, 4); ctx.restore(); gfLine(0, -h * 0.4, 0, h * 0.1, GF.coral, 7); gfLine(-h * 0.25, -h * 0.15, h * 0.25, -h * 0.15, GF.coral, 7); for (let i = 0; i < 3; i++) gfEl(-h * 0.3 + i * h * 0.3, h * 0.45, 5, 5, i === 2 ? GF.coral : GF.ink); }
  ctx.restore();
}
function gfMonitor(cx, cy, w, fill, frac, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  gfRR(-w / 2, -w * 0.34, w, w * 0.62, 12, GF.ink);
  gfRR(-w / 2 + 14, -w * 0.34 + 14, w - 28, w * 0.62 - 28, 6, GF.violet);
  gfRR(-w / 2 + 28, -4, w - 56, 16, 8, '#2a2446'); gfRR(-w / 2 + 28, -4, (w - 56) * frac, 16, 8, color);
  gfRR(-w * 0.08, w * 0.28, w * 0.16, w * 0.1, 3, GF.ink); gfRR(-w * 0.22, w * 0.36, w * 0.44, 10, 5, GF.ink);
  ctx.restore();
}
function gfCloud(cx, cy, s, k = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s * k, s * k);
  ctx.beginPath(); ctx.moveTo(-170, 60);
  ctx.bezierCurveTo(-250, 60, -250, -30, -170, -40); ctx.bezierCurveTo(-170, -130, -70, -140, -30, -100); ctx.bezierCurveTo(10, -170, 120, -150, 130, -70);
  ctx.bezierCurveTo(220, -80, 250, 40, 160, 60); ctx.closePath(); gfFillStroke(GF.mint, GF.ink, 5);
  ctx.restore();
}

// ---------------------------------------------------------------------
//  captions: a rounded cream card, one natural phrase at a time, switched on the voice's own word times,
//  key words in red. Drawn after the camera (DEFER). GF_PHR = word counts per phrase, per line.
// ---------------------------------------------------------------------
const GF_PHR = { l1: [3, 4, 3], l2: [3, 3, 2, 3], l3: [3, 2], l4: [1, 4, 2, 3, 2], l5: [4], l6: [4, 3, 3, 2, 3, 2], l7: [5], l8: [2, 3, 3, 2, 2, 3, 2], l9: [4, 2, 3, 2, 2], l10: [4, 4], l11: [3, 2, 3], l12: [2, 3], l13: [3, 3] };
const gfKept = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '').length > 0;
const GF_CACHE = {};
function gfPhrases(L) {
  if (GF_CACHE[L.id]) return GF_CACHE[L.id];
  const toks = L.text.split(/\s+/), disp = [], pend = [];
  toks.forEach((t) => {
    if (gfKept(t)) { disp.push(pend.concat([t]).join(' ')); pend.length = 0; }
    else if (/[a-zA-ZÀ-ÿ]/.test(t)) pend.push(t);
    else if (disp.length) disp[disp.length - 1] += ' ' + t;
  });
  const counts = GF_PHR[L.id] || [disp.length];
  const out = []; let i = 0;
  counts.forEach((n) => { const ws = []; for (let k = 0; k < n && i < disp.length; k++, i++) ws.push({ w: disp[i], t0: L.words[Math.min(i, L.words.length - 1)].t0 }); if (ws.length) out.push(ws); });
  return (GF_CACHE[L.id] = out);
}
function gfSplit(ws) {
  if (ws.length === 1) return [ws];
  const txt = (a) => a.map((w) => w.w).join(' ').length;
  if (txt(ws) <= 17) return [ws];
  let best = null; for (let k = 1; k < ws.length; k++) { const m = Math.max(txt(ws.slice(0, k)), txt(ws.slice(k))); if (!best || m < best[0]) best = [m, k]; }
  return [ws.slice(0, best[1]), ws.slice(best[1])];
}
function gfCaptionNow() {
  if (typeof VOICE === 'undefined') return null;
  const L = VOICE.lines.find((l) => TT >= l.t0 - 0.03 && TT < l.t1 + 0.3); if (!L) return null;
  let cur = null; for (const ph of gfPhrases(L)) if (TT >= ph[0].t0 - 0.03) cur = ph;
  return cur;
}
function gfCaption(textOverride) {
  const draw = () => {
    const ch = textOverride ? [{ w: textOverride }] : gfCaptionNow(); if (!ch) return;
    const rows = gfSplit(ch), size = 66;
    ctx.save(); ctx.font = `800 ${size}px ${GF_FONT}`;
    const meas = rows.map((r) => ctx.measureText(r.map((w) => w.w.toUpperCase()).join(' ')).width), wmax = Math.max(...meas);
    const k = Math.min(1, 860 / (wmax + 90)), cw = (wmax + 90) * k, rh = 84 * k, chh = rows.length * rh + 44 * k, cy = 1490 - chh;
    gfRR(540 - cw / 2, cy, cw, chh, 34 * k, GF.cream);
    rows.forEach((r, ri) => {
      let x = 540 - meas[ri] * k / 2; const y = cy + 22 * k + rh * (ri + 0.5);
      r.forEach((w, wi) => {
        const t = w.w.toUpperCase() + (wi < r.length - 1 ? ' ' : ''), bare = w.w.toUpperCase().replace(/[^A-ZÀ-ÖØ-Þ]/g, '');
        ctx.font = `800 ${size * k}px ${GF_FONT}`; ctx.fillStyle = GF_KEYS.includes(bare) ? GF.red : GF.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); x += ctx.measureText(t).width;
      });
    });
    ctx.restore();
  };
  if (DEFER) DEFER.push(draw); else draw();
}
function gfTitle(a, b, lt = 0, y = 330) {
  const k = popS(E0 + lt);
  if (k <= 0) return;
  ctx.save(); ctx.translate(540, y); ctx.scale(k, k);
  ctx.font = `800 74px ${GF_FONT}`; const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width) + 80;
  gfRR(-w / 2, -110, w, 220, 34, GF.cream); gfText(a, 0, -36, 74, GF.red); gfText(b, 0, 40, 74, GF.ink); ctx.restore();
}

// =====================================================================
const STYLE = {
  name: 'grok-flat',
  paper: GF.night,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); ctx.save(); trace(P, true); ctx.lineWidth = 6; ctx.strokeStyle = GF.cream; ctx.stroke(); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { gfRR(x - r, y - r * 0.6, r * 2, r * 1.2, r * 0.05, GF.brick); gfRR(x - r * 0.5, y - r * 0.2, r * 0.15, r * 0.5, 2, GF.night); gfRR(x + r * 0.35, y - r * 0.2, r * 0.15, r * 0.5, 2, GF.night); },
  heroColor: GF.brick,
  post() {},
  ones: false,
};
