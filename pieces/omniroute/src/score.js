  // SCORE — OmniRoute. Nappe calme, clics de clavier. Silence 43,5-47,9 s, puis le coup le plus fort à 48,0 s.
  const T = TIMELINE;
  to = 'm';
  pad(0.0, 43.4, ['D3', 'A3', 'E4'], 0.026, { type: 'triangle', cut: 1300, att: 0.6, rel: 0.4, send: 0.5 });
  pad(48.0, 60.0, ['D3', 'A3', 'Fs4', 'D5'], 0.05, { type: 'triangle', cut: 2000, att: 0.05, rel: 0.8, send: 0.5 });
  pluck(48.0, nz('D4'), 0.24, 0, 0.9, 2600, 0.4); pluck(48.0, nz('A4'), 0.2, 0.15, 0.9, 2600, 0.4); pluck(48.0, nz('Fs5'), 0.18, -0.15, 0.9, 2600, 0.4);
  [6, 12, 20, 27, 34].forEach((t, i) => pluck(t + 0.1, nz(['A4', 'D5', 'E5', 'Fs5', 'A5'][i]), 0.1, 0, 0.6, 2200, 0.3));
  to = 's';
  // clics de frappe (scènes 3, 5, 6)
  for (let i = 0; i < 20; i++) blip(12.9 + i * 0.05, 3000, 2600, 0.01, 0.016);
  for (let i = 0; i < 10; i++) blip(15.4 + i * 0.05, 3000, 2600, 0.01, 0.016);
  for (let i = 0; i < 4; i++) blip(SC[1] + 1.3 + i * 0.35, 700 + i * 140, 600, 0.04, 0.03);        // câbles qui se branchent
  blip(SC[0] + 3.3, 500, 260, 0.2, 0.05);                                                            // le quota tombe
  [0, 1, 2].forEach((i) => blip(SC[5] + 1.4 + i * 1.9, 1200 + i * 260, 1500 + i * 260, 0.06, 0.04)); // trois champs validés
  noiseHit(SC[4] + 0.95, 0.3, 'bandpass', 1800, 1.4, 0.03, 0, 0.2, 3200);                          // la clé qui tombe
  noiseHit(48.0, 0.9, 'lowpass', 220, 1.0, 0.14, 0, 0.5, 400);                                       // le coup : le plus fort
  [0, 1, 2, 3].forEach((i) => blip(50.0 + i * 0.6, 900 + i * 220, 1100 + i * 220, 0.05, 0.03));      // les 4 niveaux
