// Renders the link-preview images: scripts/og/og.html to public/og.png (the
// site's, 1200x630), and scripts/og/post.html once per post to
// public/og/<slug>.png, filled from the post's frontmatter (title, stat,
// statLabel). Also the icons the SVG favicon can't cover: favicon.ico (asked
// for by tools and older browsers) and apple-touch-icon.png (a phone's home
// screen), both its dark version. Run with `pnpm og` after adding a post or
// changing the cards, the favicon or the colour tokens; a post without a card
// shares the site's.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
// The favicon, dark. The phone's is square on the page colour, since a phone
// rounds the corners itself and shows a transparent one black; the .ico keeps
// the tile's own rounded corners.
const icon = await browser.newPage({ colorScheme: "dark" });
const svg = readFileSync(here("../../public/favicon.svg"), "utf8");
const shot = async (px: number, bg: string) => {
  await icon.setViewportSize({ width: px, height: px });
  await icon.setContent(
    `<body style="margin:0;background:${bg}">${svg.replace("<svg ", `<svg width="${px}" height="${px}" `)}</body>`,
  );
  return icon.screenshot({ omitBackground: bg === "transparent" });
};
writeFileSync(
  here("../../public/apple-touch-icon.png"),
  await shot(180, "#0c0d0f"),
);
console.log("wrote public/apple-touch-icon.png");
// An .ico is a 6-byte header and a 16-byte entry in front of a PNG.
const png = await shot(32, "transparent");
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6);
ico.writeUInt8(32, 7);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14);
ico.writeUInt32LE(22, 18);
writeFileSync(here("../../public/favicon.ico"), Buffer.concat([ico, png]));
console.log("wrote public/favicon.ico");
await browser.close();
