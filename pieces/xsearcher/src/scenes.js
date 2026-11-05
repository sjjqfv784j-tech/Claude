// =====================================================================
//  SCENES — X.GPT ad. World coords 1080x1920, TT absolute seconds. Shots are complete on their first frame.
//  Every word on screen comes from the xsearcher.cc landing page.
// =====================================================================
const nxCenter = (str, y, size, o = {}) => xrText(str, 500, y, size, { align: 'center', ...o });
const fitSize = (str, size, maxW) => Math.min(size, size * maxW / xrTextW(str, size));

function sceneDot() {
  const cu = TIMELINE.cues;
  xrBg({ glow: 0.3 + 0.2 * ev(0.4, 1.5), cy: 0.42 });
  xrRays(540, 760, 130, 340, ev(cu.dot, 0.8), 16);
  xrHero(540, 760, 64, { s: popS(cu.dot), pulse: 0.4 * ev(cu.dot, 1.0) });
  nxCenter('Une idée', 1180, 150, { frac: ev(0.9, 0.6) });
  nxCenter('en tête.', 1340, 150, { grad: true, frac: ev(1.35, 0.6), glow: 30 });
}

function sceneAsk() {
  const cu = TIMELINE.cues, q = 'Et si je créais un jeu ?';
  xrBg({ glow: 0.5, cy: 0.3 });
  xrHero(540, 420, 54, { key: 'ask' });
  xrCard(90, 600, 900, 170, 48, { glow: 0.35, stroke: xrRgb(XR.redHi, 0.45) });
  const f = ev(cu.type, 1.3), w = xrTextW(q, 56, 600, -0.02);
  xrText(q, 140, 706, 56, { weight: 600, spacing: -0.02, frac: f });
  if (Math.floor(TT * 2) % 2 === 0 || f < 1) { ctx.fillStyle = XR.redHi; xrRR(142 + w * f, 650, 6, 74, 3); ctx.fill(); }
  ctx.fillStyle = xrRedGrad(880, 640, 970, 730); ctx.beginPath(); ctx.arc(925, 685, 44, 0, TAU); ctx.fill();
  const labels = [['‹/›', 'Code & développement', cu.c1], ['✧', 'Création d’images', cu.c2], ['↗', 'Réponses & idées', cu.c3]];
  labels.forEach(([ic, label, t], i) => {
    const s = popS(t), y = 900 + i * 190;
    if (s <= 0) return;
    xrCard(90, y, 900, 150, 44, { s, glow: 0.25 });
    ctx.save(); ctx.translate(540, y + 75); ctx.scale(s, s); ctx.translate(-540, -(y + 75));
    xrRR(130, y + 28, 94, 94, 26); ctx.fillStyle = xrRedGrad(130, y + 28, 224, y + 122); ctx.fill();
    xrText(ic, 177, y + 92, 46, { align: 'center', weight: 700, spacing: 0, color: '#fff' });
    xrText(label, 262, y + 92, 56, { weight: 700, spacing: -0.03 });
    ctx.restore();
  });
}

const MODEL_ROWS = [['X.GPT', 'Claude', 'ChatGPT', 'Gemini'], ['DeepSeek', 'Mistral', 'Kimi'], ['Llama', 'Grok', 'Qwen']];
function sceneModels() {
  const cu = TIMELINE.cues, k = EZ.io(ev(cu.merge, 0.7));
  xrBg({ glow: 0.55, cy: 0.5 });
  nxCenter('Plusieurs modèles.', 400, 86);
  nxCenter('Un seul espace.', 505, 86, { grad: true, glow: 24 });
  MODEL_ROWS.forEach((row, ri) => {
    const size = 42, gap = 36, ws = row.map((n) => xrTextW(n, size, 700, -0.01) + size * 1.9 + gap), total = ws.reduce((a, b) => a + b, 0);
    const dir = ri % 2 ? 1 : -1, off = mod(dir * (TT - 6.0) * 150 + ri * 140, total);
    for (let rep = -1; rep <= 1; rep++) {
      let x = -off + rep * total + 60;
      row.forEach((n, i) => {
        const cx = x + ws[i] / 2 - gap / 2, y = 700 + ri * 140, hot = n === 'X.GPT';
        if (k < 0.999) xrChip(n, lerp(cx, 540, k), lerp(y, 720, k), { size, alpha: 1 - k, hot });
        x += ws[i];
      });
    }
  });
  // the one space: the X.GPT card (real logo) and the real landing page
  const s = popS(cu.card);
  xrCard(150, 610, 780, 220, 60, { s, glow: 1, stroke: xrRgb(XR.redHi, 0.6) });
  if (s > 0) {
    ctx.save(); ctx.translate(540, 720); ctx.scale(s, s); ctx.translate(-540, -720);
    drawAsset('logo.png', 215, 635, 170, 170, { fit: 'contain' });
    xrText('X.GPT', 420, 770, 120, { weight: 800 });
    ctx.restore();
  }
  const s2 = popS(cu.shot);
  if (s2 > 0) {
    ctx.save(); ctx.translate(540, 1150); ctx.scale(s2, s2); ctx.translate(-540, -1150);
    xrCard(100, 880, 880, 540, 36, { glow: 0.5, stroke: xrRgb(XR.redHi, 0.4) });
    ctx.save(); xrRR(110, 890, 860, 520, 28); ctx.clip(); drawAsset('home.png', 110, 890, 860, 520, { fit: 'cover' }); ctx.restore();
    ctx.restore();
  }
}

function sceneWord(i) {
  const word = RUSH_WORDS[i], red = i === 1 || i === 3 || i === 5;
  if (red) {
    ctx.save(); screen(); const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, XR.redHi); g.addColorStop(1, XR.redLo); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  } else xrBg({ glow: 0.7, cy: 0.5 });
  const size = fitSize(word, 250, 820);
  nxCenter(word, 1000 + size * 0.15, size, { color: red ? '#0b0a0b' : XR.ink, grad: false });
  if (!red) { ctx.fillStyle = xrRedGrad(300, 0, 780, 0); xrRR(340, 1030 + size * 0.15, 400, 14, 7); ctx.fill(); }
}

function sceneVoila() {
  const cu = TIMELINE.cues, t0 = 13.0;
  xrBg({ glow: 0.9, cy: 0.5 });
  xrRays(540, 620, 120, 380, ev(t0, 0.7), 18);
  xrHero(540, 620, 70, { key: 'voila', pulse: 0.8 * ev(t0, 0.8) });
  nxCenter('voilà.', 1050, 300, { grad: true, glow: 50 });
}

function sceneSilence() {
  xrBg({ glow: 0.1, dust: 6, dustK: 0.5, grid: false });
  xrHero(540, 960, 12, { key: 'sil', s: 1 - 0.4 * ev(14.0, 1.0) });
}

function scenePayoff() {
  const cu = TIMELINE.cues, hit = cu.hit;
  xrBg({ glow: 1.0, cy: 0.45 });
  const sl = 1 + 0.1 * (1 - EZ.o3(ev(hit, 0.35)));
  ctx.save(); ctx.translate(500, 900); ctx.scale(sl, sl); ctx.translate(-500, -900);
  nxCenter('Tout pour', 770, 176, { grad: true, glow: 60 });
  nxCenter('la créer.', 975, 176, { grad: true, glow: 60 });
  ctx.restore();
  const s1 = popS(cu.lock);
  if (s1 > 0) {
    const w = 150 + 34 + xrTextW('X.GPT', 120), x0 = 500 - w / 2;
    ctx.save(); ctx.translate(500, 1150); ctx.scale(s1, s1); ctx.translate(-500, -1150);
    drawAsset('logo.png', x0, 1075, 150, 150, { fit: 'contain' });
    xrText('X.GPT', x0 + 184, 1190, 120, { weight: 800 });
    ctx.restore();
  }
  xrText('xsearcher.cc', 500, 1330, fitSize('xsearcher.cc', 118, 820), { align: 'center', weight: 800, color: XR.ink, frac: ev(cu.url, 0.6), glow: 12 });
  xrButton('Entrer dans X.GPT', 500, 1440, 740, 118, { s: popS(cu.btn) });
  // the hit: a flash of red that settles
  const fl = 1 - ev(hit, 0.4);
  if (TT >= hit && fl > 0) { ctx.save(); screen(); ctx.globalAlpha = fl * 0.75; ctx.fillStyle = XR.redHi; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  SPARK_AT = toScreen(540, 880);
}
