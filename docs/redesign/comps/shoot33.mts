// Round 33: real posts from the dev server, reskinned with post-reskin.css, in dark, soft light and at 375px.
// Needs the blog dev server on 4331. node shoot33.mts
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire('D:/Claude Projects/astro-blog/package.json');
const { chromium } = require('playwright');
const css = readFileSync(new URL('./post-reskin.css', import.meta.url), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Sora:wght@200..600&family=DM+Mono:wght@300;400;500&display=swap';
const b = await chromium.launch();
const shot = async (slug: string, scheme: 'dark' | 'light', { w = 1440, reskin = true, tag = '' } = {}) => {
  const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
  await p.goto(`http://localhost:4331/blog/${slug}/`, { waitUntil: 'networkidle' });
  if (reskin) {
    await p.addStyleTag({ url: fonts }); await p.addStyleTag({ content: css });
    // split the headline stat on the arrow, as the build will
    await p.evaluate(() => document.querySelectorAll('.figs dd').forEach((dd) => { const [o, n] = dd.textContent.split('→').map((x) => x.trim()); if (n) dd.innerHTML = `<s>${o}</s><span class="to">→</span><b>${n}</b>`; }));
  }
  await p.evaluate(() => document.fonts.ready);
  // scroll through once so figures that grow or load when seen are drawn
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
  await p.waitForTimeout(900);
  const name = `42-${slug.split('-').slice(0, 2).join('-')}-${scheme}${w < 500 ? '-375' : ''}${tag}`;
  await p.screenshot({ path: `../shots/${name}.png`, fullPage: true });
  await p.close();
  console.log(name);
};
for (const slug of ['jest-to-vitest', 'private-ci-in-firecracker-microvms']) {
  await shot(slug, 'dark');
  await shot(slug, 'light');
}
await shot('jest-to-vitest', 'dark', { w: 375 });
await shot('jest-to-vitest', 'dark', { reskin: false, tag: '-today' });
await b.close();
