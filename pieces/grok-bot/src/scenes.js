// =====================================================================
//  SCENES — flat 2D night room. Every shot is complete on its first frame (the room, the characters, the board);
//  only the shot's own content pops in, on the voice's word times (cue(id, word, fallback)).
//  Claude stands at the left and stays fully visible; the whiteboard sits to his right.
// =====================================================================
const lt = () => TT - E0;
const gfAnchor = (x, y) => { SPARK_AT = toScreen(x, y); };
const BASE = 1290, CLB = { cx: 85, s: 0.95 }, CL = { cx: 210, s: 1.0 }, GK = { x: 680, s: 1.05 };
const on = (t) => TT >= t - 1e-6;

function sceneRoom1() {
  gfRoom();
  gfAnchor(540, 760);
  gfClaude(540, BASE, { s: 1.08, pose: spoke('l1') ? 'talk' : 'rest', talk: talking('C') });
  gfTitle('GROK BOT,', "C'EST QUOI ?");
  gfCaption();
}
function sceneEnter() {
  gfRoom();
  gfClaude(CL.cx, BASE, { s: CL.s, talk: talking('C'), pose: 'rest' });
  const k = springEase(lt() - 0.1, 90, 19), x = lerp(1340, GK.x, k);
  gfAnchor(x, 1130);
  gfGrok(x, BASE, { s: GK.s, talk: talking('G'), walk: k < 0.97 });
  gfCaption();
}
function sceneDuo() {
  gfRoom();
  const no = on(cue('l4', 'non', 1e9));
  gfClaude(CL.cx, BASE, { s: CL.s, talk: talking('C'), pose: no ? 'rest' : 'shrug' });
  gfAnchor(GK.x, 1130);
  const shake = no ? (B % 2 ? 6 : -6) : 0;
  gfGrok(GK.x + shake, BASE, { s: GK.s, talk: talking('G') });
  if (no) { const k = popS(cue('l4', 'non', 0)); ctx.save(); ctx.translate(GK.x + 20, 880); ctx.scale(k, k); gfLine(-60, -60, 60, 60, GF.red, 26); gfLine(60, -60, -60, 60, GF.red, 26); ctx.restore(); }
  gfCaption();
}
function sceneTools() {
  gfRoom();
  gfBoard();
  gfClaude(CLB.cx, BASE, { s: CLB.s, talk: false });
  const pc = gfGrok(GK.x, BASE, { s: GK.s, talk: talking('G'), arm: true }); gfAnchor(GK.x, 1130);
  const tM = cue('l4', 'connecte', E0 + 0.6), tC = tM + 0.35, tL = cue('l4', 'tes', E0 + 1.5), tB = cue('l4', 'outils', E0 + 2.2);
  gfBoardIn(() => {
    const kw = popS(E0 + 0.1);
    if (kw > 0) {
      ctx.save(); ctx.translate(540, 560); ctx.scale(kw, kw);
      gfRR(-190, -140, 380, 280, 14, GF.cream, GF.ink, 6); gfRR(-190, -140, 380, 50, [14, 14, 0, 0], GF.ink);
      [GF.coral, GF.mustard, GF.mint].forEach((c, i) => gfEl(-162 + i * 28, -115, 8, 8, c)); gfText('AGENT', 160, -115, 26, GF.cream, { align: 'right' });
      const bz = ev(tB, 0.2); gfPoly([[12, -70], [-50, 22], [-6, 22], [-28, 100], [54, -6], [8, -6], [34, -70]].map(([x, y]) => [x * bz, y * bz]), GF.coral);
      ctx.restore();
    }
    gfBoardIcon(205, 470, 140, 'mail', popS(tM)); gfBoardIcon(875, 470, 140, 'cal', popS(tC));
    for (const [x1, x2, y2] of [[285, 350, 510], [795, 730, 510]]) { const f = ev(tL, 0.4); if (f > 0) gfLine(x1, 480, lerp(x1, x2, f), lerp(480, y2, f), GF.coral, 7, [14, 11]); }
    if (on(tB)) gfText('TES OUTILS', 330, 775, 72, GF.coral);
  });
  const tk = springEase(lt() - 0.3, 120, 20), [tx, ty] = gfBW(540, 560); gfPointer(pc, [lerp(pc[0], tx, tk), lerp(pc[1], ty, tk)]);
  gfCaption();
}
function sceneCloud() {
  gfRoom();
  gfBoard();
  gfClaude(CLB.cx, BASE, { s: CLB.s, talk: talking('C') });
  const pc = gfGrok(GK.x, BASE, { s: GK.s, talk: talking('G'), arm: true }); gfAnchor(GK.x, 1130);
  const t6 = (VL('l6') || { t0: E0 + 1.2 }).t0, tCloud = cue('l6', 'cloud', t6 + 1.5), tWork = cue('l6', 'travailler', t6 + 2.6), tTien = cue('l6', 'tien', t6 + 3.4), tOff = cue('l6', 'éteint', t6 + 4.2);
  gfBoardIn(() => {
    if (!on(t6 - 0.1)) { const q = popS(E0 + 0.2); ctx.save(); ctx.translate(540, 570); ctx.scale(q, q); gfText('?', 0, 0, 340, GF.coral); ctx.restore(); }
    gfCloud(560, 560, 1.15, popS(t6 + 0.1));
    if (on(t6)) {
      const m = popS(tCloud); gfRR(560 - 100 * m, 500 - 72 * m, 200 * m, 144 * m, 14, GF.ink); gfRR(560 - 86 * m, 500 - 58 * m, 172 * m, 116 * m, 8, GF.violet);
      gfEl(560, 500, 26 * m, 26 * m, GF.cream); gfEl(548, 492, 24 * m, 24 * m, GF.violet); gfRR(560 - 44 * m, 586 - 10 * m, 88 * m, 18 * m, 6, GF.ink);
    }
    const bk = popS(tWork); if (bk > 0) { ctx.save(); ctx.translate(330, 745); ctx.scale(bk, bk); gfRR(-120, -40, 240, 80, 40, GF.coral); gfText('24 h/24', 0, 0, 60, GF.ink); ctx.restore(); }
    const pk = popS(tTien); if (pk > 0) {
      ctx.save(); ctx.translate(210, 690); ctx.scale(pk, pk); gfRR(-90, -64, 180, 120, 12, GF.ink); gfRR(-78, -52, 156, 96, 6, on(tOff) ? '#14122b' : GF.violet);
      if (!on(tOff)) gfRR(-40, -8, 80, 14, 6, GF.mint); else gfText('z z', 0, -6, 44, GF.gray); gfRR(-60, 58, 120, 12, 5, GF.ink); ctx.restore();
    }
  });
  const [px, py] = gfBW(560, 500); gfPointer(pc, [px, py], on(t6) ? 1 : 0.0001);
  gfCaption();
}
function sceneCards() {
  gfRoom();
  gfBoard();
  gfClaude(CLB.cx, BASE, { s: CLB.s, talk: talking('C') });
  const pc = gfGrok(GK.x, BASE, { s: GK.s, talk: talking('G'), arm: true }); gfAnchor(GK.x, 1130);
  const tS = cue('l8', 'support', E0 + 1.6), tG = cue('l8', 'gestion', tS + 0.9), tShow = cue('l8', 'montres', tG + 1.5), tDo = cue('l8', 'refait', tShow + 1.5), tSeul = cue('l8', 'seul', tDo + 0.8);
  const ph2 = on(tShow);
  gfBoardIn(() => {
    if (!ph2) {
      gfBoardIcon(320, 530, 230, 'support', popS(tS)); gfBoardIcon(750, 530, 230, 'toggles', popS(tG));
      if (on(tS)) gfText('SUPPORT CLIENT', 320, 710, 38, GF.ink); if (on(tG)) gfText('GESTION DE COMPTES', 750, 710, 38, GF.ink);
    } else {
      gfBoardIcon(470, 380, 70, 'support', 1); gfBoardIcon(550, 380, 70, 'toggles', 1); gfBoardIcon(630, 380, 70, 'add', 1);
      const card = (x, label, dot, sent) => {
        gfRR(x, 530, 330, 210, 18, GF.violet); gfRR(x + 24, 558, 70, 52, 8, GF.cream); gfLine(x + 112, 576, x + 300, 576, GF.cream, 8); gfLine(x + 112, 604, x + 270, 604, GF.cream, 8);
        gfRR(x + 120, 668, 190, 48, 24, sent ? GF.mint : GF.coral); gfText(sent ? '✓ ENVOYÉ' : 'ENVOYER', x + 215, 692, 26, GF.ink);
        gfEl(x + 18, 498, 11, 11, dot); gfText(label, x + 44, 498, 40, GF.ink, { align: 'left' });
      };
      card(130, 'REC · TOI', GF.red, on(tShow + 1.0));
      if (on(tDo)) { card(510, 'TOUT SEUL', GF.mintD, ev(tDo + 0.2, 0.1) >= 1); }
      if (on(tSeul)) gfText('×3', 900, 780, 64, GF.coral, { align: 'right' });
    }
  });
  const [px, py] = gfBW(ph2 ? 300 : 535, ph2 ? 540 : 540); gfPointer(pc, [px, py]);
  gfCaption();
}
function sceneParallel() {
  const a = lt();
  gfRoom();
  gfBoard();
  gfClaude(CLB.cx, BASE, { s: CLB.s, talk: false });
  const pc = gfGrok(GK.x, BASE, { s: GK.s, talk: talking('G'), arm: true }); gfAnchor(GK.x, 1130);
  const T = [cue('l9', 'créer', E0 + 0.4), cue('l9', 'équipe', E0 + 1.0), cue('l9', 'plusieurs', E0 + 1.6), cue('l9', 'parallèle', E0 + 2.4)], tLab = cue('l9', 'tournent', E0 + 2.0);
  const cols = [GF.mint, GF.coral, GF.mustard, GF.mint]; let n = 0;
  gfBoardIn(() => {
    gfBoardIcon(440, 410, 100, 'support', 1); gfBoardIcon(540, 410, 100, 'toggles', 1); gfBoardIcon(640, 410, 100, 'add', 1);
    for (let i = 0; i < 4; i++) {
      const k = popS(T[i]); if (k > 0) n = i + 1;
      gfMonitor(225 + i * 210, 590, 180, GF.ink, clamp(0.12 + 0.8 * ((a * 0.3 + i * 0.29) % 1)) * ev(T[i], 0.3), cols[i], k);
    }
    if (on(tLab)) gfText('EN PARALLÈLE', 520, 785, 70, GF.coral);
    if (n) gfText('×' + n, 930, 785, 56, GF.coral, { align: 'right' });
  });
  const [px, py] = gfBW(225 + Math.max(0, n - 1) * 210, 570); gfPointer(pc, [px, py]);
  gfCaption();
}
function sceneNight() {
  gfRoom();
  const q = on(cue('l11', 'il', 1e9));
  gfClaude(CL.cx, BASE, { s: CL.s, talk: talking('C'), pose: q ? 'rest' : 'shrug' });
  gfAnchor(GK.x, 1130);
  gfGrok(GK.x, BASE, { s: GK.s, talk: talking('G') });
  // thought bubble above Grok Bot: the night shift, then the approval
  const tNuit = cue('l10', 'nuit', E0 + 1.2), tAcc = cue('l11', 'accord', E0 + 3.0), kb = popS(cue('l10', 'laisse', E0 + 0.3));
  if (kb > 0) {
    ctx.save(); ctx.translate(700, 790); ctx.scale(kb, kb);
    gfPoly([[-20, 130], [30, 130], [40, 200]], GF.cream); gfRR(-210, -140, 420, 280, 40, GF.cream);
    if (on(tNuit) && !on(tAcc)) {
      gfEl(-120, -50, 46, 46, GF.ink); gfEl(-138, -62, 42, 42, GF.cream);
      for (let i = 0; i < 3; i++) gfMonitor(-20 + i * 100, 10, 90, GF.ink, clamp(((TT * 0.3 + i * 0.3) % 1)), [GF.mint, GF.coral, GF.mustard][i], 1);
    }
    if (on(tAcc)) {
      gfRR(-160, -80, 320, 100, 20, GF.violet); gfText('OK ?', 0, -30, 56, GF.cream);
      const k = springEase(TT - tAcc - 0.3, 260, 22); gfRR(-120, 40, 240, 70, 35, GF.mint); gfText('✓ VALIDER', 0, 75, 38, GF.ink); 
    }
    ctx.restore();
  }
  gfCaption();
}
function sceneEnd() {
  gfRoom();
  const k = springEase(lt() - (cue('l13', 'si', E0 + 1.4) - E0), 90, 19);
  gfAnchor(540, 740);
  gfClaude(540, BASE, { s: 1.15, talk: talking('C'), pose: spoke('l13') ? 'talk' : 'shrug' });
  gfGrok(lerp(1280, 1020, k), BASE, { s: 0.8, talk: talking('G') });
  gfTitle('GROK BOT,', "C'EST QUOI ?");
  const tRec = cue('l13', 'enregistre', E0 + 2.4);
  if (on(tRec)) { const on2 = (B % 12) < 8; gfEl(450, 150, 22, 22, on2 ? GF.red : '#7a2f2f'); gfText('REC', 490, 150, 48, GF.cream, { align: 'left' }); }
  gfCaption();
}
