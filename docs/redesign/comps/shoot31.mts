// Round 31: violet; light bright vs light soft vs dark, the whole first screen and the projects figure. node shoot31.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const [name, light, dark] of [['bright', 'bright', false], ['soft', 'soft', false], ['dark', 'soft', true]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4390/hero-line.html?light=${light}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [200, 400, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.evaluate(() => document.querySelector('[data-ql]').click());
  await p.mouse.move(5, 5);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `../shots/41-${name}.png` });
  await p.close();
  console.log(name);
}
await b.close();
