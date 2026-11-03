  const T = TIMELINE;
  to = 'm';
  pad(0.0, 1.55, ['C3','G3'], 0.02, { type: 'triangle', cut: 800, att: 0.05, rel: 0.2 });
  to = 's'; noiseHit(0.05, 0.05, 'bandpass', 4000, 1, 0.06, 0);
