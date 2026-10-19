// Interactive figures, loaded by BlogPost.astro only on posts that have a
// [data-widget] element. Each widget reads its numbers from data- attributes in
// the Markdown, so the post stays the one place its figures live.

const fmt = new Intl.NumberFormat("en-GB");

function duration(s: number): string {
  if (s < 90) return `${Math.round(s)} s`;
  if (s < 5400) return `${Math.round(s / 60)} min`;
  const h = s / 3600;
  return `${h >= 9.95 ? Math.round(h) : h.toFixed(1)} h`;
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
        done >= 1 ? `done in ${duration(secs)}` : `${fmt.format(Math.round(done * ticks))} ${root.dataset.unit ?? "ticks"}`;
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
    svg.appendChild(r);
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
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
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

// Q-view: a recording with the network's value for each move drawn under it,
// from the recorder's JSON (one entry per decision, with the tick it was made).
type Decision = { tick: number; action: string; q?: number[] };
async function qview(root: HTMLElement) {
  const video = root.querySelector("video")!;
  const box = root.querySelector<HTMLElement>(".qbars")!;
  const data: any = await (await fetch(root.dataset.src!)).json();
  const names: string[] = data.action_names.map((n: string) =>
    n.replace(/^ACTION_/, "").toLowerCase().replace("use", "shoot"),
  );
  // Frame i of the video shows the screen after tick i.
  const fps: number = data.video.fps;
  const ticksPerFrame: number = data.video.ticks_per_frame;
  const decisions: Decision[] = data.decisions.filter((d: Decision) => d.q);
  const rows = names.map((n) => {
    const row = document.createElement("div");
    row.className = "cmp";
    row.innerHTML = `<span>${n}</span><i style="--w:0"></i><b></b>`;
    box.appendChild(row);
    return row;
  });
  let last = -1;
  const draw = () => {
    const tick = video.currentTime * fps * ticksPerFrame;
    let lo = 0;
    let hi = decisions.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (decisions[mid].tick <= tick) lo = mid;
      else hi = mid - 1;
    }
    if (lo === last) return;
    last = lo;
    const d = decisions[lo];
    const q = d.q!;
    const min = Math.min(...q);
    const span = Math.max(...q) - min || 1;
    rows.forEach((row, i) => {
      row.querySelector<HTMLElement>("i")!.style.setProperty("--w", String(0.04 + (0.96 * (q[i] - min)) / span));
      row.querySelector("b")!.textContent = q[i].toFixed(2);
      row.classList.toggle("cmp--after", data.action_names[i] === d.action);
    });
  };
  const loop = () => {
    draw();
    if (!video.paused) requestAnimationFrame(loop);
  };
  video.addEventListener("play", () => requestAnimationFrame(loop));
  video.addEventListener("seeked", draw);
  draw();
}


// Iterate: a pinned figure while story steps scroll past. Each step carries
// data-t, the training clock (seconds) when it reaches the reading line; the
// clock is interpolated between steps. Each setup runs one idea per training
// run, so the counters show ideas tested. Without JS or under reduced motion
// the steps are plain paragraphs and the figure shows the final state.
function iterate(root: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.classList.add("is-armed");
  const steps = [...root.querySelectorAll<HTMLElement>("[data-t]")];
  const clock = root.querySelector<HTMLOutputElement>("output")!;
  const lanes = [...root.querySelectorAll<HTMLElement>("[data-run]")];
  let queued = false;
  const draw = () => {
    queued = false;
    const line = window.innerHeight * 0.75;
    let t = 0;
    for (let k = 0; k < steps.length; k++) {
      const top = steps[k].getBoundingClientRect().top;
      if (top > line) {
        if (k > 0) {
          const prev = steps[k - 1].getBoundingClientRect().top;
          const f = (line - prev) / (top - prev);
          const a = Number(steps[k - 1].dataset.t);
          t = a + f * (Number(steps[k].dataset.t) - a);
        }
        break;
      }
      t = Number(steps[k].dataset.t);
    }
    clock.value = duration(t);
    steps.forEach((s) => s.classList.toggle("is-on", s.getBoundingClientRect().top <= line));
    for (const lane of lanes) {
      const run = Number(lane.dataset.run);
      const ideas = Math.floor(t / run + 1e-9);
      const part = t / run - ideas;
      lane.querySelector<HTMLElement>("i")!.style.setProperty("--w", String(ideas && part < 1e-6 ? 1 : part));
      lane.querySelector("b")!.textContent =
        ideas === 0 ? `run 1: ${Math.round(part * 100)}%` : `${ideas} idea${ideas === 1 ? "" : "s"} tested`;
      lane.classList.toggle("cmp--after", ideas > 1);
    }
  };
  const ask = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(draw);
    }
  };
  window.addEventListener("scroll", ask, { passive: true });
  window.addEventListener("resize", ask);
  draw();
}

// Ladder: a step chart of speed changes. Each step is a focusable column;
// choosing one fills the panel below with what changed and by how much.
type Step = { name: string; before: number; after: number; note?: string };
function ladder(root: HTMLElement) {
  const steps: Step[] = JSON.parse(root.querySelector("script")!.textContent!);
  const svg = root.querySelector("svg")!;
  const out = root.querySelector<HTMLElement>("[data-out]")!;
  const W = 320, H = 170, L = 34, R = 8, T = 12, B = 22;
  const lo = Math.log10(20), hi = Math.log10(4000);
  const y = (v: number) => T + (H - T - B) * (1 - (Math.log10(v) - lo) / (hi - lo));
  const dx = (W - L - R) / steps.length;
  const ns = "http://www.w3.org/2000/svg";
  const el = (tag: string, attrs: Record<string, string | number>) => {
    const e = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    svg.appendChild(e);
    return e;
  };
  for (const v of [30, 100, 300, 1000, 3000]) {
    el("line", { class: "ax", x1: L, x2: W - R, y1: y(v), y2: y(v) });
    el("text", { x: L - 5, y: y(v) + 4, "text-anchor": "end" }).textContent = fmt.format(v);
  }
  let pts = "";
  steps.forEach((s, i) => (pts += ` ${L + i * dx},${y(s.after)} ${L + (i + 1) * dx},${y(s.after)}`));
  el("polyline", { class: "ln", points: pts.trim() });
  const risers = steps.map((s, i) =>
    el("line", { class: "riser", x1: L + i * dx, x2: L + i * dx, y1: y(s.before), y2: y(s.after) }),
  );
  const hits = steps.map((s, i) => {
    const r = el("rect", { class: "hit", x: L + i * dx, y: T, width: dx, height: H - T - B, tabindex: 0, role: "button" });
    r.setAttribute("aria-label", `${s.name}: ${s.before} to ${s.after} frames per second`);
    return r;
  });
  el("text", { x: L, y: H - 6 }).textContent = "2018";
  el("text", { x: W - R, y: H - 6, "text-anchor": "end" }).textContent = "2026";
  const pick = (i: number) => {
    const s = steps[i];
    risers.forEach((r, j) => r.classList.toggle("is-on", j === i));
    hits.forEach((r, j) => r.classList.toggle("is-on", j === i));
    const x = s.after / s.before;
    out.innerHTML = `<b>${i + 1}. ${s.name}</b> <span>${fmt.format(s.before)} → ${fmt.format(s.after)} frames/s, <strong>×${x.toFixed(1)}</strong></span>${s.note ? `<small>${s.note}</small>` : ""}`;
  };
  hits.forEach((r, i) => {
    r.addEventListener("mouseenter", () => pick(i));
    r.addEventListener("focus", () => pick(i));
    r.addEventListener("click", () => pick(i));
  });
  let best = 0;
  steps.forEach((s, i) => s.after / s.before > steps[best].after / steps[best].before && (best = i));
  pick(best);
}

const widgets: Record<string, (el: HTMLElement) => void> = { race, chain, reveal, qview, iterate, ladder };
document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
  widgets[el.dataset.widget!]?.(el);
});
export {};
