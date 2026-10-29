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
    // still held, on its first frame. Read once: toHaveCSS retries.
    const lastBar = page.locator(".ship__bar--after .ship__fill").last();
    expect(
      await lastBar.evaluate((el) => ({
        held: !!el.closest(".is-held"),
        transform: getComputedStyle(el).transform,
      })),
    ).toEqual({ held: true, transform: "matrix(0, 0, 0, 1, 0, 0)" });
    expect(
      await page
        .locator(".posts li")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("0");

    // Scrolled to, it plays.
    await lastBar.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(lastBar).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    await page
      .locator(".posts")
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator(".posts li").last()).toHaveCSS("opacity", "1");
  });
});

test("desktop holds nothing back: the writing lines print on load", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.locator(".is-held")).toHaveCount(0);
  await expect(page.locator(".posts li").last()).toHaveCSS("opacity", "1", {
    timeout: 5000,
  });
});

test("phone: whoami waits to type until the terminal scrolls in", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // The hero sizes to the screen, so on real phones the terminal usually
  // starts on screen. Push it below the release line to test the case where
  // it doesn't (a long hero, a landscape phone).
  await page.route("/", async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace(
      "</head>",
      "<style>.term { margin-top: 120vh !important; }</style></head>",
    );
    await route.fulfill({ response: res, body: html });
  });
  await page.goto("/");
  const pane = page.locator(".pane--who");
  const first = page.locator(".who__session .js-cmd").first();

  await page.waitForTimeout(1500);
  expect(await first.textContent()).toBe("");

  await pane.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(first).toHaveText("whoami");
  await expect(pane).not.toHaveClass(/is-held/);
});
