// Every figure in a post, cropped, as one sheet per figure: dark | light | 375px.
// node shoot-figs.mts slug[,slug] [only figure numbers, e.g. 3,4]  →  shots/figs/<slug>/NN.png
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const slugs = process.argv[2].split(',');
const only = process.argv[3]?.split(',').map(Number);
const b = await chromium.launch();
for (const slug of slugs) {
  mkdirSync(`../shots/figs/${slug}`, { recursive: true });
  const crops: Record<string, Buffer[]> = {};
  for (const [theme, w] of [['dark', 1280], ['light', 1280], ['375', 375]] as const) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
    if (theme === 'light') await p.addInitScript(() => localStorage.setItem('theme', 'light'));
    await p.goto(`http://localhost:4331/blog/${slug}/`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    // open any closed details so figures inside them are drawn too
    await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const figs = p.locator('.prose figure');
    const n = await figs.count();
    for (let i = 0; i < n; i++) {
      if (only && !only.includes(i + 1)) continue;
      const f = figs.nth(i);
      await f.scrollIntoViewIfNeeded();
      await p.waitForTimeout(1600);
      (crops[i] ??= []).push(await f.screenshot());
    }
    await p.close();
  }
  const q = await b.newPage({ viewport: { width: 1700, height: 400 } });
  for (const [i, imgs] of Object.entries(crops)) {
    await q.setContent(`<body style="margin:0;background:#777;display:flex;gap:6px;padding:6px;align-items:flex-start">${imgs.map((s, k) => `<img style="width:${k < 2 ? 640 : 375}px" src="data:image/png;base64,${s.toString('base64')}">`).join('')}</body>`);
    await q.locator('body').screenshot({ path: `../shots/figs/${slug}/${String(+i + 1).padStart(2, '0')}.png` });
  }
  await q.close();
  console.log(slug, Object.keys(crops).length, 'figures');
}
await b.close();
