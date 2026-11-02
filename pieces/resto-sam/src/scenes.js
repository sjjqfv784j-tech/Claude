// =====================================================================
//  SCÈNES — Le resto de Sam, crosshatch. Nuit : monde sombre bleu marine, cartes de papier crème, Sam (chef) à gauche, Pixel (le point terracotta) à droite.
//  L(t) = instant absolu du temps local t de la scène. Les prises de parole viennent de la voix (VL, SPK).
// =====================================================================
const L = (t) => E0 + t;
const lt = () => TT - E0;
const COUNTER = 1400;

// qui parle, là, maintenant : 's' (Sam), 'p' (Pixel) ou null
function speaker() {
  for (const l of VOICE.lines) if (TT >= l.t0 - 0.05 && TT <= l.t1 + 0.1) return SPK[l.id];
  return null;
}

// ---- décor : nuit sur la ville, comptoir en bois ------------------------------
function nightRoom(key) {
  darkWorld(key);
  // la lune
  paint(ellipsePts(880, 400, 70, 70, 0, 40), { fill: C.cream, key: key + 'moon', line: C.white, w: 3, tex: [{ k: 'cross', c: C.periD, al: 0.25, gap: 7 }] });
  // les immeubles, avec des fenêtres allumées (déterministe)
  for (let i = 0; i < 9; i++) {
    const R = RNG('bld', i), bw = 110 + R.r(0, 60), bh = 260 + R.r(0, 300), bx = i * 128 - 30;
    paint(box(bx, COUNTER - bh, bw, bh), { fill: i % 2 ? '#101232' : '#15173a', key: key + 'b' + i, w: 2.4, line: C.periD, tex: [{ k: 'hatch', a: 0.8, gap: 7, al: 0.2 }] });
    for (let r = 0; r < Math.floor(bh / 48); r++) for (let c = 0; c < 3; c++) {
      const on = RNG('win', i * 100 + r * 3 + c).r(0, 1) > 0.55;
      if (on) { ctx.fillStyle = (B + i + r + c) % 61 === 0 ? 'rgba(240,197,90,0.3)' : 'rgba(240,197,90,0.85)'; ctx.fillRect(bx + 14 + c * ((bw - 28) / 3), COUNTER - bh + 22 + r * 48, (bw - 28) / 3 - 10, 22); }
    }
  }
  // le comptoir
  woodSurface(-40, COUNTER, W + 40, H + 40, key + 'wood', {});
}

// ---- Sam : le chef, dessiné à l'encre ------------------------------------------
function sam(x, y, mood, talk) {
  const skin = '#c98b62';
  // la veste
  paint(rrectPts(x - 190, y + 150, 380, COUNTER - y + 60, 70), { fill: C.cream, key: 'samc', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 6, al: 0.22, dens: (px, py) => clamp((px + py - 900) / 500) }, { k: 'pencil', c: '#e8d6b0', al: 0.4, per: 80 }] });
  ink([[x, y + 190], [x, COUNTER + 40]], { w: 3, color: 'rgba(58,36,23,0.5)', key: 'samseam' });
  [1, 2, 3].forEach((i) => { ctx.fillStyle = 'rgba(58,36,23,0.45)'; ctx.beginPath(); ctx.arc(x - 34, y + 220 + i * 60, 8, 0, TAU); ctx.arc(x + 34, y + 220 + i * 60, 8, 0, TAU); ctx.fill(); });
  paint(box(x - 70, y + 120, 140, 50), { fill: C.red, key: 'samsc', w: 3.4, tex: [{ k: 'hatch', a: 0.7, gap: 5, al: 0.3 }] });
  // la tête
  paint(ellipsePts(x, y, 112, 128, 0, 48), { fill: skin, key: 'samh', w: 4.6, tex: [{ k: 'pencil', c: '#e0a77f', al: 0.4, per: 60 }, { k: 'hatch', a: 0.8, gap: 5, al: 0.2, dens: (px, py) => clamp((px + py - 1000) / 400) }] });
  // la barbe (sous le nez, autour de la bouche)
  paint(ellipsePts(x, y + 82, 96, 52, 0, 40), { fill: '#3a2a22', key: 'samb', w: 3.4, tex: [{ k: 'hatch', a: 0.8, gap: 4, al: 0.35 }] });
  // la toque
  paint(rrectPts(x - 100, y - 160, 200, 70, 12), { fill: C.cream, key: 'samt1', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 6, al: 0.15 }] });
  paint(ellipsePts(x, y - 210, 126, 78, 0, 40), { fill: C.cream, key: 'samt2', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 6, al: 0.17, dens: (px, py) => clamp((px + py - 900) / 300) }] });
  // sourcils, yeux selon l'humeur
  const tired = mood === 'tired', wow = mood === 'wow', happy = mood === 'happy';
  ink([[x - 70, y - 38 - (wow ? 18 : 0) + (tired ? 6 : 0)], [x - 28, y - 46 - (wow ? 18 : 0) - (tired ? -4 : 0)]], { w: 9, color: '#3a2a22', key: 'sbl' });
  ink([[x + 28, y - 46 - (wow ? 18 : 0) - (tired ? -4 : 0)], [x + 70, y - 38 - (wow ? 18 : 0) + (tired ? 6 : 0)]], { w: 9, color: '#3a2a22', key: 'sbr' });
  const blink = (B % 43) < 2;
  for (const s of [-1, 1]) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x + s * 48, y - 4, 11, blink ? 2 : (tired ? 9 : wow ? 18 : 13), 0, 0, TAU); ctx.fill(); }
  if (tired) for (const s of [-1, 1]) ink([[x + s * 48 - 22, y + 24], [x + s * 48 + 22, y + 24]], { w: 4, color: 'rgba(58,36,23,0.5)', key: 'sbag' + s });
  // la bouche : ouverte quand il parle
  if (talk > 0.05 || wow) { ctx.fillStyle = '#5a2a2a'; ctx.beginPath(); ctx.ellipse(x, y + 78, wow ? 18 : 26, 6 + talk * 18 + (wow ? 10 : 0), 0, 0, TAU); ctx.fill(); }
  else if (happy) ink(arcPts(x, y + 70, 30, Math.PI * 0.15, Math.PI * 0.85, 10), { w: 6, color: C.cream, key: 'sbm' });
  else ink([[x - 24, y + 80], [x + 24, y + 80]], { w: 6, color: C.cream, key: 'sbm2' });
}
function pixel(x, y, mood) { return dotHero(x, y, 105, { key: 'hero', dark: true, mood }); }

// ---- cartes de papier ----------------------------------------------------------
function card(x, y, w, h, key, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); const s = o.s ?? 1; ctx.scale(s, s);
  paint(rrectPts(-w / 2 + 7, -h / 2 + 9, w, h, 16), { fill: 'rgba(0,0,0,0.35)', line: false, key: key + 'sh', tex: [{ k: 'hatch', a: 0.8, gap: 4, al: 0.5 }] });
  paint(rrectPts(-w / 2, -h / 2, w, h, 16), { fill: o.fill ?? C.cream, key, w: 3.6, line: o.line ?? C.ink, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }, { k: 'hatch', a: 0.8, gap: 6, al: 0.12, dens: (px, py) => clamp((px + py) / 700) }] });
  ctx.restore();
}
const cardText = (str, x, y, size, color, key, frac = 1, rot = 0) => handText(str, x, y, size, color, { key, frac, rot });

// ---- le décor commun d'une scène : nuit + Sam + Pixel + qui parle -----------------
function stage(samMood, pixMood, name) {
  nightRoom('night');
  const sp = speaker();
  const talk = sp === 's' ? 0.5 + 0.5 * Math.sin(TT * 22) : 0;
  sam(270, 1135, samMood, talk);
  pixel(810, 1285 + (sp === 'p' ? -6 * Math.abs(Math.sin(TT * 9)) : 0), pixMood);
  if (sp) inkCard(sp === 's' ? 'Sam' : 'Pixel', sp === 's' ? 270 : 810, COUNTER + 150, 54, { rot: sp === 's' ? -0.03 : 0.03, s: 1 });
}

// ---- 1. minuit passé -------------------------------------------------------------
function sceneClock() {
  stage('tired', 'wow');
  card(540, 560, 520, 320, 'ck', { rot: -0.02 });
  const colon = (B % 24) < 12 ? ':' : ' ';
  cardText('23' + colon + '52', 540 - handW('23:52', 150) / 2, 620, 150, C.red, 'ckt', ev(L(0.4), 0.5), -0.02);
  cardText('toujours au resto…', 540 - handW('toujours au resto…', 54) / 2, 505, 54, C.ink, 'cks', ev(L(0.9), 0.6), -0.02);
  inkTag('minuit');
}
// ---- 2. les réservations doublent --------------------------------------------------
function sceneRevenue() {
  stage('tired', 'happy');
  card(540, 560, 600, 330, 'rv', { rot: 0.02 });
  cardText('réservations / semaine', 540 - handW('réservations / semaine', 50) / 2, 480, 50, C.ink, 'rvs', ev(L(0.3), 0.6), 0.02);
  const n = Math.round(120 + 120 * ev(L(0.8), 1.2));
  cardText(String(n), 290, 660, 150, C.ink, 'rvn', 1, 0.02);
  if (ev(L(2.2), 0.4) > 0) { paint(rrectPts(640, 570, 190, 110, 24), { fill: C.green, key: 'rvx', w: 3.6 }); cardText('×2', 675, 738, 86, C.cream, 'rvx2', 1, 0.02); }
  inkTag('trop bien');
}
// ---- 3. tout le soir -----------------------------------------------------------------
function sceneOverload() {
  stage('tired', 'wow');
  [['réservations ×2', 520, C.red], ['avis en ligne ×2', 680, C.red], ['commandes : le soir', 840, C.yellow]].forEach(([s, y, c], i) => {
    const k = popS(L(0.5 + i * 1.5));
    if (k > 0) { card(540, y, 640, 130, 'ov' + i, { rot: i % 2 ? 0.02 : -0.02, s: k }); if (k > 0.8) cardText(s, 540 - handW(s, 60) / 2, y + 22, 60, i === 2 ? C.ink : C.red, 'ovt' + i, 1, i % 2 ? 0.02 : -0.02); }
  });
  inkTag('tout le soir');
}
// ---- 4. un seul Sam ------------------------------------------------------------------
function sceneAlone() {
  stage('tired', 'smile');
  ['résas', 'avis', 'stocks', 'cuisine'].forEach((s, i) => { const k = popS(L(0.3 + i * 0.15)); if (k > 0) { card(190 + i * 235, 440, 200, 90, 'al' + i, { rot: (i - 1.5) * 0.03, s: k }); cardText(s, 190 + i * 235 - handW(s, 44) / 2, 455, 44, C.ink, 'alt' + i, 1, (i - 1.5) * 0.03); } });
  for (let i = 0; i < 4; i++) ink([[190 + i * 235, 510], [540 + (i - 1.5) * 40, 620]], { w: 5, color: C.yellow, key: 'ala' + i, frac: ev(L(0.9 + i * 0.1), 0.4) });
  const shake = Math.sin(TT * 22) * 6 * (ev(L(1.2), 0.1));
  card(540 + shake, 700, 520, 130, 'al1s', { rot: 0.01, fill: C.cream, line: C.red });
  cardText('1 SEUL SAM', 540 - handW('1 SEUL SAM', 78) / 2 + shake, 728, 78, C.red, 'alt1', ev(L(1.2), 0.5));
  inkTag('tout seul');
}
// ---- 5. les agents ---------------------------------------------------------------------
const AG = [{ id: 's8', label: 'réservations', c: '#52d6c4', x: 230 }, { id: 's9', label: 'avis ✓ tu valides', c: '#5de37a', x: 540 }, { id: 's10', label: 'stocks', c: '#e0368f', x: 850 }];
function sceneAgents() {
  stage('wow', 'happy');
  // Pixel envoie un fil vers chaque agent, au moment où la voix en parle
  AG.forEach((a, i) => {
    const t0 = VL(a.id).t0, k = ev(t0, 0.5); if (k <= 0) return;
    const x = a.x, y = 600;
    ink([[810, 1185], [810 + (x - 810) * k, 1185 + (y + 64 - 1185) * k]], { w: 5, color: a.c, key: 'agl' + i, double: true });
    if (k > 0.5) {
      const s = popS(t0 + 0.2);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      paint(ellipsePts(0, 0, 62, 62, 0, 32), { fill: a.c, key: 'ag' + i, w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.25 }] });
      for (const e of [-1, 1]) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(e * 20, -6, 7, 0, TAU); ctx.fill(); }
      ink(arcPts(0, 14, 16, Math.PI * 0.2, Math.PI * 0.8, 8), { w: 4, color: C.ink, key: 'agm' + i });
      ctx.restore();
      cardText(a.label, x - handW(a.label, 40) / 2, y - 85, 40, C.cream, 'agt' + i, ev(t0 + 0.25, 0.4));
    }
  });
  inkTag('mes agents');
}
// ---- 6. la cuisine ------------------------------------------------------------------------
function sceneCuisine() {
  stage('happy', 'happy');
  card(540, 560, 640, 360, 'cu', { rot: -0.02 });
  paint(ellipsePts(540, 480, 90, 56, 0, 36), { fill: C.cream, key: 'cut1', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 6, al: 0.2 }] });
  paint(rrectPts(450, 510, 180, 50, 10), { fill: C.cream, key: 'cut2', w: 4 });
  cardText('toi : la cuisine', 540 - handW('toi : la cuisine', 66) / 2, 680, 66, C.terra, 'cut', ev(L(0.4), 0.8), -0.02);
  inkTag('ton métier');
}
// ---- 7. avant : 16 h par jour -------------------------------------------------------------
function dayBar(y, parts, key) {
  let x = 210; const total = 660;
  parts.forEach(([w, c, t], i) => { const pw = total * w; paint(box(x, y, pw, 70), { fill: c, key: key + i, w: 3, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.22 }] }); if (t) cardText(t, x + 12, y + 50, 34, C.ink, key + 't' + i); x += pw; });
}
function sceneBefore() {
  stage('tired', 'smile');
  card(540, 560, 700, 440, 'bf', { rot: 0.01 });
  cardText("aujourd'hui", 540 - handW("aujourd'hui", 50) / 2, 460, 50, C.ink, 'bf1', ev(L(0.2), 0.5));
  cardText('16 h / jour', 540 - handW('16 h / jour', 110) / 2, 590, 110, C.red, 'bf2', ev(L(0.5), 0.7));
  dayBar(650, [[0.21, C.periD, '5 h'], [0.79, C.red, 'travail 16 h']], 'bfb');
  inkTag('avant');
}
// ---- 8. demain : 10 h et de vraies nuits ---------------------------------------------------
function sceneAfter() {
  stage('happy', 'happy');
  card(540, 560, 700, 440, 'af', { rot: -0.01, line: C.green });
  cardText('demain', 540 - handW('demain', 50) / 2, 460, 50, C.ink, 'af1', ev(L(0.3), 0.5));
  cardText('10 h / jour', 540 - handW('10 h / jour', 110) / 2, 590, 110, C.green, 'af2', ev(L(0.6), 0.7));
  dayBar(650, [[0.33, C.periD, 'sommeil 8 h'], [0.42, C.terra, 'cuisine'], [0.25, C.cyan, 'agents']], 'afb');
  // étincelles au moment du coup
  for (let i = 0; i < 12; i++) { const a = i * (TAU / 12) + 0.2; star4(540 + Math.cos(a) * 520, 560 + Math.sin(a) * 300, 14 * ev(L(0.05 + i * 0.03), 0.25) * (0.8 + 0.2 * ((B + i) % 2)), C.yellow); }
  inkTag('demain');
}
// ---- 9. abonne-toi ----------------------------------------------------------------------------
function sceneFollow() {
  stage('happy', 'happy');
  card(540, 560, 640, 380, 'fl', { rot: 0.01 });
  cardText('la suite bientôt…', 540 - handW('la suite bientôt…', 62) / 2, 520, 62, C.ink, 'fl1', ev(L(0.3), 0.8));
  const click = L(3.0), clicked = TT >= click;
  ctx.save(); ctx.translate(540, 660); const press = clicked ? 1 - 0.06 * Math.exp(-(TT - click) * 8) : 1; ctx.scale(press, press);
  paint(rrectPts(-230, -58, 460, 116, 58), { fill: clicked ? C.green : C.red, key: 'flb', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.18 }] });
  handText(clicked ? 'ABONNÉ ✓' : 'S’ABONNER', clicked ? -140 : -160, 22, 62, C.cream, { key: 'flbt' + clicked });
  ctx.restore();
  const k = ev(L(0.6), 2.2); paint([[820 - 300 * k, 920 - 240 * k], [856 - 300 * k, 1016 - 240 * k], [876 - 300 * k, 986 - 240 * k], [916 - 300 * k, 994 - 240 * k]], { fill: C.white, key: 'flcur', w: 3.4 });
  inkTag('à demain');
}
