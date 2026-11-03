  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 2.05, ['A3', 'Cs4', 'E4'], 0.07, { type: 'triangle', cut: 900, att: 0.05, rel: 0.25 });
  pluck(cu.pop ?? cu.hop ?? 1.0, nz('Cs5'), 0.22, 0.0, 0.6, 2600, 0.35);
  pluck((cu.pop ?? cu.hop ?? 1.0) + E8, nz('E5'), 0.18, 0.1, 0.6, 3000, 0.35);
  to = 's';
  sub(1.0, 0.9); blip(1.0, 440, 1760, 0.12, 0.2); blip(1.5, 880, 1320, 0.1, 0.15);
