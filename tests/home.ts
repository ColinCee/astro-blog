import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

// What the home window's specs share: the projects it should be showing, and
// a tab that can be sent to the background and brought back.

// The projects by id, in the order the window lists them, read from the file
// it is built from: a project added there needs no change in a test.
export const projects = (
  JSON.parse(readFileSync("src/data/projects.json", "utf8")) as {
    id: string;
    order: number;
  }[]
)
  .sort((a, b) => a.order - b.order)
  .map((p) => p.id);

// The home lab's stacks as the page has them before the server answers: the
// dev server's rows (src/components/home/window/data.ts).
export const snapshotStacks = (
  JSON.parse(readFileSync("src/data/homelab-stacks.snapshot.json", "utf8")) as {
    stacks: { id: string; services: string[] }[];
  }
).stacks;

// The longest name of a city Cloudflare serves from, the most room the
// colincheung.dev figure's "served from" line can be asked for.
export const longestCity = Object.values(
  (
    JSON.parse(readFileSync("worker/edge-cities.snapshot.json", "utf8")) as {
      places: Record<string, string>;
    }
  ).places,
)
  .map((place) => place.split(", ")[0])
  .reduce((a, b) => (b.length > a.length ? b : a));

// Hides the tab or shows it again, as the page sees it: a test's own tab is
// always the one in front, so what the page reads is changed and the event
// sent by hand.
export const hide = (page: Page, hidden: boolean) =>
  page.evaluate((hidden) => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (hidden ? "hidden" : "visible"),
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
