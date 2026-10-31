import { expect, type Page, test } from "@playwright/test";
import { parse } from "../worker/index.ts";

// The home server's numbers (worker/index.ts) in the home-lab and
// flight-tracker figures. The dev server has no Worker, so each test answers
// /homelab.json itself or leaves it to 404.

const now = Math.floor(Date.now() / 1000);
const stats = {
  at: now - 120,
  allUp: true,
  blocked: 1212,
  tracking: 237,
  londonHour: 107,
  haDays: 1,
  backupOk: true,
};

const open = async (page: Page, name: string) => {
  const pick = page.locator("[data-pj-pick]", { hasText: name });
  await pick.scrollIntoViewIfNeeded();
  await pick.click();
  return page.locator("[data-pj-item].is-on");
};

test("the figures show the server's numbers, and the dots go green", async ({
  page,
}) => {
  await page.route("**/homelab.json", (r) => r.fulfill({ json: stats }));
  await page.goto("/");
  const lab = await open(page, "home-lab");
  await expect(lab.locator(".pj__cap")).toContainText("live, 2 min ago");
  await expect(lab.locator(".dg--lab")).toHaveAttribute("data-up", "");
  await expect(lab.locator(".lab")).toContainText("blocking 1,212 ips");
  await expect(lab.locator(".lab")).toContainText("up 1 day");
  await expect(lab.locator(".lab")).toContainText("restic, nightly · last ok");
  const radar = await open(page, "flight-tracker");
  await expect(radar.locator(".pj__cap")).toContainText("live, 2 min ago");
  await expect(radar.locator(".rd__nodes")).toContainText("237");
  await expect(radar.locator(".rd__nodes")).toContainText("107");
});

test("old numbers say when they were seen and leave the dots grey", async ({
  page,
}) => {
  await page.route("**/homelab.json", (r) =>
    r.fulfill({ json: { ...stats, at: now - 3 * 3600 } }),
  );
  await page.goto("/");
  const lab = await open(page, "home-lab");
  await expect(lab.locator(".pj__cap")).toContainText("last seen 3 h ago");
  await expect(lab.locator(".dg--lab")).not.toHaveAttribute("data-up");
  await expect(lab.locator(".lab")).not.toContainText("last ok");
});

test("without the server, the dashes stay and the caption says offline", async ({
  page,
}) => {
  await page.goto("/");
  const lab = await open(page, "home-lab");
  await expect(lab.locator(".pj__cap")).toContainText("offline");
  await expect(lab.locator(".lab")).toContainText("blocking – ips");
});

test("the Worker accepts only the known numbers, freshly gathered", () => {
  const body = (o: object) => JSON.stringify({ ...stats, at: now, ...o });
  expect(parse(body({}), now)).not.toBeNull();
  expect(parse(body({ tracking: null }), now)).not.toBeNull();
  expect(parse(body({ host: "x" }), now)).toBeNull();
  expect(parse(body({ blocked: "<b>hi</b>" }), now)).toBeNull();
  expect(parse(body({ blocked: -1 }), now)).toBeNull();
  expect(parse(body({ allUp: 1 }), now)).toBeNull();
  expect(parse(body({ at: now - 601 }), now)).toBeNull();
  expect(parse(body({ at: now + 30 }), now)).not.toBeNull();
  expect(parse(body({ at: now + 61 }), now)).toBeNull();
  expect(parse("[]", now)).toBeNull();
  expect(parse("nope", now)).toBeNull();
});
