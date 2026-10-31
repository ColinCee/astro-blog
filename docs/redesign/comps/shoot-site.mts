// Full-page shots of the real site from the dev server (blog-dev, port 4331), in
// dark (the default), light and at 375px, with any console errors listed.
// node shoot-site.mts home,blog,cv,blog/jest-to-vitest [tag]  →  docs/redesign/shots/site-<page>-<theme><tag>.png
// (pages without slashes, so Git Bash does not rewrite them as Windows paths)
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const paths = (process.argv[2] ?? 'home').split(',').map((x) => (x === 'home' ? '/' : `/${x}/`));
const tag = process.argv[3] ? '-' + process.argv[3] : '';
const b = await chromium.launch();
for (const path of paths)
  for (const [theme, w] of [['dark', 1440], ['light', 1440], ['dark-375', 375]] as const) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: w < 500 ? 2 : 1 });
    const errors: string[] = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    if (theme === 'light') await p.addInitScript(() => localStorage.setItem('theme', 'light'));
    await p.goto('http://localhost:' + (process.env.PORT ?? '4331') + path, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    // scroll through once so anything that waits to be seen has played
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
    await p.waitForTimeout(2500);
    const page = path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
    await p.screenshot({ path: `../shots/site-${page}-${theme}${tag}.png`, fullPage: true });
    console.log(page, theme, errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok');
    await p.close();
  }
await b.close();
