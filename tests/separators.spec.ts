import { readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

// No dot between items, in any text or drawn content: a gap, a column or a
// line separates them (DESIGN.md, Don'ts). The tab's title is the one
// exception. The home window's live readouts (status, weather, the selected
// post) are held to their exact words by home-window and homelab specs.
const posts = readdirSync("src/content/blog")
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => `/blog/${f.replace(/\.mdx?$/, "")}/`);
const pages = [
  "/",
  "/blog/",
  "/cv/",
  "/cortex/",
  "/cortex/privacy/",
  "/404/",
  ...posts,
];

for (const width of [390, 1440])
  for (const path of pages)
    test(`${width}: ${path} separates items without a dot`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // The home window keeps fetching, so the network never goes quiet:
      // wait for its scripts to have drawn it instead.
      if (path === "/")
        await expect(page.locator(".win__app")).toHaveAttribute(
          "data-ready",
          "",
        );
      const dots = await page.evaluate(() => {
        const found: string[] = [];
        const skip = "astro-dev-toolbar, script, style, title";
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
        );
        for (let n = walker.nextNode(); n; n = walker.nextNode())
          if (n.textContent?.includes("·") && !n.parentElement?.closest(skip))
            found.push(n.textContent.trim().slice(0, 60));
        for (const el of document.body.querySelectorAll("*"))
          for (const at of ["::before", "::after"]) {
            const content = getComputedStyle(el, at).content;
            if (content.includes("·"))
              found.push(`${el.tagName.toLowerCase()}.${el.className}${at}`);
          }
        return found;
      });
      expect(dots, "items separated by a dot").toEqual([]);
    });
