// The window's opening round. Every panel is there from the first paint,
// dimmed (Window.astro's inline script sets is-boot). The focus goes once
// round the window, down the left column, across the bottom where the picker
// shows, and up to writing; each panel fills as it is reached (is-on): the
// favicon bar by bar, the blocks year by year, the line left to right, the
// lists row by row. Then it rests on writing.
//
// This file keeps the time. What a visit does to a panel is that panel's own
// business (onVisit); the dimming itself is CSS.
import type { WindowCtx } from "./context";

// The choreography's own timings, in ms: the wait before the first panel,
// one beat a panel (shorter when there are six to go round), and how long the
// last one has to fill before everything is released.
const LEAD = 250;
const BEAT = 650;
const BEAT_SIX = 540;
const TAIL = 1400;

export function makeBoot(
  app: HTMLElement,
): WindowCtx["boot"] & { start(): void } {
  // Not under reduced motion, and not if the module arrived so late that the
  // inline script had stopped waiting and shown everything.
  let running = app.classList.contains("is-boot");
  const visits: ((name: string) => void)[] = [];
  const ends: (() => void)[] = [];

  const visit = (name: string) => {
    for (const p of app.querySelectorAll<HTMLElement>(".pn"))
      if (p.dataset.pn === name) p.classList.add("is-on");
    for (const fn of visits) fn(name);
  };
  const end = () => {
    running = false;
    app.classList.remove("is-boot");
    for (const fn of ends) fn();
  };

  return {
    running: () => running,
    onVisit: (fn) => visits.push(fn),
    onEnd: (fn) => ends.push(fn),
    start() {
      if (!running) return;
      // The picker and its figure take a turn only where they show side by
      // side; stacked, each figure plays when it is scrolled to instead.
      const picker = app.querySelector<HTMLElement>('[data-pn="pick"]');
      const six = !!picker?.offsetParent;
      const round = six
        ? ["who", "skills", "wx", "pick", "fig", "writing"]
        : ["who", "skills", "wx", "writing"];
      const beat = six ? BEAT_SIX : BEAT;
      round.forEach((name, k) => {
        setTimeout(() => visit(name), LEAD + k * beat);
      });
      setTimeout(end, LEAD + (round.length - 1) * beat + TAIL);
    },
  };
}
