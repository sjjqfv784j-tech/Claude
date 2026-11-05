  // SCORE BODY — X.GPT ad. to = 'm' (music) or 's' (sfx). Everything stops at 14.0: silence until the hit at 15.0.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 14.0, ['A2', 'E3', 'A3'], 0.032, { type: 'triangle', cut: 700, att: 0.4, rel: 0.1, send: 0 });
  pluck(0.5, nz('A4'), 0.2, 0, 0.7, 2600, 0.35);
  [[4.0, 'E5'], [4.5, 'A5'], [5.0, 'C6']].forEach(([t, n], i) => pluck(t, nz(n), 0.17, -0.2 + i * 0.2, 0.5, 3200, 0.3));
  for (let i = 0; i < 8; i++) pluck(6.0 + i * 0.5, nz(['A3', 'C4', 'E4', 'A4'][i % 4]), 0.1 + i * 0.01, 0, 0.35, 2400, 0.2);
  riser(8.0, 8.9, 0.02);
  chime(cu.card, [nz('A5'), nz('E6')], 0.08);
  riser(10.0, 11.0, 0.03);
  to = 's';
  [11.0, 11.5, 12.0, 12.5, 12.625, 12.75, 12.875].forEach((t, i) => noiseHit(t, 0.08, 'bandpass', 1600 + i * 350, 1.5, 0.45, i % 2 ? 0.3 : -0.3));
  to = 'm';
  chime(13.0, [nz('A5'), nz('C6'), nz('E6')], 0.07);
  // 14.0 - 15.0: nothing. The payoff: a short stab + sub on the hit, then a flat chord.
  chime(15.0, [nz('A4'), nz('E5'), nz('A5'), nz('C6')], 0.16); sub(15.0, 0.9);
  pad(15.05, 20.05, ['A2', 'E3', 'A3', 'C4'], 0.04, { cut: 1100, att: 0.3, rel: 0.4, send: 0.3 });
  pluck(cu.lock, nz('E5'), 0.1, 0, 0.6, 3000, 0.3);
  pluck(cu.url, nz('A5'), 0.1, 0, 0.6, 3000, 0.3);
