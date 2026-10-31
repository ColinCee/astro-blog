// The logo ideas sheet (logo-ideas.html) as one image.
// node shoot-logos.mts  →  ../shots/logo-ideas.png
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await p.goto(new URL('./logo-ideas.html', import.meta.url).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: fileURLToPath(new URL('../shots/logo-ideas.png', import.meta.url)), fullPage: true });
await b.close();
