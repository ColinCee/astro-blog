// Renders scripts/og/og.html to public/og.png (1200x630), the image link previews
// show. Run with `npm run og` after changing the page or the colour tokens.
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const page_ = fileURLToPath(new URL("./og.html", import.meta.url));
const out = fileURLToPath(new URL("../../public/og.png", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${page_}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`wrote ${out}`);
