import { expect, type Page, test } from "@playwright/test";
import { projects } from "./home.ts";
import { fixWeather } from "./weather.ts";

// The home window's motion, with motion on. Screenshots and the other tests
// mostly look at the finished page, so they can't see a panel that stays dim
// or a figure that never draws (a hidden line happened once, from a CSS
// specificity change).

// What the page itself notes of the opening round, as it happens.
type Round = {
  order: string[];
  mid: {
    boot: boolean;
    writing: boolean;
    focus: (string | undefined)[];
    row: number;
  } | null;
};

const app = (page: Page) => page.locator(".win__app");
// The opening round is over and the scripts are in.
const settled = async (page: Page) => {
  await expect(app(page)).toHaveAttribute("data-ready", "");
  await expect(app(page)).not.toHaveClass(/is-boot/, { timeout: 8000 });
};

test.beforeEach(({ page }) => fixWeather(page));

test.describe("laptop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the window opens dimmed and fills panel by panel", async ({ page }) => {
    // The round's first stop is fastfetch, which holds the focus for about
    // half a second. That is the moment to look at the rest, so the look is
    // taken in the page as the panel fills: one taken from here would land
    // whenever the next retry fell, on that stop or the one after. The order
    // the panels fill in is kept the same way.
    await page.addInitScript(() => {
      const w = window as unknown as { round: Round };
      w.round = { order: [], mid: null };
      const one = (sel: string) => document.querySelector<HTMLElement>(sel)!;
      new MutationObserver((records) => {
        for (const r of records) {
          const panel = r.target as HTMLElement;
          const name = panel.dataset?.pn;
          if (
            !name ||
            !panel.classList.contains("is-on") ||
            /\bis-on\b/.test(r.oldValue ?? "")
          )
            continue;
          if (w.round.order.at(-1) !== name) w.round.order.push(name);
          if (name !== "who" || w.round.mid) continue;
          w.round.mid = {
            boot: one(".win__app").classList.contains("is-boot"),
            writing: one('[data-pn="writing"]').classList.contains("is-on"),
            focus: [
              ...document.querySelectorAll<HTMLElement>(".pn.is-focus"),
            ].map((p) => p.dataset.pn),
            // Shown from the first paint, only dimmed: never 0, not yet 1.
            row: Number(getComputedStyle(one(".wr__row")).opacity),
          };
        }
      }).observe(document, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true,
      });
    });
    await page.goto("/");
    const round = () =>
      page.evaluate(() => (window as unknown as { round: Round }).round);
    await expect(page.locator('[data-pn="who"]')).toHaveClass(/is-on/);
    const mid = (await round()).mid;
    expect(mid, "fastfetch filling was seen in the page").not.toBeNull();
    expect(mid!.boot, "still in the opening round").toBe(true);
    expect(mid!.writing, "writing has had its turn already").toBe(false);
    expect(mid!.focus, "the focus is on the panel being filled").toEqual([
      "who",
    ]);
    expect(mid!.row).toBeGreaterThan(0);
    expect(mid!.row).toBeLessThan(1);

    // Done: nothing is left dim, and the focus rests on writing alone.
    await settled(page);
    await expect
      .poll(() =>
        page
          .locator(".win [data-dim]")
          .evaluateAll((els) =>
            els
              .map((el) => getComputedStyle(el).opacity)
              .filter((o) => o !== "1"),
          ),
      )
      .toEqual([]);
    await expect(page.locator(".pn.is-focus")).toHaveCount(1);
    await expect(page.locator('[data-pn="writing"]')).toHaveClass(/is-focus/);
    // The open figure took its turn in the round and draws once it is seen.
    await page.locator(".pn--fig.is-open").scrollIntoViewIfNeeded();
    await expect(page.locator(".pn--fig.is-open .fg")).toHaveClass(/is-drawn/);

    // One panel at a time, down the left column, across the bottom and up to
    // writing. The figure's turn falls between the picker's and writing's;
    // it is left out here because it is the lower half's code that names
    // the figure for the round, and that loads on its own time.
    expect(
      (await round()).order.filter((name) => !name.startsWith("fig")),
    ).toEqual(["who", "skills", "wx", "pick", "writing"]);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("nothing dims and every figure is drawn", async ({ page }) => {
      // Every class change from the first byte on, so "never" means never: a
      // class set and taken off before the test could look is still caught.
      await page.addInitScript(() => {
        const w = window as unknown as { waited: string[] };
        w.waited = [];
        new MutationObserver((records) => {
          for (const r of records) {
            const now = (r.target as Element).getAttribute("class") ?? "";
            for (const cls of `${r.oldValue ?? ""} ${now}`.split(/\s+/))
              if (cls === "is-boot" || cls === "is-armed") w.waited.push(cls);
          }
        }).observe(document, {
          subtree: true,
          attributes: true,
          attributeFilter: ["class"],
          attributeOldValue: true,
        });
      });
      await page.goto("/");
      await expect(app(page)).toHaveAttribute("data-ready", "");

      // The weather line is whole as soon as its answer lands.
      const plot = page.locator("[data-wx-plot]");
      await expect(plot).toHaveClass(/is-drawn/);
      await expect(plot.locator(".plot__svg")).toHaveCSS(
        "clip-path",
        "inset(-8px -8px -8px 0px)",
      );
      await expect(page.locator("[data-wx-here]")).toHaveCSS("opacity", "1");

      // The lower half's script has run (it names the figure panels), and
      // every figure is drawn, the four not showing included.
      await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
        projects.length,
      );
      await expect(page.locator(".fg.is-drawn")).toHaveCount(projects.length);
      // Read once: nothing here is on its way to being shown.
      expect(
        await page
          .locator(".win [data-dim]")
          .evaluateAll((els) =>
            els
              .map((el) => getComputedStyle(el).opacity)
              .filter((o) => o !== "1"),
          ),
        "something is dim",
      ).toEqual([]);

      // Nothing moves on its own, so there is nothing to pause: asked of
      // each button itself, since all but one of the panels are not showing.
      const pauses = await page
        .locator("[data-pause]")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
      expect(pauses.length).toBeGreaterThan(0);
      expect(pauses.filter((display) => display !== "none")).toEqual([]);

      expect(
        await page.evaluate(
          () => (window as unknown as { waited: string[] }).waited,
        ),
        "is-boot or is-armed was set at some point",
      ).toEqual([]);
      expect(await app(page).getAttribute("class")).not.toMatch(
        /is-boot|is-armed/,
      );
    });
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("a figure waits until it scrolls into view, then plays once", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);

    // Far below the fold, long after a load-time entrance would have
    // finished: still blank. Read once: toHaveCSS retries.
    const last = page.locator(".pn--fig").last();
    const state = () =>
      last.evaluate((el) => ({
        drawn: !!el.querySelector(".fg.is-drawn"),
        opacity: getComputedStyle(el.querySelector(".rt__k")!).opacity,
      }));
    expect(await state()).toEqual({ drawn: false, opacity: "0" });

    // Scrolled to, it plays.
    await last.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(last.locator(".fg")).toHaveClass(/is-drawn/);
    await expect(last.locator(".rt__k").first()).toHaveCSS("opacity", "1");

    // And only once: gone from the screen and back, it is as it was left,
    // not blank and drawing again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);
    expect(await state()).toEqual({ drawn: true, opacity: "1" });
    await last.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await page.waitForTimeout(100);
    expect(await state()).toEqual({ drawn: true, opacity: "1" });
  });

  test("the lower half's code loads only when it is near", async ({ page }) => {
    // The dev server serves each module by its path; the built site's check
    // is in speed.spec.ts.
    const lower: string[] = [];
    page.on("request", (req) => {
      const file = /window\/(projects|radar)/.exec(req.url());
      if (file) lower.push(file[1]);
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await settled(page);
    expect(lower, "fetched with the first screen").toEqual([]);

    await page
      .locator('.pn--fig[data-f="flight-tracker"]')
      .evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    await expect.poll(() => [...lower].sort()).toEqual(["projects", "radar"]);
  });
});

// A figure plays once enough of it is on screen. On a window too short to
// ever hold that much, it plays once it fills half the window instead: a
// laptop's 1280 by 720 zoomed to 400% is 320 by 180, and the home lab's
// panel there is more than two screens tall. The shorter window is one where
// a panel is certain to be that tall, whatever the text wraps to.
for (const height of [180, 150])
  test(`320x${height}: a figure taller than the window still draws when it is scrolled to`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height });
    await page.goto("/");
    await settled(page);
    const figs = page.locator(".pn--fig");
    await expect(figs).toHaveCount(projects.length);
    // All still far below: none has played. Read once.
    expect(await page.locator(".fg.is-drawn").count()).toBe(0);

    let tall = 0;
    for (const fig of await figs.all()) {
      await fig.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      const id = await fig.getAttribute("data-f");
      await expect(fig.locator(".fg"), `${id} drew`).toHaveClass(/is-drawn/);
      await expect(fig, `${id} is running`).toHaveClass(/is-live/);
      // Too tall for the window to show the 45% a stacked panel waits for.
      if ((await fig.boundingBox())!.height * 0.45 > height) tall += 1;
    }
    if (height === 150) expect(tall).toBeGreaterThan(0);
  });
