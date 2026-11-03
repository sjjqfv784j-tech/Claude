// =====================================================================
//  SCENES — flat 2D night room. Claude stands left (clipped by the frame edge when Grok Bot is on stage), Grok Bot centre-right.
// =====================================================================
const lt = () => TT - E0;                                    // seconds since the shot started
const gfAnchor = (x, y) => { SPARK_AT = toScreen(x, y); };

function sceneRoom1() {
  gfRoom();
  gfAnchor(540, 780);
  gfClaude(540, 1290, { pose: lt() > 0.2 ? 'talk' : 'rest', talk: talking('C') });
  gfTitle('GROK BOT,', "C'EST QUOI ?");
  gfCaption();
}
function sceneEnter() {
  gfRoom();
  gfClaude(60, 1290, { talk: talking('C') });
  const k = springEase(lt(), 90, 19), x = lerp(1320, 640, k);
  gfAnchor(x, 1150);
  gfGrok(x, 1290, { talk: talking('G'), walk: k < 0.97 });
  gfCaption();
}
function sceneDuo() {
  gfRoom();
  gfClaude(60, 1290, { talk: talking('C'), pose: 'shrug' });
  gfAnchor(640, 1150);
  gfGrok(640, 1290, { talk: talking('G') });
  gfCaption();
}
function sceneTools() {
  const a = lt();
  gfRoom();
  gfClaude(-60, 1290, { talk: false }); gfBoard();
  const pc = gfGrok(580, 1290, { talk: talking('G'), arm: true }); gfAnchor(580, 1150);
  gfBoardIcon(210, 520, 120, 'mail', popS(E0 + 0.3));
  gfBoardIcon(870, 520, 120, 'cal', popS(E0 + 0.7));
  // AGENT window
  const kw = popS(E0 + 0.1);
  if (kw > 0) {
    ctx.save(); ctx.translate(540, 570); ctx.scale(kw, kw);
    gfRR(-170, -125, 340, 250, 14, GF.cream, GF.ink, 6); gfRR(-170, -125, 340, 44, [14, 14, 0, 0], GF.ink);
    [GF.coral, GF.mustard, GF.mint].forEach((c, i) => gfEl(-146 + i * 24, -103, 7, 7, c)); gfText('AGENT', 140, -103, 22, GF.cream, { align: 'right' });
    const bz = ev(E0 + 1.2, 0.2); gfPoly([[10, -60], [-45, 20], [-5, 20], [-25, 90], [48, -5], [8, -5], [30, -60]].map(([x, y]) => [x * bz, y * bz]), GF.coral);
    ctx.restore();
  }
  for (const [x1, x2] of [[270, 370], [810, 710]]) { const f = ev(E0 + 0.9, 0.4); ctx.save(); ctx.setLineDash([12, 10]); gfLine(x1, 540, lerp(x1, x2, f), lerp(540, 560, f), GF.coral, 6, [12, 10]); ctx.restore(); }
  const tk = springEase(a - 0.5, 120, 20); gfPointer(pc, [lerp(pc[0], 560, tk), lerp(pc[1], 590, tk)]);
  const lk = ev(E0 + 1.6, 0.3); if (lk > 0) gfText('TES OUTILS', 330, 760, 46, GF.coral);
  gfCaption();
}
function sceneCloud() {
  gfRoom();
  gfClaude(-60, 1290, { talk: talking('C') }); gfBoard();
  const pc = gfGrok(580, 1290, { talk: talking('G'), arm: true }); gfAnchor(580, 1150);
  gfCloud(500, 560, 1.05, popS(E0 + 0.3));
  gfRR(420, 490, 160, 110, 12, GF.ink); gfRR(430, 500, 140, 90, 6, GF.violet); gfEl(520, 545, 20, 20, GF.cream); gfEl(510, 540, 18, 18, GF.violet);
  gfRR(488, 600, 64, 14, 5, GF.ink);
  const bk = popS(E0 + 1.6); if (bk > 0) { ctx.save(); ctx.translate(820, 690); ctx.scale(bk, bk); gfRR(-100, -34, 200, 68, 34, GF.coral); gfText('24 h/24', 0, 0, 40, GF.ink); ctx.restore(); }
  gfPointer(pc, [520, 545]);
  gfCaption();
}
function sceneCards() {
  gfRoom();
  gfClaude(-60, 1290, { talk: talking('C') }); gfBoard();
  const pc = gfGrok(580, 1290, { talk: talking('G'), arm: true }); gfAnchor(580, 1150);
  gfBoardIcon(330, 530, 220, 'support', popS(E0 + 0.5));
  gfBoardIcon(750, 530, 220, 'toggles', popS(E0 + 1.2));
  if (popS(E0 + 0.7) > 0) gfText('SUPPORT CLIENT', 330, 700, 34, GF.ink);
  if (popS(E0 + 1.4) > 0) gfText('GESTION DE COMPTES', 750, 700, 34, GF.ink);
  gfPointer(pc, [750, 540]);
  gfCaption();
}
function sceneParallel() {
  const a = lt();
  gfRoom();
  gfClaude(-60, 1290, { talk: false }); gfBoard();
  const pc = gfGrok(580, 1290, { talk: talking('G'), arm: true }); gfAnchor(580, 1150);
  gfBoardIcon(420, 440, 96, 'support', popS(E0 + 0.1)); gfBoardIcon(540, 440, 96, 'toggles', popS(E0 + 0.25)); gfBoardIcon(660, 440, 96, 'add', popS(E0 + 0.4));
  const cols = [GF.mint, GF.coral, GF.mustard, GF.mint]; let n = 0;
  for (let i = 0; i < 4; i++) {
    const t0 = E0 + 0.7 + i * 0.7, k = popS(t0); if (k > 0) n = i + 1;
    gfMonitor(225 + i * 210, 610, 170, GF.ink, clamp(0.15 + 0.7 * ((a * 0.35 + i * 0.27) % 1)) * ev(t0, 0.3), cols[i], k);
  }
  gfText('EN PARALLÈLE', 540, 770, 48, GF.coral); gfText('×' + Math.max(1, n), 900, 790, 44, GF.coral, { align: 'right' });
  gfPointer(pc, [lerp(520, 760, ev(E0 + 0.6, 2)), 600]);
  gfCaption();
}
function sceneNight() {
  gfRoom();
  gfClaude(60, 1290, { talk: talking('C'), pose: 'talk' });
  gfAnchor(640, 1150);
  gfGrok(640, 1290, { talk: talking('G') });
  gfCaption();
}
function sceneEnd() {
  gfRoom();
  gfClaude(60, 1290, { talk: talking('C'), pose: 'shrug' });
  gfAnchor(640, 1150);
  gfGrok(640, 1290, { talk: talking('G') });
  gfCaption();
}
