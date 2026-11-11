import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Why the arrow is drawn: DESIGN.md, "Stat arrow".
const MAX_OFF_EM = 0.04;
const arrowPosts = readdirSync("src/content/blog")
  .filter((f) =>
    /^stat: .*→/m.test(readFileSync(`src/content/blog/${f}`, "utf8")),
  )
  .map((f) => `/blog/${f.replace(/\.mdx?$/, "")}/`);

const views = [
  { name: "phone", width: 390, height: 844 },
  { name: "laptop", width: 1440, height: 900 },
];

for (const vp of views)
  for (const path of ["/", "/blog/", "/design/", ...arrowPosts]) {
    test(`${vp.name} ${path}: stat arrows sit on the middle of the digits`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(path);
      const arrows = page.locator(".stat-arrow");
      await expect(arrows.first()).toBeAttached();
      // Retried: the dev server can reload the page once on a first visit.
      let offs: number[] = [];
      await expect(async () => {
        offs = await arrows.evaluateAll(async (svgs) => {
          await document.fonts.ready;
          return Promise.all(
            svgs.map(async (svg) => {
              const cs = getComputedStyle(svg.parentElement as HTMLElement);
              const size = parseFloat(cs.fontSize);
              const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
              const ctx = document.createElement("canvas").getContext("2d");
              if (!ctx) throw new Error("no canvas");
              ctx.font = font;
              const ink = ctx.measureText("0123456789");
              const digitsMid =
                (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) /
                2;
              // A zero-size inline-block's bottom edge is the line's baseline.
              const probe = document.createElement("span");
              probe.style.cssText = "display:inline-block;width:0;height:0";
              svg.after(probe);
              const baseline = probe.getBoundingClientRect().bottom;
              probe.remove();
              const box = svg.getBoundingClientRect();
              const arrowMid = baseline - (box.top + box.bottom) / 2;
              return Math.abs(arrowMid - digitsMid) / size;
            }),
          );
        });
      }).toPass();
      for (const off of offs)
        expect(off, "arrow off the digits' middle, in em").toBeLessThan(
          MAX_OFF_EM,
        );
      const stats = await page
        .locator(".figs dd, .log__was, .wr__was")
        .allTextContents();
      expect(
        stats.filter((s) => s.includes("→")),
        "a typed → in a stat",
      ).toEqual([]);
    });
  }
