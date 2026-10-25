import { expect, test } from "@playwright/test";

// The homepage's boot sequence, with motion on. Screenshots and the other
// tests run with the finished page, so they can't see a line that stays
// hidden while it types (which happened once, from a CSS specificity change).

const opacity = (sel: string) =>
  `getComputedStyle(document.querySelectorAll(${JSON.stringify(sel)})[0]).opacity`;

test("whoami types one command at a time, each line visible as it types", async ({
  page,
}) => {
  await page.goto("/");
  const lines = page.locator(".who__session .term-cmd");

  // Shortly after load: the first command is on screen and typed, the rest
  // wait their turn. Read once, not with toHaveCSS: that retries, and would
  // pass when the boot ends and everything shows at once.
  await page.waitForTimeout(1000);
  expect(await page.evaluate(opacity(".who__session .term-cmd"))).toBe("1");
  await expect(lines.first().locator(".js-cmd")).toHaveText("whoami");
  await expect(lines.last()).toHaveCSS("opacity", "0");

  // Its output follows it on screen.
  await expect(page.locator(".who__session .js-out").first()).toHaveCSS(
    "opacity",
    "1",
  );

  // Done booting: every line and output is shown.
  await expect(page.locator(".who__session")).not.toHaveClass(/is-booting/, {
    timeout: 10_000,
  });
  for (const line of await lines.all())
    await expect(line).toHaveCSS("opacity", "1");
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shipped bars and writing lines wait until they scroll into view", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Below the fold, long after the load-time entrance would have finished:
    // still on its first frame.
    const lastBar = page.locator(".ship__bar--after .ship__fill").last();
    expect(await lastBar.evaluate((el) => getComputedStyle(el).transform)).toBe(
      "matrix(0, 0, 0, 1, 0, 0)",
    );
    await expect(page.locator(".posts li").first()).toHaveCSS("opacity", "0");

    // Scrolled to, it plays.
    await lastBar.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(lastBar).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    await page
      .locator(".posts")
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator(".posts li").last()).toHaveCSS("opacity", "1");
  });
});
