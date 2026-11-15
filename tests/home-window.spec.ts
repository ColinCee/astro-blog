import { readdirSync, readFileSync } from "node:fs";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { type Card, tones } from "../src/components/home/window/tones.ts";
import { hide, projects } from "./home.ts";
import { fixWeather, weather } from "./weather.ts";

// The home page's window (src/components/home/Window.astro): what its panels
// show, where their content comes from, and how the focus, the keys and the
// project picker behave. Its opening round and what loads when are in
// motion.spec.ts; the home server's numbers are in homelab.spec.ts.

// What the window should be showing, read from the same files it is built
// from: a post, card or project (home.ts) added there needs no change here.
const slugs = readdirSync("src/content/blog")
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => f.replace(/\.mdx?$/, ""));
const cards: Card[] = JSON.parse(
  readFileSync("src/data/anki-cards.json", "utf8"),
);
const laptop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

// The scripts are in and the opening round is over: until then the pointer
// does not move the focus.
const ready = async (page: Page) => {
  const app = page.locator(".win__app");
  await expect(app).toHaveAttribute("data-ready", "");
  await expect(app).not.toHaveClass(/is-boot/, { timeout: 8000 });
};
// The lower half's script loads after the page; it names the figure panels
// "fig" once the picker is working. A key or a click before that does nothing.
const pickerReady = async (page: Page) => {
  await ready(page);
  await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
    projects.length,
  );
};
const tab = (page: Page, id: string) =>
  page.locator(`[role="tab"][data-pick="${id}"]`);
const openFig = (page: Page) => page.locator(".pn--fig.is-open");
const open = async (page: Page, id: string) => {
  await tab(page, id).click();
  await expect(openFig(page)).toHaveAttribute("data-f", id);
  await openFig(page).scrollIntoViewIfNeeded();
  return openFig(page);
};
// The panels showing the focus, by name. Beside the picker the five figures
// share one name and one place, so only the open one is counted.
const focused = (page: Page) =>
  page
    .locator(".win .pn.is-focus")
    .evaluateAll((els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent)
        .map((el) => (el as HTMLElement).dataset.pn),
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
// A row's result as it is shown: without the words only read aloud.
const result = (row: Locator) =>
  row.locator(".wr__stat").evaluate((cell) =>
    [...cell.children]
      .filter((el) => !el.classList.contains("sr-only"))
      .map((el) => el.textContent)
      .join(""),
  );

test.beforeEach(({ page }) => fixWeather(page));

// AGENTS.md: everything about a post lives in its frontmatter, and a new post
// must show up everywhere with no other file changed. So the window is held
// to the collection's own files and to the blog index, not to a list here.
test("every post in the collection is a row, in the blog index's order", async ({
  page,
}) => {
  await page.goto("/blog");
  // Retried: the dev server can reload the page once on a first visit.
  let index: (string | null)[] = [];
  await expect(async () => {
    index = await page.$$eval(".log__link", (as) =>
      as.map((a) => a.getAttribute("href")),
    );
    expect(index.length).toBe(slugs.length);
  }).toPass();

  await page.setViewportSize(laptop);
  await page.goto("/");
  const rows = page.locator(".wr [data-post]");
  await expect(rows).toHaveCount(slugs.length);
  expect(
    await rows.evaluateAll((as) => as.map((a) => a.getAttribute("href"))),
  ).toEqual(index);
  expect(
    (
      await rows.evaluateAll((as) => as.map((a) => a.getAttribute("data-slug")))
    ).sort(),
  ).toEqual([...slugs].sort());

  // The same count wherever the window says it.
  const all = page.locator(".pn--writing a.lbl--tr");
  await expect(all).toHaveText(`all ${slugs.length} posts`);
  await expect(all).toHaveAttribute("href", "/blog/");
  await expect(
    page
      .locator(".ff__kv div", { has: page.locator("dt", { hasText: "posts" }) })
      .locator("dd"),
  ).toHaveText(new RegExp(`^\\s*${slugs.length}\\b`));
  await expect(page.locator("[data-wr-pos]")).toHaveText(
    `1 of ${slugs.length}`,
  );
  await expect(page.locator(".rt__v", { hasText: "posts" })).toHaveText(
    new RegExp(`^${slugs.length}\\s*posts$`),
  );
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: laptop });

  // The window is whole in the HTML: nothing waits dimmed or blank for a
  // script that is not coming, and nothing offers a control that needs one.
  test("the window is whole and at rest", async ({ page }) => {
    await page.goto("/");
    const rows = page.locator(".wr [data-post]");
    await expect(rows).toHaveCount(slugs.length);
    for (const row of await rows.all()) await expect(row).toBeVisible();
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
    await expect(rows.first()).toHaveCSS("opacity", "1");

    // The readout is the newest post's, as written at build.
    await expect(page.locator("[data-pv-slug]")).toHaveText(
      (await rows.first().getAttribute("data-slug"))!,
    );
    expect((await page.locator("[data-pv-stat]").textContent())?.trim()).toBe(
      await result(rows.first()),
    );

    // The projects are a stack: all five, no picker, no empty canvas.
    const figs = page.locator(".pn--fig");
    await expect(figs).toHaveCount(projects.length);
    for (const fig of await figs.all()) await expect(fig).toBeVisible();
    expect(await shown(figs, "data-f")).toEqual(projects);
    await expect(page.locator(".pn--pick")).toBeHidden();
    await expect(page.locator("[data-radar]")).toBeHidden();
    await expect(page.locator(".rd__cnt")).toBeVisible();

    // Every figure is drawn: the chart's lines whole, its end dots showing.
    await expect(page.locator(".ch__plot .plot__svg")).toHaveCSS(
      "clip-path",
      "inset(-8px -8px -8px 0px)",
    );
    for (const end of await page.locator(".ch__end").all())
      await expect(end).toHaveCSS("opacity", "1");
    await expect(page.locator(".rt__k").first()).toHaveCSS("opacity", "1");

    // Nothing that needs the script is offered: no pause, no next card, no
    // key hints.
    for (const ctl of await page.locator(".pn__ctl, .win .lbl--bl").all())
      await expect(ctl).toBeHidden();

    // The one panel the script fills says why it is dashes, where "live"
    // would have been.
    const why = page.locator(".pn--wx .wx__nojs");
    await expect(why).toBeVisible();
    await expect(why).toHaveText("needs javascript");
    await expect(page.locator("[data-wx-note]")).toHaveText("");
    await expect(page.locator("[data-wx-temp]")).toHaveText("–");
  });
});

// Colin's last note on the design: "The fast fetch icon used to be the same
// size as the rest of the content though. So it doesn't look like the icon's
// bigger than the 4 rows." The favicon is as tall as the rows beside it, and
// the panel ends where they end, at every width the panel has a different
// shape (it loses a row, then a column, as it narrows).
test.describe("fastfetch", () => {
  test.use({ reducedMotion: "reduce" });

  // The favicon against its rows, and what is left between the rows and the
  // panel's padding.
  const fits = async (page: Page) => {
    const m = await page.locator(".pn--who").evaluate(async (panel) => {
      await document.fonts.ready;
      const mark = panel.querySelector(".ff__mark")!;
      const kv = panel.querySelector(".ff__kv")!;
      const edge = getComputedStyle(mark);
      const icon = mark.getBoundingClientRect();
      const rows = kv.getBoundingClientRect();
      const frame = getComputedStyle(panel);
      const inner =
        panel.getBoundingClientRect().bottom -
        parseFloat(frame.borderBottomWidth) -
        parseFloat(frame.paddingBottom);
      return {
        icon:
          icon.height +
          parseFloat(edge.marginTop) +
          parseFloat(edge.marginBottom),
        rows: rows.height,
        beside: icon.right <= rows.left && icon.width > 0,
        under: inner - Math.max(rows.bottom, icon.bottom),
        shownRows: [...kv.children].filter(
          (row) => (row as HTMLElement).offsetParent,
        ).length,
      };
    });
    expect(m.beside, "the favicon sits beside the rows").toBe(true);
    expect(m.shownRows).toBeGreaterThanOrEqual(3);
    expect(
      Math.abs(m.icon - m.rows),
      `favicon ${m.icon}px against rows ${m.rows}px`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(m.under),
      "space between the rows and the panel's padding",
    ).toBeLessThanOrEqual(1);
  };

  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920])
    test(`${width}: the favicon is as tall as its rows, with nothing under them`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await ready(page);
      await fits(page);
    });

  // From 46rem to 80rem the Glasgow panel shares fastfetch's row, and a row
  // is as tall as its tallest panel. The sky with the most to say is
  // "freezing drizzle", which takes two lines there: it must not be what
  // sets the height.
  for (const width of [736, 768, 820])
    test(`${width}: the longest sky leaves nothing under the rows either`, async ({
      page,
    }) => {
      await page.route("https://api.open-meteo.com/**", (route) =>
        route.fulfill({
          json: {
            ...weather,
            current: { ...weather.current, weather_code: 56 },
          },
        }),
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await ready(page);
      await expect(page.locator("[data-wx-text]")).toHaveText(
        "freezing drizzle",
      );
      await fits(page);
    });
});

// What a reader would see at once: the page scrolling sideways, or one panel
// lying over another. layout.spec.ts covers the widths every page shares;
// these are the window's own steps, either side of each breakpoint.
test.describe("layout", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [320, 390, 735, 768, 959, 1024, 1279, 1440, 1920])
    test(`${width}: no sideways scroll, and no panel overlaps another`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await ready(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        "page scrolls horizontally",
      ).toBeLessThanOrEqual(1);
      const clash = await page.locator(".win").evaluate((win) => {
        const frame = win.getBoundingClientRect();
        const boxes = [...win.querySelectorAll<HTMLElement>(".pn")]
          .filter((p) => p.offsetParent)
          .map((p) => ({ name: p.dataset.pn, r: p.getBoundingClientRect() }));
        const found: string[] = [];
        for (const [i, a] of boxes.entries()) {
          if (a.r.left < frame.left - 0.5 || a.r.right > frame.right + 0.5)
            found.push(`${a.name} leaves the window`);
          for (const b of boxes.slice(i + 1))
            if (
              a.r.left < b.r.right - 0.5 &&
              b.r.left < a.r.right - 0.5 &&
              a.r.top < b.r.bottom - 0.5 &&
              b.r.top < a.r.bottom - 0.5
            )
              found.push(`${a.name} over ${b.name}`);
        }
        return { found, count: boxes.length };
      });
      expect(clash.found).toEqual([]);
      // Six panels with the picker (60rem and wider), nine stacked.
      expect(clash.count).toBe(width >= 960 ? 6 : 4 + projects.length);
    });
});

test.describe("laptop", () => {
  test.use({ viewport: laptop });

  // The window has one accent, its focus. Two purple panels at once, or none,
  // is the regression.
  test("one panel has the focus: the one under the pointer, else writing", async ({
    page,
  }) => {
    await page.goto("/");
    await pickerReady(page);
    expect(await focused(page)).toEqual(["writing"]);
    for (const name of ["skills", "who", "wx", "writing", "pick", "fig"]) {
      const panel = page.locator(`.pn[data-pn="${name}"]:visible`);
      await panel.scrollIntoViewIfNeeded();
      // The title's corner: every panel has one, and nothing there acts on
      // the pointer.
      await panel.hover({ position: { x: 4, y: 12 } });
      await expect.poll(() => focused(page)).toEqual([name]);
    }
    // Off the window, it goes back to rest.
    await page.locator(".win__bar").hover();
    await expect.poll(() => focused(page)).toEqual(["writing"]);

    // The keyboard takes it too, and it rests where the keyboard is.
    await tab(page, projects[0]).focus();
    await expect.poll(() => focused(page)).toEqual(["pick"]);
    await page.locator('.pn[data-pn="skills"]').hover();
    await expect.poll(() => focused(page)).toEqual(["skills"]);
    await page.locator(".win__bar").hover();
    await expect.poll(() => focused(page)).toEqual(["pick"]);
  });

  test("hovering a post selects it, and the readout restates it", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const rows = page.locator(".wr [data-post]");
    const row = rows.nth(2);
    await row.hover();
    await expect(row).toHaveClass(/is-sel/);
    await expect(page.locator(".wr .is-sel")).toHaveCount(1);
    await expect(page.locator("[data-pv-slug]")).toHaveText(
      (await row.getAttribute("data-slug"))!,
    );
    await expect(page.locator("[data-wr-pos]")).toHaveText(
      `3 of ${slugs.length}`,
    );
    await expect(page.locator("[data-pv-pos]")).toHaveText(
      `3 of ${slugs.length}`,
    );
    expect(await page.locator("[data-pv-stat]").textContent()).toBe(
      await result(row),
    );
    await expect(page.locator("[data-pv-meta]")).toHaveText(
      (await row.getAttribute("data-meta"))!,
    );
    // The label's arrow, if it has one, is drawn; its words are the row's.
    const label = (await row.getAttribute("data-label"))!;
    expect(
      (await page.locator("[data-pv-label]").textContent())?.replace(/\s/g, ""),
    ).toBe(label.replace(/[\s→]/g, ""));
    await expect(page.locator("[data-pv-label] .stat-arrow")).toHaveCount(
      label.split("→").length - 1,
    );

    // Enter with nothing focused opens the selected post.
    const href = await row.getAttribute("href");
    await page.keyboard.press("Enter");
    await page.waitForURL(`**${href}`);
  });

  test("j and k move through the posts, only while the window is in view", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const rows = page.locator(".wr [data-post]");
    const state = () =>
      page.evaluate(() => ({
        sel: [...document.querySelectorAll(".wr [data-post]")].findIndex((r) =>
          r.classList.contains("is-sel"),
        ),
        at: document.activeElement?.getAttribute("data-slug") ?? null,
      }));

    // Scrolled to the footer, the keys are the page's. Read once after a
    // wait: a retry could not tell "nothing happened" from "not yet".
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    // The window's foot may still show there; the list itself has gone.
    await expect(page.locator(".pn--writing")).not.toBeInViewport({
      ratio: 0.25,
    });
    await page.keyboard.press("j");
    await page.keyboard.press("j");
    await page.waitForTimeout(250);
    expect(await state()).toEqual({ sel: 0, at: null });

    // Back at the window, they move the selection and the real focus.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.keyboard.press("j");
    const second = await rows.nth(1).getAttribute("data-slug");
    await expect.poll(state).toEqual({ sel: 1, at: second });
    await expect(page.locator("[data-pv-slug]")).toHaveText(second!);
    expect(await focused(page)).toEqual(["writing"]);
    await page.keyboard.press("k");
    await expect
      .poll(state)
      .toEqual({ sel: 0, at: await rows.first().getAttribute("data-slug") });
    // Past either end it stays put.
    await page.keyboard.press("k");
    await page.waitForTimeout(150);
    expect((await state()).sel).toBe(0);

    await page.keyboard.press("j");
    await expect.poll(state).toEqual({ sel: 1, at: second });
    const href = await rows.nth(1).getAttribute("href");
    await page.keyboard.press("Enter");
    await page.waitForURL(`**${href}`);
  });

  // They are the window's keys, not the page's: with the keyboard on the
  // nav, the theme button, a link in the hero or the footer, j and k leave
  // the focus and the selection where they are.
  test("j and k do nothing while the keyboard is on a control outside the window", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const rows = page.locator(".wr [data-post]");
    const sel = () =>
      rows.evaluateAll((list) =>
        list.findIndex((r) => r.classList.contains("is-sel")),
      );
    // The page's own: the dev server adds a toolbar that the site does not
    // have.
    const outside = await page
      .locator("nav, main, footer")
      .locator(":is(a[href], button):not(.win *):visible")
      .all();
    // The nav's links and its theme button at the least.
    expect(outside.length).toBeGreaterThanOrEqual(
      (await page.locator(".nav__link, .nav__theme").count()) + 1,
    );
    const moved: string[] = [];
    for (const ctl of outside) {
      await ctl.focus();
      // Twice, and no k: a j that did move the selection must not be undone.
      await page.keyboard.press("j");
      await page.keyboard.press("j");
      const still = await ctl.evaluate((el) => el === document.activeElement);
      if (!still || (await sel()) !== 0)
        moved.push((await ctl.textContent())?.trim() || "(unnamed)");
    }
    expect(moved, "controls that j took the keyboard from").toEqual([]);

    // With the keyboard nowhere and the list on screen the same key does
    // act, so it was the control that held it back above. Shift+enter is
    // not enter: it opens nothing. Read once after a wait.
    await page.evaluate(() => {
      (document.activeElement as HTMLElement).blur();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.keyboard.press("Shift+Enter");
    await page.waitForTimeout(250);
    expect(new URL(page.url()).pathname).toBe("/");
    await page.keyboard.press("j");
    await expect.poll(sel).toBe(1);
  });

  test("the arrow keys open projects, only while the picker has the keyboard", async ({
    page,
  }) => {
    await page.goto("/");
    await pickerReady(page);
    const figs = page.locator(".pn--fig");
    const at = async (i: number) => {
      await expect(openFig(page)).toHaveAttribute("data-f", projects[i]);
      // One figure at a time, and everything that names it agrees.
      expect(await shown(figs, "data-f")).toEqual([projects[i]]);
      expect(
        await page
          .locator('[role="tab"][aria-selected="true"]')
          .evaluateAll((els) => els.map((el) => el.getAttribute("data-pick"))),
      ).toEqual([projects[i]]);
      await expect(tab(page, projects[i])).toBeFocused();
      await expect(page.locator("[data-pk-pos]")).toHaveText(
        `${i + 1} of ${projects.length}`,
      );
      expect(await shown(page.locator(".rv [data-rv]"), "data-rv")).toEqual([
        projects[i],
      ]);
      await expect(openFig(page)).toHaveAttribute(
        "aria-label",
        new RegExp(`^${projects[i]}: `),
      );
    };

    // The key hints in the border are hidden from a screen reader; the list
    // says the same in words of its own.
    await expect(page.getByRole("tablist")).toHaveAccessibleDescription(
      /arrow keys.+enter/i,
    );

    // With the keyboard somewhere else, an arrow key is the page's.
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(250);
    expect(await shown(figs, "data-f")).toEqual([projects[0]]);

    await tab(page, projects[0]).focus();
    await at(0);
    await page.keyboard.press("ArrowDown");
    await at(1);
    await page.keyboard.press("ArrowDown");
    await at(2);
    await page.keyboard.press("ArrowUp");
    await at(1);
    await page.keyboard.press("End");
    await at(projects.length - 1);
    await page.keyboard.press("ArrowDown");
    await at(projects.length - 1);
    await page.keyboard.press("Home");
    await at(0);

    // The keyboard gone again, the open project stays as it is.
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(250);
    expect(await shown(figs, "data-f")).toEqual([projects[0]]);

    // A mouse opens a project by moving over its row.
    await tab(page, projects[2]).hover();
    await expect(openFig(page)).toHaveAttribute("data-f", projects[2]);
    expect(await shown(figs, "data-f")).toEqual([projects[2]]);
  });

  // Picking a project marks what it is tied to elsewhere in the window. The
  // ties are data (src/data/projects.json: `posts`, `runsOn`), and only the
  // plainly true ones are there. A tie for home-lab or anki-chinese to a
  // post is Colin's to add; this test then changes with it.
  test("the open project marks its posts and the project it runs on", async ({
    page,
  }) => {
    await page.goto("/");
    await pickerReady(page);
    const marks = async () => ({
      posts: (
        await page
          .locator(".wr__row.is-rel")
          .evaluateAll((els) => els.map((el) => el.getAttribute("data-slug")))
      ).sort(),
      projects: await page
        .locator(".pk__row.is-rel")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-pick"))),
    });
    const all = [...slugs].sort();
    const tied: Record<string, Awaited<ReturnType<typeof marks>>> = {
      dissertation: {
        posts: all.filter((s) => s.startsWith("dissertation-revival-")),
        projects: [],
      },
      "flight-tracker": { posts: [], projects: ["home-lab"] },
      "home-lab": { posts: [], projects: ["flight-tracker"] },
      "anki-chinese": { posts: [], projects: [] },
      "colincheung.dev": { posts: all, projects: [] },
    };
    expect(Object.keys(tied).sort()).toEqual([...projects].sort());
    expect(tied.dissertation.posts.length).toBeGreaterThan(0);

    // Nothing is marked while the focus is on writing.
    expect(await marks()).toEqual({ posts: [], projects: [] });
    for (const id of projects) {
      await tab(page, id).focus();
      await expect(openFig(page)).toHaveAttribute("data-f", id);
      await expect.poll(marks, id).toEqual(tied[id]);
    }
    // A mark is shown, not only set.
    await tab(page, "dissertation").focus();
    const mark = page.locator(".wr__row.is-rel").first();
    await expect
      .poll(() =>
        mark.evaluate((el) => getComputedStyle(el, "::before").opacity),
      )
      .toBe("1");

    // The marks belong to the projects' focus: on writing they go, and come
    // back when the pointer leaves, since the keyboard is still in the picker.
    await page.locator(".pn--writing").hover({ position: { x: 4, y: 12 } });
    await expect.poll(marks).toEqual({ posts: [], projects: [] });
    await page.locator(".win__bar").hover();
    await expect.poll(marks).toEqual(tied.dissertation);
  });

  // DESIGN.md: anything drawn is true, or says that it is not. The radar
  // says "simulated"; the dissertation's curves are drawn by hand, and its
  // caption (the panel's title beside the picker, and its name read aloud)
  // says so, as does the chart's axis label in the stack.
  test("the dissertation's figure says it is sketched", async ({ page }) => {
    await page.goto("/");
    await pickerReady(page);
    const fig = await open(page, "dissertation");
    await expect(fig).toHaveAttribute("aria-label", /\bsketched\b/);
    const caption = fig.locator(".pn__cap");
    await expect(caption).toBeVisible();
    await expect(caption).toHaveText(/\bsketched\b/);
    // Whole, not cut to an ellipsis before the word.
    expect(
      await fig
        .locator(".pn__t")
        .evaluate((title) => title.scrollWidth - title.clientWidth),
    ).toBeLessThanOrEqual(0);
    // The title has the word there, so the axis label leaves it out.
    await expect(fig.locator(".ch__sk")).toBeHidden();
    // Stacked, the title is the project's name: the axis label says it.
    await page.setViewportSize({ width: 390, height: 844 });
    const axis = page.locator('[data-f="dissertation"] .ch__y');
    await expect(axis).toBeVisible();
    await expect(axis).toHaveText("reward, sketched");
    await expect(axis.locator(".ch__sk")).toBeVisible();
  });

  test("next card shows the deck's next card and its two tones", async ({
    page,
  }) => {
    await page.goto("/");
    await pickerReady(page);
    const fig = await open(page, "anki-chinese");
    const said = () =>
      fig.locator("[data-anki]").evaluate((el) => {
        const text = (sel: string) => el.querySelector(sel)?.textContent ?? "";
        const voice = (key: string) => ({
          say: text(`[data-tone="${key}"] [data-tone-say]`),
          n: text(`[data-tone="${key}"] [data-tone-n]`),
          points:
            el
              .querySelector(`[data-tone="${key}"] polyline`)
              ?.getAttribute("points") ?? "",
        });
        return {
          hanzi: text("[data-anki-hanzi]"),
          meaning: text("[data-anki-mean]"),
          mandarin: voice("mandarin"),
          cantonese: voice("cantonese"),
        };
      });
    const want = (card: Card) => {
      const t = tones(card);
      return {
        hanzi: card.hanzi,
        meaning: card.meaning,
        mandarin: {
          say: card.pinyin,
          n: String(t.mandarin.n || "–"),
          points: t.mandarin.points,
        },
        cantonese: {
          say: card.jyutping,
          n: String(t.cantonese.n || "–"),
          points: t.cantonese.points,
        },
      };
    };
    const count = page.locator('[data-rv="anki-chinese"] .rv__v');
    // The first card is in the page as built.
    expect(await said()).toEqual(want(cards[0]));
    await expect(count).toHaveText(`1of ${cards.length}`);

    const next = fig.locator("[data-anki-next]");
    await expect(next).toHaveText("next card");
    await next.click();
    await expect.poll(said).toEqual(want(cards[1]));
    await expect(count).toHaveText(`2of ${cards.length}`);
    // Its lines are drawn again, not left blank.
    await expect(fig.locator(".fg")).toHaveClass(/is-drawn/);

    // Round the deck and back to the first.
    for (let i = 2; i <= cards.length; i++) await next.click();
    await expect.poll(said).toEqual(want(cards[0]));
    await expect(count).toHaveText(`1of ${cards.length}`);
  });

  test("the weather panel shows the reading, the day's line and now", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const hours = weather.hourly.temperature_2m;
    await expect(page.locator("[data-wx-temp]")).toHaveText("10");
    await expect(page.locator("[data-wx-text]")).toHaveText("overcast");
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    await expect(page.locator(".wx__nojs")).toBeHidden();
    await expect(page.locator("[data-wx-hi]")).toHaveText(
      `${Math.max(...hours)}°`,
    );
    await expect(page.locator("[data-wx-lo]")).toHaveText(
      `${Math.min(...hours)}°`,
    );
    // One point an hour, and the line is on screen, not waiting clipped.
    const d = await page.locator("[data-wx-line]").getAttribute("d");
    expect(d?.split("L").length).toBe(hours.length);
    await expect(page.locator("[data-wx-plot]")).toHaveClass(/is-drawn/);
    await expect(page.locator("[data-wx-plot] .plot__svg")).toHaveCSS(
      "clip-path",
      "inset(-8px -8px -8px 0px)",
    );
    // "now" is at 13:00, the fixture's hour, 13 of the 23 steps across.
    const here = page.locator("[data-wx-here]");
    await expect(here).toBeVisible();
    await expect(here).toHaveText("now");
    await expect(here).toHaveCSS("opacity", "1");
    expect(
      await here.evaluate((el) => parseFloat((el as HTMLElement).style.left)),
    ).toBeCloseTo((13 / 23) * 100, 1);

    // The pointer reads any hour, in the border where "live" was.
    const plot = page.locator("[data-wx-plot]");
    const box = (await plot.boundingBox())!;
    await plot.hover({
      position: { x: (box.width * 6) / 23, y: box.height / 2 },
    });
    await expect(page.locator("[data-wx-note]")).toHaveText(
      `06:00 · ${hours[6]}°`,
    );
    await expect(page.locator("[data-wx-cross]")).toBeVisible();
    await expect(page.locator("[data-wx-dot]")).toBeVisible();
    await page.locator(".win__bar").hover();
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    await expect(page.locator("[data-wx-cross]")).toBeHidden();
    await expect(page.locator("[data-wx-dot]")).toBeHidden();
  });

  // A reading is real or it is a dash: never a stand-in number.
  test("with no weather, the panel says offline and keeps its dashes", async ({
    page,
  }) => {
    await page.route("https://api.open-meteo.com/**", (r) => r.abort());
    await page.goto("/");
    await ready(page);
    await expect(page.locator("[data-wx-note]")).toHaveText("offline");
    // Offline is the script's word; "needs javascript" is not for here.
    await expect(page.locator(".wx__nojs")).toBeHidden();
    await expect(page.locator("[data-wx-temp]")).toHaveText("–");
    await expect(page.locator("[data-wx-text]")).toHaveText("");
    await expect(page.locator("[data-wx-line]")).toHaveAttribute("d", "");
    await expect(page.locator("[data-wx-here]")).toBeHidden();
  });

  test("a reading below zero has a real minus, and one without hours stands alone", async ({
    page,
  }) => {
    await page.route("https://api.open-meteo.com/**", (r) =>
      r.fulfill({
        json: { current: { temperature_2m: -2.6, weather_code: 71 } },
      }),
    );
    await page.goto("/");
    await ready(page);
    await expect(page.locator("[data-wx-temp]")).toHaveText("−3");
    await expect(page.locator("[data-wx-text]")).toHaveText("light snow");
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    await expect(page.locator("[data-wx-line]")).toHaveAttribute("d", "");
  });

  // "live" has to stay true on a tab left open: the reading is asked for
  // again every half hour while the tab is showing, and when it is shown
  // again with a reading that old. On the page's own clock, so half an hour
  // takes no time here.
  test("the weather is asked for again every half hour, and only while the tab is showing", async ({
    page,
  }) => {
    // How many times the page has asked to hear of a resize, or of the
    // pointer on the plot, so a second answer can be seen not to add a
    // second set of listeners.
    await page.addInitScript(() => {
      const w = window as unknown as { listens: Record<string, number> };
      w.listens = { "window resize": 0, "plot pointermove": 0 };
      const add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (
        this: EventTarget,
        ...args: Parameters<typeof add>
      ) {
        const on =
          this === window
            ? "window"
            : this instanceof Element && this.matches("[data-wx-plot]")
              ? "plot"
              : "";
        const key = `${on} ${args[0]}`;
        if (key in w.listens) w.listens[key] += 1;
        return add.apply(this, args);
      };
    });
    const listens = () =>
      page.evaluate(
        () =>
          (window as unknown as { listens: Record<string, number> }).listens,
      );
    // Two hours on and two degrees up, with rain.
    const later = {
      current: {
        time: weather.current.time.replace("T13:00", "T15:00"),
        temperature_2m: 12,
        weather_code: 61,
      },
      hourly: {
        temperature_2m: weather.hourly.temperature_2m.map((t) => t + 2),
      },
    };
    let asked = 0;
    await page.route("https://api.open-meteo.com/**", (route) => {
      asked += 1;
      return route.fulfill({ json: asked === 1 ? weather : later });
    });
    await page.clock.install();
    await page.goto("/");
    await ready(page);
    const temp = page.locator("[data-wx-temp]");
    const here = page.locator("[data-wx-here]");
    await expect(temp).toHaveText("10");
    await expect(page.locator("[data-wx-plot]")).toHaveClass(/is-drawn/);
    const first = await listens();
    expect(first["plot pointermove"]).toBe(1);
    expect(first["window resize"]).toBeGreaterThan(0);
    // "Not yet" is read once, after the clock has moved and a moment has
    // gone by for a request to show up in.
    const quiet = async (count: number, when: string) => {
      await page.waitForTimeout(250);
      expect(asked, when).toBe(count);
    };

    await page.clock.fastForward("29:00");
    await quiet(1, "asked again before the half hour");
    await page.clock.fastForward("02:00");
    await expect(temp).toHaveText("12");
    await expect(page.locator("[data-wx-text]")).toHaveText("light rain");
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    await expect(page.locator("[data-wx-hi]")).toHaveText(
      `${Math.max(...later.hourly.temperature_2m)}°`,
    );
    expect(
      await here.evaluate((el) => parseFloat((el as HTMLElement).style.left)),
      "now moves to the new reading's hour",
    ).toBeCloseTo((15 / 23) * 100, 1);
    expect(asked).toBe(2);

    // In the background nothing is asked for, however long.
    await hide(page, true);
    await page.clock.fastForward("03:00:00");
    await quiet(2, "asked while the tab was hidden");
    // Shown again with a reading hours old: asked at once.
    await hide(page, false);
    await expect.poll(() => asked).toBe(3);
    await expect(page.locator("[data-wx-note]")).toHaveText("live");
    // Hidden for five minutes and shown: that reading will do.
    await hide(page, true);
    await page.clock.fastForward("05:00");
    await hide(page, false);
    await quiet(3, "asked again with a reading five minutes old");

    // Three answers on, the panel listens as it did after the first.
    expect(await listens()).toEqual(first);
    // And the pointer still reads an hour off the newest line, once.
    const plot = page.locator("[data-wx-plot]");
    const box = (await plot.boundingBox())!;
    await plot.hover({
      position: { x: (box.width * 6) / 23, y: box.height / 2 },
    });
    await expect(page.locator("[data-wx-note]")).toHaveText(
      `06:00 · ${later.hourly.temperature_2m[6]}°`,
    );
    await expect(page.locator("[data-wx-cross]:not([hidden])")).toHaveCount(1);
  });

  // A reading that could not be renewed is still the last one seen, but it
  // is no longer live: the border says when it was taken.
  test("when asking again fails, the reading stays and the border says when it was seen", async ({
    page,
  }) => {
    let asked = 0;
    await page.route("https://api.open-meteo.com/**", (route) => {
      asked += 1;
      return asked === 2 ? route.abort() : route.fulfill({ json: weather });
    });
    await page.clock.install();
    await page.goto("/");
    await ready(page);
    const note = page.locator("[data-wx-note]");
    await expect(note).toHaveText("live");

    await page.clock.fastForward("31:00");
    // The fixture's reading was taken at 13:00.
    await expect(note).toHaveText("last seen 13:00");
    await expect(page.locator("[data-wx-temp]")).toHaveText("10");
    await expect(page.locator("[data-wx-text]")).toHaveText("overcast");
    await expect(page.locator("[data-wx-here]")).toBeVisible();

    // The pointer borrows the border and gives it back as it was.
    const plot = page.locator("[data-wx-plot]");
    const box = (await plot.boundingBox())!;
    await plot.hover({
      position: { x: (box.width * 6) / 23, y: box.height / 2 },
    });
    await expect(note).toHaveText(
      `06:00 · ${weather.hourly.temperature_2m[6]}°`,
    );
    await page.locator(".win__bar").hover();
    await expect(note).toHaveText("last seen 13:00");

    // The next answer is live again.
    await page.clock.fastForward("30:00");
    await expect(note).toHaveText("live");
    expect(asked).toBe(3);
  });

  test("the radar draws when its project is opened, and pause holds it", async ({
    page,
  }) => {
    await page.goto("/");
    await pickerReady(page);
    const fig = await open(page, "flight-tracker");
    const canvas = fig.locator("canvas[data-radar]");
    await expect(canvas).toBeVisible();
    // More than one colour on it: a scope, not a blank or a flat fill.
    const colours = () => canvas.evaluate(inked);
    await expect.poll(colours).toBeGreaterThan(1);
    const size = await canvas.evaluate((c: HTMLCanvasElement) => [
      c.width,
      c.height,
    ]);
    expect(Math.min(...size)).toBeGreaterThan(100);

    // It moves.
    const frame = () =>
      canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
    const first = await frame();
    await expect.poll(frame).not.toBe(first);

    const pause = fig.locator("[data-pause]");
    await expect(pause).toHaveText("pause");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await pause.click();
    await expect(pause).toHaveText("play");
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    // Held: two looks a moment apart are the same picture. Read once each.
    await page.waitForTimeout(100);
    const held = await frame();
    await page.waitForTimeout(400);
    expect(await frame()).toBe(held);

    await pause.click();
    await expect(pause).toHaveText("pause");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await expect.poll(frame).not.toBe(held);
  });

  // Safari does not move the focus to a button that is clicked, so the
  // window moves it itself: enter then presses the button again, where it
  // would otherwise open the selected post. Chromium does move it, which
  // would hide the window's part, so here a click on these buttons is made
  // to leave the focus on nothing, as it does in Safari.
  test("a clicked pause or next card keeps the keyboard, so enter presses it again", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      addEventListener(
        "mousedown",
        (e) => {
          if (!(e.target as Element).closest?.(".pn__ctl")) return;
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
        },
        true,
      ),
    );
    await page.goto("/");
    await pickerReady(page);

    const anki = await open(page, "anki-chinese");
    const next = anki.locator("[data-anki-next]");
    const count = page.locator('[data-rv="anki-chinese"] .rv__v');
    await next.click();
    await expect(count).toHaveText(`2of ${cards.length}`);
    await expect(next).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(count).toHaveText(`3of ${cards.length}`);

    for (const id of ["flight-tracker", "home-lab"]) {
      const pause = (await open(page, id)).locator("[data-pause]");
      await pause.click();
      await expect(pause, id).toHaveText("play");
      await expect(pause, id).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(pause, id).toHaveText("pause");
    }
    expect(new URL(page.url()).pathname).toBe("/");
  });

  // One pause holds everything that moves on its own: the scope, and the
  // traffic in the home lab's tunnel. Asked of the animation itself, with
  // the pointer off the figure, since a mouse resting there holds the
  // traffic too. At two widths: the figure lies on its side beside a wide
  // picker and stands upright beside a narrow one.
  for (const width of [1440, 1100])
    test(`${width}: pause holds the tunnel's traffic, by mouse and by keyboard`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await pickerReady(page);
      const fig = await open(page, "home-lab");
      await expect(fig).toHaveClass(/is-live/);
      const traffic = () =>
        fig.locator(".lab__tun").evaluate((tun) => {
          const run = tun
            .getAnimations({ subtree: true })
            .find(
              (a) => (a.effect as KeyframeEffect).pseudoElement === "::before",
            );
          return run
            ? { state: run.playState, at: Number(run.currentTime) }
            : null;
        });
      const state = async () => (await traffic())?.state;
      const away = () => page.mouse.move(2, 2);
      // Paused, and two looks a moment apart find it at the same place.
      // Read once each.
      const held = async () => {
        await expect.poll(state).toBe("paused");
        const at = (await traffic())!.at;
        await page.waitForTimeout(300);
        expect((await traffic())!.at).toBe(at);
      };
      const pause = fig.locator("[data-pause]");
      await away();
      await expect.poll(state).toBe("running");

      await pause.click();
      await away();
      await expect(pause).toHaveText("play");
      await held();
      await pause.click();
      await away();
      await expect.poll(state).toBe("running");

      await pause.focus();
      await page.keyboard.press("Enter");
      await expect(pause).toHaveText("play");
      await held();
      await page.keyboard.press("Enter");
      await expect.poll(state).toBe("running");
    });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the radar is one still frame, with nothing to pause", async ({
      page,
    }) => {
      await page.goto("/");
      await pickerReady(page);
      const fig = await open(page, "flight-tracker");
      const canvas = fig.locator("canvas[data-radar]");
      await expect.poll(() => canvas.evaluate(inked)).toBeGreaterThan(1);
      await expect(fig.locator("[data-pause]")).toBeHidden();
      const frame = () =>
        canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
      const still = await frame();
      await page.waitForTimeout(400);
      expect(await frame()).toBe(still);
    });

    // The figure's last stop is this visit's own time to first byte, from
    // the browser's timing of the page request. With motion off it does not
    // count up, so what is read is the number itself.
    test("the first byte is this visit's, in the figure and the readout", async ({
      page,
    }) => {
      await page.goto("/");
      await pickerReady(page);
      const fig = await open(page, "colincheung.dev");
      const ms = fig.locator("[data-ttfb]");
      await expect(ms).toHaveText(/^[1-9]\d*$/);
      const measured = await page.evaluate(() => {
        const nav = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        return Math.max(1, Math.round(nav.responseStart - nav.startTime));
      });
      await expect(ms).toHaveText(String(measured));
      await expect(
        page.locator('[data-rv="colincheung.dev"] [data-ttfb]'),
      ).toHaveText(String(measured));
      await expect(fig.locator("[data-rt-note]")).toHaveText(
        "measured in your browser",
      );
    });
  });
});

// The picker shows at 60rem and wider. On the line itself and one pixel
// under it, and across it both ways, as a window being resized crosses it.
test.describe("the picker's breakpoint", () => {
  test.use({ reducedMotion: "reduce" });

  test("at 60rem the projects are a picker, one pixel under a stack", async ({
    page,
  }) => {
    const figs = page.locator(".pn--fig");
    const picker = async () => {
      await expect(page.locator(".pn--pick")).toBeVisible();
      expect(await shown(figs, "data-f")).toEqual([projects[0]]);
      await expect(figs.first()).toHaveAttribute("role", "tabpanel");
      expect(new Set(await shown(figs, "data-pn"))).toEqual(new Set(["fig"]));
    };
    const stack = async () => {
      await expect(page.locator(".pn--pick")).toBeHidden();
      expect(await shown(figs, "data-f")).toEqual(projects);
      // Each is a panel in its own right, with a name of its own.
      await expect
        .poll(async () => new Set(await shown(figs, "data-pn")).size)
        .toBe(projects.length);
      await expect(page.locator('.pn--fig[role="tabpanel"]')).toHaveCount(0);
    };

    await page.setViewportSize({ width: 960, height: 900 });
    await page.goto("/");
    await pickerReady(page);
    await picker();
    await page.setViewportSize({ width: 959, height: 900 });
    await stack();
    await page.setViewportSize({ width: 960, height: 900 });
    await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
      projects.length,
    );
    await picker();
  });
});

test.describe("phone", () => {
  test.use({ viewport: phone });

  test("there is no picker: all five projects follow the writing panel", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    await expect(page.locator(".pn--pick")).toBeHidden();
    const figs = page.locator(".pn--fig");
    await expect(figs).toHaveCount(projects.length);
    expect(await shown(figs, "data-f")).toEqual(projects);
    // Each under the one before, all under writing, titled by its project.
    const tops = await page
      .locator(".pn--writing, .pn--fig")
      .evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return [r.top, r.bottom];
        }),
      );
    for (let i = 1; i < tops.length; i++)
      expect(
        tops[i][0],
        `panel ${i} starts under the one before`,
      ).toBeGreaterThan(tops[i - 1][1]);
    for (const [i, id] of projects.entries()) {
      await expect(figs.nth(i).locator(".pn__id")).toBeVisible();
      await expect(figs.nth(i).locator(".pn__id")).toHaveText(id);
    }
    // No key hints where there are no keys.
    for (const hint of await page.locator(".win .lbl--bl").all())
      await expect(hint).toBeHidden();
  });

  // On a phone nothing hovers, so the readout rides the bottom of the screen
  // and reads the post at the reading line (42% down) as the list scrolls.
  test("the writing readout pins once the list is on screen, and follows the scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const panel = page.locator(".pn--writing");
    const rows = page.locator(".wr [data-post]");
    // At the top of the page the list is below the fold. Read once.
    expect(await panel.getAttribute("class")).not.toMatch(/is-pin/);

    const look = () =>
      page.evaluate(() => {
        const list = [
          ...document.querySelectorAll<HTMLElement>(".wr [data-post]"),
        ];
        const line = window.innerHeight * 0.42;
        const pv = document.querySelector<HTMLElement>(".pv")!;
        const sel = list.findIndex((r) => r.classList.contains("is-sel"));
        return {
          sel,
          // The last row whose top has passed the line; the first until one
          // has.
          want: Math.max(
            0,
            list.findLastIndex((r) => r.getBoundingClientRect().top <= line),
          ),
          slug: document.querySelector("[data-pv-slug]")!.textContent!.trim(),
          selSlug: list[sel]?.dataset.slug,
          offBottom: Math.round(
            window.innerHeight - pv.getBoundingClientRect().bottom,
          ),
        };
      });
    const follows = async (from: number) => {
      await expect
        .poll(async () => {
          const s = await look();
          return s.sel === s.want && s.slug === s.selSlug && s.sel >= from;
        })
        .toBe(true);
      return look();
    };
    const stat = page.locator("[data-pv-stat]");

    // The first few rows on screen: the readout comes up from the bottom
    // edge and stays there, over the list, still on the newest post.
    await panel.evaluate((el) =>
      window.scrollBy({
        top: el.getBoundingClientRect().top - (window.innerHeight - 300),
        behavior: "instant",
      }),
    );
    await expect(panel).toHaveClass(/is-pin/);
    await expect(panel).toHaveClass(/is-stuck/);
    await expect.poll(async () => (await look()).offBottom).toBe(0);
    expect((await follows(0)).sel).toBe(0);
    await expect(page.locator("[data-pv-pos]")).toBeVisible();

    // Into the list: the post at the reading line, its result and position.
    await rows
      .nth(2)
      .evaluate((el) =>
        el.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    const early = await follows(2);
    expect(await stat.textContent()).toBe(await result(rows.nth(early.sel)));
    await expect(page.locator("[data-pv-pos]")).toHaveText(
      `${early.sel + 1} of ${slugs.length}`,
    );

    // Further down, a later post.
    const far = Math.min(early.sel + 2, slugs.length - 1);
    await rows
      .nth(far)
      .evaluate((el) =>
        el.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    const later = await follows(far);
    expect(later.sel).toBeGreaterThan(early.sel);
    expect(await stat.textContent()).toBe(await result(rows.nth(later.sel)));

    // Back at the top of the page, it lets go.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(panel).not.toHaveClass(/is-pin/);
  });
});

// Where the readout rides the bottom of the screen, a post reached by
// keyboard must not end up under it: the row scrolls clear, and the readout
// restates that row, not the one the scroll left at the reading line. At a
// phone's size, and at a laptop's zoomed to 200%. Motion is off so that a
// scroll lands at once and each look is of the page at rest.
test.describe("the pinned readout and the keyboard", () => {
  test.use({ reducedMotion: "reduce" });

  for (const size of [
    { width: 390, height: 844 },
    { width: 640, height: 450 },
  ])
    test(`${size.width}x${size.height}: a focused post is clear of the readout, and the readout is that post's`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto("/");
      await ready(page);
      const rows = page.locator(".wr [data-post]");
      const list = await rows.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-slug")),
      );
      // The row with the keyboard, once the page has had the frame in which
      // it follows a scroll.
      const look = () =>
        page.evaluate(async () => {
          await new Promise((done) =>
            requestAnimationFrame(() => requestAnimationFrame(done)),
          );
          const at = document.activeElement as HTMLElement;
          const row = at.getBoundingClientRect();
          const pv = document.querySelector(".pv")!.getBoundingClientRect();
          return {
            focused: at.dataset.slug ?? null,
            selected:
              document.querySelector<HTMLElement>(".wr .is-sel")?.dataset
                .slug ?? null,
            readout: document
              .querySelector("[data-pv-slug]")!
              .textContent!.trim(),
            // How far the row runs under the readout, and off the screen,
            // in whole pixels.
            under: Math.max(0, Math.round(row.bottom - pv.top)),
            off: Math.max(
              0,
              Math.round(-row.top),
              Math.round(row.bottom - window.innerHeight),
            ),
          };
        });
      const at = (slug: string | null) => ({
        focused: slug,
        selected: slug,
        readout: slug,
        under: 0,
        off: 0,
      });
      let pinned = 0;
      const step = async (key: string, i: number) => {
        await page.keyboard.press(key);
        expect(await look(), `${key} to row ${i + 1}`).toEqual(at(list[i]));
        if (
          await page
            .locator(".pn--writing")
            .evaluate((el) => el.classList.contains("is-stuck"))
        )
          pinned += 1;
      };

      // From the link before the list, Tab goes down it a row at a time.
      await page.locator(".pn--writing a.lbl--tr").focus();
      for (let i = 0; i < list.length; i++) await step("Tab", i);
      for (let i = list.length - 2; i >= 0; i--) await step("Shift+Tab", i);
      for (let i = 1; i < list.length; i++) await step("j", i);
      for (let i = list.length - 2; i >= 0; i--) await step("k", i);
      // The readout was riding over the list for some of that: the case
      // this is here for.
      expect(pinned).toBeGreaterThan(0);
    });
});

// On a phone a tap leaves what it touched hovered, with no pointer over it
// to read an hour: the "now" label steps aside for a mouse's reading and
// must not for that. A test's tap does not leave the hover behind on every
// system, so the hover is put there through the browser's debugger, which
// styles the plot as a phone would after the tap.
test.describe("a touch screen", () => {
  test.use({ viewport: phone, hasTouch: true, isMobile: true });

  test("a plot left hovered by a tap still shows the now label", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const now = page.locator("[data-wx-here] b");
    await expect(now).toBeVisible();
    expect(
      await page.evaluate(() => matchMedia("(hover: none)").matches),
      "nothing hovers on this screen",
    ).toBe(true);

    const debug = await page.context().newCDPSession(page);
    await debug.send("DOM.enable");
    await debug.send("CSS.enable");
    const { root } = await debug.send("DOM.getDocument");
    const { nodeId } = await debug.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: "[data-wx-plot]",
    });
    await debug.send("CSS.forcePseudoState", {
      nodeId,
      forcedPseudoClasses: ["hover"],
    });
    // The case this is here for: the plot is hovered.
    expect(
      await page
        .locator("[data-wx-plot]")
        .evaluate((el) => el.matches(":hover")),
    ).toBe(true);
    await expect(now).toBeVisible();
  });
});

// The tone a card's readings carry, checked against known cards: the mark
// over the pinyin's vowel, the digit that ends the jyutping.
test("a card's tones are read from its pinyin and jyutping", () => {
  const card = (pinyin: string, jyutping: string): Card => ({
    hanzi: "",
    meaning: "",
    pinyin,
    jyutping,
  });
  const n = (c: Card) => [tones(c).mandarin.n, tones(c).cantonese.n];
  expect(n(card("zhēng", "zing1"))).toEqual([1, 1]);
  expect(n(card("jí", "gat1"))).toEqual([2, 1]);
  expect(n(card("shǎ", "so4"))).toEqual([3, 4]);
  expect(n(card("gèng", "gang3"))).toEqual([4, 3]);
  // No mark, no digit: no tone, and no line to draw.
  expect(n(card("ma", "maa"))).toEqual([0, 0]);
  expect(tones(card("ma", "maa")).mandarin.points).toBe("");
  // A falling tone starts at the top of the box and ends at the bottom.
  expect(tones(card("gèng", "gang3")).mandarin.points).toBe("0,0 100,100");
});

// How many different colours a canvas holds, sampled across it: 0 for one
// never drawn on, 1 for a flat fill.
function inked(canvas: HTMLCanvasElement) {
  if (!canvas.width || !canvas.height) return 0;
  const g = canvas.getContext("2d")!;
  const data = g.getImageData(0, 0, canvas.width, canvas.height).data;
  const seen = new Set<number>();
  for (let i = 0; i < data.length && seen.size < 8; i += 4 * 7)
    if (data[i + 3])
      seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
  return seen.size;
}
