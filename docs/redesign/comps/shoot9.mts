// Round 9 type sheet: the reel in each typeface, on a one-liner with bold and a drawing. node shoot9.mts
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const faces = ['geist-mono', 'geist', 'inter', 'instrument-sans', 'plex-mono', 'jetbrains-mono', 'dm-mono', 'fragment-mono', 'instrument-serif'];
const thin = ['geist-200', 'manrope', 'sora', 'outfit', 'space-grotesk', 'mona-wide', 'unbounded', 'fraunces', 'newsreader', 'martian-mono', 'azeret-mono'];
const b = await chromium.launch();
const shot = async (face: string, { dark = false, w = 1440, part = '.hero', suffix = '' } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`http://localhost:4391/hero-line.html?hero=reel&face=${face}`, { waitUntil: 'load' });
  await p.evaluate((dark) => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.querySelector('.vc')?.remove(); }, dark);
  // load the face before the reel measures its rows
  await p.evaluate(async () => { const fam = getComputedStyle(document.documentElement).getPropertyValue('--q-font'); await Promise.all([300, 400, 500].map((w) => document.fonts.load(`${w} 24px ${fam}`))); });
  await p.evaluate(() => document.querySelector('[data-ql]').click());
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2600);
  await p.evaluate(() => document.fonts.ready);
  await p.locator(part).screenshot({ path: `../shots/19-${face}${suffix}.png` });
  await p.close();
  console.log(face + suffix);
};
if (process.argv[2] === 'thin') { for (const f of thin) await shot(f, { part: '.ql' }); await b.close(); process.exit(0); }
if (process.argv[2] !== 'hero') for (const f of faces) await shot(f, { part: '.ql' });
await shot('sora', { suffix: '-hero' });
await shot('sora', { suffix: '-dark', dark: true });
await shot('sora', { suffix: '-375', w: 375 });
await b.close();
