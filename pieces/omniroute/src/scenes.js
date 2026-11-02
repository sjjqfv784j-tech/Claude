// =====================================================================
//  SCÈNES — OmniRoute. Chaque scène fixe son origine iso puis dessine de l'arrière vers l'avant.
//  TT = temps absolu ; lt() = temps local à la scène (0 au début de la scène). Tout bouge sur des ressorts.
//  Contenu gardé dans x 60-940, y 250-1500.
// =====================================================================
const OMNI_ISO = { ox: 500, oy: 1000, u: 1.1 };
const lt = () => TT - E0;
const sp = (t0, o = { k: 140, damp: 0.7 }) => spring(lt(), t0, o);   // ressort local
const drop = (t0, h = 220) => (1 - spring(lt(), t0, { k: 160, damp: 0.6 })) * h;
const typedN = (s, t0, cps = 22) => Math.floor(clamp((lt() - t0) * cps, 0, s.length));

// ---- éléments communs --------------------------------------------------
const PROV = [
  { x: -240, y: -220, name: 'IA 1' },
  { x: -80,  y: -220, name: 'IA 2' },
  { x: 80,   y: -220, name: 'IA 3' },
];
const PW = 160, PD = 96, PH = 24;

// un fournisseur d'IA : une dalle avec un nom et une lampe. state : 'ok' | 'dead'
function provider(p, z0, state, t0 = 0, label) {
  const z = z0 + drop(t0, 180);
  isoBox(p.x, p.y, z, PW, PD, PH, { r: 12, seg: 4 });
  const fp = faceOf([p.x, p.y + PD, z + PH], [1, 0, 0], [0, 0, -1]);
  lamp(fp, 22, PH / 2, 5, state === 'ok' && blinkOn(TT, 1.0, p.x * 0.003));
  isoText(fp, label || p.name, 40, PH / 2 + 6, 18, { color: state === 'dead' ? PAL.textD : PAL.text });
  const top = faceOf([p.x, p.y, z + PH], [1, 0, 0], [0, 1, 0]);
  for (let k = 0; k < 5; k++) faceRR(top, 18 + k * 26, 16, 16, 7, 3, { seg: 2 });
  return fp;
}

// la plaque-passerelle au centre, sur laquelle vit le robot
const HUB = { x: -150, y: -90, w: 300, d: 190 };
function hub(t0 = 0) {
  const dz = (i) => (1 - spring(lt(), t0 + i * 0.08, { k: 160, damp: 0.6 })) * 200;
  isoPlates(HUB.x, HUB.y, 0, HUB.w, HUB.d, [{ h: 14, r: 40, dz: dz(0) }, { h: 12, gap: 6, inset: 12, r: 34, dz: dz(1) - dz(0) }]);
  return 26;   // hauteur du dessus
}

// un câble du hub vers un fournisseur (dessiné en partie : f = 0..1)
function cableTo(p, hz, f) {
  if (f <= 0.02) return;
  const a = [HUB.x + HUB.w / 2 + (p.x + PW / 2 - (HUB.x + HUB.w / 2)) * 0.15, HUB.y, hz];
  const b = [p.x + PW / 2, p.y + PD, 18];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 8];
  const P = [a, m, b].map((q, i, arr) => (i === 0 ? q : [arr[0][0] + (q[0] - arr[0][0]) * f, arr[0][1] + (q[1] - arr[0][1]) * f, q[2]]));
  isoCable(P, { w: 6 });
}

// un terminal posé à plat (dalle + écran) ; renvoie la face du dessus pour y écrire
function terminal(x, y, z, w, d, t0 = 0) {
  const zz = z + drop(t0, 200);
  isoBox(x, y, zz, w, d, 22, { r: 16, seg: 4 });
  const fp = faceOf([x, y, zz + 22], [1, 0, 0], [0, 1, 0]);
  faceRR(fp, 10, 10, w - 20, d - 20, 10);
  for (let i = 0; i < 3; i++) faceEll(fp, 24 + i * 13, 24, 4, 4, { stroke: PAL.inner });
  return fp;
}

// ---- 1. quota : un fournisseur devient gris -------------------------------
function sceneQuota() {
  setIso(OMNI_ISO);
  const dead = lt() > 3.3;
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  provider(PROV[0], 14, 'ok', 0.05);
  provider(PROV[1], 14, 'ok', 0.15);
  provider(PROV[2], 14, dead ? 'dead' : 'ok', 0.25, dead ? 'quota' : 'IA 3');
  // le développeur : un terminal avec le curseur sombre qui clignote puis se fige
  const fp = terminal(-120, 20, 14, 280, 180, 0.35);
  isoText(fp, '> ship the api', 24, 70, 20, { color: PAL.text, count: typedN('> ship the api', 1.0) });
  [150, 110, 190].forEach((L, i) => { const s = sp(1.7 + i * 0.12, { k: 200, damp: 0.7 }); if (s > 0.02) faceSlab(fp, 24, 92 + i * 18, Math.max(8, L * s), 10, 3, { edge: PAL.edge, creaseC: PAL.inner }); });
  if (lt() > 2.2 && (!dead ? blinkOn(lt(), 0.5) : true)) faceSlab(fp, 24, 150, 12, 20, 3, { r: 2, fill: PAL.accent, edge: PAL.accent, creaseC: PAL.accent });
  // une croix « stop » sur le fournisseur éteint
  if (dead) { const s = sp(3.3, { k: 200, damp: 0.6 }); isoText(faceOf([PROV[2].x, PROV[2].y, 14 + PH + 2], [1, 0, 0], [0, 1, 0]), '× 429', 14, 62, 26, { color: PAL.textD, count: Math.floor(5 * s) }); }
  isoTag('01', 'le problème');
  isoCaption('quota atteint');
}

// ---- 2. une seule adresse : le robot branche tout --------------------------
function sceneGateway() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  PROV.forEach((p, i) => provider(p, 14, 'ok', 0, undefined));
  const hz = hub(0.05) + 14;
  PROV.forEach((p, i) => cableTo(p, hz, sp(1.3 + i * 0.35, { k: 70, damp: 0.9 })));
  // l'adresse unique, écrite sur le devant du hub
  const front = faceOf([HUB.x, HUB.y + HUB.d, 26], [1, 0, 0], [0, 0, -1]);
  isoText(front, 'localhost:20128', 40, 18, 22, { color: PAL.text, count: typedN('localhost:20128', 2.6, 20) });
  const hy = hz + (1 - spring(lt(), 0.3, { k: 170, damp: 0.5 })) * 240;
  cubeBot(-6, 0, hy, 78, { key: 'hero', hop: 1.2, look: 0 });
  isoTag('02', 'OmniRoute');
  isoCaption('une seule adresse');
}

// ---- 3. installer ---------------------------------------------------------
function sceneInstall() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  const fp = terminal(-200, -150, 14, 400, 300, 0.05);
  const l1 = '$ npm i -g omniroute', l2 = '$ omniroute', l3 = '✓ localhost:20128';
  isoText(fp, l1, 26, 74, 26, { color: PAL.text, count: typedN(l1, 0.9, 20) });
  isoText(fp, l2, 26, 124, 26, { color: PAL.text, count: typedN(l2, 3.4, 20) });
  const s = sp(5.2, { k: 200, damp: 0.7 });
  if (s > 0.02) isoText(fp, l3, 26, 176, 24, { color: PAL.textD, count: Math.floor(l3.length * clamp(s)) });
  const cur = lt() < 5.2 ? (lt() < 3.4 ? 26 + 24 * 0.62 * typedN(l1, 0.9, 20) + 4 : 26 + 24 * 0.62 * typedN(l2, 3.4, 20) + 4) : 0;
  if (cur && blinkOn(lt(), 0.5)) faceSlab(fp, cur, lt() < 3.4 ? 54 : 104, 12, 24, 3, { r: 2, fill: PAL.accent, edge: PAL.accent, creaseC: PAL.accent });
  cubeBot(150, 110, 36 + (1 - spring(lt(), 0.25, { k: 170, damp: 0.5 })) * 220, 70, { key: 'hero', hop: 5.2, look: -0.5 });
  isoTag('03', 'installer');
  isoCaption('npm i -g omniroute');
}

// ---- 4. le tableau de bord : Providers -----------------------------------
function sceneProviders() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  const fp = terminal(-210, -170, 14, 420, 330, 0.05);
  // barre latérale : 3 entrées, « Providers » s'allume
  ['Providers', 'Endpoints', 'Combos'].forEach((n, i) => {
    const on = i === 0 && lt() > 1.6;
    faceRR(fp, 20, 50 + i * 44, 120, 32, 8, { fill: on ? PAL.accent : PAL.face, stroke: on ? PAL.accent : PAL.edge });
    isoText(fp, n, 30, 72 + i * 44, 18, { color: on ? PAL.paper : PAL.textD });
  });
  // la liste : des lignes avec lampes qui arrivent en vague
  ['openai', 'groq', 'mistral', 'gemini'].forEach((n, i) => {
    const s = sp(2.0 + i * 0.35, { k: 200, damp: 0.7 });
    if (s <= 0.02) return;
    const y = 52 + i * 52;
    faceSlab(fp, 164, y, 230 * s, 38, 3, { edge: PAL.edge, creaseC: PAL.inner });
    if (s > 0.8) { lamp(fp, 184, y + 19, 5, i === 0 || blinkOn(lt(), 1.0, i * 0.3)); isoText(fp, n, 200, y + 25, 19, { color: PAL.text }); }
  });
  cubeBot(170, 120, 36 + (1 - spring(lt(), 0.25, { k: 170, damp: 0.5 })) * 220, 70, { key: 'hero', hop: 1.9, look: -0.5 });
  isoTag('04', 'fournisseur');
  isoCaption('ajoute un fournisseur');
}

// ---- 5. la clé : Endpoints ---------------------------------------------------
function sceneKey() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  const fp = terminal(-210, -170, 14, 420, 330, 0.05);
  faceRR(fp, 20, 50, 120, 32, 8, { fill: PAL.accent, stroke: PAL.accent });
  isoText(fp, 'Endpoints', 30, 72, 18, { color: PAL.paper });
  const l = 'sk-omni-••••••••••••';
  isoText(fp, 'Ta clé OmniRoute', 164, 76, 20, { color: PAL.textD });
  faceRR(fp, 164, 96, 232, 44, 10);
  isoText(fp, l, 176, 126, 20, { color: PAL.text, count: typedN(l, 2.2, 16) });
  // la clé tombe du ciel et se pose devant la dalle
  const kz = 36 + drop(0.7, 360);
  isoCyl(-20, 190, kz, 26, 10, {});
  isoBox(-4, 182, kz, 120, 16, 10, { r: 5, seg: 3 });
  isoBox(70, 182, kz + 10, 14, 16, 18, { r: 3, seg: 2 });
  cubeBot(170, 120, 36 + (1 - spring(lt(), 0.25, { k: 170, damp: 0.5 })) * 220, 70, { key: 'hero', hop: 3.2, look: -0.5 });
  isoTag('05', 'la clé');
  isoCaption('crée ta clé');
}

// ---- 6. le client : adresse, clé, modèle ---------------------------------
function sceneClient() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  const fp = terminal(-230, -190, 14, 460, 360, 0.05);
  const rows = [['URL', 'localhost:20128/v1'], ['CLÉ', 'sk-omni-••••••'], ['MODÈLE', 'auto']];
  rows.forEach(([k, v], i) => {
    const t0 = 1.0 + i * 1.9;
    const s = sp(t0, { k: 200, damp: 0.7 });
    if (s <= 0.02) return;
    const y = 56 + i * 80;
    isoText(fp, k, 24, y + 4, 18, { color: PAL.textD });
    faceRR(fp, 24, y + 12, 412 * clamp(s), 44, 10);
    if (s > 0.8) isoText(fp, v, 38, y + 42, 24, { color: PAL.text, count: typedN(v, t0 + 0.4, 18) });
  });
  if (lt() > 6.8) { const s = sp(6.8, { k: 200, damp: 0.6 }); faceSlab(fp, 24, 300, 180 * s, 36, 3, { fill: PAL.accent, edge: PAL.accent, creaseC: PAL.accent }); if (s > 0.8) isoText(fp, '✓ connecté', 40, 324, 20, { color: PAL.paper }); }
  cubeBot(190, 140, 36 + (1 - spring(lt(), 0.25, { k: 170, damp: 0.5 })) * 220, 70, { key: 'hero', hop: 6.8, look: -0.5 });
  isoTag('06', 'ton outil');
  isoCaption('adresse, clé, auto');
}

// ---- 7. silence : un fournisseur s'éteint ------------------------------
function sceneSilence() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  const dead = lt() > 2.2;
  provider(PROV[0], 14, 'ok');
  provider(PROV[1], 14, dead ? 'dead' : 'ok', 0, dead ? 'panne' : 'IA 2');
  provider(PROV[2], 14, 'ok');
  const hz = hub(0) + 14;
  PROV.forEach((p, i) => cableTo(p, hz, 1));
  const front = faceOf([HUB.x, HUB.y + HUB.d, 26], [1, 0, 0], [0, 0, -1]);
  isoText(front, 'localhost:20128', 40, 18, 22, { color: PAL.text });
  cubeBot(-6, 0, hz, 78, { key: 'hero', hop: 99, look: 0 });
  isoTag('07', 'et si…');
  isoCaption('et si ça tombe ?');
}

// ---- 8. la bascule : 4 niveaux de repli --------------------------------
const TIERS = ['abonnement', 'clé API', 'pas cher', 'gratuit'];
function sceneFallback() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  provider(PROV[0], 14, 'ok');
  provider(PROV[1], 14, 'dead', 0, 'panne');
  provider(PROV[2], 14, 'ok');
  const hz = hub(0) + 14;
  PROV.forEach((p) => cableTo(p, hz, 1));
  // la requête (le point sombre) saute du hub vers le fournisseur voisin
  const f = clamp((lt() - 0.6) / 1.2);
  const k = spring(lt(), 0.6, { k: 60, damp: 0.8 });
  const src = [-6, 20, hz + 40], dst = [PROV[2].x + PW / 2, PROV[2].y + PD / 2, 14 + PH + 30];
  const q = [src[0] + (dst[0] - src[0]) * k, src[1] + (dst[1] - src[1]) * k, src[2] + (dst[2] - src[2]) * k + Math.sin(f * Math.PI) * 90];
  const s2 = isoP(q);
  ctx.fillStyle = PAL.accent; ctx.beginPath(); ctx.arc(s2[0], s2[1], 11, 0, Math.PI * 2); ctx.fill();
  cubeBot(-6, 0, hz, 78, { key: 'hero', hop: 0.6, look: 0.5 });
  // les 4 niveaux s'allument un par un sur le devant du hub
  const front = faceOf([HUB.x, HUB.y + HUB.d, 26], [1, 0, 0], [0, 0, -1]);
  TIERS.forEach((n, i) => { lamp(front, 30 + i * 66, 16, 5, lt() > 2.0 + i * 0.6); });
  const tier = clamp(Math.floor((lt() - 2.0) / 0.6), 0, 3);
  if (lt() > 2.0) isoText(faceOf([HUB.x, HUB.y, 26], [1, 0, 0], [0, 1, 0]), TIERS[tier], 170, 170, 22, { color: PAL.text });
  isoTag('08', 'la bascule');
  isoCaption('ça bascule tout seul');
}

// ---- 9. retour : une adresse, tous tes modèles ---------------------------
function sceneEnd() {
  setIso(OMNI_ISO);
  isoPlates(-260, -240, 0, 500, 450, [{ h: 14, r: 52 }]);
  PROV.forEach((p) => provider(p, 14, 'ok'));
  const fp = terminal(-120, 20, 14, 280, 180, 0);
  isoText(fp, '> ship the api', 24, 70, 20, { color: PAL.text });
  [150, 110, 190].forEach((L, i) => faceSlab(fp, 24, 92 + i * 18, L, 10, 3, { edge: PAL.edge, creaseC: PAL.inner }));
  if (blinkOn(lt(), 0.5) || true) faceSlab(fp, 24, 150, 12, 20, 3, { r: 2, fill: PAL.accent, edge: PAL.accent, creaseC: PAL.accent });
  const hz = 14;
  cubeBot(200, 120, hz + (1 - spring(lt(), 0.2, { k: 170, damp: 0.5 })) * 200, 74, { key: 'hero', hop: 1.4, look: -0.5 });
  isoTag('09', 'OmniRoute');
  isoCaption('une adresse. tous tes modèles.');
}
