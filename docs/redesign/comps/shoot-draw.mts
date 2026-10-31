// A figure drawing itself in: frames at set times after it scrolls into view,
// side by side.  node shoot-draw.mts <slug> <figure number> [port]  →  shots/draw-<slug>-<n>.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const [slug, n, port = '4332'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 1400 } });
await p.goto(`http://localhost:${port}/blog/${slug}/`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const f = p.locator('.prose figure.fig').nth(Number(n) - 1);
const frames: Buffer[] = [];
await f.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
// page shots of the figure's box: an element shot waits for it to stop moving
const box = (await f.boundingBox())!;
const clip = { x: box.x, y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, 1400 - Math.max(0, box.y)) };
let last = 0;
for (const t of [0, 250, 600, 1600]) {
  await p.waitForTimeout(t - last);
  last = t;
  frames.push(await p.screenshot({ clip }));
}
const q = await b.newPage({ viewport: { width: 1800, height: 400 } });
await q.setContent(`<body style="margin:0;background:#777;display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:6px">${frames.map((s) => `<img style="width:100%" src="data:image/png;base64,${s.toString('base64')}">`).join('')}</body>`);
await q.locator('body').screenshot({ path: `../shots/draw-${slug}-${n}.png` });
await b.close();
console.log('ok');
