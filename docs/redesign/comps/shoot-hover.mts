// Each button on the homepage at rest and hovered, side by side, in dark and light,
// with optional CSS to try a hover style.  node shoot-hover.mts [tag] [css]  →  shots/hover-<theme><tag>.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const tag = process.argv[2] ? '-' + process.argv[2] : '';
const css = process.argv[3] ?? '';
const b = await chromium.launch();
for (const theme of ['dark', 'light']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  if (theme === 'light') await p.addInitScript(() => localStorage.setItem('theme', 'light'));
  await p.goto('http://localhost:4331/', { waitUntil: 'networkidle' });
  if (css) await p.addStyleTag({ content: css });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3000);
  const shots: Buffer[] = [];
  for (const sel of ['.nav__theme', '.hero__ico', '.strip__toggle']) {
    const el = p.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await p.mouse.move(0, 0);
    await p.waitForTimeout(300);
    const box = (await el.boundingBox())!;
    const clip = { x: box.x - 12, y: box.y - 12, width: box.width + 24, height: box.height + 24 };
    shots.push(await p.screenshot({ clip }));
    await el.hover();
    await p.waitForTimeout(400);
    shots.push(await p.screenshot({ clip }));
  }
  // lay the crops out in a row on a blank page
  const q = await b.newPage({ deviceScaleFactor: 1 });
  await q.setContent(`<body style="margin:0;background:#888;display:flex;gap:6px;padding:6px;align-items:center">${shots.map((s, i) => `<img style="height:${i < 4 ? 70 : 60}px" src="data:image/png;base64,${s.toString('base64')}">`).join('')}</body>`);
  await q.locator('body').screenshot({ path: `../shots/hover-${theme}${tag}.png` });
  console.log(theme);
  await p.close();
  await q.close();
}
await b.close();
