// Round 8 screenshots: each hero and projects variant, light, dark and 375px. node shoot8.mts [filter]
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const only = process.argv[2] ?? '';
const b = await chromium.launch();
const shot = async (name: string, qs: string, part: string, { dark = false, w = 1440, wait = 2200 } = {}) => {
  if (!name.includes(only)) return;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto('http://localhost:4391/hero-line.html?' + qs, { waitUntil: 'load' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(() => document.fonts.ready);
  if (part !== '.hero') await p.locator(part).scrollIntoViewIfNeeded();
  await p.waitForTimeout(wait);
  await p.locator(part).screenshot({ path: `../shots/${name}.png` });
  await p.close();
  console.log(name);
};
for (const h of ['bare', 'panel', 'reel']) {
  await shot(`18-hero-${h}`, `hero=${h}`, '.hero');
  await shot(`18-hero-${h}-dark`, `hero=${h}`, '.hero', { dark: true });
  await shot(`18-hero-${h}-375`, `hero=${h}`, '.hero', { w: 375 });
}
await shot('18-hero-bare-sans', 'hero=bare&face=sans', '.hero');
for (const pr of ['cards', 'picker']) {
  await shot(`18-proj-${pr}`, `proj=${pr}`, '#projects', { wait: 3200 });
  await shot(`18-proj-${pr}-dark`, `proj=${pr}`, '#projects', { dark: true, wait: 3200 });
  await shot(`18-proj-${pr}-375`, `proj=${pr}`, '#projects', { w: 375, wait: 3200 });
}
await b.close();
