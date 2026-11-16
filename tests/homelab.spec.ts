import { expect, type Locator, type Page, test } from "@playwright/test";
import * as entry from "../worker/index.ts";
import worker, { type Env, edgeCity, parse } from "../worker/index.ts";
import { MAX_BYTES } from "../worker/stacks.ts";
import { hide, projects, snapshotStacks } from "./home.ts";
import { fixWeather } from "./weather.ts";

// The home server's numbers (worker/index.ts) in the home window's home-lab
// and flight-tracker projects. The dev server has no Worker, so each test
// answers /homelab.json itself or leaves it to 404.

// What the server gathered two minutes before each test starts. Set afresh
// for each: this file is loaded once for all the tests a worker runs from
// it, and an age counted from then would be a minute out by the last.
const gathered = (at: number) => ({
  at: at - 120,
  allUp: true,
  tracking: 237,
  londonHour: 107,
});
let now = Math.floor(Date.now() / 1000);
let stats = gathered(now);
test.beforeEach(() => {
  now = Math.floor(Date.now() / 1000);
  stats = gathered(now);
});

// Opens a project from the picker and gives back its figure's panel. The
// picker's script loads after the page, and names the figure panels when it
// has: a click before that would do nothing.
const open = async (page: Page, name: string) => {
  await expect(page.locator('.pn--fig[data-pn="fig"]')).toHaveCount(
    projects.length,
  );
  await page.getByRole("tab", { name: new RegExp(`^${name}`) }).click();
  const fig = page.locator(".pn--fig.is-open");
  await expect(fig).toHaveAttribute("data-f", name);
  return fig;
};
// The picker's readout for the open project.
const readout = (page: Page) => page.locator(".rv [data-rv]:not([hidden])");

test.describe("the picker", () => {
  // Wide enough for the picker: under 60rem the projects are a stack.
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(({ page }) => fixWeather(page));

  test("the figures show the server's numbers, and the lab says all up", async ({
    page,
  }) => {
    await page.route("**/homelab.json", (r) => r.fulfill({ json: stats }));
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(lab.locator(".lab__live")).toHaveText(
      "all up live, 2 min ago",
    );
    await expect(lab.locator("[data-lab]")).toHaveAttribute("data-up", "");
    await expect(lab.locator(".lab__now")).toHaveText("tracking 237 now");
    await open(page, "flight-tracker");
    await expect(readout(page).locator(".rv__note")).toContainText(
      "live, 2 min ago",
    );
    await expect(readout(page).locator(".rv__v")).toHaveText(["237", "107"]);
  });

  test("old numbers say when they were seen, and nothing claims to be up", async ({
    page,
  }) => {
    await page.route("**/homelab.json", (r) =>
      r.fulfill({ json: { ...stats, at: now - 3 * 3600 } }),
    );
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(lab.locator(".lab__live")).toHaveText("last seen 3 h ago");
    await expect(lab.locator("[data-lab]")).not.toHaveAttribute("data-up");
    // The numbers themselves are still the last ones seen.
    await expect(lab.locator(".lab__now")).toHaveText("tracking 237 now");
    await open(page, "flight-tracker");
    await expect(readout(page).locator(".rv__note")).toContainText(
      "last seen 3 h ago",
    );
  });

  test("without the server, the dashes stay and the labels say offline", async ({
    page,
  }) => {
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(lab.locator(".lab__live")).toHaveText("offline");
    await expect(lab.locator("[data-lab]")).not.toHaveAttribute("data-up");
    await expect(lab.locator(".lab__now")).toHaveText("tracking – now");
    await open(page, "flight-tracker");
    await expect(readout(page).locator(".rv__note")).toContainText("offline");
    await expect(readout(page).locator(".rv__v")).toHaveText(["–", "–"]);
  });

  test("a number the server left out goes back to a dash", async ({ page }) => {
    await page.route("**/homelab.json", (r) =>
      r.fulfill({ json: { ...stats, londonHour: null } }),
    );
    await page.goto("/");
    await open(page, "flight-tracker");
    await expect(readout(page).locator(".rv__v")).toHaveText(["237", "–"]);
  });

  // The server gathers its numbers every five minutes, and an open tab asks
  // again as often: a page left open must not go on showing the first answer.
  test("the numbers are fetched again after five minutes", async ({ page }) => {
    await page.clock.install();
    let asked = 0;
    await page.route("**/homelab.json", (r) => {
      asked += 1;
      return r.fulfill({
        json:
          asked === 1
            ? stats
            : { ...stats, at: now + 240, tracking: 300, londonHour: 96 },
      });
    });
    await page.goto("/");
    await open(page, "flight-tracker");
    await expect(readout(page).locator(".rv__v")).toHaveText(["237", "107"]);
    expect(asked).toBe(1);
    await page.clock.fastForward("05:01");
    await expect(readout(page).locator(".rv__v")).toHaveText(["300", "96"]);
    expect(asked).toBe(2);
  });

  // A tab left in the background does not ask; shown again, its numbers may
  // be hours old and the timer minutes from its next turn. So it asks at
  // once, and what it says is the new answer's age, not the old one's.
  test("the numbers are fetched again when a hidden tab is shown", async ({
    page,
  }) => {
    await page.clock.install();
    let asked = 0;
    await page.route("**/homelab.json", (r) => {
      asked += 1;
      return r.fulfill({
        json:
          asked === 1
            ? stats
            : // Gathered just now by the page's clock, three hours on.
              {
                ...stats,
                at: Math.floor(Date.now() / 1000) + 3 * 3600,
                tracking: 300,
              },
      });
    });
    await page.goto("/");
    const lab = await open(page, "home-lab");
    const live = lab.locator(".lab__live");
    await expect(live).toHaveText("all up live, 2 min ago");

    await hide(page, true);
    await page.clock.fastForward("03:00:00");
    // Nothing while hidden. Read once, after a moment for a request to
    // show up in.
    await page.waitForTimeout(250);
    expect(asked, "asked while the tab was hidden").toBe(1);

    await hide(page, false);
    await expect(live).toHaveText("all up live, just now");
    await expect(lab.locator("[data-lab]")).toHaveAttribute("data-up", "");
    await expect(lab.locator(".lab__now")).toHaveText("tracking 300 now");
    expect(asked).toBe(2);
  });

  // The age is worked out from `at`. An answer without one (or with one
  // that is not a number) cannot say how old it is, so it is no answer.
  for (const [name, answer] of [
    ["no at", { allUp: true, tracking: 237, londonHour: 107 }],
    ["an at in words", { ...stats, at: "soon" }],
    ["a list", [1, 2]],
  ] as const)
    test(`an answer with ${name} reads as offline, never as a number that is not one`, async ({
      page,
    }) => {
      await page.route("**/homelab.json", (r) => r.fulfill({ json: answer }));
      await page.goto("/");
      const lab = await open(page, "home-lab");
      await expect(lab.locator(".lab__live")).toHaveText("offline");
      await expect(lab.locator("[data-lab]")).not.toHaveAttribute("data-up");
      await expect(lab.locator(".lab__now")).toHaveText("tracking – now");
      await open(page, "flight-tracker");
      await expect(readout(page).locator(".rv__note")).toContainText("offline");
      await expect(readout(page).locator(".rv__v")).toHaveText(["–", "–"]);
      expect(
        await page.locator(".win").evaluate((win) => win.textContent),
      ).not.toContain("NaN");
    });

  test("after a good answer, one without an age changes nothing but the age", async ({
    page,
  }) => {
    await page.clock.install();
    let asked = 0;
    await page.route("**/homelab.json", (r) => {
      asked += 1;
      return r.fulfill({
        json:
          asked === 1 ? stats : { allUp: false, tracking: 9, londonHour: 9 },
      });
    });
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(lab.locator(".lab__live")).toHaveText(
      "all up live, 2 min ago",
    );
    await page.clock.fastForward("05:01");
    await expect(lab.locator(".lab__live")).toHaveText(
      "all up live, 7 min ago",
    );
    expect(asked).toBe(2);
    await expect(lab.locator(".lab__now")).toHaveText("tracking 237 now");
    expect(
      await page.locator(".win").evaluate((win) => win.textContent),
    ).not.toContain("NaN");
  });
});

// The stacks the server says it has deployed, and the city that served the
// visit. The page is built with the snapshot's rows (the dev server's), and
// draws the server's list over them when it comes.
test.describe("the stacks and the edge", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(({ page }) => fixWeather(page));

  const rows = (lab: Locator) => lab.locator(".lab__host__kv > div");
  // Each row as its stack's name and the words on its chips.
  const said = (lab: Locator) =>
    rows(lab).evaluateAll((all) =>
      all.map((row) => [
        row.querySelector("dt")!.textContent,
        [...row.querySelectorAll(".lab__chip")].map((c) => c.textContent),
      ]),
    );
  const chipsOf = (services: string[]) =>
    services.length > 4
      ? [...services.slice(0, 4), `+${services.length - 4}`]
      : services;

  test("before an answer the rows are the build's, four chips and then how many more", async ({
    page,
  }) => {
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(lab.locator(".lab__live")).toHaveText("offline");
    expect(await said(lab)).toEqual(
      snapshotStacks.map((s) => [s.id, chipsOf(s.services)]),
    );
    // observability has fifteen services: four, then "+11".
    await expect(
      lab.locator(".lab__host__kv > div", { hasText: "observability" }),
    ).toContainText("+11");
    await expect(lab.locator(".lab__now")).toHaveText("tracking – now");
  });

  test("the server's list replaces the rows, and every count of them changes with it", async ({
    page,
  }) => {
    const stacks = [
      { id: "flight-tracker", services: ["backend", "worker"] },
      { id: "media", services: ["a", "b", "c", "d", "e", "f"] },
    ];
    await page.route("**/homelab.json", (r) =>
      r.fulfill({ json: { ...stats, stacks } }),
    );
    await page.goto("/");
    const lab = await open(page, "home-lab");
    await expect(rows(lab)).toHaveCount(2);
    expect(await said(lab)).toEqual([
      ["flight-tracker", ["backend", "worker"]],
      ["media", ["a", "b", "c", "d", "+2"]],
    ]);
    // The live count moved with its stack, and kept its number.
    await expect(rows(lab).first().locator(".lab__now")).toHaveText(
      "tracking 237 now",
    );
    await expect(page.locator('[data-pick="home-lab"] .pk__sub')).toHaveText(
      "one mini-PC, two stacks",
    );
    await expect(readout(page).locator(".rv__v").first()).toHaveText("2stacks");
    // The stacked panel's line says it too.
    await expect(
      page.locator('.pn--fig[data-f="home-lab"] [data-stacks-words]'),
    ).toHaveText("two stacks");
  });

  test("one stack is said as one", async ({ page }) => {
    await page.route("**/homelab.json", (r) =>
      r.fulfill({
        json: {
          ...stats,
          stacks: [{ id: "tunnel", services: ["cloudflared"] }],
        },
      }),
    );
    await page.goto("/");
    await open(page, "home-lab");
    await expect(page.locator('[data-pick="home-lab"] .pk__sub')).toHaveText(
      "one mini-PC, one stack",
    );
    await expect(readout(page).locator(".rv__v").first()).toHaveText("1stack");
  });

  // The Worker checks the list; the page checks it again, so a list that
  // breaks the rules (here a name that is markup) changes nothing.
  for (const [name, stacks] of [
    ["a name that is not a name", [{ id: "<b>hi</b>", services: ["x"] }]],
    ["no stacks at all", []],
    ["a list in words", "backup"],
  ] as const)
    test(`an answer with ${name} keeps the build's rows`, async ({ page }) => {
      await page.route("**/homelab.json", (r) =>
        r.fulfill({ json: { ...stats, stacks } }),
      );
      await page.goto("/");
      const lab = await open(page, "home-lab");
      await expect(lab.locator(".lab__now")).toHaveText("tracking 237 now");
      expect(await said(lab)).toEqual(
        snapshotStacks.map((s) => [s.id, chipsOf(s.services)]),
      );
      await expect(page.locator('[data-pick="home-lab"] .pk__sub')).toHaveText(
        "one mini-PC, seven stacks",
      );
    });

  test("the city that served the visit is a dash until the Worker names it", async ({
    page,
  }) => {
    // Held until the dash has been seen.
    let answer = () => {};
    const asked = new Promise<void>((seen) =>
      page.route("**/homelab.json", (r) => {
        answer = () => void r.fulfill({ json: { ...stats, edge: "London" } });
        seen();
      }),
    );
    await page.goto("/");
    const fig = await open(page, "colincheung.dev");
    const edge = fig.locator(".rt__s--edge");
    await asked;
    await expect(edge).toHaveText("served from –");
    await expect(fig.locator(".rt__stop--edge .rt__v")).toHaveText(
      /^\d{3}cities$/,
    );
    answer();
    await expect(edge).toHaveText("served from London");
  });

  test("an answer with no city, or one that is not a name, leaves the dash", async ({
    page,
  }) => {
    for (const edge of [null, 42]) {
      await page.unrouteAll();
      await page.route("**/homelab.json", (r) =>
        r.fulfill({ json: { ...stats, edge } }),
      );
      await page.goto("/");
      const fig = await open(page, "colincheung.dev");
      await expect(page.locator(".lab__live").first()).toHaveText(
        /live, 2 min ago/,
      );
      await expect(fig.locator(".rt__s--edge")).toHaveText("served from –");
    }
  });
});

// Under 60rem there is no picker: flight-tracker is a panel in the stack, with
// its two counts under the scope and their age said beside the note.
for (const vp of [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
])
  test(`${vp.name}: the stacked flight-tracker panel shows the counts and their age`, async ({
    page,
  }) => {
    await page.setViewportSize(vp);
    await fixWeather(page);
    await page.route("**/homelab.json", (r) => r.fulfill({ json: stats }));
    await page.goto("/");
    const panel = page.locator('.pn--fig[data-f="flight-tracker"]');
    await panel.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(panel.locator(".rd__cnt dd")).toHaveText(["237", "107"]);
    for (const dd of await panel.locator(".rd__cnt dd").all())
      await expect(dd).toBeVisible();
    const age = panel.locator(".rd__note [data-stats-age]");
    await expect(age).toHaveText("live, 2 min ago");
    await expect(panel.locator(".rd__note")).toContainText(
      "radar simulated here",
    );
    // A gap joins the two where they share a line; on a phone the age has a
    // line of its own.
    const own = await age.evaluate(
      (el) =>
        el.getBoundingClientRect().top >
        el.previousElementSibling!.getBoundingClientRect().top,
    );
    expect(own).toBe(vp.width < 736);
  });

test("the Worker accepts only the known numbers, freshly gathered", () => {
  const body = (o: object) => JSON.stringify({ ...stats, at: now, ...o });
  expect(parse(body({}), now)).not.toBeNull();
  expect(parse(body({ tracking: null }), now)).not.toBeNull();
  expect(parse(body({ host: "x" }), now)).toBeNull();
  expect(parse(body({ blocked: null }), now)).toBeNull();
  expect(parse(body({ tracking: "<b>hi</b>" }), now)).toBeNull();
  expect(parse(body({ tracking: -1 }), now)).toBeNull();
  expect(parse(body({ allUp: 1 }), now)).toBeNull();
  expect(parse(body({ at: now - 601 }), now)).toBeNull();
  expect(parse(body({ at: now + 30 }), now)).not.toBeNull();
  expect(parse(body({ at: now + 61 }), now)).toBeNull();
  expect(parse("[]", now)).toBeNull();
  expect(parse("nope", now)).toBeNull();
});

test("the Worker takes a body only when the server's key signed it", async () => {
  const toHex = (b: ArrayBuffer) => Buffer.from(b).toString("hex");
  const keys = (await crypto.subtle.generateKey("Ed25519", true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const other = (await crypto.subtle.generateKey("Ed25519", true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const kv = new Map<string, string>();
  const env: Env = {
    STATS: {
      get: async (k) => kv.get(k) ?? null,
      put: async (k, v) => void kv.set(k, v),
    },
    HOMELAB_PUBLIC_KEY: toHex(
      await crypto.subtle.exportKey("raw", keys.publicKey),
    ),
  };
  const put = async (body: string, key = keys.privateKey) =>
    (
      await worker.fetch(
        new Request("https://x/homelab.json", {
          method: "PUT",
          body,
          headers: {
            // Set by the server's HTTP client; Node's Request leaves it out.
            "Content-Length": String(body.length),
            Signature: toHex(
              await crypto.subtle.sign(
                "Ed25519",
                key,
                new TextEncoder().encode(body),
              ),
            ),
          },
        }),
        env,
      )
    ).status;
  const body = JSON.stringify({ ...stats, at: now });
  expect(await put(body, other.privateKey)).toBe(401);
  // no key configured yet (wrangler.json ships it empty): nothing is taken
  const key = env.HOMELAB_PUBLIC_KEY;
  env.HOMELAB_PUBLIC_KEY = "";
  expect(await put(body)).toBe(401);
  env.HOMELAB_PUBLIC_KEY = key;
  expect(await put(body)).toBe(204);
  expect(JSON.parse(kv.get("latest")!).tracking).toBe(237);
  // the same signed body again, or an older one, is refused
  expect(await put(body)).toBe(409);
  expect(
    (
      await worker.fetch(
        new Request("https://x/homelab.json", {
          method: "PUT",
          body: body.replace('"tracking":237', '"tracking":9999'),
          headers: {
            "Content-Length": String(body.length),
            Signature: "00".repeat(64),
          },
        }),
        env,
      )
    ).status,
  ).toBe(401);
  expect(
    (await worker.fetch(new Request("https://x/homelab.json"), env)).status,
  ).toBe(200);
  // no length, or a malformed one, is refused before the body is read
  for (const length of [undefined, "abc"])
    expect(
      (
        await worker.fetch(
          new Request("https://x/homelab.json", {
            method: "PUT",
            body,
            headers: length ? { "Content-Length": length } : {},
          }),
          env,
        )
      ).status,
    ).toBe(413);
});

test("the Worker takes the stacks only as names, within their limits", () => {
  const body = (stacks: unknown) =>
    JSON.stringify({ ...stats, at: now, stacks });
  const ok = (stacks: unknown) => parse(body(stacks), now) !== null;
  const stack = (id: string, services = ["web"]) => ({ id, services });
  // A server from before the stacks, and one with today's.
  expect(parse(JSON.stringify({ ...stats, at: now }), now)).not.toBeNull();
  expect(ok(snapshotStacks)).toBe(true);
  expect(ok([stack("a")])).toBe(true);
  expect(ok([stack("a", [])])).toBe(true);
  expect(ok([stack("a".repeat(40))])).toBe(true);
  // Names: lower case, digits and hyphens, not starting with a hyphen, 40 at most.
  for (const id of [
    "Backup",
    "-x",
    "a_b",
    "a b",
    "a.b",
    "",
    "a".repeat(41),
    "<b>hi</b>",
    "café",
    "a\n",
  ]) {
    expect(ok([stack(id)]), `stack ${JSON.stringify(id)}`).toBe(false);
    expect(ok([stack("a", [id])]), `service ${JSON.stringify(id)}`).toBe(false);
  }
  for (const v of [null, 1, true, {}]) {
    expect(ok([stack("a", [v as never])])).toBe(false);
    expect(ok([{ id: v, services: [] }])).toBe(false);
  }
  // The shape: a list of {id, services} and nothing else.
  for (const stacks of [
    null,
    "backup",
    {},
    [],
    [[]],
    ["backup"],
    [{ id: "a" }],
    [{ services: [] }],
    [{ ...stack("a"), status: "up" }],
    [{ id: "a", services: "web" }],
  ])
    expect(ok(stacks), JSON.stringify(stacks)).toBe(false);
  // None twice.
  expect(ok([stack("a"), stack("a")])).toBe(false);
  expect(ok([stack("a", ["web", "web"])])).toBe(false);
  // At most 16 stacks of at most 32 services.
  const many = (n: number, f: (i: number) => string) =>
    Array.from({ length: n }, (_, i) => f(i));
  expect(ok(many(16, (i) => `s${i}`).map((id) => stack(id)))).toBe(true);
  expect(ok(many(17, (i) => `s${i}`).map((id) => stack(id)))).toBe(false);
  expect(
    ok([
      stack(
        "a",
        many(32, (i) => `v${i}`),
      ),
    ]),
  ).toBe(true);
  expect(
    ok([
      stack(
        "a",
        many(33, (i) => `v${i}`),
      ),
    ]),
  ).toBe(false);
});

test("the Worker's size limit takes today's body with room to spare, and no more", async () => {
  // As the server sends it, compact, with every number at its widest.
  const today = JSON.stringify({
    ...stats,
    at: 9_999_999_999,
    tracking: 9_999_999,
    londonHour: 9_999_999,
    stacks: snapshotStacks,
  });
  expect(MAX_BYTES - today.length).toBeGreaterThan(400);
  const kv = new Map<string, string>();
  const env: Env = {
    STATS: {
      get: async (k) => kv.get(k) ?? null,
      put: async (k, v) => void kv.set(k, v),
    },
    HOMELAB_PUBLIC_KEY: "00".repeat(32),
  };
  const status = async (length: number) =>
    (
      await worker.fetch(
        new Request("https://x/homelab.json", {
          method: "PUT",
          body: "x".repeat(length),
          headers: { "Content-Length": String(length), Signature: "" },
        }),
        env,
      )
    ).status;
  // Past the limit, refused for its size; within it, read and refused for
  // its signature.
  expect(await status(MAX_BYTES + 1)).toBe(413);
  expect(await status(MAX_BYTES)).toBe(401);
});

test("a GET says which city served it", async () => {
  const kv = new Map<string, string>([
    // A body stored by a server from before the stacks.
    ["latest", JSON.stringify({ ...stats, at: now })],
  ]);
  const env: Env = {
    STATS: {
      get: async (k) => kv.get(k) ?? null,
      put: async (k, v) => void kv.set(k, v),
    },
    HOMELAB_PUBLIC_KEY: "",
  };
  const get = async (cf?: object) => {
    const request = new Request("https://x/homelab.json");
    // Cloudflare's own property on a request; Node's has none.
    if (cf) Object.defineProperty(request, "cf", { value: cf });
    return (await worker.fetch(request, env)).json();
  };
  expect(await get({ colo: "LHR" })).toEqual({
    ...stats,
    at: now,
    edge: "London",
  });
  expect((await get({ colo: "ZZZ" })).edge).toBe("ZZZ");
  expect((await get({})).edge).toBeNull();
  expect((await get()).edge).toBeNull();
  expect(edgeCity("EWR")).toBe("Newark");
  expect(edgeCity(42)).toBeNull();
  // With the stacks, they come back as they were stored.
  kv.set(
    "latest",
    JSON.stringify({ ...stats, at: now, stacks: snapshotStacks }),
  );
  expect((await get({ colo: "LHR" })).stacks).toEqual(snapshotStacks);
});

// The Workers runtime takes each of the script's exports as an entry point
// and will not start with any other kind: an exported number stopped
// `wrangler dev` (the dry run in pnpm check does not run the script).
test("the Worker exports only its handler and functions", () => {
  for (const [name, value] of Object.entries(entry))
    expect(
      name === "default" || typeof value === "function",
      `export ${name}`,
    ).toBe(true);
});
