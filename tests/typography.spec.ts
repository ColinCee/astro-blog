import { expect, test } from "@playwright/test";
import { styleLines } from "./style-scan";

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
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const el = n.parentElement;
            if (!el || !n.textContent?.trim()) continue;
            if (el.closest("astro-dev-toolbar, script, style, .sr-only"))
              continue;
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

    test("post body text is a comfortable size and line length", async ({
      page,
    }) => {
      await page.goto(post);
      const m = await page
        .locator(".prose p")
        .first()
        .evaluate(async (p) => {
          const cs = getComputedStyle(p);
          const size = parseFloat(cs.fontSize);
          // Measure the real font, not its fallback: load it first (fonts.ready
          // can resolve before the fetch starts). Only the first family: the
          // sized fallback is local Arial, which Linux lacks, and fails the load.
          const family = cs.fontFamily.split(",")[0];
          await document.fonts.load(
            `${cs.fontWeight} ${cs.fontSize} ${family}`,
          );
          // Characters on the first line as rendered, counted until one sits
          // below it. An estimate from average glyph width moved with the
          // wording of the paragraph, not the width of the column.
          const range = document.createRange();
          const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
          let firstTop: number | undefined;
          let chars = 0;
          lines: for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            for (let i = 0; i < n.textContent!.length; i++) {
              range.setStart(n, i);
              range.setEnd(n, i + 1);
              const r = range.getBoundingClientRect();
              if (!r.height) continue;
              firstTop ??= r.top;
              if (r.top > firstTop + size / 2) break lines;
              chars++;
            }
          }
          return {
            size,
            lineHeight: parseFloat(cs.lineHeight) / size,
            charsPerLine: chars,
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

// Every size is a --text-* role from src/styles/tokens.css, and every
// line-height and weight one of the few below (DESIGN.md, Type). Exceptions
// are marked as style-scan.ts says, with "type".
const SCAN_SKIP = new Set(["src/styles/tokens.css"]);
const LEADINGS = new Set(["1", "1.3", "1.6", "inherit"]);
const WEIGHTS = new Set(["200", "300", "400", "500", "600", "inherit"]);
const value = (text: string, prop: string) =>
  text
    .match(new RegExp(`(?:^|[;{"'\`])\\s*${prop}:\\s*([^;"}]+)`))?.[1]
    .replace("!important", "")
    .trim();

test("every size, line-height and weight is on the scale", () => {
  const found: string[] = [];
  for (const { at, text, styled } of styleLines("type", SCAN_SKIP)) {
    if (/\bfont-size="|\.fontSize\s*=[^=]|\.font\s*=[^=]/.test(text))
      found.push(`${at} a size set outside CSS`);
    if (!styled) continue;
    const size = value(text, "font-size");
    if (size && size !== "inherit" && !/^(calc\()?var\(--text-/.test(size))
      found.push(`${at} a size that is not a role: ${size}`);
    const leading = value(text, "line-height");
    if (leading && !LEADINGS.has(leading))
      found.push(`${at} a line-height off the scale: ${leading}`);
    const weight = value(text, "font-weight");
    if (weight && !WEIGHTS.has(weight))
      found.push(`${at} a weight off the scale: ${weight}`);
    const font = value(text, "font");
    if (font && font !== "inherit")
      found.push(`${at} a font shorthand: ${font}`);
    if (/font-variation-settings:[^;]*wght/.test(text))
      found.push(`${at} a weight set by its axis`);
  }
  expect(found, "type off the scale").toEqual([]);
});
