// Round 29: the page in each accent candidate, and the design-system page. node shoot29.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const accents = ['blue', 'indigo', 'violet', 'magenta', 'sky', 'teal'];
for (const a of accents) for (const dark of [false, true]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4391/hero-line.html?accent=${a}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [200, 400, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.evaluate(() => document.querySelector('[data-ql]').click());
  await p.mouse.move(5, 5);
  await p.waitForTimeout(1600);
  const bottom = await p.evaluate(() => document.querySelector('.term').getBoundingClientRect().bottom + 16);
  await p.screenshot({ path: `../shots/39-accent-${a}${dark ? '-dark' : ''}.png`, clip: { x: 0, y: 120, width: 1440, height: bottom - 120 } });
  await p.close();
}
for (const dark of [false, true]) {
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.goto('http://localhost:4391/system.html', { waitUntil: 'networkidle' });
  if (dark) await p.evaluate(() => document.documentElement.dataset.theme = 'dark');
  await p.waitForTimeout(500);
  await p.screenshot({ path: `../shots/39-system${dark ? '-dark' : ''}.png`, fullPage: true });
  await p.close();
}
console.log('done');
await b.close();
