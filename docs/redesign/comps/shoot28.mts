// Round 28: the projects picker list, plain or cards, with or without subtitles. node shoot28.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (side: string, sub: string, { dark = false, w = 1440 } = {}) => {
  const name = `37-proj-${side}-${sub}${dark ? '-dark' : ''}${w < 500 ? '-375' : ''}`;
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?side=${side}&sub=${sub}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.locator('#projects').scrollIntoViewIfNeeded();
  await p.locator('.pj__head', { hasText: 'colincheung.dev' }).click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(900);
  // a little wider than the section: the open project's slash hangs into the page gutter
  const r = await p.locator('#projects').boundingBox();
  await p.screenshot({ path: `../shots/${name}.png`, clip: { x: Math.max(0, r.x - 24), y: r.y, width: r.width + 48, height: r.height } });
  await p.close();
  console.log(name);
};
await shot('plain', 'short');
await shot('plain', 'short', { dark: true });
await shot('plain', 'short', { w: 375 });
await b.close();
