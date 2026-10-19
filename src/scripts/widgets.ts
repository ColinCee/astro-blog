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
  // The video may already be playing: autoplay can start before the data above
  // has loaded, and then its "play" event has already gone by.
  if (!video.paused) requestAnimationFrame(loop);
  draw();

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

const widgets: Record<string, (el: HTMLElement) => void> = { chain, reveal, qview, pick, dice };
document.querySelectorAll<HTMLElement>("[data-widget]").forEach((el) => {
  widgets[el.dataset.widget!]?.(el);
});
export {};
