// The window's lower half: the project picker, its readout, the five figures
// and the marks that tie a project to its posts. It is a file of its own so
// that it loads only when the lower half is near (main.ts decides when), not
// with the first screen. The radar is a further file, loaded from here when
// its panel is near.
//
// Everything it shows is already in the page (Picker.astro, Figures.astro).
// This moves classes, text and `hidden`, never markup: which project is open,
// which figures have been drawn, the numbers only the browser knows.
import cards from "../../../data/anki-cards.json";
import { onceSeen } from "../../../scripts/in-view";
import type { WindowCtx } from "./context";
import type { makeRadar } from "./radar";
import { initStats } from "./stats";
import { tones } from "./tones";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function initProjects(ctx: WindowCtx): void {
  const { app, still, focus, boot } = ctx;
  const all = <T extends HTMLElement = HTMLElement>(sel: string) => [
    ...app.querySelectorAll<T>(sel),
  ];
  const one = <T extends Element = HTMLElement>(sel: string) =>
    app.querySelector<T>(sel);

  const panels = all(".pn--fig");
  const picks = all<HTMLButtonElement>("[data-pick]");
  const readouts = all("[data-rv]");
  const fig = (el: HTMLElement) => el.querySelector<HTMLElement>(".fg");

  // Beside one another (60rem and wider) the projects are a picker; under
  // that they are a stack and the picker is not shown. The CSS decides which
  // on the same line; this keeps the names and roles in step with it.
  const wide = matchMedia("(min-width: 60rem)");
  const picker = () => wide.matches;
  let open = Math.max(
    0,
    panels.findIndex((el) => el.classList.contains("is-open")),
  );

  const layout = () => {
    const pk = picker();
    panels.forEach((el, i) => {
      el.classList.toggle("is-open", i === open);
      // Stacked, each is a panel in its own right and takes the focus alone.
      el.dataset.pn = pk ? "fig" : `fig-${i}`;
      if (pk) el.setAttribute("role", "tabpanel");
      else el.removeAttribute("role");
    });
  };

  // ---- What the open project is tied to elsewhere in the window: its posts
  // in the writing list and its related projects in this one. Marked only
  // while the projects have the focus, and only beside the picker. The ties
  // are the data's (data-posts, data-with), not this file's. ----
  const mark = () => {
    const at = focus.current();
    const on = !boot.running() && picker() && (at === "pick" || at === "fig");
    const pick = picks[open];
    const tie = on ? pick?.dataset.posts : undefined;
    const related = on ? (pick?.dataset.with ?? "").split(" ") : [];
    ctx.posts.mark((slug) => !!tie && (tie === "*" || slug.startsWith(tie)));
    for (const r of picks)
      r.classList.toggle("is-rel", related.includes(r.dataset.pick ?? ""));
  };
  focus.onChange(mark);

  // ---- A figure plays when it comes on screen: it draws itself once
  // (is-drawn), and what keeps moving runs while it is there (is-live) and
  // rests when it leaves. Armed by the inline script in Window.astro; where
  // it is not (reduced motion, or this code came late), everything is drawn
  // from the start and only is-live follows the screen. ----
  const armed = app.classList.contains("is-armed");
  const seen = new Set<Element>();
  // In the opening round the open figure waits for the focus to reach it, as
  // the other panels do.
  let figTurn = false;
  const play = (el: HTMLElement) => {
    if (boot.running() && picker() && !figTurn) return;
    fig(el)?.classList.add("is-drawn");
    if (el.dataset.f === "colincheung.dev") countMs();
  };
  const playSeen = () => {
    for (const el of panels) if (seen.has(el)) play(el);
  };
  // How much of a panel has to be on screen before it plays. Stacked, nearly
  // half, so it is watched. Beside the picker a quarter is enough: the arrow
  // keys bring a row into view, not the whole figure, and the panel they
  // open must not sit there empty. A panel too tall for the screen to hold
  // that much of (a short window, zoomed far in) plays once it fills half the
  // screen.
  const need = () => (picker() ? 0.25 : 0.45);
  // Cuts a figure back to nothing, without a transition, so it can draw
  // again.
  const blank = (f: HTMLElement | null | undefined) => {
    if (!armed || !f) return;
    f.classList.add("is-cut");
    f.classList.remove("is-drawn");
    void f.offsetWidth;
    f.classList.remove("is-cut");
  };
  boot.onVisit((name) => {
    if (name !== "fig") return;
    figTurn = true;
    playSeen();
  });
  boot.onEnd(() => {
    playSeen();
    mark();
  });

  // ---- The picker ----
  const pos = one("[data-pk-pos]");
  const choose = (i: number) => {
    const n = clamp(i, 0, picks.length - 1);
    if (n === open) return;
    open = n;
    picks.forEach((r, k) => {
      const on = k === open;
      r.classList.toggle("is-sel", on);
      r.setAttribute("aria-selected", String(on));
      r.tabIndex = on ? 0 : -1;
    });
    if (pos) pos.textContent = `${open + 1} of ${picks.length}`;
    readouts.forEach((r, k) => {
      r.hidden = k !== open;
    });
    if (picker()) {
      // The figure coming up starts blank and draws once the observer sees
      // it.
      const el = panels[open];
      blank(fig(el));
      layout();
      // If the observer has nothing new to report (opened, closed and opened
      // again within a frame), draw it anyway once it is plainly on screen.
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        const shown =
          Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (
          panels[open] === el &&
          r.height &&
          (shown >= r.height * need() || shown >= window.innerHeight * 0.5)
        )
          play(el);
      }, 400);
    }
    mark();
  };
  picks.forEach((r, i) => {
    r.addEventListener("click", () => {
      choose(i);
      // Not every browser focuses a button on click, and the arrow keys
      // need it.
      r.focus({ preventScroll: true });
    });
    r.addEventListener("focus", () => choose(i));
    // A moving mouse, not pointerenter: a still pointer that the page scrolls
    // under must not switch the figure.
    r.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") choose(i);
    });
  });
  // The arrow keys (and home, end) while the list has the keyboard; enter
  // opens the project's link. Handled on the list: nothing on document.
  one("[data-pk]")?.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const to: Record<string, number> = {
      ArrowDown: open + 1,
      ArrowUp: open - 1,
      Home: 0,
      End: picks.length - 1,
    };
    if (e.key === "Enter") {
      e.preventDefault();
      panels[open]?.querySelector<HTMLElement>(".pn__link")?.click();
    } else if (e.key in to) {
      e.preventDefault();
      choose(to[e.key]);
      picks[open].focus();
    }
  });

  // ---- pause: one hold for everything that moves on its own, the scope and
  // the tunnel's traffic, from either figure's button ----
  let held = false;
  const pauses = all<HTMLButtonElement>("[data-pause]");
  for (const b of pauses)
    b.addEventListener("click", () => {
      held = !held;
      app.classList.toggle("is-held", held);
      for (const x of pauses) {
        x.setAttribute("aria-pressed", String(held));
        x.textContent = held ? "play" : "pause";
      }
      // As the picker's rows do: enter must press it again, in a browser
      // that does not focus a button on click too.
      b.focus({ preventScroll: true });
      runRadar();
    });

  // ---- flight-tracker: the scope. Its code is fetched the first time the
  // panel is within half a screen, which beside the picker means the first
  // time it is opened. It runs while it is seen, not held, and the tab is
  // showing. ----
  const flight = panels.find((el) => el.dataset.f === "flight-tracker");
  const canvas = flight?.querySelector<HTMLCanvasElement>("[data-radar]");
  let radar: ReturnType<typeof makeRadar> | undefined;
  const runRadar = () =>
    radar?.run(!!flight && seen.has(flight) && !held && !document.hidden);
  if (flight && canvas) {
    onceSeen(
      [flight],
      () => {
        import("./radar")
          .then((m) => {
            radar = m.makeRadar(canvas, still);
            runRadar();
          })
          // Without it the scope is an empty panel; the counts still show.
          .catch(() => {});
      },
      { rootMargin: "50% 0px" },
    );
    document.addEventListener("visibilitychange", runRadar);
  }

  // ---- dissertation: the pointer reads both runs at any hour, as it reads
  // the temperature line above. The curves are the SVG's own paths, asked
  // where they are at that x, so no second copy of them is kept here. ----
  const plot = one("[data-ch-plot]");
  const cross = one("[data-ch-cross]");
  const box = plot?.querySelector("svg")?.viewBox.baseVal;
  if (plot && cross && box) {
    const note = one("[data-ch-note]");
    const curves = [
      ...plot.querySelectorAll<SVGPathElement>("[data-ch-curve]"),
    ];
    const dots = [...plot.querySelectorAll<HTMLElement>("[data-ch-dot]")];
    // A run only moves forward in time, so the point at a given x is found
    // by halving the path's length.
    const yAt = (path: SVGPathElement, x: number) => {
      let a = 0;
      let b = path.getTotalLength();
      for (let k = 0; k < 16; k++) {
        const mid = (a + b) / 2;
        if (path.getPointAtLength(mid).x < x) a = mid;
        else b = mid;
      }
      return path.getPointAtLength((a + b) / 2).y;
    };
    plot.addEventListener("pointermove", (e) => {
      const r = plot.getBoundingClientRect();
      const f = clamp((e.clientX - r.left) / r.width, 0, 1);
      cross.style.left = `${f * 100}%`;
      cross.hidden = false;
      dots.forEach((dot, k) => {
        const y = yAt(curves[k], box.x + f * box.width);
        dot.style.left = `${f * 100}%`;
        dot.style.top = `${((y - box.y) / box.height) * 100}%`;
        dot.hidden = false;
      });
      // The axis is a 12-hour run; read to the quarter hour.
      const m = Math.round((f * 12 * 60) / 15) * 15;
      if (note)
        note.textContent = `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min into a run`;
    });
    plot.addEventListener("pointerleave", () => {
      cross.hidden = true;
      for (const dot of dots) dot.hidden = true;
      if (note) note.textContent = "";
    });
  }

  // ---- anki-chinese: the next card from the deck, and its two tones. The
  // page shows the first card; the deck itself is part of this file. ----
  const anki = one("[data-anki]");
  if (anki) {
    const put = (hook: string, text: string, root: Element = anki) => {
      const el = root.querySelector(`[${hook}]`);
      if (el) el.textContent = text;
    };
    const card = anki.querySelector<HTMLElement>("[data-anki-card]");
    const shown = one("[data-card-at]");
    let at = 0;
    const next = one("[data-anki-next]");
    next?.addEventListener("click", () => {
      // Kept on the button, so enter shows the card after this one.
      next.focus({ preventScroll: true });
      at = (at + 1) % cards.length;
      const c = cards[at];
      const tone = tones(c);
      put("data-anki-hanzi", c.hanzi);
      put("data-anki-mean", c.meaning);
      for (const [key, say, t] of [
        ["mandarin", c.pinyin, tone.mandarin],
        ["cantonese", c.jyutping, tone.cantonese],
      ] as const) {
        const voice = anki.querySelector(`[data-tone="${key}"]`);
        if (!voice) continue;
        put("data-tone-say", say, voice);
        put("data-tone-n", String(t.n || "–"), voice);
        voice.querySelector("polyline")?.setAttribute("points", t.points);
        const end = voice.querySelector<HTMLElement>(".plot__end");
        if (end) {
          end.hidden = !t.points;
          end.style.top = `${t.end}%`;
        }
      }
      if (shown) shown.textContent = String(at + 1);
      // The new card comes up, and its lines draw again.
      if (card) {
        card.classList.remove("is-swap");
        void card.offsetWidth;
        card.classList.add("is-swap");
      }
      const f = anki.closest<HTMLElement>(".fg");
      blank(f);
      f?.classList.add("is-drawn");
    });
  }

  // ---- colincheung.dev: this visit's own time to first byte, from the
  // browser's timing of the page request. Without it the dashes stay. In the
  // figure it counts up once, after the line has reached "you". ----
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const ttfb =
    nav && nav.responseStart > 0
      ? Math.max(1, Math.round(nav.responseStart - nav.startTime))
      : null;
  if (ttfb !== null) {
    for (const el of all("[data-ttfb]")) {
      el.textContent = String(ttfb);
      el.classList.add("is-set");
    }
    const note = one("[data-rt-note]");
    if (note) note.textContent = "measured in your browser";
  }
  let counted = false;
  function countMs() {
    const el = one(".rt [data-ttfb]");
    if (counted || ttfb === null || !armed || !el) return;
    counted = true;
    // The figure's own timing: the stops arrive 0.3 s apart, so the count
    // holds at 0 until the last one has, then runs for as long again.
    const HOLD = 900;
    let t0 = 0;
    const frame = (t: number) => {
      t0 ||= t;
      const e = 1 - (1 - clamp((t - t0 - HOLD) / HOLD, 0, 1)) ** 3;
      el.textContent = String(Math.round(ttfb * e));
      if (t - t0 < HOLD * 2) requestAnimationFrame(frame);
      else el.textContent = String(ttfb);
    };
    requestAnimationFrame(frame);
  }

  // ---- start ----
  layout();
  // Not armed, nothing waits to be drawn: every figure is there already.
  if (!armed) for (const el of panels) fig(el)?.classList.add("is-drawn");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const on =
            e.isIntersecting &&
            (e.intersectionRatio >= need() ||
              e.intersectionRect.height >= window.innerHeight * 0.5);
          if (on) seen.add(e.target);
          else seen.delete(e.target);
          e.target.classList.toggle("is-live", on);
          if (on) play(e.target as HTMLElement);
        }
        runRadar();
      },
      // The low steps are for the tall panel, of which half a screen is a
      // small part.
      { threshold: [0.05, 0.1, 0.15, 0.25, 0.45] },
    );
    for (const el of panels) io.observe(el);
  } else {
    // Nothing to say what is on screen: everything counts as seen.
    for (const el of panels) {
      seen.add(el);
      el.classList.add("is-live");
    }
  }
  // The pointer may already be on a figure that has just been renamed.
  if (!boot.running() && picker() && focus.current().startsWith("fig-"))
    focus.set("fig");
  else mark();
  wide.addEventListener("change", () => {
    layout();
    focus.set(focus.rest());
    focus.track();
    playSeen();
  });
  focus.track();
  initStats(app);
}
