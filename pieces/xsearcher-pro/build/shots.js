const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
  p.on('console', () => {});
  await p.goto('https://xsearcher.cc/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'assets/home.png' });
  await p.screenshot({ path: 'assets/home-full.png', fullPage: true });
  const links = await p.$$eval('a', a => a.map(x => x.href + ' | ' + x.textContent.trim().slice(0, 40)).slice(0, 30));
  console.log(links.join('\n'));
  const h = await p.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log(h);
  await b.close();
})();
