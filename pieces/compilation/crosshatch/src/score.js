  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 2.05, ['D3', 'Fs3', 'A3'], 0.035, { type: 'triangle', cut: 900, att: 0.05, rel: 0.25 });
  pluck(cu.pop ?? cu.hop ?? 1.0, nz('Fs4'), 0.22, 0.0, 0.6, 2600, 0.35);
  pluck((cu.pop ?? cu.hop ?? 1.0) + E8, nz('A4'), 0.18, 0.1, 0.6, 3000, 0.35);
