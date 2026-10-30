import { expect, type Page, test } from "@playwright/test";

// Layout smoke tests. They assert things a reader would notice immediately:
// nothing scrolls sideways, and the reading column is wide enough to read.
// Posts are discovered from /blog, so a new post is covered without editing
// this file.

const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "wide", width: 1920, height: 1080 },
  { name: "qhd", width: 2560, height: 1440 },
];

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(1);
}

for (const vp of viewports) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of ["/", "/blog", "/cv"]) {
      test(`${path} has a heading and no sideways scroll`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("h1").first()).toBeVisible();
        await expectNoSidewaysScroll(page);
      });
    }

    test("every post has a readable column", async ({ page }) => {
      await page.goto("/blog");
      const hrefs = await page
        .locator('main a[href^="/blog/"]')
        .evaluateAll((as) => [
          ...new Set(as.map((a) => a.getAttribute("href")!)),
        ]);
      expect(hrefs.length).toBeGreaterThan(0);

      for (const href of hrefs) {
        await page.goto(href);
        await expect(page.locator("main h1")).toBeVisible();
        await expectNoSidewaysScroll(page);

        const prose = await page.locator(".prose").first().boundingBox();
        expect(prose, `${href} has no .prose`).not.toBeNull();
        // Phones: the column fills most of the screen. Larger: at least ~30rem,
        // so a line holds a sentence rather than three words.
        // Big monitors: the column scales up with the screen rather than
        // staying laptop-sized in a wide window.
        const min =
          vp.width < 700 ? vp.width * 0.8 : vp.width >= 2000 ? 740 : 480;
        expect(
          prose!.width,
          `${href} prose column width`,
        ).toBeGreaterThanOrEqual(min);

        // Every block in the post shares one left edge and one width, so the
        // header, body, figures, timeline and footer line up.
        const boxes = await page
          .locator(
            // Below 64rem the timeline body is inset for its spine, by design.
            vp.width >= 1024
              ? ".post__head, .prose > *, .tl__span, .post__foot"
              : ".post__head, .post > .prose > *, .tl__span, .post__foot",
          )
          .evaluateAll((els) =>
            els
              .map((el) => el.getBoundingClientRect())
              // hidden blocks (the side panel on narrow screens) have no box
              .filter((r) => r.width > 0)
              .map((r) => ({
                left: Math.round(r.left),
                right: Math.round(r.right),
              })),
          );
        const right = Math.max(...boxes.map((b) => b.right));
        for (const box of boxes) {
          expect(
            Math.abs(box.left - boxes[0].left),
            `${href} left edges`,
          ).toBeLessThanOrEqual(1);
          expect(
            box.right,
            `${href} block wider than the column`,
          ).toBeLessThanOrEqual(right);
        }
        expect(
          right - boxes[0].left,
          `${href} column width`,
        ).toBeLessThanOrEqual(
          (await page.locator(".post__head").boundingBox())!.width + 1,
        );
      }
    });
  });
}

// Dark unless the visitor chose light (the nav button, saved as "theme"), on
// any system setting. Guards against a page hardcoding one theme.
for (const theme of ["dark", "light"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme === "dark" ? "light" : "dark" });

    for (const path of ["/", "/blog", "/cv"]) {
      test(`${path} background is ${theme}`, async ({ page }) => {
        if (theme === "light")
          await page.addInitScript(() =>
            localStorage.setItem("theme", "light"),
          );
        await page.goto(path);
        const luminance = await page.evaluate(() => {
          const rgb = getComputedStyle(document.querySelector(".shell")!)
            .backgroundColor.match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number);
          return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
        });
        if (theme === "light") expect(luminance).toBeGreaterThan(0.6);
        else expect(luminance).toBeLessThan(0.15);
      });
    }
  });
}
