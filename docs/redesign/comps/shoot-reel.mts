// Every one-liner with a drawing, stacked, in candidate accents, so the reel's
// colour is judged on all of them at once.
// node shoot-reel.mts "solid wash text" ...  (spaces inside a value as _)  →  shots/reel-<n>.png
import { createRequire } from 'node:module';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const [n, set] of process.argv.slice(2).entries()) {
  const [solid, wash, text] = set.split(' ').map((v) => v.replaceAll('_', ' '));
  const p = await b.newPage({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:4331/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(([solid, wash, text]) => {
    const quips: string[] = JSON.parse(document.querySelector('[data-reel]')!.getAttribute('data-quips')!);
    const li = document.querySelector('.reel__track li')!;
    const box = document.createElement('div');
    box.id = 'shot';
    box.style.cssText = `position:fixed;inset:0;z-index:99;background:var(--bg);padding:24px;display:grid;gap:14px;align-content:start;--accent-solid:${solid};--accent-wash:${wash};--accent-text:${text}`;
    for (const q of quips.filter((q) => q.includes('class="q-'))) {
      const row = li.cloneNode() as HTMLElement;
      row.className = li.className;
      row.removeAttribute('style');
      row.style.cssText = 'position:static;opacity:1;transform:none';
      row.innerHTML = q;
      box.append(row);
    }
    document.body.append(box);
  }, [solid, wash, text]);
  await p.waitForTimeout(3500);
  await p.locator('#shot').screenshot({ path: `../shots/reel-${n + 1}.png` });
  console.log(n + 1, set);
  await p.close();
}
await b.close();
