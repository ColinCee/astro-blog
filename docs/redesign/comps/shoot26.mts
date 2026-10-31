// Round 26: the radar with arrows on real-looking routes, and the new cloud. node shoot26.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const pick = async (p, name: string) => {
  await p.locator('.pj__head', { hasText: name }).click();
  await p.waitForTimeout(600);
};
for (const dark of [false, true]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4391/hero-line.html', { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, dark);
  await p.locator('#projects').scrollIntoViewIfNeeded();
  const t = dark ? '-dark' : '';
  await pick(p, 'flight-tracker');
  await p.waitForTimeout(1500);
  await p.locator('.is-on .pj__fig').screenshot({ path: `../shots/35-radar-a${t}.png` });
  if (!dark) { await p.waitForTimeout(6000); await p.locator('.is-on .pj__fig').screenshot({ path: '../shots/35-radar-b.png' }); }
  await pick(p, 'home-lab');
  await p.locator('.is-on .pj__fig').screenshot({ path: `../shots/35-cloud-lab${t}.png` });
  await pick(p, 'colincheung.dev');
  await p.locator('.is-on .pj__fig').screenshot({ path: `../shots/35-cloud-edge${t}.png` });
  await p.close();
}
console.log('done');
await b.close();
