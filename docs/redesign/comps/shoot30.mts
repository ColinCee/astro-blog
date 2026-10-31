// Round 30: warm accents with status folded in, against blue: the top of the page and the homelab figure. node shoot30.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const a of ['blue', 'tomato', 'orange']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4391/hero-line.html?accent=${a}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.querySelector('.vc')?.remove(); });
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [200, 400, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.evaluate(() => document.querySelector('[data-ql]').click());
  await p.mouse.move(5, 5);
  await p.waitForTimeout(1600);
  const bottom = await p.evaluate(() => document.querySelector('.term').getBoundingClientRect().bottom + 16);
  await p.screenshot({ path: `../shots/40-warm-${a}.png`, clip: { x: 0, y: 120, width: 1440, height: bottom - 120 } });
  await p.locator('#projects').scrollIntoViewIfNeeded();
  await p.locator('.pj__head', { hasText: 'home-lab' }).click();
  await p.waitForTimeout(600);
  await p.locator('.is-on .pj__body').screenshot({ path: `../shots/40-warm-${a}-lab.png` });
  await p.close();
  console.log(a);
}
await b.close();
