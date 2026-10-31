import { expect, type Page, test } from "@playwright/test";

// Page speed budgets: each page type's bytes by type (KB), request count and
// LCP (ms) on a slow phone connection, against the built site (run by
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
};

const budgets: Record<string, Budget> = {
  "/": {
    html: 12,
    css: 12,
    js: 12,
    font: 112,
    image: 3,
    total: 141,
    requests: 19,
    lcp: 1300,
  },
  "/blog/": {
    html: 7,
    css: 7,
    js: 3,
    font: 101,
    image: 3,
    total: 110,
    requests: 9,
    lcp: 1250,
  },
  // A post with a code block, a figure and a script; its content is settled.
  "/blog/jest-to-vitest/": {
    html: 11,
    css: 21,
    js: 8,
    font: 101,
    image: 3,
    total: 134,
    requests: 14,
    lcp: 1400,
  },
  "/cv/": {
    html: 9,
    css: 10,
    js: 3,
    font: 101,
    image: 3,
    total: 114,
    requests: 10,
    lcp: 600,
  },
};

const kinds: Record<string, keyof Budget> = {
  document: "html",
  stylesheet: "css",
  script: "js",
  font: "font",
  image: "image",
};

// One load in a fresh context (a cold cache), at 1.6 Mbps and 150 ms a request.
async function load(page: Page, path: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6e6 / 8,
    uploadThroughput: 0.75e6 / 8,
  });
  // The homepage's live weather: a fixed answer, so the page is the same each run.
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({
      json: { current: { temperature_2m: 10, weather_code: 3 } },
    }),
  );

  const got: Budget = {
    html: 0,
    css: 0,
    js: 0,
    font: 0,
    image: 0,
    total: 0,
    requests: 0,
    lcp: 0,
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
  await page.goto(path, { waitUntil: "networkidle" });
  // Past the first screen's entrances, so LCP has its last candidate: every
  // animation that ends, up to 3 s, since the home reel's timer bar runs 5 s.
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
  got.lcp = await page.evaluate(
    () =>
      new Promise<number>((done) =>
        new PerformanceObserver((list) =>
          done(list.getEntries().at(-1)?.startTime ?? 0),
        ).observe({ type: "largest-contentful-paint", buffered: true }),
      ),
  );
  await Promise.all(sized);
  expect(failed, `${path}: requests that failed`).toEqual([]);
  return got;
}

for (const [path, budget] of Object.entries(budgets)) {
  test(`${path} keeps to its speed budget`, async ({ browser }) => {
    const runs: Budget[] = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "no-preference",
      });
      runs.push(await load(await context.newPage(), path));
      await context.close();
    }
    // Bytes from the first load; LCP the median of the three.
    const got = {
      ...runs[0],
      lcp: runs.map((r) => r.lcp).sort((a, b) => a - b)[1],
    };
    const shown = Object.fromEntries(
      Object.entries(got).map(([k, v]) => [k, Math.round(v * 10) / 10]),
    );
    console.log(path, JSON.stringify(shown));
    for (const key of Object.keys(budget) as (keyof Budget)[])
      expect
        .soft(got[key], `${path} ${key} (budget in tests/speed.spec.ts)`)
        .toBeLessThanOrEqual(budget[key]);
  });
}
