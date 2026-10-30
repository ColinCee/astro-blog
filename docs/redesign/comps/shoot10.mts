// Round 10: hero and terminal in each font pairing next to the Sora one-liners. node shoot10.mts [pair]
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const pairs = ['geist', 'dm-mono', 'azeret', 'martian', 'sora-dm-mono', 'sora-azeret', 'sora-martian'];
const b = await chromium.launch();
for (const pair of pairs.filter((x) => !process.argv[2] || x === process.argv[2])) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1400 } });
  await p.goto(`http://localhost:4391/hero-line.html?hero=reel&face=sora&pair=${pair}`, { waitUntil: 'load' });
  await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; document.querySelector('.vc')?.remove(); });
  // load every face in use before the reel measures its rows
  await p.evaluate(async () => { const css = getComputedStyle(document.documentElement); await Promise.all(['--q-font', '--mono', '--head', '--sans'].flatMap((v) => [200, 300, 400, 500, 600].map((w) => document.fonts.load(`${w} 24px ${css.getPropertyValue(v)}`)))); });
  await p.evaluate(() => document.querySelector('[data-ql]').click());
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2400);
  const bottom = await p.evaluate(() => document.querySelector('.term').getBoundingClientRect().bottom + 24);
  await p.screenshot({ path: `../shots/20-${pair}.png`, clip: { x: 0, y: 0, width: 1440, height: bottom } });
  // a close crop where the faces meet: the hero, and the top of the terminal
  const t = await p.evaluate(() => document.querySelector('.term').getBoundingClientRect().top);
  await p.screenshot({ path: `../shots/20-${pair}-crop.png`, clip: { x: 40, y: 170, width: 1360, height: 230 } });
  await p.screenshot({ path: `../shots/20-${pair}-term.png`, clip: { x: 48, y: t, width: 1344, height: 330 } });
  await p.close();
  console.log(pair);
}
await b.close();
