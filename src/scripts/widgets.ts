// Interactive figures, loaded by BlogPost.astro only on posts that have a
// [data-widget] element. Each widget reads its numbers from data- attributes in
// the Markdown, so the post stays the one place its figures live.

const fmt = new Intl.NumberFormat("en-GB");


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
// Optional parts, used when the figure has them: [data-step] / [data-play]
// buttons to pause and move one decision at a time; [data-seen] with four cells
// showing the frames that decision saw (rows of the sprite sheet in data-stack,
// one per decision, from tools/stacks.py), each tappable to enlarge in
// [data-zoom]; [data-held-name] for the move it then holds; [data-at] for where
// the game is.
type Decision = { tick: number; action: string; score?: number; q?: number[] };
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
  const seen = root.querySelector<HTMLElement>("[data-seen]");
  const heldName = root.querySelector<HTMLElement>("[data-held-name]");
  const seenTicks = root.querySelector<HTMLElement>("[data-seen-ticks]");
  const at = root.querySelector<HTMLElement>("[data-at]");
  const zoom = root.querySelector<HTMLElement>("[data-zoom]");
  // On the figure, so the enlarged frame shares the sheet and the current row.
  if (seen && root.dataset.stack) {
    root.style.setProperty("--sheet", `url(${root.dataset.stack})`);
    root.style.setProperty("--n", String(decisions.length));
  }
  let zoomed = -1;
  const showZoom = () => {
    if (!zoom) return;
    zoom.hidden = zoomed < 0;
    if (zoomed < 0) return;
    zoom.style.setProperty("--i", String(zoomed));
    const d = decisions[Math.max(0, last)];
    zoom.querySelector("small")!.textContent = `tick ${d.tick - 3 + zoomed}`;
  };
  seen?.querySelectorAll<HTMLElement>("i").forEach((cell, i) => {
    cell.tabIndex = 0;
    cell.setAttribute("role", "button");
    cell.setAttribute("aria-label", `Enlarge frame ${i + 1} of 4`);
    const toggle = () => {
      zoomed = zoomed === i ? -1 : i;
      seen.querySelectorAll("i").forEach((c, j) => c.classList.toggle("is-on", j === zoomed));
      showZoom();
    };
    cell.addEventListener("click", toggle);
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
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
    show(lo);
  };
  // Fill everything from the data for decision i, so stepping works even
  // before the video has loaded a frame.
  function show(i: number) {
    if (i === last) return;
    last = i;
    const lo = i;
    const d = decisions[lo];
    const q = d.q!;
    const min = Math.min(...q);
    const span = Math.max(...q) - min || 1;
    rows.forEach((row, i) => {
      row.querySelector<HTMLElement>("i")!.style.setProperty("--w", String(0.04 + (0.96 * (q[i] - min)) / span));
      row.querySelector("b")!.textContent = q[i].toFixed(2);
      row.classList.toggle("cmp--after", data.action_names[i] === d.action);
    });
    root.style.setProperty("--k", String(lo));
    showZoom();
    if (seenTicks) seenTicks.textContent = `ticks ${d.tick - 3} to ${d.tick}`;
    if (heldName) heldName.textContent = names[data.action_names.indexOf(d.action)];
    if (at) at.textContent = `decision ${lo + 1} of ${decisions.length} · tick ${d.tick} · ${d.score ?? 0} points`;
  }
  const loop = () => {
    draw();
    if (!video.paused) requestAnimationFrame(loop);
  };
  video.addEventListener("play", () => requestAnimationFrame(loop));
  video.addEventListener("seeked", draw);
  draw();
  // BlogPost's autoplay holds this video until its data is ready; start it
  // now if it's on screen (and the reader allows motion).
  video.dataset.ready = "1";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!video.dataset.hold) video.play().catch(() => {});
    }, { threshold: 0.35 }).observe(video);

  // Controls. data-hold on the video tells BlogPost's autoplay-when-visible
  // observer to leave a video the reader paused alone.
  const playBtn = root.querySelector<HTMLButtonElement>("[data-play]");
  const setPlayBtn = () => {
    if (!playBtn) return;
    playBtn.setAttribute("aria-pressed", String(!video.paused));
    playBtn.textContent = video.paused ? "play" : "pause";
  };
  video.addEventListener("play", setPlayBtn);
  video.addEventListener("pause", setPlayBtn);
  setPlayBtn();
  playBtn?.addEventListener("click", () => {
    if (video.paused) {
      delete video.dataset.hold;
      video.play().catch(() => {});
    } else {
      video.dataset.hold = "1";
      video.pause();
    }
  });
  root.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((b) =>
    b.addEventListener("click", () => {
      video.dataset.hold = "1";
      video.pause();
      const i = Math.min(decisions.length - 1, Math.max(0, last + Number(b.dataset.step)));
      show(i);
      // Land in the middle of the frame that shows the decision's tick; a
      // video that hasn't loaded yet (preload="none") is loaded first.
      const seek = () => (video.currentTime = (decisions[i].tick + 0.5) / (fps * ticksPerFrame));
      if (video.readyState >= 1) seek();
      else {
        video.addEventListener("loadedmetadata", seek, { once: true });
        video.preload = "auto";
        video.load();
      }
    }),
  );
}


// Ladder: a step chart of speed changes. Each step is a focusable column;
// choosing one fills the panel below with what changed and by how much.
type Step = { name: string; before: number; after: number; note?: string };
function ladder(root: HTMLElement) {
  const steps: Step[] = JSON.parse(root.querySelector("script")!.textContent!);
  const svg = root.querySelector("svg")!;
  const out = root.querySelector<HTMLElement>("[data-out]")!;
  const [baseName, baseNote] = (root.dataset.base ?? "").split("|");
  const lo = Math.log10(20), hi = Math.log10(4000);
  let risers: SVGElement[] = [], hits: SVGElement[] = [], baseHit: SVGElement | null = null;
  let picked = 0;
  steps.forEach((s, i) => s.after / s.before > steps[picked].after / steps[picked].before && (picked = i));
  const pick = (i: number) => {
    picked = i;
    risers.forEach((r, j) => r.classList.toggle("is-on", j === i));
    hits.forEach((r, j) => r.classList.toggle("is-on", j === i));
    baseHit?.classList.toggle("is-on", i < 0);
    if (i < 0) {
      out.innerHTML = `<b>0. ${baseName}</b> <span>${baseNote}</span>`;
      return;
    }
    const s = steps[i];
    const x = s.after / s.before;
    out.innerHTML = `<b>${i + 1}. ${s.name}</b> <span>${fmt.format(s.before)} → ${fmt.format(s.after)} frames/s, <strong>×${x.toFixed(1)}</strong></span>${s.note ? `<small>${s.note}</small>` : ""}`;
  };
  // Drawn in screen pixels at the figure's width, and redrawn when it changes.
  const draw = () => {
    const W = Math.round(svg.parentElement!.clientWidth);
    if (!W) return;
    const H = Math.round(Math.min(300, Math.max(220, W * 0.42)));
    const L = 58, R = 8, T = 12, B = 44;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.dataset.px = "";
    svg.style.setProperty("--k", "1");
    svg.replaceChildren();
    const el = svgEl(svg);
    const y = (v: number) => T + (H - T - B) * (1 - (Math.log10(v) - lo) / (hi - lo));
    const dx = (W - L - R) / (steps.length + 1); // column 0 is the 2018 engine, before any change
    const X = (i: number) => L + (i + 1) * dx; // left edge of change i's column
    for (const v of [30, 100, 300, 1000, 3000]) {
      el("line", { class: "ax", x1: L, x2: W - R, y1: y(v), y2: y(v) });
      el("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }).textContent = fmt.format(v);
    }
    let pts = `${L},${y(steps[0].before)} ${X(0)},${y(steps[0].before)}`;
    steps.forEach((s, i) => (pts += ` ${X(i)},${y(s.after)} ${X(i) + dx},${y(s.after)}`));
    el("polyline", { class: "ln", points: pts.trim() });
    risers = steps.map((s, i) => el("line", { class: "riser", x1: X(i), x2: X(i), y1: y(s.before), y2: y(s.after) }));
    hits = steps.map((s, i) => {
      const r = el("rect", { class: "hit", x: X(i), y: T, width: dx, height: H - T - B, tabindex: 0, role: "button" });
      r.setAttribute("aria-label", `${s.name}: ${s.before} to ${s.after} frames per second`);
      return r;
    });
    // The x axis is the order of the changes, not time.
    for (let i = 0; i <= steps.length; i++)
      el("text", { x: L + (i + 0.5) * dx, y: H - B + 17, "text-anchor": "middle" }).textContent = String(i);
    // Axis titles: what each axis measures, in its units.
    el("text", { x: L + (W - L - R) / 2, y: H - 6, "text-anchor": "middle" }).textContent = "change, in order (0 = the 2018 engine) →";
    const yt = (T + H - B) / 2;
    el("text", { x: 11, y: yt, "text-anchor": "middle", transform: `rotate(-90 11 ${yt})` }).textContent = "frames per second (log)";
    // Column 0, the starting point, is tappable too when the figure gives it
    // a data-base of "name|detail".
    baseHit = baseName ? el("rect", { class: "hit", x: L, y: T, width: dx, height: H - T - B, tabindex: 0, role: "button" }) : null;
    baseHit?.setAttribute("aria-label", `${baseName}: ${baseNote}`);
    [...hits, ...(baseHit ? [baseHit] : [])].forEach((r, i) => {
      const k = i < hits.length ? i : -1;
      r.addEventListener("mouseenter", () => pick(k));
      r.addEventListener("focus", () => pick(k));
      r.addEventListener("click", () => pick(k));
    });
    pick(picked);
  };
  new ResizeObserver(draw).observe(svg.parentElement!);
  draw();
}

// SVG element factory for charts drawn in code.
function svgEl(svg: SVGSVGElement) {
  return (tag: string, attrs: Record<string, string | number>) => {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    svg.appendChild(e);
    return e;
  };
}

// Lines: a line chart from data, drawn in screen pixels at the figure's width
// (the SVG in the page is the no-script fallback). Data: x and y axes with a
// max, ticks and a title; an optional band of [x, low, high]; a line of
// [x, y]; optional dots of [x, y] (a run known only at a few points, joined
// dashed); labels placed at data points with pixel offsets; and a legend
// drawn in the plot's empty top-left corner.
type Axis = { max: number; ticks: number[]; title: string };
type Label = { x: number; y: number; text: string; cls?: string; anchor?: string; dx?: number; dy?: number };
type Key = { kind: "line" | "dots" | "band"; text: string };
function lines(root: HTMLElement) {
  const d: { x: Axis; y: Axis; band?: number[][]; line: number[][]; dots?: number[][]; labels?: Label[]; legend?: Key[] } = JSON.parse(
    root.querySelector("script")!.textContent!,
  );
  const svg = root.querySelector("svg")!;
  const draw = () => {
    const W = Math.round(svg.parentElement!.clientWidth);
    if (!W) return;
    const H = Math.round(Math.min(300, Math.max(220, W * 0.42)));
    const L = 52, R = 12, T = 12, B = 44;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.dataset.px = "";
    svg.style.setProperty("--k", "1");
    svg.replaceChildren();
    const el = svgEl(svg);
    const X = (v: number) => L + (v / d.x.max) * (W - L - R);
    const Y = (v: number) => H - B - (v / d.y.max) * (H - T - B);
    for (const t of d.y.ticks) {
      el("line", { class: "ax", x1: L, x2: W - R, y1: Y(t), y2: Y(t) });
      el("text", { x: L - 6, y: Y(t) + 4, "text-anchor": "end" }).textContent = fmt.format(t);
    }
    d.x.ticks.forEach((t, i) => {
      const anchor = i === 0 ? "start" : i === d.x.ticks.length - 1 ? "end" : "middle";
      el("text", { x: X(t), y: H - B + 17, "text-anchor": anchor }).textContent = fmt.format(t);
    });
    el("text", { x: L + (W - L - R) / 2, y: H - 6, "text-anchor": "middle" }).textContent = d.x.title;
    const yt = (T + H - B) / 2;
    el("text", { x: 11, y: yt, "text-anchor": "middle", transform: `rotate(-90 11 ${yt})` }).textContent = d.y.title;
    if (d.band) {
      const up = d.band.map(([x, , h]) => `${X(x)},${Y(h)}`);
      const down = d.band.map(([x, l]) => `${X(x)},${Y(l)}`).reverse();
      el("polygon", { class: "band band--runs", points: [...up, ...down].join(" ") });
    }
    el("polyline", { class: "ln hi", points: d.line.map(([x, v]) => `${X(x)},${Y(v)}`).join(" ") });
    if (d.dots) {
      el("polyline", { class: "ln hi ln--dash", points: d.dots.map(([x, v]) => `${X(x)},${Y(v)}`).join(" ") });
      for (const [x, v] of d.dots) el("circle", { class: "hi", cx: X(x), cy: Y(v), r: 4 });
    }
    (d.legend ?? []).forEach((k, i) => {
      const ky = T + 10 + i * 18, kx = L + 10;
      if (k.kind === "band") el("rect", { class: "band band--runs", x: kx, y: ky - 5, width: 22, height: 10 });
      else el("line", { class: k.kind === "dots" ? "ln hi ln--dash" : "ln hi", x1: kx, x2: kx + 22, y1: ky, y2: ky });
      if (k.kind === "dots") el("circle", { class: "hi", cx: kx + 11, cy: ky, r: 3.5 });
      el("text", { x: kx + 30, y: ky + 4, class: "ink" }).textContent = k.text;
    });
    for (const l of d.labels ?? []) {
      const t = el("text", { x: X(l.x) + (l.dx ?? 0), y: Y(l.y) + (l.dy ?? 0), "text-anchor": l.anchor ?? "start" });
      if (l.cls) t.setAttribute("class", l.cls);
      t.textContent = l.text;
    }
  };
  new ResizeObserver(draw).observe(svg.parentElement!);
  draw();
}

// Pick: tappable parts of a figure ([data-pick]); choosing one shows its
// <template data-for> in the figure's [data-panel]. Choosing it again closes it.
function pick(root: HTMLElement) {
  const items = [...root.querySelectorAll<HTMLElement | SVGElement>("[data-pick]")];
  const panel = root.querySelector<HTMLElement>("[data-panel]")!;
  let open: Element | null = null;
  const show = (el: HTMLElement | SVGElement) => {
    open = open === el ? null : el;
    items.forEach((i) => {
      i.classList.toggle("is-on", i === open);
      i.setAttribute("aria-pressed", String(i === open));
    });
    const t = open && root.querySelector<HTMLTemplateElement>(`template[data-for="${el.dataset.pick}"]`);
    panel.replaceChildren(...(t ? [t.content.cloneNode(true)] : []));
  };
  items.forEach((el) => {
    el.addEventListener("click", () => show(el));
    el.addEventListener("keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        show(el);
      }
    });
  });
}

// Flow: one won game as a row of decision boxes. After p passes of practice
// the win has reached p boxes back, each worth 0.99 of the box after it; the
// slider sets p. Each box is shaded by its score.
function flow(root: HTMLElement) {
  const n = Number(root.dataset.n);
  const g = Number(root.dataset.gamma);
  const boxes = [...root.querySelectorAll<HTMLElement>(".flow__b")];
  const slider = root.querySelector<HTMLInputElement>("input")!;
  const out = root.querySelector<HTMLOutputElement>("output")!;
  const draw = () => {
    const p = Number(slider.value);
    boxes.forEach((b, i) => {
      const back = n - 1 - i;
      const v = back < p ? g ** back : 0;
      b.style.setProperty("--v", v.toFixed(3));
      b.querySelector("b")!.textContent = v === 0 ? "0" : v === 1 ? "1" : v.toFixed(2);
    });
    out.value = p === 0 ? "before any practice" : `after ${p} pass${p === 1 ? "" : "es"}`;
  };
  slider.addEventListener("input", draw);
  draw();
}

const widgets: Record<string, (el: HTMLElement) => void> = { chain, reveal, qview, pick, ladder, flow, lines };
document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
  widgets[el.dataset.widget!]?.(el);
});
export {};
