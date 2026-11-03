  // SCORE BODY — grok-bot: a soft pad, a blip per icon, silence before the closing line, one stab on the payoff
  const T = TIMELINE, E = T.shots;
  to = 'm';
  pad(0.0, T.duration, ['D3', 'A3', 'Fs4'], 0.018, { type: 'triangle', cut: 800, att: 0.4, rel: 0.5 });
  to = 's';
  E.forEach((s, i) => { if (i) noiseHit(s.t0, 0.05, 'bandpass', 1400 + (i % 3) * 400, 1.5, 0.35, i % 2 ? 0.3 : -0.3); });
  to = 'm';
  chime(T.shots[T.shots.length - 1].t0 + 1.4, [nz('D5'), nz('Fs5'), nz('A5')], 0.12); sub(T.shots[T.shots.length - 1].t0 + 1.4, 0.5);
