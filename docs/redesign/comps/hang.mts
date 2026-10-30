// Load a comp headless and report whether its main thread answers.
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const url = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
try {
  await page.goto(url, { waitUntil: 'load', timeout: 15000 });
  const t0 = Date.now();
  const r = await Promise.race([
    page.evaluate(() => new Promise(res => setTimeout(() => res('alive after 1.5s · slides ' + document.querySelectorAll('[data-slide]').length + ' · on: ' + (document.querySelector('.slide.is-on')?.dataset.cap || 'none')), 1500))),
    new Promise(res => setTimeout(() => res('HUNG: evaluate did not return in 8s'), 8000)),
  ]);
  console.log(r, '(' + (Date.now() - t0) + 'ms)');
} catch (e) { console.log('ERR', e.message.split('\n')[0]); }
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
