  // SCORE BODY — grok-bot: thin pad early, fullest at the team, near-silence on the night, one stab in the pause before the last line
  const T = TIMELINE, E = T.shots;
  const tTools = E[3].t0, tPeak = E[6].t0, nightT = E[7].t0;
  const l12 = typeof VOICE !== 'undefined' ? VOICE.lines.find((l) => l.id === 'l12') : null;
  const hitT = l12 ? l12.t1 : E[8].t0 + 1.0;
  to = 'm';
  pad(0.0, tTools, ['D3', 'A3'], 0.010, { type: 'triangle', cut: 700, att: 0.4, rel: 0.5 });
  pad(tTools, tPeak, ['D3', 'A3', 'Fs4'], 0.016, { type: 'triangle', cut: 800, att: 0.4, rel: 0.5 });
  pad(tPeak, nightT + 0.2, ['D3', 'A3', 'Fs4', 'D4'], 0.020, { type: 'triangle', cut: 1000, att: 0.3, rel: 0.4 });
  for (let k = 0; k < 4; k++) pluck(tPeak + 0.25 + k * 0.7, nz(['D4', 'Fs4', 'A4', 'D5'][k]), 0.08, 0, 0.3, 2800, 0.2);
  to = 's';
  E.forEach((s, i) => { if (i && s.t0 < nightT) noiseHit(s.t0, 0.05, 'bandpass', 1400 + (i % 3) * 400, 1.5, 0.3, i % 2 ? 0.3 : -0.3); });
  to = 'm';
  chime(hitT, [nz('D5'), nz('Fs5'), nz('A5')], 0.3); sub(hitT, 0.7);
  pad(hitT + 0.1, T.duration, ['D3', 'A3', 'D4', 'Fs4'], 0.03, { cut: 1200, att: 0.2, rel: 0.4, send: 0.4 });
