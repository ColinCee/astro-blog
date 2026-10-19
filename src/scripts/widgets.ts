// Interactive figures, loaded by BlogPost.astro only on posts that have a
// [data-widget] element. Each widget reads its numbers from data- attributes in
// the Markdown, so the post stays the one place its figures live.

const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = new Intl.NumberFormat("en-GB");

function duration(s: number): string {
  if (s < 90) return `${Math.round(s)} s`;
  if (s < 5400) return `${Math.round(s / 60)} min`;
  return `${(s / 3600).toFixed(1)} h`;
}

// Race: how far each setup gets through the same training budget as the
// clock runs. data-ticks is the budget; each lane has data-secs, the time it
// took to train that budget.
function race(root: HTMLElement) {
  const ticks = Number(root.dataset.ticks);
  const max = Number(root.dataset.max); // seconds on the clock at the right end
  const lanes = [...root.querySelectorAll<HTMLElement>("[data-secs]")];
  const slider = root.querySelector<HTMLInputElement>("input")!;
  const clock = root.querySelector<HTMLOutputElement>("output")!;
  const play = root.querySelector<HTMLButtonElement>("button")!;
  const draw = () => {
    // Cubic, so the first minutes get most of the slider: 12 h and 4 min share it.
    const t = (Number(slider.value) / 1000) ** 3 * max;
    clock.value = duration(t);
    for (const lane of lanes) {
      const secs = Number(lane.dataset.secs);
      const done = Math.min(1, t / secs);
      lane.querySelector<HTMLElement>("i")!.style.setProperty("--w", String(done));
      lane.querySelector("b")!.textContent =
        done >= 1 ? `done in ${duration(secs)}` : `${fmt.format(Math.round(done * ticks))} ticks`;
      lane.classList.toggle("cmp--after", done >= 1);
    }
  };
  let raf = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    play.textContent = "Play";
  };
  play.addEventListener("click", () => {
    if (raf) return stop();
    if (Number(slider.value) >= 1000) slider.value = "0";
    play.textContent = "Pause";
    let last = performance.now();
    const step = (now: number) => {
      // 12 seconds of real time for the whole clock.
      slider.value = String(Math.min(1000, Number(slider.value) + ((now - last) / 12000) * 1000));
      last = now;
      draw();
      if (Number(slider.value) < 1000) raf = requestAnimationFrame(step);
      else stop();
    };
    raf = requestAnimationFrame(step);
  });
  slider.addEventListener("input", () => {
    stop();
    draw();
  });
  draw();
}

// Chain: one lost game as a row of decisions, the only reward at the end.
// Plain Q-learning updates on random moves from the game (as replay does)
// show how slowly that end signal reaches the early moves; the 2018 penalty
// puts a signal on every move at once.
function chain(root: HTMLElement) {
  const n = Number(root.dataset.moves);
  const gamma = 0.99;
  const alpha = 0.5;
  const svg = root.querySelector("svg")!;
  const w = 600 / n;
  const cells: SVGRectElement[] = [];
  for (let i = 0; i < n; i++) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", String(i * w));
    r.setAttribute("y", "18");
    r.setAttribute("width", String(Math.max(0.5, w - 0.6)));
    r.setAttribute("height", "34");
    svg.append(r);
    cells.push(r);
  }
  const slider = root.querySelector<HTMLInputElement>("input")!;
  const out = root.querySelector<HTMLOutputElement>("output")!;
  const toggle = root.querySelector<HTMLButtonElement>("button")!;
  const reached = root.querySelector<HTMLElement>("[data-reached]")!;
  const draw = () => {
    const updates = Math.round(Number(slider.value) ** 2 / 25); // finer at the start
    const penalty = toggle.getAttribute("aria-pressed") === "true";
    const v = new Float64Array(n + 1);
    let seed = 7; // same random moves every time, so dragging back and forth is stable
    for (let k = 0; k < updates; k++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const i = seed % n;
      const end = i === n - 1;
      const r = (end ? -1 : 0) + (penalty ? -0.5 : 0);
      const target = r + (end ? 0 : gamma * v[i + 1]);
      v[i] += alpha * (target - v[i]);
    }
    let first = n;
    for (let i = 0; i < n; i++) {
      const strength = Math.min(1, Math.abs(v[i]));
      if (strength > 0.01 && i < first) first = i;
      cells[i].style.fill = `color-mix(in oklch, var(--accent) ${Math.round(strength * 100)}%, var(--panel))`;
    }
    out.value = fmt.format(updates);
    reached.textContent = first === n ? "none yet" : first === 0 ? "every move" : `the last ${n - first}`;
  };
  slider.addEventListener("input", draw);
  toggle.addEventListener("click", () => {
    toggle.setAttribute("aria-pressed", String(toggle.getAttribute("aria-pressed") !== "true"));
    draw();
  });
  draw();
}

// Reveal: a button that shows the figure's hidden layer (.reveal) and hides
// what it replaces (.hide-on-reveal). Used for "now add the baseline".
function reveal(root: HTMLElement) {
  const btn = root.querySelector<HTMLButtonElement>("button")!;
  root.classList.add("is-armed");
  btn.addEventListener("click", () => {
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(on));
    root.classList.toggle("is-revealed", on);
  });
}

const widgets: Record<string, (el: HTMLElement) => void> = { race, chain, reveal };
document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
  widgets[el.dataset.widget!]?.(el);
});
export {};
void still;
