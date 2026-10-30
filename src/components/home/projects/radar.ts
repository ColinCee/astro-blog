// The flight-tracker figure: a simulated London radar on a canvas. Heathrow
// is at the centre with runway 27 east-west, and the four holding stacks
// (BNN, LAM, BIG, OCK) sit around it. Each plane is an arrow that steers to
// its next waypoint at a limited turn rate, so its track curves like a real
// one: arrivals come in from the edge, may fly one lap of a stack, then join a
// long final from the east and land; departures roll west and turn out; the
// rest cross at cruise. A short fading trail shows where each has been.
// Positions are in radar units (the scope is the unit circle); everything is
// drawn at display scale k = S / 260, where S is the canvas side in pixels.

type Pt = [number, number];
type Plane = {
  kind: "arr" | "dep" | "ovf";
  x: number;
  y: number;
  h: number;
  v: number;
  wps: Pt[];
  i: number;
  t: number;
  trail: Pt[];
  cs: string;
  hot: boolean;
};

const stacks: Record<string, Pt> = {
  BNN: [-0.55, -0.5],
  LAM: [0.55, -0.5],
  BIG: [0.55, 0.5],
  OCK: [-0.55, 0.5],
};
const airlines = ["BAW", "EZY", "VIR", "RYR", "DLH", "AFR", "KLM", "UAE"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const onEdge = (a: number): Pt => [Math.cos(a) * 1.12, Math.sin(a) * 1.12];
const lap = ([x, y]: Pt): Pt[] => [
  [x + 0.09, y],
  [x + 0.09, y + 0.07],
  [x, y + 0.07],
  [x, y],
];

const route = (): Pick<Plane, "kind" | "v" | "wps"> & { p: Pt; h?: number } => {
  const r = Math.random();
  if (r < 0.45) {
    const s = pick(Object.values(stacks));
    const side = Math.sign(s[1]);
    // Runway 27 lands westbound: from a west stack fly an eastbound downwind
    // on that side, then base and final; from an east stack go straight to
    // base and final.
    const dy = side * rnd(0.26, 0.36);
    const pattern: Pt[] =
      s[0] < 0
        ? [
            [-0.25, dy],
            [0.55, dy],
            [0.85, side * 0.14],
          ]
        : [[0.85, side * rnd(0.18, 0.26)]];
    return {
      kind: "arr",
      p: onEdge(Math.atan2(s[1], s[0]) + rnd(-0.35, 0.35)),
      v: 0.0022,
      wps: [
        s,
        ...(Math.random() < 0.6 ? lap(s) : []),
        ...pattern,
        [0.92, 0],
        [0.45, 0],
        [0, 0],
      ],
    };
  }
  if (r < 0.7)
    return {
      kind: "dep",
      p: [0.02, 0],
      h: Math.PI,
      v: 0.0016,
      wps: [[-0.38, 0], onEdge(Math.PI + rnd(-1.1, 1.1))],
    };
  const a = rnd(0, 7);
  return {
    kind: "ovf",
    p: onEdge(a),
    v: 0.0032,
    wps: [
      [rnd(-0.4, 0.4), rnd(-0.4, 0.4)],
      onEdge(a + Math.PI + rnd(-0.5, 0.5)),
    ],
  };
};

const spawn = (hot: boolean): Plane => {
  const { p, h, ...r } = route();
  const w = r.wps[0];
  return {
    ...r,
    x: p[0],
    y: p[1],
    h: h ?? Math.atan2(w[1] - p[1], w[0] - p[0]),
    i: 0,
    t: 0,
    trail: [],
    cs: pick(airlines) + Math.floor(rnd(10, 990)),
    hot,
  };
};

const step = (p: Plane) => {
  const w = p.wps[p.i];
  if (!w) return;
  let d = Math.atan2(w[1] - p.y, w[0] - p.x) - p.h;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  p.h += Math.max(-0.03, Math.min(0.03, d));
  if (p.kind === "dep") p.v = Math.min(0.0034, p.v * 1.004);
  p.x += Math.cos(p.h) * p.v;
  p.y += Math.sin(p.h) * p.v;
  if (Math.hypot(w[0] - p.x, w[1] - p.y) < 0.05) p.i++;
  if (++p.t % 4 === 0) p.trail.push([p.x, p.y]);
  if (p.trail.length > 45) p.trail.shift();
};

const done = (p: Plane) =>
  (p.kind === "arr" && p.i >= p.wps.length) ||
  (Math.hypot(p.x, p.y) > 1.2 && p.i > 0);

export function radar(canvas: HTMLCanvasElement, reduce: boolean) {
  const ctx = canvas.getContext("2d")!;
  // Seven planes, spread along their routes so the scope is busy from the
  // first frame; the first two carry callsigns.
  const planes = Array.from({ length: 7 }, (_, j) => {
    let p = spawn(j < 2);
    for (let n = rnd(0, 500); n > 0 && !done(p); n--) step(p);
    if (done(p)) p = spawn(j < 2);
    return p;
  });
  let c: Record<string, string> = {};
  const colors = () => {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim();
    c = {
      ring: v("--n6"),
      runway: v("--n8"),
      sweep: v("--n7"),
      faint: v("--n9"),
      plane: v("--n10"),
      label: v("--n11"),
      hot: v("--accent"),
      mono: v("--mono"),
    };
  };
  let S = 0;
  let k = 1;
  const resize = () => {
    const w = canvas.getBoundingClientRect().width;
    if (!w) return;
    S = Math.round(w * devicePixelRatio);
    k = S / 260;
    canvas.width = canvas.height = S;
  };
  // Labels at least 11 CSS pixels, however small the scope gets.
  const font = (px: number) =>
    `${Math.max(11 * devicePixelRatio, px * k)}px ${c.mono}`;

  let sweep = 0;
  const draw = () => {
    if (!S) return;
    const cx = S / 2;
    const R = S / 2 - 4 * k;
    const px = (x: number) => cx + x * R;
    ctx.clearRect(0, 0, S, S);
    ctx.strokeStyle = c.ring;
    ctx.lineWidth = k;
    for (const r of [0.33, 0.66, 1]) {
      ctx.beginPath();
      ctx.arc(cx, cx, R * r, 0, 7);
      ctx.stroke();
    }
    ctx.lineWidth = 3 * k;
    ctx.strokeStyle = c.runway;
    ctx.beginPath();
    ctx.moveTo(px(-0.06), cx);
    ctx.lineTo(px(0.06), cx);
    ctx.stroke();
    ctx.font = font(9);
    ctx.fillStyle = c.faint;
    for (const [n, [x, y]] of Object.entries(stacks)) {
      ctx.beginPath();
      ctx.arc(px(x), px(y), 2 * k, 0, 7);
      ctx.fill();
      ctx.fillText(n, px(x) + 5 * k, px(y) - 5 * k);
    }
    const g = ctx.createConicGradient(sweep, cx, cx);
    g.addColorStop(0, c.sweep);
    g.addColorStop(0.12, "transparent");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.arc(cx, cx, R, sweep - 0.75, sweep);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cx, R, 0, 7);
    ctx.clip();
    for (const p of planes) {
      ctx.lineWidth = 1.3 * k;
      ctx.strokeStyle = p.hot ? c.hot : c.faint;
      for (let t = 1; t < p.trail.length; t++) {
        ctx.globalAlpha = (t / p.trail.length) * 0.5;
        ctx.beginPath();
        ctx.moveTo(px(p.trail[t - 1][0]), px(p.trail[t - 1][1]));
        ctx.lineTo(px(p.trail[t][0]), px(p.trail[t][1]));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(px(p.x), px(p.y));
      ctx.rotate(p.h);
      ctx.scale(k, k);
      ctx.fillStyle = p.hot ? c.hot : c.plane;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(-2.5, 0);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      if (p.hot) {
        ctx.font = font(10);
        ctx.fillStyle = c.label;
        ctx.fillText(p.cs, px(p.x) + 9 * k, px(p.y) - 8 * k);
      }
    }
    ctx.restore();
  };

  // The simulation steps 60 times a second whatever the screen's refresh
  // rate, so planes fly at the same speed on a 120 Hz display.
  let raf = 0;
  let last = 0;
  const loop = (ms: number) => {
    raf = requestAnimationFrame(loop);
    let n = last ? Math.min(10, Math.floor((ms - last) / (1000 / 60))) : 1;
    if (!n) return;
    last = last ? last + n * (1000 / 60) : ms;
    for (; n > 0; n--) {
      sweep += 0.012;
      for (const p of planes) {
        step(p);
        if (done(p)) Object.assign(p, spawn(p.hot));
      }
    }
    draw();
  };

  colors();
  resize();
  draw();
  new ResizeObserver(() => {
    resize();
    draw();
  }).observe(canvas);
  // The nav button announces a theme change; the canvas holds its colours.
  addEventListener("themechange", () => {
    colors();
    draw();
  });

  return {
    run(on: boolean) {
      cancelAnimationFrame(raf);
      last = 0;
      if (on && !reduce) raf = requestAnimationFrame(loop);
      else draw();
    },
  };
}
