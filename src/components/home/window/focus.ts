// The window's one focus: a single panel at a time takes the accent
// (is-focus). With a pointer it follows the pointer; the keyboard takes it
// wherever it goes; on a phone or a touch screen, where nothing hovers, it
// follows the scroll: the panel at the middle of the screen.
import type { WindowCtx } from "./context";

export function makeFocus(
  app: HTMLElement,
  boot: WindowCtx["boot"],
): WindowCtx["focus"] {
  const narrow = matchMedia("(max-width: 45.99rem)");
  const touch = matchMedia("(hover: none)");
  const byScroll = () => narrow.matches || touch.matches;
  // Asked for each time: the lower half renames its panels when the layout
  // changes between a picker and a stack.
  const panels = () => app.querySelectorAll<HTMLElement>(".pn");
  const heard: (() => void)[] = [];
  let cur = "";

  const set = (name: string) => {
    cur = name;
    for (const p of panels())
      p.classList.toggle("is-focus", p.dataset.pn === name);
    for (const fn of heard) fn();
  };

  const rest = () => {
    const at = document.activeElement?.closest<HTMLElement>(".pn");
    return (at && app.contains(at) && at.dataset.pn) || "writing";
  };

  // The pointer moves the focus as it enters a panel, and leaving the window
  // puts it back at rest. Not during the opening round, which is moving it.
  app.addEventListener("pointerover", (e) => {
    if (boot.running() || byScroll()) return;
    const name = (e.target as Element).closest<HTMLElement>(".pn")?.dataset.pn;
    if (name && name !== cur) set(name);
  });
  app.addEventListener("pointerleave", () => {
    if (!boot.running() && !byScroll()) set(rest());
  });
  app.addEventListener("focusin", (e) => {
    const name = (e.target as Element).closest<HTMLElement>(".pn")?.dataset.pn;
    if (name) set(name);
  });

  let scrolled = false;
  const track = () => {
    const vh = window.innerHeight;
    // In a frame as tall as the page nothing scrolls: leave it at rest.
    const scrolls = document.documentElement.scrollHeight - vh > 40;
    if (!byScroll() || !scrolls) {
      // Back on a wide screen with a pointer.
      if (scrolled && !boot.running()) set(rest());
      scrolled = false;
      return;
    }
    scrolled = true;
    if (boot.running()) return;
    const mid = vh / 2;
    let best = "";
    let gap = Infinity;
    for (const p of panels()) {
      // Not shown at this width, or not the open project.
      if (!p.offsetParent) continue;
      const r = p.getBoundingClientRect();
      const d = mid < r.top ? r.top - mid : mid > r.bottom ? mid - r.bottom : 0;
      if (d < gap) {
        gap = d;
        best = p.dataset.pn ?? "";
      }
    }
    if (best && best !== cur) set(best);
  };

  // The opening round carries the focus from panel to panel; until its first
  // stop, no panel has it.
  boot.onVisit(set);
  set(boot.running() ? "" : rest());

  return {
    set,
    current: () => cur,
    rest,
    onChange: (fn) => heard.push(fn),
    track,
  };
}
