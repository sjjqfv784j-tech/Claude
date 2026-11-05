const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('https://xsearcher.cc/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => {
    const f = document.querySelector('iframe'); const r = f && f.getBoundingClientRect();
    return { iframe: f && f.src, r: r && [r.x, r.y + scrollY, r.width, r.height] };
  });
  console.log(JSON.stringify(info));
  const el = await p.$('iframe');
  await el.scrollIntoViewIfNeeded();
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(2500); await el.screenshot({ path: `assets/demo-${i}.png` }); }
  // chat page
  const q = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  const r = await q.goto('https://xsearcher.cc/chatt', { waitUntil: 'networkidle' }).catch(e => null);
  await q.waitForTimeout(1200);
  await q.screenshot({ path: 'assets/chat.png' });
  console.log(q.url());
  await b.close();
})();
