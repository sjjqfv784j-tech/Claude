  // SCORE — Le resto de Sam. Nappe de nuit douce ; silence avant « Demain, dix heures » ; le coup le plus fort tombe dans la pause avant la phrase.
  const T = TIMELINE, H = T.cues.hit, S0 = SC, QUIET0 = VL('s13').t1 + 0.1;
  to = 'm';
  pad(0.0, QUIET0, ['D3', 'A3', 'Fs4'], 0.028, { type: 'triangle', cut: 900, att: 0.5, rel: 0.4, send: 0.4 });
  pad(H + 0.6, T.duration + 0.05, ['D3', 'A3', 'Fs4', 'D5'], 0.022, { type: 'triangle', cut: 2000, att: 0.05, rel: 0.8, send: 0.5 });
  pluck(H, nz('D4'), 0.4, 0, 1.0, 2600, 0.4); pluck(H, nz('A4'), 0.34, 0.15, 1.0, 2600, 0.4); pluck(H, nz('Fs5'), 0.3, -0.15, 1.0, 2600, 0.4); pluck(H, nz('D3'), 0.36, 0, 1.2, 1400, 0.4);
  [1, 2, 3, 4, 5].forEach((i) => pluck(S0[i] + 0.1, nz(['A4', 'D5', 'E5', 'Fs5', 'A5'][i - 1]), 0.1, 0, 0.6, 2200, 0.3));
  to = 's';
  [VL('s8'), VL('s9'), VL('s10')].forEach((l) => blip(l.t0 + 0.2, 1500, 2200, 0.08, 0.05));            // un agent s'allume
  for (let i = 0; i < 6; i++) blip(S0[1] + 0.6 + i * 0.05, 800 + i * 150, 900 + i * 150, 0.03, 0.03);   // le compteur monte
  noiseHit(H, 1.0, 'lowpass', 220, 1.0, 0.3, 0, 0.5, 400);                                              // le coup : le plus fort
  blip(S0[8] + 3.2, 1400, 2200, 0.1, 0.05);                                                             // clic « abonné »
