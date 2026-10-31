// Round 15-16: the terminal's right pane as a CV timeline, a CV list, or shipped. node shoot15.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (term: string, { dark = false, w = 1440 } = {}) => {
  const name = `25-term-${term}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?term=${term}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [400, 500, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.waitForTimeout(800);
  await p.locator('.term').screenshot({ path: `../shots/${name}.png` });
  await p.close();
  console.log(name);
};
for (const t of ['timeline', 'cv', 'shipped']) await shot(t);
await shot('timeline', { dark: true });
await shot('timeline', { w: 375 });
await b.close();
