// A before/after bar chart as a PNG, for a pull request whose change has
// numbers but nothing to see (speed, size, a test's timing): a reader scans
// bars faster than a list.
//
//   pnpm chart <data.json> <out.png>
//
// data.json: { "title": "Main content shown, slow phone", "unit": "ms",
//   "rows": [{ "label": "Home", "before": 456, "after": 412 }, ...],
//   "higherIsBetter": false }
// Each row gets a grey before bar and a purple after bar, both labelled, and
// the change in percent. A white card, so it reads on GitHub's light and dark.

import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

type Data = {
  title: string;
  unit: string;
  rows: { label: string; before: number; after: number }[];
  higherIsBetter?: boolean;
};

const [input, out] = process.argv.slice(2);
if (!input || !out) {
  console.error("usage: pnpm chart <data.json> <out.png>");
  process.exit(1);
}
const data: Data = JSON.parse(readFileSync(input, "utf8"));

// Every bar on one scale; 1 so an all-zero chart still draws.
const max = Math.max(1, ...data.rows.flatMap((r) => [r.before, r.after]));
const fmt = (n: number) =>
  `${Number(n.toPrecision(3)).toLocaleString("en-GB")} ${data.unit}`;
const bar = (n: number, colour: string) =>
  `<div class="bar"><div><i style="width:${(n / max) * 100}%;background:${colour}"></i></div><span>${fmt(n)}</span></div>`;
const rows = data.rows
  .map((r) => {
    // From nothing there is no percent: "new". Unchanged is neutral.
    const change = r.before ? ((r.after - r.before) / r.before) * 100 : null;
    const pct = change === null ? 0 : Math.round(change);
    const better = data.higherIsBetter ? pct > 0 : pct < 0;
    const text =
      change === null
        ? "new"
        : pct === 0
          ? "0%"
          : `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%`;
    const tone = change === null || pct === 0 ? "same" : better ? "up" : "down";
    return `<div class="row"><b>${r.label}</b><div>${bar(r.before, "#b4b2a9")}${bar(r.after, "#7c3aed")}</div><em class="${tone}">${text}</em></div>`;
  })
  .join("");

const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin: 0; font: 15px system-ui, sans-serif; color: #1f2328; }
  .card { width: 720px; padding: 24px 28px; background: #fff; }
  h1 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
  .key { margin: 0 0 18px; color: #59636e; font-size: 13px; }
  .key i { display: inline-block; width: 10px; height: 10px; margin: 0 4px 0 12px; border-radius: 2px; vertical-align: -1px; }
  .row { display: grid; grid-template-columns: 110px 1fr 56px; gap: 12px; align-items: center; margin: 12px 0; }
  .bar { display: grid; grid-template-columns: 1fr 72px; gap: 8px; align-items: center; height: 20px; margin: 3px 0; }
  .bar i { display: block; height: 16px; border-radius: 0 4px 4px 0; }
  .bar span { color: #59636e; font-size: 13px; white-space: nowrap; }
  em { font-style: normal; font-weight: 600; text-align: right; }
  .up { color: #1a7f37; } .down { color: #cf222e; } .same { color: #59636e; }
</style><div class="card"><h1>${data.title}</h1>
<p class="key">${data.higherIsBetter ? "higher" : "lower"} is better<i style="background:#b4b2a9"></i>before<i style="background:#7c3aed"></i>after</p>
${rows}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(html);
await page.locator(".card").screenshot({ path: out });
await browser.close();
console.log(out);
