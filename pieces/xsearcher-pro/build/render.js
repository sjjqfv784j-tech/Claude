// usage: node render.js stills t1,t2,...   |   node render.js video fps workers
const { chromium } = require('playwright'); const fs = require('fs');
const mode = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-gpu-vsync'] });
  async function page() {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
    await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => window.readyP); return p;
  }
  if (mode === 'stills') {
    const ts = process.argv[3].split(',').map(Number); const p = await page(); fs.mkdirSync('/tmp/stills', { recursive: true });
    for (const t of ts) { await p.evaluate(([t]) => render(t, Math.round(t * 30)), [t]); await p.screenshot({ path: `/tmp/stills/t${t.toFixed(2)}.png` }); }
  } else {
    const fps = +process.argv[3], nw = +process.argv[4], dur = 25, N = Math.round(dur * fps); fs.mkdirSync('frames', { recursive: true });
    const pages = await Promise.all([...Array(nw)].map(page)); let next = 0; const t0 = Date.now();
    await Promise.all(pages.map(async p => { for (;;) { const i = next++; if (i >= N) break; const t = i / fps;
      await p.evaluate(([t, i]) => render(t, i), [t, i]); await p.screenshot({ path: `frames/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 96 });
      if (i % 60 === 0) console.log(i, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } }));
  }
  await b.close();
})();
