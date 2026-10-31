// Renders the link-preview images: scripts/og/og.html to public/og.png (the
// site's, 1200x630), and scripts/og/post.html once per post to
// public/og/<slug>.png, filled from the post's frontmatter (title, stat,
// statLabel). Run with `pnpm og` after adding a post or changing the cards or
// the colour tokens; a post without a card shares the site's.

import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const blog = here("../../src/content/blog");
mkdirSync(here("../../public/og"), { recursive: true });

// The three fields the card needs, from a post's frontmatter block.
function front(file: string) {
  const block = readFileSync(`${blog}/${file}`, "utf8").split("---")[1] ?? "";
  const field = (k: string) =>
    block
      .match(new RegExp(`^${k}:(.*)$`, "m"))?.[1]
      .trim()
      .replace(/^"(.*)"$/, "$1");
  return {
    title: field("title") ?? "",
    stat: field("stat") ?? "",
    label: field("statLabel") ?? "",
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

await page.goto(`file://${here("./og.html")}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here("../../public/og.png") });
console.log("wrote public/og.png");

for (const file of readdirSync(blog).filter((f) => /\.mdx?$/.test(f))) {
  const slug = file.replace(/\.mdx?$/, "");
  const post = front(file);
  await page.goto(`file://${here("./post.html")}`);
  await page.evaluate(({ title, stat, label }) => {
    const $ = (s: string) => document.querySelector(s) as HTMLElement;
    $("[data-title]").textContent = title;
    $("[data-label]").textContent = label;
    const value = $("[data-value]");
    // "428 s → 23 s" splits into old and new; "82% vs 80%" stays one value
    const [was, now] = stat.split("→").map((s) => s.trim());
    if (now) {
      value.innerHTML = `<span class="was"></span><span class="to">→</span><span class="now"></span>`;
      $(".was").textContent = was;
      $(".now").textContent = now;
    } else {
      value.innerHTML = `<span class="now"></span>`;
      $(".now").textContent = was;
      value.classList.toggle("flat", stat.includes(" vs "));
    }
  }, post);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: here(`../../public/og/${slug}.png`) });
  console.log(`wrote public/og/${slug}.png`);
}
await browser.close();
