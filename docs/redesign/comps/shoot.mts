// Headless screenshots of the hero area for each figure. node shoot.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const shot = async (url, name, { dark = false, slide = null, wait = 1800 } = {}) => {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: 'load' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  await p.evaluate(() => document.fonts.ready);
  if (slide != null) await p.evaluate((k) => document.querySelectorAll('[data-dots] button')[k].click(), slide);
  await p.waitForTimeout(wait);
  await p.locator('.hero').screenshot({ path: `shots/${name}.png` });
  await p.close();
  console.log(name);
};
const u = 'http://localhost:4390/hero-figures.html';
await shot(u + '?line=slide', '17-fig0-oneliner', { slide: 0 });
await shot(u + '?line=slide', '17-fig2-delivery', { slide: 2 });
await shot(u + '?line=slide', '17-fig4-weather', { slide: 4 });
await shot(u + '?line=slide', '17-fig5-training', { slide: 5, wait: 3400 });
await shot(u + '?line=slide', '17-fig6-radar', { slide: 6 });
await shot(u + '?line=big', '17-line-big-left', { slide: 2 });
await shot(u + '?line=slide', '17-dark-delivery', { slide: 1, dark: true });
await b.close();
