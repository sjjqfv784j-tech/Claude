  // SCORE — OmniRoute. Nappe calme, clics de clavier. Silence avant le coup ; le coup (le plus fort) tombe dans la pause avant « OmniRoute bascule ».
  const T = TIMELINE, H = T.cues.hit, S0 = SC, QUIET0 = VL('l7').t1 + 0.1;
  to = 'm';
  pad(0.0, QUIET0, ['D3', 'A3', 'E4'], 0.026, { type: 'triangle', cut: 1300, att: 0.6, rel: 0.4, send: 0.5 });
  pad(H + 0.6, T.duration + 0.05, ['D3', 'A3', 'Fs4', 'D5'], 0.022, { type: 'triangle', cut: 2000, att: 0.05, rel: 0.8, send: 0.5 });
  pluck(H, nz('D4'), 0.4, 0, 1.0, 2600, 0.4); pluck(H, nz('A4'), 0.34, 0.15, 1.0, 2600, 0.4); pluck(H, nz('Fs5'), 0.3, -0.15, 1.0, 2600, 0.4); pluck(H, nz('D3'), 0.36, 0, 1.2, 1400, 0.4);
  [1, 2, 3, 4, 5].forEach((i) => pluck(S0[i] + 0.1, nz(['A4', 'D5', 'E5', 'Fs5', 'A5'][i - 1]), 0.1, 0, 0.6, 2200, 0.3));
  to = 's';
  for (let i = 0; i < 20; i++) blip(S0[2] + 0.8 + i * 0.07, 3000, 2600, 0.01, 0.016);          // npm i -g omniroute
  for (let i = 0; i < 10; i++) blip(S0[2] + 3.0 + i * 0.06, 3000, 2600, 0.01, 0.016);          // omniroute
  for (let i = 0; i < 26; i++) blip(S0[6] + 0.9 + i * 0.065, 3000, 2600, 0.01, 0.016);         // omniroute configure claude
  for (let i = 0; i < 4; i++) blip(S0[1] + 1.3 + i * 0.35, 700 + i * 140, 600, 0.04, 0.03);    // câbles qui se branchent
  blip(S0[0] + 3.3, 500, 260, 0.2, 0.05);                                                      // le quota tombe
  [0, 1, 2].forEach((i) => blip(S0[5] + 0.8 + i * 1.3, 1200 + i * 260, 1500 + i * 260, 0.06, 0.04)); // trois champs
  noiseHit(S0[4] + 0.95, 0.3, 'bandpass', 1800, 1.4, 0.03, 0, 0.2, 3200);                      // la clé qui tombe
  noiseHit(H, 1.0, 'lowpass', 220, 1.0, 0.3, 0, 0.5, 400);                                    // le coup : le plus fort
  [0, 1, 2, 3].forEach((i) => blip(H + 2.0 + i * 0.6, 900 + i * 220, 1100 + i * 220, 0.05, 0.03));  // les 4 niveaux
