import { expect, type Page, test } from "@playwright/test";

// Page speed budgets: each page type's bytes by type (KB), request count, LCP
// (ms) and layout shift (CLS) on a slow phone connection, against the built site (run by
// playwright.speed.config.ts, `pnpm speed`). How they are measured and why
// these numbers: docs/page-speed.md. Raise one only with the reason in the PR.

type Budget = {
  html: number;
  css: number;
  js: number;
  font: number;
  image: number;
  total: number;
  requests: number;
  lcp: number;
  cls: number;
};

const budgets: Record<string, Budget> = {
  "/": {
    html: 20,
    css: 3,
    js: 12,
    font: 95,
    image: 3,
    total: 123,
    requests: 17,
    lcp: 550,
    cls: 0.1,
  },
  "/blog/": {
    html: 11,
    css: 3,
    js: 3,
    font: 88,
    image: 3,
    total: 96,
    requests: 7,
    lcp: 450,
    cls: 0.1,
  },
  // A post with a code block, a figure and a script; its content is settled.
  "/blog/jest-to-vitest/": {
    html: 24,
    css: 8,
    js: 8,
    font: 88,
    image: 3,
    total: 121,
    requests: 11,
    lcp: 500,
    cls: 0.1,
  },
  "/cv/": {
    html: 15,
    css: 3,
    js: 3,
    font: 88,
    image: 3,
    total: 101,
    requests: 7,
    lcp: 500,
    cls: 0.1,
  },
};

const kinds: Record<string, keyof Budget> = {
  document: "html",
  stylesheet: "css",
  script: "js",
  font: "font",
  image: "image",
};

// A slow phone connection: 1.6 Mbps and 150 ms a request.
async function slow(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6e6 / 8,
    uploadThroughput: 0.75e6 / 8,
  });
}

// Fixed answers for the live calls, so the page is the same each run.
async function fixLiveCalls(page: Page) {
  // The homepage's live weather: a fixed answer, so the page is the same each run.
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({
      json: { current: { temperature_2m: 10, weather_code: 3 } },
    }),
  );

  // The home server's numbers come from the Worker (worker/index.ts), which
  // the preview server doesn't run: a production-sized answer instead.
  await page.route("**/homelab.json", (route) =>
    route.fulfill({
      json: {
        at: Math.floor(Date.now() / 1000),
        allUp: true,
        blocked: 1212,
        tracking: 237,
        londonHour: 107,
        haDays: 3,
        backupOk: true,
      },
    }),
  );
}

// Past the first screen's entrances, so LCP has its last candidate: every
// animation that ends, up to 3 s, since the home reel's timer bar runs 5 s.
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
          .map((a) => a.finished.catch(() => {})),
      ),
      new Promise((done) => setTimeout(done, 3000)),
    ]),
  );
}

// One load in a fresh context (a cold cache).
async function load(page: Page, path: string) {
  await slow(page);
  await fixLiveCalls(page);
  const got: Budget = {
    html: 0,
    css: 0,
    js: 0,
    font: 0,
    image: 0,
    total: 0,
    requests: 0,
    lcp: 0,
    cls: 0,
  };
  const sized: Promise<void>[] = [];
  // A file that fails to load, or answers with an error, would make the page
  // look lighter, so it fails the test.
  const failed: string[] = [];
  page.on("requestfailed", (req) => failed.push(req.url()));
  page.on("requestfinished", (req) =>
    sized.push(
      req.sizes().then(async (s) => {
        if (((await req.response())?.status() ?? 0) >= 400)
          failed.push(req.url());
        const kb = (s.responseHeadersSize + s.responseBodySize) / 1024;
        const kind = kinds[req.resourceType()];
        if (kind) got[kind] += kb;
        got.total += kb;
        got.requests += 1;
      }),
    ),
  );
  // Layout shift (CLS): the worst burst of shifts, a burst being shifts under
  // 1 s apart within 5 s, as Chrome scores it.
  await page.addInitScript(() => {
    const w = window as unknown as { cls: number; moved: string };
    w.cls = 0;
    w.moved = "";
    let biggest = 0;
    let sum = 0;
    let first = 0;
    let last = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
        startTime: number;
        sources: { node?: Node }[];
      }[]) {
        if (e.hadRecentInput) continue;
        // What moved in the biggest shift, for the failure message.
        if (e.value > biggest) {
          biggest = e.value;
          w.moved = e.sources
            .map(
              (x) =>
                (x.node as Element | undefined)?.getAttribute?.("class") ||
                x.node?.nodeName,
            )
            .join(", ");
        }
        if (sum && e.startTime - last < 1000 && e.startTime - first < 5000)
          sum += e.value;
        else {
          sum = e.value;
          first = e.startTime;
        }
        last = e.startTime;
        w.cls = Math.max(w.cls, sum);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(path, { waitUntil: "networkidle" });
  await settle(page);
  const lcp = await page.evaluate(
    () =>
      new Promise<[number, string]>((done) =>
        new PerformanceObserver((list) => {
          const e = list.getEntries().at(-1) as unknown as
            | { startTime: number; element: Element | null }
            | undefined;
          done([e?.startTime ?? 0, e?.element?.getAttribute("class") ?? ""]);
        }).observe({ type: "largest-contentful-paint", buffered: true }),
      ),
  );
  got.lcp = lcp[0];
  const shift = await page.evaluate(() => {
    const w = window as unknown as { cls: number; moved: string };
    return { cls: w.cls, moved: w.moved };
  });
  got.cls = shift.cls;
  // Named in a failure message: what LCP waited for and what moved most.
  const why = { lcp: lcp[1], cls: shift.moved };
  await Promise.all(sized);
  expect(failed, `${path}: requests that failed`).toEqual([]);
  return { got, why };
}

for (const [path, budget] of Object.entries(budgets)) {
  test(`${path} keeps to its speed budget`, async ({ browser }) => {
    const runs: Awaited<ReturnType<typeof load>>[] = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        // Motion off: the entrances are design, not load time (docs/page-speed.md).
        reducedMotion: "reduce",
      });
      runs.push(await load(await context.newPage(), path));
      await context.close();
    }
    // Bytes and layout shift from the first load; LCP the median of the three.
    const median = [...runs].sort((a, b) => a.got.lcp - b.got.lcp)[1];
    const got = { ...runs[0].got, lcp: median.got.lcp };
    const why: Partial<Record<keyof Budget, string>> = {
      cls: runs[0].why.cls,
      lcp: median.why.lcp,
    };
    const shown = Object.fromEntries(
      Object.entries(got).map(([k, v]) => {
        const at = k === "cls" ? 1000 : 10;
        return [k, Math.round(v * at) / at];
      }),
    );
    console.log(path, JSON.stringify(shown));
    for (const key of Object.keys(budget) as (keyof Budget)[])
      expect
        .soft(
          got[key],
          `${path} ${key}${why[key] ? ` (${why[key]})` : ""} (budget in tests/speed.spec.ts)`,
        )
        .toBeLessThanOrEqual(budget[key]);
  });
}

// A reader's click: the pointer rests on a link, then clicks it. The speculation
// rules in Head.astro prerender the page while it rests. Chrome under automation
// won't prerender (PrerenderingDisabledByDevTools), so this measures what it
// does instead, reuse the page it fetched; a visitor's Chrome shows it sooner.
// Measured by the clock: navigation timing hides the throttle's delay.
test("a hovered link opens its page at once", async ({ browser }) => {
  const runs: number[] = [];
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    // Throttled only: the page needn't be idle, just loaded.
    await slow(page);
    await page.goto("/");
    const link = page.locator('a[href="/blog/"]').first();
    await link.hover();
    await page.waitForTimeout(600);
    const clicked = Date.now();
    await link.click();
    await page.waitForURL("**/blog/");
    await settle(page);
    const painted = await page.evaluate(
      () =>
        new Promise<number>((done) =>
          new PerformanceObserver((list) =>
            done(
              performance.timeOrigin +
                (list.getEntries().at(-1)?.startTime ?? 0),
            ),
          ).observe({ type: "largest-contentful-paint", buffered: true }),
        ),
    );
    runs.push(painted - clicked);
    await context.close();
  }
  const median = runs.sort((a, b) => a - b)[1];
  console.log("click to blog index painted", Math.round(median), "ms");
  // About 140 ms today with motion off.
  expect(
    median,
    "click to painted, ms (tests/speed.spec.ts)",
  ).toBeLessThanOrEqual(250);
});
