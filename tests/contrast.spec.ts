import { readdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Every word on the site is readable on what it sits on: 4.5:1, or 3:1 for
// large text (WCAG 1.4.3), in both themes, measured by axe-core. The colour
// roles and their values are DESIGN.md's (Colours).
const posts = readdirSync("src/content/blog")
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => `/blog/${f.replace(/\.mdx?$/, "")}/`);
const pages = ["/", "/blog/", "/cv/", ...posts];

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
      const { violations, incomplete } = await new AxeBuilder({ page })
        .withRules(["color-contrast"])
        // A glyph that is decoration, not words (WCAG 1.4.3's own exception):
        // the worked-at slash.
        .exclude("[data-decor]")
        .exclude("astro-dev-toolbar")
        .analyze();
      const low = violations.flatMap((v) =>
        v.nodes.map((n) => `${n.target.join(" ")}: ${n.failureSummary}`),
      );
      expect(low, "text below 4.5:1 (3:1 large)").toEqual([]);
      // axe skips text over a background image. One empty layer on the page
      // wrapper once hid most of the site from it this way.
      const skipped = incomplete.flatMap((v) =>
        v.nodes
          .filter((n) => /background image/.test(n.any[0]?.message ?? ""))
          .map((n) => n.target.join(" ")),
      );
      expect(skipped, "text axe could not check").toEqual([]);
    });
