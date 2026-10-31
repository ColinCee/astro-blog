// Round 13: the terminal with whoami and weather back, three right-hand panes. node shoot13.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (term: string, { dark = false, w = 1440 } = {}) => {
  const name = `23-term-${term}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?term=${term}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [400, 500, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.waitForTimeout(800);
  await p.locator('.term').screenshot({ path: `../shots/${name}.png` });
  await p.close();
  console.log(name);
};
for (const t of ['shipped', 'now', 'both']) await shot(t);
await shot('both', { dark: true });
await shot('both', { w: 375 });
await b.close();
