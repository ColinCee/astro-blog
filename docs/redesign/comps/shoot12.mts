// Round 12: the shipped bars with labels, one legend, or nothing. node shoot12.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (ship: string, { dark = false, w = 1440 } = {}) => {
  const name = `22-ship-${ship}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?ship=${ship}`, { waitUntil: 'load' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [400, 500, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.waitForTimeout(800);
  await p.locator(w < 500 ? '.pane--ship' : '.term').screenshot({ path: `../shots/${name}.png` });
  await p.close();
  console.log(name);
};
for (const s of ['labels', 'legend', 'none']) await shot(s);
await shot('legend', { dark: true });
await shot('legend', { w: 375 });
await shot('none', { w: 375 });
await b.close();
