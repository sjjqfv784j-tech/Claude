  // SCORE — Claude ou Claude Code ? Nappe calme, crayon et clics. Le coup tombe dans la pause avant la règle (l5).
  const T = TIMELINE, H = T.cues.hit, S0 = SC;
  to = 'm';
  pad(0.0, H - 1.0, ['D3', 'A3', 'Fs4'], 0.026, { type: 'triangle', cut: 900, att: 0.5, rel: 0.4, send: 0.4 });
  pad(H + 0.4, T.duration + 0.05, ['D3', 'A3', 'Fs4', 'D5'], 0.022, { type: 'triangle', cut: 2000, att: 0.05, rel: 0.8, send: 0.5 });
  pluck(H, nz('D4'), 0.4, 0, 1.0, 2600, 0.4); pluck(H, nz('A4'), 0.34, 0.15, 1.0, 2600, 0.4); pluck(H, nz('Fs5'), 0.3, -0.15, 1.0, 2600, 0.4); pluck(H, nz('D3'), 0.36, 0, 1.2, 1400, 0.4);
  [1, 2, 3, 4, 5, 7, 8].forEach((i, k) => pluck(S0[i] + 0.1, nz(['A4', 'D5', 'E5', 'Fs5', 'A5', 'D5', 'E5'][k]), 0.1, 0, 0.6, 2200, 0.3));
  to = 's';
  noiseHit(0.02, 0.5, 'lowpass', 260, 1.0, 0.22, 0, 0.3, 300); blip(0.1, 600, 1400, 0.12, 0.05);                                      // le coup d'ouverture : l'accroche dès la première image
  const H1 = VL('l1').t0; blip(0.5, 1200, 1500, 0.07, 0.04);
  for (let i = 0; i < 6; i++) { noiseHit(S0[0] + H1 + 0.8 + i * 0.55, 0.05, 'bandpass', 3800, 2, 0.04, -0.2); blip(S0[0] + H1 + 0.9 + i * 0.55, 900, 600, 0.05, 0.03); }  // copier / coller
  for (let i = 0; i < 6; i++) noiseHit(S0[1] + 0.8 + i * 0.12, 0.05, 'bandpass', 3000, 2, 0.04, 0.2);                                  // il écrit sa réponse
  ['Read', 'Edit', 'Bash'].forEach((_, i) => blip(S0[2] + 1.2 + i * 1.3, 1300 + i * 250, 1700 + i * 250, 0.08, 0.05));                  // les trois outils
  [0, 1, 2, 3].forEach((i) => blip(S0[3] + 0.9 + i * 1.0, 900 + i * 200, 1100 + i * 200, 0.07, 0.05));                         // les quatre endroits
  blip(S0[4] + 3.4, 1500, 2000, 0.1, 0.05);                                                                                              // la faute corrigée
  blip(S0[5] + 1.0, 700, 900, 0.1, 0.05); blip(S0[5] + 4.6, 500, 800, 0.12, 0.05);                                                      // téléphone, puis boîte à outils                                                      // téléphone, puis boîte à outils
  noiseHit(H, 1.0, 'lowpass', 220, 1.0, 0.3, 0, 0.5, 400);                                                                              // le coup : la règle
  blip(S0[7] + 1.6, 900, 700, 0.1, 0.05);                                                                                              // attention
  blip(S0[8] + 2.0, 1400, 2200, 0.1, 0.05);                                                                                            // A / B
