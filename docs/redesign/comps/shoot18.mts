// Round 18: where writing goes, as the whole page down to the end of Projects. node shoot18.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (writing: string, { dark = false, w = 1440 } = {}) => {
  const name = `27-writing-${writing}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?writing=${writing}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [200, 400, 500, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.evaluate(() => document.querySelector('#projects').scrollIntoView());
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  const bottom = await p.evaluate(() => document.querySelector('#projects').getBoundingClientRect().bottom + window.scrollY + 24);
  await p.screenshot({ path: `../shots/${name}.png`, fullPage: true, clip: { x: 0, y: 0, width: w, height: bottom } });
  await p.locator('.term').screenshot({ path: `../shots/${name}-term.png` });
  await p.close();
  console.log(name);
};
await shot('term');
await shot('compact');
await shot('term', { dark: true });
await shot('term', { w: 375 });
await b.close();
