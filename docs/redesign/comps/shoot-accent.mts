// Crops of a post's header and a chart with candidate dark accents (a9 a10 a11),
// so accent picks are judged on the real page.
// node shoot-accent.mts "#974afe #a674fb #bc9cfe" "#9133fd ..."  →  shots/accent-<n>.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const [n, set] of process.argv.slice(2).entries()) {
  const [a9, a10, a11] = set.split(' ');
  const p = await b.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });
  await p.addInitScript(() => matchMedia && 0);
  await p.goto('http://localhost:4331/blog/dissertation-revival-beating-2018/', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: `:root{--a9:${a9};--a10:${a10};--a11:${a11}}` });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2500);
  const head = await p.locator('.post__head').boundingBox();
  const fig = await p.locator('figure').first().boundingBox();
  await p.evaluate((y) => scrollTo(0, y), fig!.y - 300);
  await p.waitForTimeout(1500);
  const y0 = head!.y;
  await p.screenshot({ path: `../shots/accent-${n + 1}.png`, fullPage: true, clip: { x: head!.x - 20, y: y0, width: head!.width + 40, height: fig!.y + fig!.height - y0 + 10 } });
  console.log(n + 1, set);
  await p.close();
}
await b.close();
