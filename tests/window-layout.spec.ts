import { expect, type Page, test } from "@playwright/test";
import { longestCity, projects, snapshotStacks } from "./home.ts";
import { fixWeather } from "./weather.ts";

// The home window holds still, and its text keeps inside its lines: what
// must not move when the open project changes or the home server answers,
// and the labels and counts that had run through a border at some width.
// All measured, at the widths where each once went wrong. What the panels
// show is in home-window.spec.ts.

// Motion off: every figure is drawn from the start, so what is measured is
// the page at rest.
test.use({ reducedMotion: "reduce" });
test.beforeEach(({ page }) => fixWeather(page));

// The home server's answer. The dev server has no Worker, so each test
// answers /homelab.json itself: with these numbers, or as a server that is
// not there. The stacks are the ones the page was built with, so the rows
// are drawn again the same, and the city is the longest Cloudflare has.
const stats = (minutesOld = 2) => ({
  at: Math.floor(Date.now() / 1000) - minutesOld * 60,
  allUp: true,
  tracking: 237,
  londonHour: 107,
  stacks: snapshotStacks,
  edge: longestCity,
});
const lab = (page: Page, live: boolean, minutesOld?: number) =>
  page.route("**/homelab.json", (route) =>
    live
      ? route.fulfill({ json: stats(minutesOld) })
      : route.fulfill({ status: 404, body: "" }),
  );

const fig = (page: Page, id: string) =>
  page.locator(`.pn--fig[data-f="${id}"]`);
// The lower half's script has run: it names the figure panels "fig" once the
// picker is working. It loads only once the window is near the screen.
const pickerReady = async (page: Page) => {
  await page
    .locator(".win")
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
    projects.length,
  );
};
// The numbers have landed, or their absence has been said.
const answered = (page: Page) =>
  expect(page.locator(".lab__live [data-stats-age]")).toHaveText(
    /^(live|last seen|offline)/,
  );

// Beside the picker one project is open at a time, in a place the five
// share. Opening another must change what is in that place and nothing
// around it: a list whose rows shift under the pointer picks the wrong
// project, and a window that changes height moves the page below it.
test.describe("beside the picker", () => {
  for (const width of [960, 1100, 1280, 1440])
    for (const live of [true, false])
      test(`${width}, home lab ${live ? "answering" : "missing"}: the list and the window keep their size whichever project is open`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await lab(page, live);
        await page.goto("/");
        await pickerReady(page);
        await answered(page);

        const sizes: Record<string, number>[] = [];
        for (const id of projects) {
          await page.locator(`[role="tab"][data-pick="${id}"]`).focus();
          await expect(page.locator(".pn--fig.is-open")).toHaveAttribute(
            "data-f",
            id,
          );
          sizes.push(
            await page.locator(".win").evaluate(async (win) => {
              await document.fonts.ready;
              const top = win.getBoundingClientRect().top;
              const box = (sel: string) =>
                win.querySelector(sel)!.getBoundingClientRect();
              const out: Record<string, number> = {
                "the window's height": win.getBoundingClientRect().height,
                "the readout's height": box(".rv").height,
                "the figure's height": box(".pn--fig.is-open").height,
              };
              win.querySelectorAll(".pk__row").forEach((row, i) => {
                out[`row ${i + 1}'s top`] =
                  row.getBoundingClientRect().top - top;
              });
              return out;
            }),
          );
        }
        // Each against the first project's, by name, so a failure says what
        // moved and for which.
        const moved: string[] = [];
        sizes.forEach((size, i) => {
          for (const [what, px] of Object.entries(size)) {
            const by = px - sizes[0][what];
            if (Math.abs(by) > 0.5)
              moved.push(`${projects[i]}: ${what} by ${by.toFixed(1)}px`);
          }
        });
        expect(Object.keys(sizes[0]).length).toBe(3 + projects.length);
        expect(moved).toEqual([]);
      });
});

// The home lab's rows are drawn again from the server's list when it lands,
// and the colincheung.dev figure's city is filled in: with the same stacks as
// the build's and the longest city there is, nothing in the window moves.
test.describe("when the stacks and the city land", () => {
  for (const width of [960, 1100, 1280, 1440])
    for (const id of ["home-lab", "colincheung.dev"])
      test(`${width}, ${id} open: nothing in the window moves`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        let answer = () => {};
        const asked = new Promise<void>((seen) =>
          page.route("**/homelab.json", (route) => {
            answer = () => void route.fulfill({ json: stats() });
            seen();
          }),
        );
        await page.goto("/");
        await pickerReady(page);
        await page.locator(`[role="tab"][data-pick="${id}"]`).focus();
        await expect(page.locator(".pn--fig.is-open")).toHaveAttribute(
          "data-f",
          id,
        );
        await asked;
        const places = () =>
          page.locator(".win").evaluate(async (win) => {
            await document.fonts.ready;
            const out: Record<string, number> = {};
            const put = (name: string, el: Element) => {
              const r = el.getBoundingClientRect();
              out[`${name}'s top`] = r.top;
              out[`${name}'s left`] = r.left;
              out[`${name}'s height`] = r.height;
              out[`${name}'s width`] = r.width;
            };
            put("the window", win);
            win
              .querySelectorAll(
                ".pn--fig.is-open :is(.lab__host__kv > div, .rt__stop)",
              )
              .forEach((el, i) => put(`part ${i + 1}`, el));
            return out;
          });
        const before = await places();
        answer();
        await expect(page.locator(".lab__live [data-stats-age]")).toHaveText(
          "live, 2 min ago",
        );
        await expect(page.locator("[data-edge]")).toHaveText(longestCity);
        const after = await places();
        const moved = Object.entries(after)
          .filter(([what, px]) => Math.abs(px - before[what]) > 0.5)
          .map(
            ([what, px]) => `${what} by ${(px - before[what]).toFixed(1)}px`,
          );
        expect(Object.keys(before).length).toBeGreaterThan(4 * 4);
        expect(moved).toEqual([]);
      });
});

// On a phone the flight tracker's panel says how old its counts are on a
// line of its own. That line is there before the answer is, or every panel
// under it would jump down when the answer came.
test.describe("when the home server answers late", () => {
  for (const width of [320, 390])
    for (const live of [true, false])
      test(`${width}: nothing under the flight tracker moves when ${live ? "the numbers land" : "it turns out to be offline"}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        // Held: asked for, and not answered until the page has been
        // measured.
        let answer = () => {};
        const asked = new Promise<void>((seen) =>
          page.route("**/homelab.json", (route) => {
            answer = () =>
              void (live
                ? route.fulfill({ json: stats() })
                : route.fulfill({ status: 404, body: "" }));
            seen();
          }),
        );
        await page.goto("/");
        const panel = fig(page, "flight-tracker");
        await panel.evaluate((el) =>
          el.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        // The lower half's code asks as the last thing it does on starting.
        await asked;

        const places = () =>
          page.evaluate(async () => {
            await document.fonts.ready;
            const out: Record<string, number> = {
              "the page's height": document.documentElement.scrollHeight,
            };
            const put = (name: string, el: Element) => {
              const r = el.getBoundingClientRect();
              out[`${name}'s top`] = r.top + window.scrollY;
              out[`${name}'s height`] = r.height;
            };
            const win = document.querySelector(".win")!;
            put("the window", win);
            for (const el of document.querySelectorAll<HTMLElement>(".pn--fig"))
              put(el.dataset.f!, el);
            // What follows the window on the page.
            let next = win.nextElementSibling;
            for (let i = 1; next; i++, next = next.nextElementSibling)
              put(`section ${i} after the window`, next);
            return out;
          });
        const before = await places();
        const age = panel.locator(".rd__note [data-stats-age]");
        await expect(age).toHaveText("");

        answer();
        await expect(age).toHaveText(live ? "live, 2 min ago" : "offline");
        const after = await places();
        const moved = Object.entries(after)
          .filter(([what, px]) => Math.abs(px - before[what]) > 0.5)
          .map(
            ([what, px]) => `${what} by ${(px - before[what]).toFixed(1)}px`,
          );
        expect(Object.keys(before).length).toBeGreaterThan(
          2 * projects.length + 3,
        );
        expect(moved).toEqual([]);
      });
});

// The same in the home lab's box, at every phone width and whatever the
// font's widths: the flight tracker's row keeps its shape from a dash to
// seven digits. The test above sees two widths in one font; a row whose
// shape turned on the number's width passed there in one browser and
// failed in the next.
test("on a phone the flight tracker's row keeps its shape for any count", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.route("**/homelab.json", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.goto("/");
  const row = fig(page, "home-lab")
    .locator(".lab__host__kv > div")
    .filter({ has: page.locator(".lab__now") });
  const changed: string[] = [];
  for (let width = 320; width <= 700; width += 6) {
    await page.setViewportSize({ width, height: 844 });
    const [dash, wide] = await row.evaluate(async (el) => {
      const n = el.querySelector("[data-stat='tracking']")!;
      const shape = () => {
        const dt = el.querySelector("dt")!.getBoundingClientRect();
        const dd = el.querySelector("dd")!.getBoundingClientRect();
        return `${el.getBoundingClientRect().height.toFixed(1)} ${dd.top >= dt.bottom ? "under" : "beside"}`;
      };
      await document.fonts.ready;
      n.textContent = "–";
      const a = shape();
      n.textContent = "9999999";
      const b = shape();
      n.textContent = "–";
      return [a, b];
    });
    if (dash !== wide) changed.push(`${width}: ${dash} -> ${wide}`);
  }
  expect(changed).toEqual([]);
});

// The home lab's figure: a cloud, a tunnel, and the box at home. The
// tunnel's name sits over it, and where the tunnel is shorter than its name
// (narrow pickers, and a band of tablet widths) the name has to give way
// without crossing a line: the box's border, the cloud's outline, the tunnel
// itself or the panel's edge. Measured from the words, not their element.
test.describe("the tunnel's name", () => {
  // Stacked under 60rem, where the figure needs no script; beside the
  // picker above it, where the project has to be opened.
  for (const width of [320, 390, 800, 1280, 1366, 1440])
    test(`${width}: it is clear of the box, the cloud, the tunnel and the panel's edge`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await lab(page, true);
      await page.goto("/");
      const panel = fig(page, "home-lab");
      if (width >= 960) {
        await pickerReady(page);
        await page.locator('[role="tab"][data-pick="home-lab"]').focus();
        await expect(panel).toHaveClass(/is-open/);
      }
      await expect(panel).toBeVisible();
      const clear = await panel.evaluate(async (el) => {
        await document.fonts.ready;
        // The words themselves, however they are wrapped.
        const words = document.createRange();
        words.selectNodeContents(
          document
            .createTreeWalker(
              el.querySelector(".lab__tun")!,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: (node) =>
                  node.textContent?.trim()
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP,
              },
            )
            .nextNode()!,
        );
        const text = words.getBoundingClientRect();
        // How far apart two boxes are: under 0 where they overlap.
        const apart = (sel: string) => {
          const b = el.querySelector(sel)!.getBoundingClientRect();
          return Math.max(
            b.left - text.right,
            text.left - b.right,
            b.top - text.bottom,
            text.top - b.bottom,
          );
        };
        // The cloud is a drawn outline, not a box: the nearest point on it.
        const path = el.querySelector<SVGPathElement>(".lab__cloud path")!;
        const onScreen = path.getScreenCTM()!;
        const length = path.getTotalLength();
        let cloud = Infinity;
        for (let i = 0; i <= 600; i++) {
          const p = path
            .getPointAtLength((length * i) / 600)
            .matrixTransform(onScreen);
          cloud = Math.min(
            cloud,
            Math.hypot(
              Math.max(text.left - p.x, 0, p.x - text.right),
              Math.max(text.top - p.y, 0, p.y - text.bottom),
            ),
          );
        }
        const edge = el.getBoundingClientRect();
        return {
          width: text.width,
          box: apart(".lab__host"),
          tunnel: apart(".lab__tun"),
          cloud,
          panel: Math.min(
            text.left - edge.left,
            edge.right - text.right,
            text.top - edge.top,
            edge.bottom - text.bottom,
          ),
        };
      });
      expect(clear.width, "the name is on the page").toBeGreaterThan(40);
      // Two pixels: it reads as apart, with one to spare for how a browser
      // rounds the text.
      for (const line of ["box", "tunnel", "cloud", "panel"] as const)
        expect(
          clear[line],
          `the name's distance from the ${line}`,
        ).toBeGreaterThanOrEqual(2);
    });
});

// Under the stacked scope, the two counts sit side by side while both fit.
// Just above 46rem they do not, and went out through the panel's border.
test.describe("the flight tracker's counts", () => {
  for (const width of [736, 744])
    test(`${width}: both counts are inside the panel`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await lab(page, true);
      await page.goto("/");
      const panel = fig(page, "flight-tracker");
      // The numbers are asked for once the projects are near.
      await panel.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await expect(panel.locator(".rd__cnt dd")).toHaveText(["237", "107"]);
      const fit = await panel.evaluate(async (el) => {
        await document.fonts.ready;
        const counts = el.querySelector(".rd__cnt")!;
        const frame = getComputedStyle(counts);
        const box = counts.getBoundingClientRect();
        // Where the words end, each label and each number.
        const ends = [...counts.querySelectorAll("dt, dd")].map((cell) => {
          const words = document.createRange();
          words.selectNodeContents(cell);
          return words.getBoundingClientRect().right;
        });
        return {
          cells: ends.length,
          scrolls: counts.scrollWidth - counts.clientWidth,
          // Past the padding's inner edge, in pixels: over 0 is out.
          past:
            Math.max(...ends) - (box.right - parseFloat(frame.paddingRight)),
        };
      });
      expect(fit.cells).toBe(4);
      expect(fit.scrolls, "the counts are wider than their box").toBe(0);
      expect(fit.past, "a count runs into the padding").toBeLessThanOrEqual(1);
    });
});

// On the narrowest phones the box's status is its longest, on the bottom
// border: all of it shows, not "all up · live, 2 m…".
test("320: the mini-PC's status is not cut short", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  // As old as it can be and still be live: the longest it gets.
  await lab(page, true, 20);
  await page.goto("/");
  const panel = fig(page, "home-lab");
  // The numbers are asked for once the projects are near.
  await panel.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  const live = panel.locator(".lab__live");
  await expect(live).toHaveText("all up · live, 20 min ago");
  await expect(live).toBeVisible();
  expect(
    await live.evaluate(async (el) => {
      await document.fonts.ready;
      return el.scrollWidth - el.clientWidth;
    }),
    "the status is wider than the room it has",
  ).toBe(0);
});
