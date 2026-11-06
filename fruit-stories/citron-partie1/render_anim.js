// Rend frames/NNNNN.jpg : chaque image est calculée (bouches synchronisées sur la voix, clignements, gestes, caméra).
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'))); const FPS = T.fps, N = process.env.LIMIT ? +process.env.LIMIT : Math.round(T.total * FPS);
const MAP = { LEO: 'LEO', NOIX: 'NOIX', ARTICHAUT: 'ARTICHAUT' }; const dir = path.join(__dirname, 'frames');
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
(async () => {
  const b = await chromium.launch(); const code = fs.readFileSync(path.join(__dirname, 'scenes_anim.js'), 'utf8'); const WK = 4; let done = 0;
  await Promise.all(Array.from({ length: WK }, async (_, w) => {
    const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } }); await pg.setContent('<body style="margin:0;background:#000"><div id="r"></div></body>'); await pg.addScriptTag({ content: code });
    for (let f = w; f < N; f += WK) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(f))) continue;
      const gt = f / FPS; let pi = T.plans.findIndex(p => gt >= p.start && gt < p.start + p.dur); if (pi < 0) pi = T.plans.length - 1;
      const P = T.plans[pi], t = gt - P.start; let sp = null, mo = 0;
      for (const l of P.lines) if (t >= l.start && t < l.start + l.dur) { sp = MAP[l.who] || null; mo = l.env[Math.min(l.env.length - 1, Math.floor((t - l.start) * FPS))] || 0; }
      await pg.evaluate(([pi, t, d, sp, mo]) => { document.getElementById('r').innerHTML = window.frameSVG(pi, t, d, sp, mo); }, [pi, t, P.dur, sp, mo]);
      await pg.screenshot({ path: path.join(dir, String(f + 1).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 88 });
      if (++done % 200 === 0) console.log(done + '/' + N);
    }
  }));
  await b.close(); console.log('frames', N);
})();
