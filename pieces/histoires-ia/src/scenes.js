// =====================================================================
//  SCÈNES — Histoires d'IA, crosshatch. Coordonnées monde 1080x1920 ; temps TT (sur 2) ; ev / popS pour les événements.
//  L(t) = instant absolu du temps local t de la scène. Le héros (point terracotta) est dans chaque scène.
// =====================================================================
const L = (t) => E0 + t;
const lt = () => TT - E0;
const strike = (x0, y0, x1, y1, t0, key) => ink([[x0, y0], [x1, y1]], { w: 9, color: C.red, key, frac: ev(L(t0), 0.3), double: true });

// ---- 1. accroche : la page blanche, un point d'encre ouvre les yeux ----------
function sceneHook() {
  paperSheet('sheet');
  handText("L'IA va tout changer…", 100, 640, 82, C.ink, { key: 'h1', rot: -0.03, frac: ev(L(1.2), 1.7) });
  handText('…mais qui l’explique ?', 170, 800, 74, C.red, { key: 'h2', rot: 0.02, frac: ev(L(3.6), 1.7) });
  for (let i = 0; i < 7; i++) { const R = RNG('hk', i); star4(R.r(80, 1000), R.r(960, 1300), R.r(5, 11) * (0.7 + 0.3 * ((B + i) % 2)), 'rgba(58,36,23,0.35)'); }
  if (TT > L(0.3)) dotHero(540, 1090, 120 * Math.min(1, popS(L(0.3)) + 0.001), { key: 'hero', mood: lt() < 3.6 ? 'smile' : 'wow' });
  inkTag('salut');
  inkCaption('personne ne l’explique en histoires');
}

// ---- 2. qui je suis : le point à son bureau ---------------------------------
function sceneWho() {
  woodSurface(-40, -40, W + 40, H + 40, 'desk', {});
  // un ordinateur portable vu de face
  paint(box(250, 560, 580, 380), { fill: C.cream, key: 'lap', w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }, { k: 'hatch', a: 0.8, gap: 5, al: 0.16, dens: (x, y) => clamp((x + y - 800) / 500) }] });
  paint(box(290, 600, 500, 300), { fill: C.navy2, key: 'scr', w: 3, line: C.peri });
  paint(box(210, 940, 660, 40), { fill: C.cream, key: 'base', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.25 }] });
  handText(NAME, 330, 790, 78, C.cream, { key: 'nm', frac: ev(L(1.6), 1.8) });
  ink([[330, 820], [330 + handW(NAME, 78) * ev(L(3.4), 0.6), 826]], { w: 5, color: C.terra, key: 'nu', frac: 1 });
  inkMug(900, 1060, 90, 'mug');
  // une note collante
  ctx.save(); ctx.translate(120, 1080); ctx.rotate(-0.07);
  paint(box(0, 0, 260, 230), { fill: C.yellowL, key: 'stk', w: 2.6, tex: [{ k: 'pencil', c: C.yellow, al: 0.5, per: 70 }] });
  handText('1 histoire', 24, 100, 52, C.ink, { key: 'stk1', frac: ev(L(4.8), 0.6) });
  handText('= 1 idée', 24, 170, 52, C.ink, { key: 'stk2', frac: ev(L(5.5), 0.6) });
  ctx.restore();
  dotHero(560, 1250, 115, { key: 'hero', mood: 'happy' });
  inkTag('moi');
  inkCaption('des idées d’IA, dessinées à la main');
}

// ---- 3. règles : pas de jargon, pas de cours barbant -------------------------
function sceneRules() {
  paperSheet('sheet');
  [['du jargon', 600, 1.0], ['des cours barbants', 790, 2.4]].forEach(([s, y, t0], i) => {
    ctx.save(); ctx.translate(540, y); ctx.rotate(i ? 0.02 : -0.02);
    const w = handW(s, 70) + 90;
    paint(box(-w / 2, -70, w, 120), { fill: C.cream, key: 'rl' + i, w: 3, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 70 }] });
    handText(s, -w / 2 + 45, 20, 70, C.ink, { key: 'rt' + i, frac: ev(L(t0 - 0.5), 0.5) });
    ctx.restore();
    strike(540 - 330, y - 30, 540 + 330, y + 30, t0, 'st' + i);
  });
  // ce qu'on garde : un point, un dessin, une idée
  const k = ev(L(4.3), 0.9);
  handText('un point d’encre,', 150, 1010, 66, C.ink, { key: 'k1', frac: ev(L(4.3), 1.1) });
  handText('un dessin, une idée', 150, 1100, 66, C.green, { key: 'k2', frac: ev(L(5.4), 1.2) });
  if (k > 0) ink(ellipsePts(540, 1260, 70 * k, 70 * k, 0, 40), { closed: true, w: 5, color: C.terra, key: 'kc' });
  dotHero(540, 1260, 105, { key: 'hero', mood: lt() < 4.3 ? 'wow' : 'happy' });
  inkTag('zéro blabla');
  inkCaption('pas de cours barbant');
}

// ---- 4. promesse 1 : un robot dessiné, « ? » puis « ! » ---------------------
function sceneOne() {
  darkWorld('inside');
  // le robot
  paint(box(390, 560, 300, 250), { fill: C.navy2, key: 'rh', w: 4, line: C.peri, tex: [{ k: 'cross', c: C.periD, al: 0.4, gap: 7 }] });
  paint(box(410, 830, 260, 230), { fill: C.navy2, key: 'rb', w: 4, line: C.peri, tex: [{ k: 'cross', c: C.periD, al: 0.35, gap: 7 }] });
  ink([[540, 560], [540, 500]], { w: 5, color: C.peri, key: 'ra' });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(540, 490 + 6 * Math.sin(TT * 5), 16, 0, TAU); ctx.fill();
  const blink = (B % 37) < 2;
  for (const s of [-1, 1]) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.ellipse(540 + s * 70, 680, 28, blink ? 4 : 32, 0, 0, TAU); ctx.fill(); }
  ink([[490, 760], [590, 760]], { w: 6, color: C.cyan, key: 'rm' });
  // la bulle : d'abord « ? », puis « ! »
  const q = lt() < 3.1;
  const s = popS(L(q ? 0.9 : 3.1));
  ctx.save(); ctx.translate(820, 470); ctx.scale(s, s);
  paint(ellipsePts(0, 0, 130, 100, 0, 40), { fill: C.cream, key: 'bub', w: 4 });
  handText(q ? '?' : '!', q ? -22 : -14, 36, 110, q ? C.red : C.green, { key: 'bq' + q });
  ctx.restore();
  for (let i = 0; i < 18; i++) { const R = RNG('o1', i); star4(R.r(40, 1040), R.r(260, 1200), R.r(4, 9) * (0.7 + 0.3 * ((B + i) % 2)), C.white); }
  dotHero(540, 1290, 105, { key: 'hero', dark: true, mood: q ? 'wow' : 'happy' });
  inkTag('un');
  inkCaption('tu comprends ce que fait l’IA');
}

// ---- 5. promesse 2 : un téléphone, une ampoule qui s'allume ------------------
function sceneTwo() {
  paperSheet('sheet');
  // le téléphone
  paint(rrectPts(240, 520, 300, 560, 40), { fill: C.cream, key: 'ph', w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }] });
  paint(rrectPts(262, 570, 256, 440, 18), { fill: C.navy2, key: 'phs', w: 3, line: C.peri });
  ['astuce', 'du jour'].forEach((s, i) => monoText(s, 290, 680 + i * 70, 44, i ? C.cyan : C.white, { key: 'pt' + i, count: Math.floor(clamp((lt() - 0.6 - i * 0.6) / 0.6) * s.length) }));
  // l'ampoule
  const on = lt() > 2.2;
  paint(ellipsePts(790, 640, 120, 130, 0, 48), { fill: on ? C.yellow : C.cream, key: 'bulb', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: on ? 0.12 : 0.3, dens: (x, y) => clamp((x + y - 1000) / 400) }] });
  paint(box(745, 760, 90, 60), { fill: C.cream, key: 'bulbb', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.35 }] });
  if (on) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * (Math.PI / 8), r0 = 160, r1 = 220 + 14 * ((B + i) % 3); ink([[790 + Math.cos(a) * r0, 640 + Math.sin(a) * r0], [790 + Math.cos(a) * r1, 640 + Math.sin(a) * r1]], { w: 6, color: C.yellow, key: 'ry' + i, frac: ev(L(2.2 + i * 0.03), 0.25) }); }
  dotHero(560, 1250, 110, { key: 'hero', mood: on ? 'wow' : 'smile' });
  inkTag('deux');
  inkCaption('des astuces dès ce soir');
}

// ---- 6. promesse 3 : des pages empilées, 1/5, 2/5… ---------------------------
function sceneThree() {
  woodSurface(-40, -40, W + 40, H + 40, 'desk', {});
  for (let i = 0; i < 5; i++) {
    const s = popS(L(0.7 + i * 0.7)); if (s <= 0.01) continue;
    ctx.save(); ctx.translate(540 + (i - 2) * 26, 1000 - i * 112); ctx.rotate((i - 2) * 0.04); ctx.scale(s, s);
    paint(box(-260, -80, 520, 150), { fill: C.paper, key: 'pg' + i, w: 3.4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 70 }, { k: 'hatch', a: 0.8, gap: 5, al: 0.14, dens: (x, y) => clamp((x + y) / 400) }] });
    handText('histoire ' + (i + 1) + '/5', -220, 34, 64, i === 4 ? C.terra : C.ink, { key: 'pgt' + i });
    ctx.restore();
  }
  dotHero(540, 1290, 105, { key: 'hero', mood: 'happy' });
  inkTag('trois');
  inkCaption('une série, en plusieurs parties');
}

// ---- 7. l'histoire qui reste en tête ------------------------------------------
function sceneThreeB() {
  paperSheet('sheet');
  // une tête vue de profil, avec une petite page dedans
  paint(ellipsePts(540, 800, 250, 300, 0, 60), { fill: C.cream, key: 'head', w: 5, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }, { k: 'hatch', a: 0.8, gap: 6, al: 0.2, dens: (x, y) => clamp((x + y - 1000) / 500) }] });
  paint(box(440, 680, 200, 250), { fill: C.paper, key: 'in', w: 3.4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 60 }] });
  const k = ev(L(1.0), 1.6);
  for (let i = 0; i < 5; i++) ink([[462, 730 + i * 40], [462 + 140 * (0.6 + 0.4 * ((i * 5) % 3) / 2), 730 + i * 40]], { w: 3, color: 'rgba(58,36,23,0.6)', key: 'in' + i, frac: ev(L(1.0 + i * 0.25), 0.3) });
  paint(ellipsePts(540, 610, 38 * k, 38 * k, 0, 24), { fill: C.terra, key: 'mdot', w: 3, line: C.ink });
  for (let i = 0; i < 10; i++) { const R = RNG('tb', i), a = R.r(0, TAU); star4(540 + Math.cos(a) * R.r(290, 380), 800 + Math.sin(a) * R.r(330, 420), R.r(7, 15) * (0.7 + 0.3 * ((B + i) % 2)) * ev(L(2.5 + i * 0.1), 0.3), C.yellow); }
  dotHero(540, 1300, 105, { key: 'hero', mood: 'happy' });
  inkTag('en tête');
  inkCaption('elle reste en tête');
}

// ---- 8. silence : la page est pleine de dessins -------------------------------
function sceneSilence() {
  paperSheet('sheet');
  // des mini-dessins des scènes précédentes, posés sur la page
  paint(box(120, 520, 220, 180), { fill: C.navy2, key: 'm1', w: 3, line: C.peri }); ink([[200, 700], [200, 740]], { w: 4, color: C.ink, key: 'm1l' });
  paint(rrectPts(430, 500, 110, 210, 18), { fill: C.cream, key: 'm2', w: 3.4 });
  paint(ellipsePts(780, 600, 70, 76, 0, 36), { fill: C.yellow, key: 'm3', w: 3.4 });
  for (let i = 0; i < 4; i++) paint(box(150 + i * 14, 850 - i * 38, 230, 80), { fill: C.paper, key: 'm4' + i, w: 3 });
  paint(ellipsePts(740, 860, 120, 130, 0, 48), { fill: C.cream, key: 'm5', w: 3.4 });
  handText(NAME, 150, 1060, 60, 'rgba(58,36,23,0.35)', { key: 'm6', rot: -0.02 });
  dotHero(540, 1250, 125, { key: 'hero', mood: 'smile' });
}

// ---- 9. le coup : le titre s'encre sur la page ----------------------------------
function scenePayoff() {
  paperSheet('sheet');
  const w = handW(NAME, 140);
  handText(NAME, 540 - w / 2, 780, 140, C.ink, { key: 'tt', rot: -0.02, frac: ev(L(0.15), 1.3) });
  ink([[540 - w / 2, 830], [540 + w / 2, 846]], { w: 9, color: C.terra, key: 'tu', frac: ev(L(1.2), 0.5), double: true });
  for (let i = 0; i < 14; i++) { const a = i * (TAU / 14) + 0.2, R = 560 + 40 * ((i * 7) % 3); star4(540 + Math.cos(a) * R * 0.85, 800 + Math.sin(a) * R * 0.5, 14 * ev(L(0.1 + i * 0.03), 0.25) * (0.8 + 0.2 * ((B + i) % 2)), C.yellow); }
  dotHero(540, 1200, 140, { key: 'hero', mood: 'happy' });
  inkTag('c’est parti');
}

// ---- 10. appel : retour à la page blanche, signée -----------------------------------
function sceneCta() {
  paperSheet('sheet');
  handText(NAME, 540 - handW(NAME, 74) / 2, 560, 74, C.ink, { key: 'sig', rot: -0.02 });
  ink([[300, 600], [780, 612]], { w: 5, color: C.terra, key: 'sigu', double: true });
  dotHero(540, 880, 130, { key: 'hero', mood: 'happy' });
  // le bouton « s'abonner » : un curseur vient cliquer, il devient vert
  const click = L(3.6), clicked = TT >= click;
  const press = clicked ? 1 - 0.06 * Math.exp(-(TT - click) * 8) : 1;
  ctx.save(); ctx.translate(540, 1230); ctx.scale(press, press);
  paint(rrectPts(-250, -62, 500, 124, 62), { fill: clicked ? C.green : C.red, key: 'btn', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.18, dens: (x, y) => clamp((x + y + 300) / 600) }] });
  handText(clicked ? 'ABONNÉ ✓' : 'S’ABONNER', clicked ? -148 : -170, 24, 66, C.cream, { key: 'btt' + clicked });
  ctx.restore();
  const k = ev(L(1.0), 2.4), cx = 820 - 330 * k, cy = 1500 - 230 * k;
  paint([[cx, cy], [cx + 36, cy + 96], [cx + 56, cy + 66], [cx + 96, cy + 74]], { fill: C.white, key: 'cur', w: 3.4 });
  // la cloche
  const ring = clicked ? Math.sin((TT - click) * 22) * 0.3 * Math.exp(-(TT - click) * 2) : 0;
  ctx.save(); ctx.translate(830, 1230); ctx.rotate(ring);
  paint(ellipsePts(0, 0, 50, 56, 0, 30, Math.PI, TAU), { fill: C.yellow, key: 'bell', w: 4 });
  paint(box(-52, 0, 104, 22), { fill: C.yellow, key: 'bellb', w: 4 });
  paint(ellipsePts(0, 36, 14, 14, 0, 16), { fill: C.ink, key: 'belld', w: 2 });
  ctx.restore();
  inkTag('à demain');
  inkCaption('la prochaine histoire arrive demain');
}
