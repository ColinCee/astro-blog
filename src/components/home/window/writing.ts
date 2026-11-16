// The writing panel's selection. One row is selected (is-sel) and the
// readout under the list restates it: its file name, its result large, what
// the result measures. Hover or keyboard focus selects; so do j and k; and
// on a phone, where the readout rides the bottom of the screen, the row at
// the reading line is the selected one.
//
// The page arrives with the first row selected and its readout filled, so
// this only ever moves text that is already there: the result is a copy of
// the row's own cell, never markup built here.
import { statArrow } from "../../site/stat-arrow";
import type { WindowCtx } from "./context";

export function makeWriting(
  win: HTMLElement,
  app: HTMLElement,
): { posts: WindowCtx["posts"]; track(): void } {
  const panel = app.querySelector<HTMLElement>('[data-pn="writing"]')!;
  const rows = [...panel.querySelectorAll<HTMLAnchorElement>("[data-post]")];
  // No posts, no readout: nothing to select.
  if (!rows.length) return { posts: { rows, mark() {} }, track() {} };
  const one = (hook: string) => panel.querySelector<HTMLElement>(`[${hook}]`)!;
  const pv = {
    slug: one("data-pv-slug"),
    pos: one("data-pv-pos"),
    stat: one("data-pv-stat"),
    label: one("data-pv-label"),
    date: one("data-pv-date"),
    read: one("data-pv-read"),
  };
  const pos = one("data-wr-pos");
  let sel = 0;

  const select = (i: number) => {
    const n = Math.max(0, Math.min(rows.length - 1, i));
    if (n === sel) return;
    rows[sel].classList.remove("is-sel");
    sel = n;
    const row = rows[sel];
    row.classList.add("is-sel");
    pos.textContent = pv.pos.textContent = `${sel + 1} of ${rows.length}`;
    pv.slug.textContent = row.dataset.slug ?? "";
    pv.stat.replaceChildren(
      ...[...(row.querySelector(".wr__stat")?.children ?? [])]
        .filter((el) => !el.classList.contains("sr-only"))
        .map((el) => el.cloneNode(true)),
    );
    // A label can carry an arrow; the fonts have no glyph for it, so it is
    // the drawn one, as in the result.
    pv.label.textContent = "";
    (row.dataset.label ?? "").split("→").forEach((part, k) => {
      if (k) pv.label.insertAdjacentHTML("beforeend", statArrow);
      pv.label.append(part.trim());
    });
    pv.date.textContent = row.dataset.date ?? "";
    pv.read.textContent = row.dataset.read ?? "";
  };

  rows.forEach((row, i) => {
    row.addEventListener("pointerenter", () => select(i));
    row.addEventListener("focus", () => select(i));
  });

  // j and k move the selection (and the real focus, so enter opens it);
  // enter with nothing focused opens the selected post too. They are the
  // window's keys, not the page's: they act while the keyboard is in the
  // window, or is nowhere and at least half of the list is on screen. With
  // the keyboard on anything else (the nav, a link in the footer) they are
  // left alone, as they are with a modifier held or in a field.
  const nowhere = () =>
    !document.activeElement || document.activeElement === document.body;
  const live = () => {
    if (!nowhere()) return win.contains(document.activeElement);
    const r = panel.getBoundingClientRect();
    const seen = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return seen >= Math.min(r.height, window.innerHeight) * 0.5;
  };
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey)
      return;
    const at = e.target as HTMLElement;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(at.tagName) || at.isContentEditable)
      return;
    const move = e.key === "j" || e.key === "k";
    const open = e.key === "Enter" && nowhere();
    if ((!move && !open) || !live()) return;
    if (move) {
      select(sel + (e.key === "j" ? 1 : -1));
      rows[sel].focus();
    } else {
      rows[sel].click();
    }
  });

  // On a phone the readout pins to the bottom of the screen once a few rows
  // of the list are on it (is-pin; is-stuck while the list runs on under
  // it), and reads the last row whose top has passed the reading line. A row
  // the keyboard is on comes first while any of it is on screen: the readout
  // restates the row being acted on, not one the scroll happens to pass.
  const narrow = matchMedia("(max-width: 45.99rem)");
  const track = () => {
    if (!narrow.matches) {
      panel.classList.remove("is-pin", "is-stuck");
      return;
    }
    const vh = window.innerHeight;
    const page = document.documentElement.scrollHeight;
    // In a frame as tall as the page nothing scrolls: leave it at rest.
    if (page - vh <= 40) return;
    // Measured before anything is changed, so a frame lays out once.
    const box = panel.getBoundingClientRect();
    const at = rows.map((row) => row.getBoundingClientRect());
    const held = rows.findIndex((row) => row.matches(":focus-visible"));
    const pin = box.top < vh - 230;
    panel.classList.toggle("is-pin", pin);
    panel.classList.toggle("is-stuck", pin && box.bottom > vh + 1);
    if (held >= 0 && at[held].bottom > 0 && at[held].top < vh) {
      select(held);
      return;
    }
    // Near the end of the page the last rows cannot climb as high as the
    // line, so the line slides down to meet them.
    const left = Math.max(0, page - vh - window.scrollY);
    const last = at[at.length - 1].top - left;
    let line = vh * 0.42;
    if (last > line)
      line += (last - line + 4) * Math.max(0, 1 - left / (vh * 0.6));
    // The first row until one has passed the line.
    let n = at.length - 1;
    while (n > 0 && at[n].top > line) n--;
    select(n);
  };

  return {
    posts: {
      rows,
      mark(tied) {
        for (const row of rows)
          row.classList.toggle("is-rel", tied(row.dataset.slug ?? ""));
      },
    },
    track,
  };
}
