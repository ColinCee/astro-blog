import { test, expect } from "@playwright/test";

// Typography standards, enforced. The numbers are documented in DESIGN.md
// ("Typography standards"); change them there and here together.
const MIN_TEXT_PX = 11; // smallest label anywhere on the site
const BODY_PX = [16, 19]; // long-form body text, at every screen size
const LINE_HEIGHT = [1.5, 1.8]; // body line-height as a ratio
const CHARS_PER_LINE = [45, 90]; // body line length on laptop and larger

const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "qhd", width: 2560, height: 1440 },
  { name: "4k", width: 3840, height: 2160 },
];
const post = "/blog/i-sued-easyjet-and-won/";

for (const vp of viewports) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of ["/", "/blog", "/cv", post]) {
      test(`${path} has no text under ${MIN_TEXT_PX}px`, async ({ page }) => {
        await page.goto(path);
        const tooSmall = await page.evaluate((min) => {
          const found = new Map<string, number>();
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const el = n.parentElement;
            if (!el || !n.textContent?.trim()) continue;
            if (el.closest("astro-dev-toolbar, script, style, .sr-only")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            const px = parseFloat(cs.fontSize);
            if (px < min - 0.01) {
              const key = `${el.tagName.toLowerCase()}.${el.className}`;
              found.set(key, Math.round(px * 100) / 100);
            }
          }
          return [...found.entries()].map(([k, v]) => `${k} = ${v}px`);
        }, MIN_TEXT_PX);
        expect(tooSmall, "text below the minimum size").toEqual([]);
      });
    }

    test("post body text is a comfortable size and line length", async ({ page }) => {
      await page.goto(post);
      const m = await page.locator(".prose p").first().evaluate((p) => {
        const cs = getComputedStyle(p);
        const size = parseFloat(cs.fontSize);
        const ctx = document.createElement("canvas").getContext("2d")!;
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const text = p.textContent ?? "";
        const charWidth = ctx.measureText(text).width / text.length;
        return {
          size,
          lineHeight: parseFloat(cs.lineHeight) / size,
          charsPerLine: p.getBoundingClientRect().width / charWidth,
        };
      });
      expect(m.size).toBeGreaterThanOrEqual(BODY_PX[0]);
      expect(m.size).toBeLessThanOrEqual(BODY_PX[1]);
      expect(m.lineHeight).toBeGreaterThanOrEqual(LINE_HEIGHT[0]);
      expect(m.lineHeight).toBeLessThanOrEqual(LINE_HEIGHT[1]);
      if (vp.width >= 1024) {
        expect(m.charsPerLine).toBeGreaterThanOrEqual(CHARS_PER_LINE[0]);
        expect(m.charsPerLine).toBeLessThanOrEqual(CHARS_PER_LINE[1]);
      }
    });
  });
}
