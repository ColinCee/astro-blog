// The homepage's first screen and a post's header and first chart in candidate
// dark accents, so accent picks are judged on the real pages.
// node shoot-accent.mts "accent text solid" ...  →  shots/accent-<n>-home.png, accent-<n>-post.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const [n, set] of process.argv.slice(2).entries()) {
  const [accent, text, solid] = set.split(' ');
  const css = `:root:root{--accent:${accent};--accent-text:${text};--accent-solid:${solid}}`;
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:4331/', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: css });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `../shots/accent-${n + 1}-home.png` });
  await p.goto('http://localhost:4331/blog/jest-to-vitest/', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: css });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `../shots/accent-${n + 1}-post.png`, clip: { x: 300, y: 60, width: 680, height: 560 } });
  console.log(n + 1, set);
  await p.close();
}
await b.close();
