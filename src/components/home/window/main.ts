// The home window's scripts, started once from Window.astro. The top half
// (the focus, the writing list, the weather, the opening round) loads with
// the page; the lower half is fetched when it is near.
import { onceSeen, still } from "../../../motion/in-view";
import { makeBoot } from "./boot";
import type { WindowCtx } from "./context";
import { makeFocus } from "./focus";
import { initWeather } from "./weather";
import { makeWriting } from "./writing";

// How long the lower half's code may take to arrive before the projects are
// shown without it, in ms.
const LOWER_WAIT = 8000;

function start(win: HTMLElement, app: HTMLElement) {
  const boot = makeBoot(app);
  const focus = makeFocus(app, boot);
  const writing = makeWriting(win, app);
  const ctx: WindowCtx = { win, app, still, focus, posts: writing.posts, boot };

  // Where the focus is and what the phone's readout shows both follow the
  // scroll: looked at once a frame, however often the events come.
  let queued = false;
  const look = () => {
    queued = false;
    focus.track();
    writing.track();
  };
  const ask = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(look);
  };
  window.addEventListener("scroll", ask, { passive: true });
  window.addEventListener("resize", ask);
  boot.onEnd(look);
  look();

  // skills: hovering a row says in the border when that skill began.
  const note = app.querySelector<HTMLElement>("[data-sk-note]");
  if (note) {
    const rest = note.textContent;
    for (const row of app.querySelectorAll<HTMLElement>("[data-note]")) {
      row.addEventListener("pointerenter", () => {
        note.textContent = row.dataset.note ?? rest;
      });
      row.addEventListener("pointerleave", () => {
        note.textContent = rest;
      });
    }
  }

  // The lower half's code loads when the picker or a figure comes within
  // half a screen, or takes the keyboard: at once on a desktop, not until
  // most of the writing list has gone by on a phone. If it cannot load, or
  // has not within LOWER_WAIT, the projects fall back to what the page is
  // without it: every figure drawn, one under another, and no picker with
  // nothing behind it. That is then how they stay: code that turns up after
  // the fallback is not started. Nor is it asked for where the inline script
  // has already stopped waiting for this file and taken data-live off: the
  // top half still starts then, over the projects as a stack.
  const lower = app.querySelectorAll<HTMLElement>('[data-pn="pick"], .pn--fig');
  let asked = false;
  const load = () => {
    if (asked || !("live" in app.dataset)) return;
    asked = true;
    let left = false;
    const leave = () => {
      left = true;
      app.classList.remove("is-armed");
      delete app.dataset.live;
    };
    const wait = setTimeout(leave, LOWER_WAIT);
    import("./projects")
      .then((m) => {
        if (left) return;
        clearTimeout(wait);
        m.initProjects(ctx);
      })
      .catch(() => {
        clearTimeout(wait);
        leave();
      });
  };
  onceSeen(lower, load, { rootMargin: "50% 0px" });
  for (const el of lower) el.addEventListener("focusin", load, { once: true });

  // A page the browser is preparing ahead of a click (the speculation rules
  // in Head.astro) keeps the opening round for when it is shown.
  const hidden = document as Document & { prerendering?: boolean };
  if (hidden.prerendering)
    document.addEventListener("prerenderingchange", boot.start, { once: true });
  else boot.start();

  // Last, so the Glasgow panel fills only where everything above started: if
  // it did not, the panel keeps its dashes and its own word for why.
  initWeather(app, boot);
}

const win = document.querySelector<HTMLElement>(".win");
const app = win?.querySelector<HTMLElement>(".win__app");
if (win && app) {
  try {
    start(win, app);
    // The inline script waits for this mark. Set last, so that if anything
    // above throws it is the page without scripts that is left, at once and
    // whole: nothing dim, no figure blank, no picker.
    app.dataset.ready = "";
  } catch (err) {
    app.classList.remove("is-boot", "is-armed");
    delete app.dataset.live;
    throw err;
  }
}
