// Round 25: no icons; where the blue goes in the worked-at strip. node shoot25.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (worked: string, { dark = false, w = 1440, term = false } = {}) => {
  const name = `34-tint-${worked}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?tint=${worked}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { await Promise.all(['DM Mono', 'Sora', 'Geist'].flatMap((f) => [200, 400, 500, 600].map((w) => document.fonts.load(`${w} 16px "${f}"`)))); });
  await p.waitForTimeout(1200);
  const sec = p.locator('.sec', { has: p.locator('.strip') });
  // the bars grow in once the strip is on screen, so bring it there first
  await sec.scrollIntoViewIfNeeded();
  await p.waitForTimeout(2200);
  await sec.screenshot({ path: `../shots/${name}.png` });
  if (term) await p.locator('.term').screenshot({ path: `../shots/28-term.png` });
  await p.close();
  console.log(name);
};
await shot('slash');
await shot('year');
await shot('none');
await shot('slash', { dark: true });
await b.close();
