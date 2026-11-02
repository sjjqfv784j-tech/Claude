  // SCORE — Histoires d'IA. Nappe calme, crayon et clics. Silence avant le titre ; le coup (le plus fort) tombe dans la pause avant « Et tout ça commence maintenant ».
  const T = TIMELINE, H = T.cues.hit, S0 = SC, QUIET0 = VL('l5b').t1 + 0.1;
  to = 'm';
  pad(0.0, QUIET0, ['D3', 'A3', 'Fs4'], 0.028, { type: 'triangle', cut: 900, att: 0.5, rel: 0.4, send: 0.4 });
  pad(H + 0.6, T.duration + 0.05, ['D3', 'A3', 'Fs4', 'D5'], 0.022, { type: 'triangle', cut: 2000, att: 0.05, rel: 0.8, send: 0.5 });
  pluck(H, nz('D4'), 0.4, 0, 1.0, 2600, 0.4); pluck(H, nz('A4'), 0.34, 0.15, 1.0, 2600, 0.4); pluck(H, nz('Fs5'), 0.3, -0.15, 1.0, 2600, 0.4); pluck(H, nz('D3'), 0.36, 0, 1.2, 1400, 0.4);
  [1, 2, 3, 4, 5, 6].forEach((i) => pluck(S0[i] + 0.1, nz(['A4', 'D5', 'E5', 'Fs5', 'A5', 'D5'][i - 1]), 0.1, 0, 0.6, 2200, 0.3));
  to = 's';
  for (let i = 0; i < 8; i++) noiseHit(S0[0] + 1.2 + i * 0.2, 0.06, 'bandpass', 3800, 2, 0.04, -0.2);       // le crayon écrit « l'IA va tout changer »
  for (let i = 0; i < 6; i++) noiseHit(S0[2] + 1.0 + i * 0.05, 0.06, 'bandpass', 3000, 2, 0.05, 0.2);      // on barre « du jargon »
  for (let i = 0; i < 6; i++) noiseHit(S0[2] + 2.4 + i * 0.05, 0.06, 'bandpass', 3000, 2, 0.05, 0.2);      // on barre « des cours barbants »
  blip(S0[3] + 0.9, 900, 700, 0.1, 0.04); blip(S0[3] + 3.1, 1500, 1800, 0.1, 0.05);                         // « ? » puis « ! »
  blip(S0[4] + 2.2, 1800, 2600, 0.14, 0.05);                                                               // l'ampoule s'allume
  for (let i = 0; i < 5; i++) blip(S0[5] + 0.7 + i * 0.7, 700 + i * 120, 600, 0.05, 0.04);                  // les pages qui tombent
  [0, 1, 2, 3, 4].forEach((i) => blip(S0[6] + 1.0 + i * 0.25, 2200 + i * 200, 2000, 0.02, 0.03));           // les lignes dans la tête
  noiseHit(H, 1.0, 'lowpass', 220, 1.0, 0.3, 0, 0.5, 400);                                                // le coup : le plus fort
  blip(S0[9] + 3.6, 1400, 2200, 0.1, 0.05);                                                               // le clic « abonné »
