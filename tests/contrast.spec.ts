import { readdirSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

// Every word on the site is readable on what it sits on: 4.5:1, or 3:1 for
// large text (WCAG 1.4.3), measured from what the browser paints in both
// themes. The colour roles and their values are DESIGN.md's (Colours).
const posts = readdirSync("src/content/blog")
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => `/blog/${f.replace(/\.mdx?$/, "")}/`);
const pages = ["/", "/blog/", "/cv/", ...posts];

const lowContrast = (page: Page) =>
  page.evaluate(() => {
    const paint = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    })!;
    // Any CSS colour as sRGB 0-255 and alpha 0-1.
    const rgba = (css: string) => {
      paint.clearRect(0, 0, 1, 1);
      paint.fillStyle = "#000";
      paint.fillStyle = css;
      paint.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const over = (top: number[], under: number[]) =>
      [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]));
    // What an element's text is drawn on: its own background and its
    // ancestors', layered, down to the page.
    const backdrop = (el: Element | null): number[] => {
      if (!el) return rgba(getComputedStyle(document.body).backgroundColor);
      const bg = rgba(getComputedStyle(el).backgroundColor);
      if (bg[3] >= 1) return bg.slice(0, 3);
      return over(bg, backdrop(el.parentElement));
    };
    const lum = (c: number[]) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const found = new Map<string, string>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.textContent?.trim()) continue;
      if (
        el.closest(
          "astro-dev-toolbar, script, style, svg, .sr-only, [aria-hidden='true']",
        )
      )
        continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
      const bg = backdrop(el);
      const fg = over(rgba(cs.color), bg);
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      const ratio = (hi + 0.05) / (lo + 0.05);
      const px = parseFloat(cs.fontSize);
      const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5) - 0.01) {
        const key = `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${n.textContent.trim().slice(0, 24)}"`;
        found.set(key, ratio.toFixed(2));
      }
    }
    return [...found].map(([k, v]) => `${k} ${v}:1`);
  });

for (const theme of ["dark", "light"])
  for (const path of pages)
    test(`${theme}: ${path} has no text below its contrast minimum`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((t) => {
        localStorage.setItem("theme", t);
      }, theme);
      await page.goto(path);
      if (path === "/")
        await expect(page.locator(".win__app")).toHaveAttribute(
          "data-ready",
          "",
        );
      expect(await lowContrast(page), "text below 4.5:1 (3:1 large)").toEqual(
        [],
      );
    });
