// The home server's numbers (worker/index.ts serves them at /homelab.json):
// how many planes the flight tracker is following, how many were bound for
// London in the past hour, whether every stack is up and which stacks it has
// deployed. The server gathers them every five minutes, and this fetches them
// as often while the tab is showing, and again when it is shown after being
// hidden. The Worker adds the city of Cloudflare's that answered.
//
// A number is real or it is a dash. Its age is always said beside it: "live,
// 2 min ago" while it is fresh, "last seen 3 h ago" once it is older than 20
// minutes, "offline" if the server never answered. The stacks and the city
// are not news, so they have no age: a list the server sent, however old,
// is still what it has deployed.

import { isStacks } from "../../../../worker/stacks";
import { drawStacks } from "./lab";

type Stats = Record<string, unknown>;

const FRESH_MIN = 20;
const REFETCH_MS = 300_000;

const fmt = (v: number) => Math.round(v).toLocaleString("en-GB");

export function initStats(root: HTMLElement) {
  const all = <T extends HTMLElement = HTMLElement>(hook: string) =>
    root.querySelectorAll<T>(`[${hook}]`);
  const ages = all("data-stats-age");
  const ups = all("data-stats-up");
  const lab = root.querySelector<HTMLElement>("[data-lab]");
  let stats: Stats | undefined;

  const sayAge = (words: string) => {
    for (const a of ages) a.textContent = words;
  };
  const say = () => {
    if (!stats) return;
    const mins = Math.max(
      0,
      Math.round((Date.now() / 1000 - Number(stats.at)) / 60),
    );
    const fresh = mins <= FRESH_MIN;
    const ago =
      mins < 2
        ? "just now"
        : mins < 120
          ? `${mins} min ago`
          : `${Math.round(mins / 60)} h ago`;
    sayAge(fresh ? `live, ${ago}` : `last seen ${ago}`);
    // "All up" is only worth saying while it is news.
    const up = fresh && !!stats.allUp;
    for (const u of ups) u.textContent = up ? "all up · " : "";
    // State for tests and future styling: no CSS reads data-up yet.
    lab?.toggleAttribute("data-up", up);
  };

  const load = () =>
    fetch("/homelab.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: Stats | null) => {
        // An answer that does not say when it was gathered is no answer: its
        // age could not be told.
        if (typeof s?.at !== "number") throw new Error("no age");
        stats = s;
        say();
        // Before the numbers: the rows it draws hold one of them.
        if (isStacks(s.stacks)) drawStacks(root, s.stacks);
        // A city's name, from the Worker's own list; a dash until it is.
        const edge =
          typeof s.edge === "string" && s.edge.length <= 60 ? s.edge : "";
        for (const el of all("data-edge")) {
          el.textContent = edge || "–";
          el.classList.toggle("is-set", !!edge);
        }
        for (const el of all("data-stat")) {
          const v = s[el.dataset.stat ?? ""];
          // Not reported this time: back to a dash, not the old number.
          const set = typeof v === "number";
          el.textContent = set ? fmt(v) : "–";
          el.classList.toggle("is-set", set);
        }
      })
      .catch(() => {
        // An earlier answer stands, a little older; with none, say so.
        if (stats) say();
        else sayAge("offline");
      });

  load();
  setInterval(() => {
    if (!document.hidden) load();
  }, REFETCH_MS);
  // Shown again, the numbers on the page may be hours old and the timer some
  // minutes from its next turn.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load();
  });
}
