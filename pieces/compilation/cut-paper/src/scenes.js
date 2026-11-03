
// =====================================================================
//  SCENES — one function per era, drawn in world coordinates (1080x1920), animated with TT / ev / popS.
//  Each scene: a full-bleed world, the hero acting, 3+ details of background life, a year tag and a caption.
// =====================================================================
function sceneNight() {
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.navy, { key: 'wallN', shadow: false, tear: 0, shade: false, pat: pat.dots('rgba(255,230,180,0.10)', 4, 70) });
  // the window, the moon (the bridge object), the stars
  cut(rect(560, 280, 360, 400, 6), PAL.woodD, { key: 'win' });
  cut(rect(584, 304, 312, 352, 2), PAL.night, { key: 'glass', shadow: false, pat: (bb) => { const R = RNG('stars'); for (let i = 0; i < 30; i++) sparkle(R.r(bb.x0, bb.x1), R.r(bb.y0, bb.y1), R.r(3, 7) * (0.6 + 0.4 * ((B + i) % 2))); } });
  cut(ellipsePts(780, 420, 40, 40, 0, 30), '#f6ecc8', { key: 'moon' });
  cut(rect(540, 670, 400, 30, 4), PAL.wood, { key: 'sill' });
  cat(720, 645, 0.8, PAL.charcoal, 'catN');
  clock(220, 420, 90, 11, 52, 'clock');
  // the desk, a lamp, a mug
  cut(rect(-30, 1150, W + 60, 900, 0), PAL.wood, { key: 'desk', tear: 0, pat: pat.grainWood('rgba(120,60,20,0.18)'), sy: -6 });
  cut(ellipsePts(200, 1150, 80, 22, 0, 24), PAL.lamp, { key: 'lbase' });
  cut(capsulePts(200, 1140, 260, 900, 20), '#c9a24a', { key: 'larm' });
  cut([[200, 920], [240, 840], [400, 840], [440, 920]], PAL.lamp, { key: 'shade' });
  mug(820, 1210, 0.9, PAL.yellow, 'mugN');
  // the hero: asleep (eyes closed), then it wakes and grows
  spark(500, 1060, 96, { rays: 7, mood: TT < TIMELINE.cues.wake ? 'focus' : 'wow', key: 'hero', s: 0.65 + 0.35 * popS(TIMELINE.cues.wake) });
  yearTag('night');
  capStrip('the spark wakes up');
}
function sceneMorning() {
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mint, { key: 'wallM', shadow: false, tear: 0, shade: false, pat: pat.stripes('rgba(255,255,255,0.18)', 30, 80) });
  cut(ellipsePts(780, 420, 80, 80, 0, 36), PAL.yellow, { key: 'sun', crayon: '#e6b23a' });
  [[200, 360], [420, 300]].forEach(([x, y], i) => cut(ellipsePts(x + Math.sin(TT + i) * 10, y, 70, 28, 0, 20), '#ffffff', { key: 'cloud' + i, sb: 6 }));
  cut([[-40, 1100], [300, 1060], [700, 1110], [1120, 1070], [1120, 2000], [-40, 2000]], PAL.green, { key: 'grass', sy: -4, pat: pat.stripes('rgba(255,255,255,0.12)', 4, 22, 0.3) });
  // flowers pop in one by one
  for (let i = 0; i < 6; i++) {
    const t0 = TIMELINE.cues.flowers + i * 0.25, k = popS(t0); if (k <= 0) continue;
    const x = 120 + i * 150, y = 1250 + (i % 2) * 70;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ink([[0, 0], [0, 90]], { w: 6, color: PAL.greenD, key: 'stem' + i });
    for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; cut(ellipsePts(Math.cos(a) * 22, Math.sin(a) * 22, 18, 12, a, 14), [PAL.pink, PAL.purple, '#ffffff'][i % 3], { key: 'pet' + i + p, sb: 4 }); }
    cut(ellipsePts(0, 0, 12, 12, 0, 14), PAL.yellow, { key: 'mid' + i, shadow: false });
    ctx.restore();
  }
  spark(500, 960, 110, { rays: 8, mood: 'happy', key: 'hero' });
  yearTag('morning');
  capStrip('and the garden grows');
}

function sceneCompile() {
  const cu = TIMELINE.cues, lit = popS(cu.pop), on = TT >= cu.pop;
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.sky, { key: 'wallC', shadow: false, tear: 0, shade: false, pat: pat.stripes('rgba(255,255,255,0.18)', 30, 80) });
  [[200, 400], [860, 520]].forEach(([x, y], i) => cut(ellipsePts(x + Math.sin(TT * 1.3 + i) * 12, y, 80, 28, 0, 20), '#ffffff', { key: 'cloudC' + i, sb: 6 }));
  cut([[-40, 1250], [300, 1200], [700, 1260], [1120, 1210], [1120, 2000], [-40, 2000]], PAL.green, { key: 'grassC', sy: -4, pat: pat.stripes('rgba(255,255,255,0.12)', 4, 22, 0.3) });
  if (on) for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2; if (Math.sin(a) > 0.75) continue; const r0 = 150, r1 = 150 + 50 * lit; ink([[540 + Math.cos(a) * r0, 600 + Math.sin(a) * r0], [540 + Math.cos(a) * r1, 600 + Math.sin(a) * r1]], { w: 9, color: '#e6b23a', key: 'rayC' + i }); }
  cut(ellipsePts(540, 600, 112, 112, 0, 36), on ? PAL.yellow : '#ece6d2', { key: 'bulbC', crayon: '#e6b23a' });
  cut(rect(490, 700, 100, 70, 8), PAL.charcoal, { key: 'baseC' });
  spark(540, 1080, 112, { rays: 8, mood: on ? 'happy' : 'focus', key: 'hero' });
  yearTag('1 / 7');
  capStrip('cut paper');
}
