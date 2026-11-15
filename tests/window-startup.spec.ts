import { expect, type Locator, type Page, test } from "@playwright/test";
import { projects } from "./home.ts";
import { fixWeather } from "./weather.ts";

// The home window when its scripts are late, missing or broken. An inline
// script sets the starting state before the first paint (the picker's
// layout, the panels dimmed, the figures blank) and the module takes it from
// there; these are the ways the module can fail to, and what the page must
// be left as each time: never dim, never a blank figure, never a picker with
// nothing behind it, and never a layout that flips twice.
//
// The waits (4, 8 and 20 seconds) are the page's own timers, so each test
// stops the page's clock and moves it on by hand: just short of a wait and
// just past it are then exact, however slow the machine. The dev server
// serves each module by its path; the routes below hold or fail those.

// The window's entry module (the script in Window.astro) and the lower
// half's code it fetches later.
const ENTRY = /Window\.astro\?[^/]*type=script/;
const LOWER = /window\/projects\.ts/;

const laptop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

// Stops the page's clock at the present, before the page is opened: its
// timers and frames then run only when the test moves the clock on.
const stopClock = async (page: Page) => {
  const at = Date.now();
  await page.clock.install({ time: at });
  await page.clock.pauseAt(at);
  return at;
};

const app = (page: Page) => page.locator(".win__app");
// How many of the window's parts are less than fully shown.
const dim = (page: Page) =>
  page
    .locator(".win [data-dim]")
    .evaluateAll(
      (els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length,
    );
// Which of a set of elements are displayed, by an attribute.
const shown = (set: Locator, attr: string) =>
  set.evaluateAll(
    (els, name) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent)
        .map((el) => el.getAttribute(name)),
    attr,
  );
const height = (page: Page) =>
  page.locator(".win").evaluate(async (win) => {
    await document.fonts.ready;
    return win.getBoundingClientRect().height;
  });
// Holds every request for a file until `arrive` is called; `asked` settles
// when the first one is made.
const hold = (page: Page, file: RegExp) => {
  const held: (() => void)[] = [];
  let open = false;
  let seen = () => {};
  const asked = new Promise<void>((done) => {
    seen = done;
  });
  const ready = page.route(file, (route) => {
    const go = () => void route.continue();
    if (open) go();
    else held.push(go);
    seen();
  });
  return {
    ready,
    asked,
    arrive() {
      open = true;
      for (const go of held.splice(0)) go();
    },
  };
};

// The picker's layout: the list, and one figure beside it.
const isPicker = async (page: Page) => {
  await expect(app(page)).toHaveAttribute("data-live", "");
  await expect(page.locator(".pn--pick")).toBeVisible();
  expect(await shown(page.locator(".pn--fig"), "data-f")).toHaveLength(1);
};
// What the page is without the lower half's code: no picker, the five
// projects one under another, each a panel of its own and each drawn.
const isDrawnStack = async (page: Page) => {
  await expect(app(page)).not.toHaveAttribute("data-live");
  await expect(app(page)).not.toHaveClass(/is-boot|is-armed/);
  await expect(page.locator(".pn--pick")).toBeHidden();
  const figs = page.locator(".pn--fig");
  expect(await shown(figs, "data-f")).toEqual(projects);
  expect(await shown(figs, "data-pn")).toEqual(
    projects.map((_, i) => `fig-${i}`),
  );
  await expect(page.locator('.pn--fig[role="tabpanel"]')).toHaveCount(0);
  await expect.poll(() => dim(page), "something is dim").toBe(0);
  // Drawn, each in its own way: the chart's lines whole and their ends
  // showing, the home lab's rows in, the route's stops in.
  await expect(page.locator(".ch__plot .plot__svg")).toHaveCSS(
    "clip-path",
    "inset(-8px -8px -8px 0px)",
  );
  for (const part of await page
    .locator(".ch__end, .lab__host__kv > div, .rt__k")
    .all())
    await expect(part).toHaveCSS("opacity", "1");
};

test.beforeEach(({ page }) => fixWeather(page));

test.describe("the entry module", () => {
  test.use({ viewport: laptop });

  // Late is not failed. At four seconds the page stops waiting dimmed, but
  // it keeps the layout it has, because the module is still expected: the
  // window once became the stack here and the picker again when the module
  // came, moving everything under it twice.
  test("later than four seconds: the window is shown as it is, and the picker works once it comes", async ({
    page,
  }) => {
    await stopClock(page);
    const entry = hold(page, ENTRY);
    await entry.ready;
    // The page's load waits for its module, so not for the load.
    await page.goto("/", { waitUntil: "commit" });
    await entry.asked;
    await expect(app(page)).toHaveClass(/is-boot/);
    await expect
      .poll(() => page.evaluate(() => document.readyState))
      .not.toBe("loading");

    // Waiting, and a tenth of a second short of four still waiting: dimmed,
    // in the picker's layout. Read once.
    await page.clock.fastForward(3900);
    expect(await app(page).getAttribute("class")).toMatch(/is-boot/);
    expect(await dim(page), "parts waiting dimmed").toBeGreaterThan(0);
    await isPicker(page);
    const before = await height(page);

    await page.clock.fastForward(200);
    await expect(app(page)).not.toHaveClass(/is-boot|is-armed/);
    await expect.poll(() => dim(page), "something is dim").toBe(0);
    await expect(app(page)).not.toHaveAttribute("data-ready");
    await isPicker(page);
    expect(
      Math.abs((await height(page)) - before),
      "the window's height changed at four seconds",
    ).toBeLessThanOrEqual(0.5);

    // It arrives: no opening round over a page already shown, and the
    // picker does what it looked able to.
    entry.arrive();
    await expect(app(page)).toHaveAttribute("data-ready", "");
    await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
      projects.length,
    );
    await expect(app(page)).not.toHaveClass(/is-boot|is-armed/);
    await isPicker(page);
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    expect(await dim(page)).toBe(0);

    // The scope runs while its project is open and rests when it is not,
    // as it does on a page whose module was on time. It draws by the frame,
    // so the clock runs again from here.
    await page.clock.resume();
    const open = async (id: string) => {
      await page.locator(`[role="tab"][data-pick="${id}"]`).click();
      await expect(page.locator(".pn--fig.is-open")).toHaveAttribute(
        "data-f",
        id,
      );
      await page.locator(".pn--fig.is-open").scrollIntoViewIfNeeded();
    };
    const frame = () =>
      page
        .locator("canvas[data-radar]")
        .evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await open("flight-tracker");
    const first = await frame();
    await expect.poll(frame, "the scope moves while open").not.toBe(first);
    await open(projects[0]);
    await expect(
      page.locator('.pn--fig[data-f="flight-tracker"]'),
    ).not.toHaveClass(/is-live/);
    // Closed: two looks a moment apart are the same picture. Read once each.
    await page.waitForTimeout(100);
    const closed = await frame();
    await page.waitForTimeout(400);
    expect(await frame(), "the scope went on drawing while closed").toBe(
      closed,
    );
  });

  // With no module to wait for, the page is the one without scripts, at
  // once: not after four seconds of sitting dimmed.
  test("failing to load: the window is whole at once, as it is without scripts", async ({
    page,
  }) => {
    const stopped = await stopClock(page);
    await page.route(ENTRY, (route) =>
      route.fulfill({ status: 404, body: "" }),
    );
    await page.goto("/");
    await isDrawnStack(page);
    // And no wait ran out to get there: the page's clock has not moved.
    expect(await page.evaluate(() => Date.now())).toBe(stopped);
    await expect(app(page)).not.toHaveAttribute("data-ready");
    await expect(page.locator(".wx__nojs")).toBeVisible();
    for (const ctl of await page.locator(".pn__ctl, .win .lbl--bl").all())
      await expect(ctl).toBeHidden();
  });

  // A module that never comes is given up on at twenty seconds. If it turns
  // up after that the top half still starts, but the projects stay as they
  // are: the page has moved once and does not move back.
  test("never arriving: the projects are the stack at twenty seconds, and stay one", async ({
    page,
  }) => {
    await stopClock(page);
    const entry = hold(page, ENTRY);
    await entry.ready;
    await page.goto("/", { waitUntil: "commit" });
    await entry.asked;
    await expect(app(page)).toHaveClass(/is-boot/);
    await page.clock.fastForward(19900);
    await expect(app(page)).not.toHaveClass(/is-boot|is-armed/);
    await isPicker(page);

    await page.clock.fastForward(200);
    await isDrawnStack(page);
    await expect(page.locator(".wx__nojs")).toBeVisible();

    entry.arrive();
    await expect(app(page)).toHaveAttribute("data-ready", "");
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    await expect(page.locator(".wx__nojs")).toBeHidden();
    await isDrawnStack(page);
  });

  // The module is here but cannot start (a browser missing something it
  // leans on). Whatever it had done by then, the page is left whole.
  test("throwing as it starts: nothing is left dim, blank or half working", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.IntersectionObserver = class {
        constructor() {
          throw new Error("no observers here");
        }
      } as unknown as typeof IntersectionObserver;
    });
    const thrown: string[] = [];
    page.on("pageerror", (err) => thrown.push(`${err.message} ${err.stack}`));
    const stopped = await stopClock(page);
    await page.goto("/");
    await isDrawnStack(page);
    expect(await page.evaluate(() => Date.now())).toBe(stopped);
    await expect(app(page)).not.toHaveAttribute("data-ready");
    await expect(page.locator(".wx__nojs")).toBeVisible();
    await expect(page.locator("[data-wx-note]")).toHaveText("");
    // The module did throw, and the error was passed on to the console,
    // not swallowed by the tidying up.
    expect(
      thrown.filter((err) => /no observers here.*window\/main\.ts/s.test(err)),
    ).toHaveLength(1);
  });
});

// The lower half's code is fetched when the projects are near. Until it is
// here the picker has nothing behind it and a figure scrolled to stays
// blank, so it is given eight seconds, and then the projects are shown
// without it.
test.describe("the lower half's code", () => {
  for (const size of [laptop, phone])
    test(`${size.width}: never arriving, the projects become the drawn stack after eight seconds, and stay one`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await stopClock(page);
      const lower = hold(page, LOWER);
      await lower.ready;
      await page.goto("/");
      await expect(app(page)).toHaveAttribute("data-ready", "");
      // On a phone it is not asked for until the projects are near.
      const first = page.locator(".pn--fig").first();
      await first.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await lower.asked;
      // Waiting: the figures armed and this one blank. Read once.
      expect(await app(page).getAttribute("class")).toMatch(/is-armed/);
      expect(await first.locator(".fg").getAttribute("class")).not.toMatch(
        /is-drawn/,
      );
      if (size === laptop) await isPicker(page);

      // A tenth of a second short of eight: the opening round is long
      // over, and the code not yet given up on. Read once.
      await page.clock.fastForward(7900);
      await expect(app(page)).not.toHaveClass(/is-boot/);
      expect(await app(page).getAttribute("data-live")).toBe("");
      expect(await app(page).getAttribute("class")).toMatch(/is-armed/);
      await page.clock.fastForward(200);
      await isDrawnStack(page);
      await expect(first).toBeVisible();

      // Code that turns up after that is not started: the page has settled.
      const landed = page.waitForResponse(LOWER);
      lower.arrive();
      await landed;
      await page.waitForLoadState("networkidle");
      await isDrawnStack(page);
    });
});
