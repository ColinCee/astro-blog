// Round 11: the terminal before and after the clean-up, in Sora + DM Mono. node shoot11.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (name: string, term: string, { dark = false, w = 1440 } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?pair=sora-dm-mono&term=${term}`, { waitUntil: 'load' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(async () => { const css = getComputedStyle(document.documentElement); await Promise.all(['--mono', '--head', '--sans'].flatMap((v) => [400, 500, 600].map((w) => document.fonts.load(`${w} 16px ${css.getPropertyValue(v)}`)))); });
  await p.waitForTimeout(800);
  await p.locator('.term').screenshot({ path: `../shots/21-${name}.png` });
  await p.close();
  console.log(name);
};
await shot('term-full', 'full');
await shot('term-clean', 'clean');
await shot('term-clean-dark', 'clean', { dark: true });
await shot('term-clean-375', 'clean', { w: 375 });
await b.close();
