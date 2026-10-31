// The violet spectrum rebuilt at other hues (same share of each hue's possible
// colour at each step), shot on a post and the homepage in dark and light, in one
// grid per hue.  node shoot-hue.mts 262,296,308  →  shots/hue-<h>.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const lin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function rgb(L: number, C: number, h: number) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (L: number, C: number, h: number) => rgb(L, C, h).every((v) => v >= -0.0005 && v <= 1.0005);
const maxC = (L: number, h: number) => { let c = 0; for (let k = 0; k < 400; k++) if (inGamut(L, k / 1000, h)) c = k / 1000; return c; };
const hex = (L: number, C: number, h: number) => '#' + rgb(L, Math.min(C, maxC(L, h)), h).map((v) => Math.round(Math.min(1, Math.max(0, lin(v))) * 255).toString(16).padStart(2, '0')).join('');
// the live spectrum (tokens.mts), as a share of violet's possible colour at each step
const V = [[0.25, 0.07, 298], [0.33, 0.12, 298], [0.41, 0.16, 298], [0.49, 0.19, 297], [0.57, 0.2, 296], [0.65, 0.19, 295]];
const b = await chromium.launch();
for (const h of (process.argv[2] ?? '296').split(',').map(Number)) {
  const css = ':root:root:root{' + V.map(([L, C, vh], i) => `--v${i + 1}:${hex(L, (C / maxC(L, vh)) * maxC(L, h), h)}`).join(';') + '}';
  const shots: string[] = [];
  for (const theme of ['dark', 'light']) {
    const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
    if (theme === 'light') await p.addInitScript(() => localStorage.setItem('theme', 'light'));
    for (const [url, clip] of [['/', { x: 0, y: 160, width: 1280, height: 520 }], ['/blog/dissertation-revival-beating-2018/', { x: 300, y: 0, width: 680, height: 860 }]] as const) {
      await p.goto('http://localhost:4331' + url, { waitUntil: 'networkidle' });
      await p.addStyleTag({ content: css });
      await p.evaluate(() => document.fonts.ready);
      if (url !== '/') await p.evaluate(() => document.querySelector('figure:nth-of-type(2), .fig ~ .fig')?.scrollIntoView({ block: 'center' }));
      await p.waitForTimeout(3000);
      shots.push((await p.screenshot({ clip })).toString('base64'));
    }
    await p.close();
  }
  const q = await b.newPage({ viewport: { width: 1980, height: 900 } });
  await q.setContent(`<body style="margin:0;background:#666;display:grid;grid-template-columns:1280px 680px;gap:6px;padding:6px;font:20px sans-serif;color:#fff">${shots.map((s) => `<img style="width:100%" src="data:image/png;base64,${s}">`).join('')}<div>hue ${h}: ${css.slice(16, -1)}</div></body>`);
  await q.screenshot({ path: `../shots/hue-${h}.png`, fullPage: true });
  await q.close();
  console.log(h, css);
}
await b.close();
