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
  const W = 320, H = 170, L = 34, R = 8, T = 12, B = 22;
  const lo = Math.log10(20), hi = Math.log10(4000);
  const y = (v: number) => T + (H - T - B) * (1 - (Math.log10(v) - lo) / (hi - lo));
  const dx = (W - L - R) / (steps.length + 1); // column 0 is the 2018 engine, before any change
  const X = (i: number) => L + (i + 1) * dx; // left edge of change i's column
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
  let pts = `${L},${y(steps[0].before)} ${X(0)},${y(steps[0].before)}`;
  steps.forEach((s, i) => (pts += ` ${X(i)},${y(s.after)} ${X(i) + dx},${y(s.after)}`));
  el("polyline", { class: "ln", points: pts.trim() });
  const risers = steps.map((s, i) =>
    el("line", { class: "riser", x1: X(i), x2: X(i), y1: y(s.before), y2: y(s.after) }),
  );
  const hits = steps.map((s, i) => {
    const r = el("rect", { class: "hit", x: X(i), y: T, width: dx, height: H - T - B, tabindex: 0, role: "button" });
    r.setAttribute("aria-label", `${s.name}: ${s.before} to ${s.after} frames per second`);
    return r;
  });
  // The x axis is the order of the changes, not time.
  for (let i = 0; i <= steps.length; i++)
    el("text", { x: L + (i + 0.5) * dx, y: H - 6, "text-anchor": "middle" }).textContent = String(i);
  // Column 0, the starting point, is tappable too when the figure gives it
  // a data-base of "name|detail".
  const [baseName, baseNote] = (root.dataset.base ?? "").split("|");
  const baseHit = baseName
    ? el("rect", { class: "hit", x: L, y: T, width: dx, height: H - T - B, tabindex: 0, role: "button" })
    : null;
  baseHit?.setAttribute("aria-label", `${baseName}: ${baseNote}`);
  const pick = (i: number) => {
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
  [...hits, ...(baseHit ? [baseHit] : [])].forEach((r, i) => {
    const k = i < hits.length ? i : -1;
    r.addEventListener("mouseenter", () => pick(k));
    r.addEventListener("focus", () => pick(k));
    r.addEventListener("click", () => pick(k));
  });
  let best = 0;
  steps.forEach((s, i) => s.after / s.before > steps[best].after / steps[best].before && (best = i));
  pick(best);
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

// Dice: why Double DQN helps. Three moves all truly worth 1; two networks
// guess each with independent random error. Taking the best-looking guess and
// trusting its own score is biased high; scoring that pick with the other
// network's guess is not. The running averages show it.
function dice(root: HTMLElement) {
  const grid = root.querySelector<HTMLElement>("[data-grid]")!;
  const same = root.querySelector<HTMLElement>("[data-same]")!;
  const other = root.querySelector<HTMLElement>("[data-other]")!;
  const avg = root.querySelector<HTMLOutputElement>("[data-avg]")!;
  const moves = ["shoot", "left", "right"];
  let seed = 17053; // its first roll shows the bias plainly: picks left at 1.49, the copy says 1.00
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed + 0.5) / 4294967296;
  };
  const noise = () => 0.3 * Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand());
  const cells: HTMLElement[][] = [[], []];
  ["network", "older copy"].forEach((who, r) => {
    const label = document.createElement("span");
    label.className = "dice__who";
    label.textContent = who;
    grid.appendChild(label);
    moves.forEach(() => {
      const c = document.createElement("div");
      c.className = "dice__cell";
      c.innerHTML = "<i></i><b></b>";
      grid.appendChild(c);
      cells[r].push(c);
    });
  });
  const foot = document.createElement("span");
  grid.appendChild(foot);
  for (const m of moves) {
    const t = document.createElement("small");
    t.textContent = m;
    grid.appendChild(t);
  }
  let n = 0;
  let sumSame = 0;
  let sumOther = 0;
  let last: { a: number[]; b: number[]; pick: number } | null = null;
  const roll = () => {
    const a = moves.map(() => 1 + noise());
    const b = moves.map(() => 1 + noise());
    const pick = a.indexOf(Math.max(...a));
    n++;
    sumSame += a[pick];
    sumOther += b[pick];
    last = { a, b, pick };
  };
  const show = () => {
    const { a, b, pick } = last!;
    [a, b].forEach((vals, r) =>
      vals.forEach((v, k) => {
        const c = cells[r][k];
        c.style.setProperty("--v", String(Math.max(0, Math.min(2, v)) / 2));
        c.querySelector("b")!.textContent = v.toFixed(2);
        c.classList.toggle("is-pick", k === pick);
      }),
    );
    same.textContent = a[pick].toFixed(2);
    other.textContent = b[pick].toFixed(2);
    const off = (x: number) => (Math.abs(x) < 0.005 ? "0.00" : `${x > 0 ? "+" : "−"}${Math.abs(x).toFixed(2)}`);
    avg.value = `average over ${n} round${n === 1 ? "" : "s"} of guesses: same network ${off(sumSame / n - 1)}, older copy ${off(sumOther / n - 1)}`;
  };
  root.querySelectorAll<HTMLButtonElement>("[data-roll]").forEach((btn) =>
    btn.addEventListener("click", () => {
      for (let k = 0; k < Number(btn.dataset.roll); k++) roll();
      show();
    }),
  );
  roll();
  show();
}

// Backup: a won game as a row of decisions. Each pass applies one Q-learning
// update to every decision (score = points now + gamma x next moment's best;
// the last decision's score is its points alone), starting from zeros, so the
// win reaches back one decision per pass. The SVG in the Markdown holds the
// pass-4 state; this only rewrites it.
function backup(root: HTMLElement) {
  const gamma = Number(root.dataset.gamma);
  const rewards = root.dataset.rewards!.split(",").map(Number);
  const n = rewards.length;
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const out = q<HTMLOutputElement>("[data-pass]");
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-step]")];
  const num = (v: number) => (v === 0 ? "0" : v.toFixed(2).replace(/\.?0+$/, ""));
  const after = (passes: number) => {
    let v = new Array<number>(n).fill(0);
    for (let k = 0; k < passes; k++) {
      v = v.map((_, i) => (i === n - 1 ? rewards[i] : rewards[i] + gamma * v[i + 1]));
    }
    return v.map((x) => Number(x.toFixed(2)));
  };
  let pass = 4;
  const draw = () => {
    const v = after(pass);
    const prev = after(pass - 1);
    const i = v.findIndex((x, k) => x !== prev[k]);
    v.forEach((x, k) => {
      const h = Math.min(1, x) * 26;
      const lvl = q<SVGRectElement>(`[data-lvl="${k}"]`);
      lvl.setAttribute("y", String(66 - h));
      lvl.setAttribute("height", String(h));
      q<SVGTextElement>(`[data-v="${k}"]`).textContent = num(x);
      q<SVGRectElement>(`[data-box="${k}"]`).classList.toggle("nd__box--on", k === i);
    });
    const next = i + 1 < n ? prev[i + 1] : 0;
    const x = 4 + 40 * i + 17;
    q<SVGPathElement>("[data-arrow]").setAttribute("d", i + 1 < n ? `M${x + 40},68 C${x + 40},88 ${x},88 ${x},70` : "");
    q<SVGTextElement>("[data-who]").textContent = `decision ${i + 1} learns`;
    q<SVGTextElement>("[data-r]").textContent = rewards[i] > 0 ? `+${num(rewards[i])}` : num(rewards[i]);
    q<SVGTextElement>("[data-next]").textContent = num(next);
    q<SVGTextElement>("[data-out]").textContent = num(v[i]);
    out.value = `pass ${pass} of ${n}`;
    buttons[0].disabled = pass <= 1;
    buttons[1].disabled = pass >= n;
  };
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      pass = Math.max(1, Math.min(n, pass + Number(b.dataset.step)));
      draw();
    }),
  );
  draw();
}

const widgets: Record<string, (el: HTMLElement) => void> = { chain, reveal, qview, pick, dice, ladder, backup };
document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
  widgets[el.dataset.widget!]?.(el);
});
export {};
