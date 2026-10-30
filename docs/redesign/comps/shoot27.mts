// Round 27: three cloud styles in both diagrams, light and dark. node shoot27.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const cloud of ['tone', 'line', 'soft']) for (const dark of [false, true]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4391/hero-line.html?cloud=${cloud}`, { waitUntil: 'networkidle' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.locator('#projects').scrollIntoViewIfNeeded();
  for (const [name, tag] of [['colincheung.dev', 'edge'], ['home-lab', 'lab']]) {
    await p.locator('.pj__head', { hasText: name }).click();
    await p.waitForTimeout(500);
    await p.locator('.is-on .pj__body').screenshot({ path: `../shots/36-cloud-${cloud}-${tag}${dark ? '-dark' : ''}.png` });
  }
  await p.close();
  console.log(cloud, dark);
}
await b.close();
