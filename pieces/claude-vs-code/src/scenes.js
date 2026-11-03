// =====================================================================
//  SCÈNES — Claude ou Claude Code ?, crosshatch. Coordonnées monde 1080x1920 ; temps TT ; ev / popS pour les événements.
//  L(t) = instant absolu du temps local t de la scène. Le héros (Pixel, point terracotta) est dans chaque scène.
//  Première et dernière scène : même cadre (page, Pixel, étiquette, titre, mention) → la boucle retombe sur la première image.
// =====================================================================
const L = (t) => E0 + t;
const lt = () => TT - E0;
const rel = (abs, i) => abs - SC[i];            // instant absolu → temps local de la scène i

// le titre géant : visible dès la première image et à la dernière (la boucle retombe dessus), jamais d'apparition
function bigTitle() {
  const w1 = handW('Claude', 150), w2 = handW('ou Claude Code ?', 96);
  handText('Claude', 540 - w1 / 2, 520, 150, C.ink, { key: 'bt1', rot: -0.02 });
  ink([[540 - w1 / 2, 556], [540 + w1 / 2, 570]], { w: 9, color: C.terra, key: 'bt-u', double: true });
  handText('ou Claude Code ?', 540 - w2 / 2, 680, 96, C.terra, { key: 'bt2', rot: 0.015 });
}
const fixedFrame = () => {};

// un ordinateur portable vu de face, centré sur (0,0) : écran avec des lignes de code, base
function laptopIcon(key) {
  paint(box(-130, -110, 260, 170), { fill: C.navy2, key: key + 's', w: 4, line: C.peri, tex: [{ k: 'cross', c: C.periD, al: 0.35, gap: 7 }] });
  [0, 1, 2].forEach((k) => ink([[-100, -76 + k * 36], [-100 + 90 + k * 36 - (k % 2) * 30, -76 + k * 36]], { w: 6, color: [C.cyan, C.peri, C.green][k], key: key + 'l' + k }));
  paint(box(-170, 62, 340, 26), { fill: C.cream, key: key + 'b', w: 4, tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.25 }] });
}
const bubble = (x, y, w, h, o = {}) => paint(rrectPts(x, y, w, h, 34), { fill: o.fill || C.cream, key: o.key, w: 3.6, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 70 }, { k: 'hatch', a: 0.8, gap: 5, al: 0.14, dens: (px, py) => clamp((px + py - 900) / 500) }] });
const lines = (x, y, n, w, t0, key, color = 'rgba(58,36,23,0.7)') => { for (let i = 0; i < n; i++) ink([[x, y + i * 46], [x + w * (i === n - 1 ? 0.6 : 1) - (i % 2) * 24, y + i * 46 + 2]], { w: 4.5, color, key: key + i, frac: ev(L(t0 + i * 0.35), 0.4) }); };
const check = (x, y, t0, key) => ink([[x - 24, y], [x - 6, y + 22], [x + 30, y - 28]], { w: 9, color: C.green, key, frac: ev(L(t0), 0.3) });

// ---- 1. accroche : copier, coller, recopier… -----------------------------------------------------
function sceneHook() {
  paperSheet('sheet');
  bigTitle();
  const h0 = VL('l1').t0;                     // Pixel répond à partir d'ici ; avant, « toi » pose la question
  if (lt() < h0 - 0.1) {                      // la question de « toi » (voix l1a) : bulle bleue sous le titre
    const qs = popS(L(0.3));
    if (qs > 0.01) { ctx.save(); ctx.translate(540, 960); ctx.scale(qs, qs); bubble(-400, -130, 800, 260, { key: 'h-q', fill: C.sky });
      handText('Pixel, c’est quoi la', -350, -10, 70, C.ink, { key: 'h-q1', frac: ev(L(0.4), 1.0) });
      handText('différence ?', -350, 80, 70, C.ink, { key: 'h-q2', frac: ev(L(1.5), 1.2) }); ctx.restore(); }
    handText('toi', 150, 1130, 56, C.ink, { key: 'h-qt', frac: ev(L(0.5), 0.3) });
  }
  const a = popS(L(h0 + 0.3)), b = popS(L(h0 + 0.5));
  // à gauche : la réponse de Claude ; à droite : ton projet ; une petite carte fait l'aller-retour à la main
  if (a > 0.01) { ctx.save(); ctx.translate(250, 880); ctx.scale(a, a); bubble(-130, -90, 260, 180, { key: 'h-a' }); lines(-96, -40, 3, 190, h0 + 0.6, 'h-al'); ctx.restore(); }
  if (b > 0.01) { ctx.save(); ctx.translate(790, 880); ctx.scale(b, b); paint(box(-130, -90, 260, 180), { fill: C.paper, key: 'h-b', w: 3.6, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 60 }] }); monoText('projet/', -100, -20, 34, C.ink, { key: 'h-bt' }); ink([[-100, 20], [60, 22]], { w: 4, color: 'rgba(58,36,23,0.6)', key: 'h-bl' }); ctx.restore(); }
  if (lt() > h0 + 0.8) {
    const k = ((lt() - h0 - 0.8) % 1.1) / 1.1, x = 380 + 300 * EZ.io(Math.min(1, k * 1.25));
    ctx.save(); ctx.translate(x, 840 - Math.sin(Math.min(1, k * 1.25) * Math.PI) * 40);
    paint(box(-34, -26, 68, 52), { fill: C.yellowL, key: 'h-c', w: 3, tex: [{ k: 'pencil', c: C.yellow, al: 0.5, per: 40 }] }); ctx.restore();
  }
  [['copier…', 1050, h0 + 0.8], ['coller…', 1130, h0 + 1.5], ['recopier…', 1210, h0 + 2.2]].forEach(([s, y, t0], i) => handText(s, 110 + i * 60, y, 76, i === 2 ? C.red : C.ink, { key: 'hk' + i, rot: -0.02 + i * 0.02, frac: ev(L(t0), 0.6) }));
  const q = ev(L(h0 + 3.0), 0.4); if (q > 0) handText('?', 800, 1230, 190 * q, C.red, { key: 'hq', rot: 0.08 });
  dotHero(540, 1360, 90, { key: 'hero', mood: lt() < h0 + 3.0 ? 'smile' : 'wow' });
}

// ---- 2. Claude : une conversation, puis c'est toi qui fais ------------------------------------------
function sceneTalk() {
  woodSurface(-40, -40, W + 40, H + 40, 'desk', {});
  // toi (à droite) → Claude (à gauche)
  const s1 = popS(L(0.3)), s2 = popS(L(1.6));
  if (s1 > 0.01) { ctx.save(); ctx.translate(660, 560); ctx.scale(s1, s1); bubble(-260, -80, 520, 160, { key: 't-q', fill: C.sky }); handText('Comment faire… ?', -220, 18, 56, C.ink, { key: 't-qt', frac: ev(L(0.5), 0.9) }); ctx.restore(); }
  if (s2 > 0.01) { ctx.save(); ctx.translate(390, 850); ctx.scale(s2, s2); bubble(-290, -150, 580, 300, { key: 't-a' }); ctx.restore(); lines(130, 740, 4, 440, 1.8, 'ta', 'rgba(58,36,23,0.75)'); }
  handText('toi', 760, 700, 56, C.cream, { key: 't-l1', frac: ev(L(0.4), 0.3) }); handText('Claude', 150, 1050, 56, C.cream, { key: 't-l2', frac: ev(L(1.8), 0.4) });
  // la note : « à toi de faire »
  const n = popS(L(rel(VF('l2', 0.7), 1)));
  if (n > 0.01) { ctx.save(); ctx.translate(690, 1180); ctx.rotate(-0.05); ctx.scale(n, n); paint(box(-250, -90, 500, 180), { fill: C.yellowL, key: 't-st', w: 3, tex: [{ k: 'pencil', c: C.yellow, al: 0.5, per: 70 }] }); handText('à toi de faire !', -205, 22, 60, C.red, { key: 't-stt', frac: ev(L(rel(VF('l2', 0.72), 1)), 0.6) }); ctx.restore(); }
  dotHero(250, 1250, 100, { key: 'hero', mood: 'smile' });
  inkTag('Claude');
  inkCaption('il te répond');
}

// ---- 3. Claude Code : dans ton projet (outils réels : Read, Edit, Bash) ---------------------------------
function sceneAgent() {
  darkWorld('inside');
  paint(rrectPts(110, 470, 700, 500, 28), { fill: C.navy2, key: 'a-f', w: 4, line: C.peri, tex: [{ k: 'cross', c: C.periD, al: 0.35, gap: 7 }] });
  monoText('mon-projet/', 150, 535, 44, C.cyan, { key: 'a-t', count: Math.floor(clamp(lt() / 0.9) * 11) });
  ['index.html', 'style.css', 'app.js'].forEach((s, i) => monoText(s, 190, 630 + i * 100, 46, C.peri, { key: 'a-f' + i, count: Math.floor(clamp((lt() - 0.5 - i * 0.2) / 0.5) * s.length) }));
  const t0 = rel(VF('l3', 0.40), 2), t1 = rel(VF('l3', 0.62), 2), t2 = rel(VF('l3', 0.85), 2);
  toolPill('Read', 'index.html', 90, 1000, L(t0), { size: 40 });
  toolPill('Edit', 'style.css', 90, 1100, L(t1), { size: 40 });
  toolPill('Bash', 'npm test', 90, 1200, L(t2), { size: 40 });
  [t0, t1, t2].forEach((t, i) => { if (lt() > t + 0.4) check(780, 640 + i * 100, t + 0.4, 'a-ok' + i); });
  dotHero(850, 1100, 95, { key: 'hero', dark: true, mood: lt() < t1 ? 'smile' : 'happy' });
  inkTag('Claude Code');
  inkCaption('il travaille dans tes fichiers');
}

// ---- 4. le téléphone et l'ordinateur ---------------------------------------------------------------
function sceneFriend() {
  paperSheet('sheet');
  const p = popS(L(0.5));
  if (p > 0.01) {
    ctx.save(); ctx.translate(240, 720); ctx.scale(p, p);
    paint(rrectPts(-130, -250, 260, 500, 40), { fill: C.cream, key: 'f-ph', w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }] });
    paint(rrectPts(-108, -190, 216, 370, 16), { fill: C.navy2, key: 'f-phs', w: 3, line: C.peri });
    paint(rrectPts(-90, -150, 180, 70, 20), { fill: C.cream, key: 'f-b1', w: 2.6 }); paint(rrectPts(-90, -50, 140, 70, 20), { fill: C.sky, key: 'f-b2', w: 2.6 });
    ctx.restore();
  }
  handText('Claude', 110, 1050, 70, C.ink, { key: 'f-n1', frac: ev(L(1.2), 0.5) }); handText('(au téléphone)', 80, 1112, 46, '#8a5a3a', { key: 'f-n1b', frac: ev(L(1.7), 0.6) });
  const tb = rel(VF('l4', 0.52), 5), h = popS(L(tb));
  if (h > 0.01) {
    ctx.save(); ctx.translate(700, 760); ctx.scale(h * 1.25, h * 1.25); laptopIcon('f-lp'); ctx.restore();
    handText('Claude Code', 480, 1000, 70, C.ink, { key: 'f-n2', frac: ev(L(tb + 0.8), 0.7) }); handText('(sur ton ordinateur)', 480, 1060, 46, '#8a5a3a', { key: 'f-n2b', frac: ev(L(tb + 1.3), 0.5) });
  }
  dotHero(540, 1290, 85, { key: 'hero', mood: 'happy' });
  inkTag('un ami');
  inkCaption('un conseil, ou un coup de main');
}

// ---- 5. la règle -----------------------------------------------------------------------------------------------
function sceneRule() {
  paperSheet('sheet');
  const tA = rel(VF('l5', 0.0), 6) + 0.2, tB = rel(VF('l5', 0.40), 6);
  inkCard('Claude', 310, 540, 92, { rot: -0.03, s: popS(L(tA)), color: C.ink });
  ['une idée', 'un texte', 'une question'].forEach((s, i) => handText(s, 110 + (i % 2) * 50, 690 + i * 96, 76, C.green, { key: 'r1' + i, frac: ev(L(tA + 0.5 + i * 0.7), 0.5) }));
  check(900, 760, tA + 2.4, 'r-ck1');
  ink([[100, 975], [980, 987]], { w: 4, color: 'rgba(58,36,23,0.4)', key: 'r-sep', frac: ev(L(tB - 0.3), 0.4) });
  inkCard('Claude Code', 400, 1070, 92, { rot: 0.025, s: popS(L(tB)), color: C.terra });
  handText('un projet à modifier', 100, 1200, 72, C.green, { key: 'r2', frac: ev(L(tB + 0.7), 1.2) });
  check(900, 1180, tB + 2.2, 'r-ck2');
  dotHero(850, 1330, 75, { key: 'hero', mood: 'happy' });
  inkTag('la règle');
  inkCaption('un conseil ou un projet ?');
}

// ---- 6. attention : abonnement payant ou compte Console --------------------------------------------------------
function scenePrice() {
  woodSurface(-40, -40, W + 40, H + 40, 'desk', {});
  const s = popS(L(0.4));
  if (s > 0.01) {
    ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.03); ctx.scale(s, s);
    paint(box(-380, -170, 760, 340), { fill: C.paper, key: 'p-t', w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }, { k: 'hatch', a: 0.8, gap: 5, al: 0.15, dens: (x, y) => clamp((x + y + 300) / 700) }] });
    handText('abonnement payant', -320, -40, 74, C.ink, { key: 'p-t1', frac: ev(L(0.7), 1.0) });
    handText('ou compte Console', -300, 90, 74, C.ink, { key: 'p-t2', frac: ev(L(1.9), 1.0) });
    ctx.restore();
  }
  const e = popS(L(0.9)); if (e > 0.01) { ctx.save(); ctx.translate(820, 540); ctx.rotate(0.15); ctx.scale(e, e); handText('!', -30, 60, 190, C.red, { key: 'p-e' }); ctx.restore(); }
  handText('(en général)', 370, 1030, 60, C.ink, { key: 'p-g', frac: ev(L(3.0), 0.6) });
  dotHero(540, 1230, 100, { key: 'hero', mood: 'wow' });
  inkTag('attention');
  inkCaption('à vérifier avant de choisir');
}

// ---- 7. A ou B ? puis retour à la page de départ (boucle) -------------------------------------------------------
function sceneAsk() {
  paperSheet('sheet');
  bigTitle();
  const end = SC[9] - SC[8], gone = lt() > end - 1.5;     // les cartes s'effacent : il reste la page, Pixel, l'étiquette et le titre = la 1re image
  if (!gone) {
    const a = popS(L(0.5)), b = popS(L(rel(VF('l7', 0.55), 8)));
    const card = (x, rot, k, letter, label, sub, icon) => {
      ctx.save(); ctx.translate(x, 960); ctx.scale(k, k); ctx.rotate(rot);
      paint(box(-190, -180, 380, 360), { fill: C.paper, key: 'q-c' + letter, w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }] });
      handText(letter, -170, -92, 100, C.red, { key: 'q-l' + letter });
      ctx.save(); ctx.translate(0, -22); icon(); ctx.restore();
      handText(label, -handW(label, 56) / 2, 112, 56, C.ink, { key: 'q-t' + letter });
      handText(sub, -handW(sub, 40) / 2, 160, 40, '#8a5a3a', { key: 'q-s' + letter });
      ctx.restore();
    };
    const phone = () => {   // un téléphone, de face, centré
      paint(rrectPts(-58, -140, 116, 200, 22), { fill: C.cream, key: 'q-ph', w: 3.6, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 60 }] });
      paint(rrectPts(-44, -118, 88, 140, 10), { fill: C.navy2, key: 'q-phs', w: 2.6, line: C.peri });
      paint(rrectPts(-34, -104, 62, 28, 10), { fill: C.cream, key: 'q-pb1', w: 2 }); paint(rrectPts(-28, -68, 62, 28, 10), { fill: C.sky, key: 'q-pb2', w: 2 });
      ink([[-14, 40], [14, 40]], { w: 4, color: C.ink, key: 'q-phb' });
    };
    const laptop = () => { ctx.save(); ctx.scale(0.72, 0.72); laptopIcon('q-lp'); ctx.restore(); };
    if (a > 0.01) card(260, -0.03, a, 'A', 'téléphone', '(Claude)', phone);
    if (b > 0.01) card(700, 0.03, b, 'B', 'ordinateur', '(Claude Code)', laptop);
  }
  dotHero(540, 1360, 90, { key: 'hero', mood: gone ? 'smile' : 'happy' });
}

// ---- 4b. où ça marche : terminal, éditeur, app de bureau, navigateur (doc officielle : « terminal, IDE, desktop app, browser ») --------
function sceneWhere() {
  paperSheet('sheet');
  const tiles = [['terminal', 0.12], ['éditeur', 0.32], ['app de bureau', 0.52], ['navigateur', 0.78]];
  tiles.forEach(([name, f], i) => {
    const x = 280 + (i % 2) * 450, y = 590 + Math.floor(i / 2) * 380, s = popS(L(rel(VF('l3b', f), 3)));
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * 0.9, s * 0.9); ctx.rotate((i % 2 ? 0.02 : -0.02));
    paint(box(-210, -140, 420, 280), { fill: C.paper, key: 'w' + i, w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }] });
    if (i === 0) { paint(box(-180, -110, 360, 150), { fill: C.navy2, key: 'w0s', w: 3, line: C.peri }); monoText('> claude', -150, -30, 40, C.cyan, { key: 'w0t' }); }
    if (i === 1) { paint(box(-180, -110, 360, 150), { fill: C.navy2, key: 'w1s', w: 3, line: C.peri }); [0, 1, 2].forEach((k) => ink([[-150 + (k % 2) * 30, -80 + k * 38], [-150 + (k % 2) * 30 + 150 + k * 20, -80 + k * 38]], { w: 5, color: [C.cyan, C.peri, C.green][k], key: 'w1l' + k })); }
    if (i === 2) { paint(box(-180, -110, 360, 150), { fill: C.cream, key: 'w2s', w: 3 }); paint(box(-180, -110, 360, 34), { fill: C.sky, key: 'w2b', w: 3 }); [-160, -134, -108].forEach((dx, k) => { ctx.fillStyle = [C.red, C.yellow, C.green][k]; ctx.beginPath(); ctx.arc(dx, -93, 8, 0, TAU); ctx.fill(); }); ink([[-150, -40], [60, -40]], { w: 5, color: C.ink, key: 'w2l' }); }
    if (i === 3) { paint(box(-180, -110, 360, 150), { fill: C.cream, key: 'w3s', w: 3 }); paint(rrectPts(-160, -100, 320, 40, 18), { fill: C.paper, key: 'w3u', w: 3 }); ink([[-130, -80], [20, -80]], { w: 4, color: '#8a5a3a', key: 'w3l' }); ink(ellipsePts(0, -5, 38, 38, 0, 24), { closed: true, w: 5, color: C.sky, key: 'w3g' }); }
    handText(name, -handW(name, 54) / 2, 105, 54, C.ink, { key: 'wn' + i });
    ctx.restore();
  });
  dotHero(540, 1290, 85, { key: 'hero', mood: 'happy' });
  inkTag('partout');
  inkCaption('le même Claude Code partout');
}

// ---- 4c. exemple : une faute dans le site — Claude explique, Claude Code corrige ------------------------------------
function sceneExample() {
  woodSurface(-40, -40, W + 40, H + 40, 'desk', {});
  const fix = rel(VF('l3c', 0.72), 4), explain = rel(VF('l3c', 0.36), 4), fixed = lt() > fix + 0.5;
  paint(box(110, 470, 810, 230), { fill: C.navy2, key: 'e-f', w: 4, line: C.peri, tex: [{ k: 'cross', c: C.periD, al: 0.35, gap: 7 }] });
  monoText('index.html', 150, 520, 36, C.cyan, { key: 'e-t' });
  monoText(fixed ? 'Bienvenue sur mon site' : 'Bienvenue sur mon sitte', 150, 630, 48, fixed ? C.green : C.peri, { key: 'e-l' + fixed });
  if (!fixed) ink([[520, 650], [710, 656]], { w: 6, color: C.red, key: 'e-u', frac: ev(L(0.5), 0.4), double: true });
  const bs = popS(L(explain));
  if (bs > 0.01) { ctx.save(); ctx.translate(540, 880); ctx.scale(bs, bs); bubble(-400, -90, 800, 180, { key: 'e-b' });
    handText('Claude : « enlève un t »', -350, 20, 62, C.ink, { key: 'e-bt', frac: ev(L(explain + 0.2), 1.1) }); ctx.restore(); }
  toolPill('Edit', 'index.html', 110, 1050, L(fix), { size: 40 });
  if (fixed) check(880, 640, fix + 0.5, 'e-ok');
  dotHero(540, 1290, 85, { key: 'hero', mood: fixed ? 'happy' : 'smile' });
  inkTag('exemple');
  inkCaption('il explique, puis il corrige');
}
