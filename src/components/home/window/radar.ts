// The flight-tracker figure: a simulated radar around Heathrow on a canvas.
// The field is at the centre with its two runways east-west and the four
// holding stacks (BNN, LAM, BIG, OCK) around it. Each plane is an arrow that
// steers at a limited turn rate, so its track curves like a real one.
// Arrivals come in from the edge to a stack, fly its racetrack until their
// slot on final is clear, then join the approach from the east and land on
// 27L; departures roll west off 27R and turn out; the rest cross at cruise. A
// short fading trail shows where each has been.
//
// Positions are in radar units: the 30 nm ring is the unit circle, and the
// scope is as many units wide and tall as its canvas allows. The planes are
// invented (the real counts are beside it, from the home server); what is
// drawn honestly is how the airspace works.
//
// It is the heaviest script on the home page, so it is a file of its own and
// projects.ts loads it only when the panel is near.

type Pt = [number, number];
type Leg =
  | { to: Pt; r?: number }
  | { hold: string }
  | { final: true }
  | { roll: true };
type Plane = {
  kind: "arr" | "dep" | "ovf";
  /** Carries a callsign. */
  hot: boolean;
  x: number;
  y: number;
  /** Heading, radians. */
  h: number;
  /** Speed, units a step. */
  v: number;
  /** Opacity: a departure fades in on its roll, an arrival out on its own. */
  a: number;
  legs: Leg[];
  i: number;
  /** Steps on this leg. */
  s: number;
  /** Where it is round a hold: -1 arriving, then 0 to 3. */
  ph: number;
  laps: number;
  /** Distance flown on a hold's outbound leg. */
  d: number;
  t: number;
  /** Steps still to wait before it appears. */
  wait: number;
  gone: boolean;
  trail: Pt[];
  cs: string;
  /** The corner its callsign rides on. */
  seat?: number;
};

const { PI, cos, sin, atan2, hypot, min, max, abs, floor, random, sign } = Math;
const TAU = PI * 2;
const rnd = (a: number, b: number) => a + random() * (b - a);
const pick = <T>(a: T[]) => a[floor(random() * a.length)];

const V = 0.0018; // an arrival's speed
const TURN = 0.0257; // the most a heading changes in a step
const HR = V / TURN; // so a hold's turn radius
const HL = 0.17; // and its straight legs
const RWY = 0.085; // half a runway
const yN = -0.045; // 27R
const yS = 0.045; // 27L
const GAP = 170; // steps between two arrivals on final
const STEP = 1000 / 60; // one step of the simulation, ms

// Each stack: its fix, the heading planes arrive on (from the west for the
// two western stacks, from the east for the eastern two) and where its name
// goes, clear of the racetrack.
const stacks: Record<string, { p: Pt; th: number; lab: Pt }> = {
  BNN: { p: [-0.55, -0.5], th: 0.3, lab: [9, -8] },
  LAM: { p: [0.55, -0.5], th: PI - 0.25, lab: [-9, 18] },
  BIG: { p: [0.55, 0.5], th: 0.25 - PI, lab: [-9, 18] },
  OCK: { p: [-0.55, 0.5], th: -0.3, lab: [9, -8] },
};
const airlines = ["BAW", "EZY", "VIR", "RYR", "DLH", "AFR", "KLM", "UAE"];

// The same colour at no opacity, so a gradient fades without greying.
const clear = (hex: string) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "transparent";
  const n = parseInt(m[1], 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0)`;
};

export function makeRadar(canvas: HTMLCanvasElement, still: boolean) {
  const g = canvas.getContext("2d")!;
  let W = 0;
  let H = 0;
  let R = 1;
  // Half the scope's width and height, in radar units.
  let hw = 2.4;
  let hh = 1.1;
  let dpr = 1;
  let now = 0;
  let sweep = 0;
  let etas: number[] = [];
  let planes: Plane[] | undefined;
  let c: Record<string, string> = {};
  let label = 11;

  // Where a ray from (x, y) leaves the scope, m units beyond its edge.
  const edge = (x: number, y: number, a: number, m = 0.1): Pt => {
    const dx = cos(a);
    const dy = sin(a);
    const tx =
      dx > 0 ? (hw + m - x) / dx : dx < 0 ? (-hw - m - x) / dx : Infinity;
    const ty =
      dy > 0 ? (hh + m - y) / dy : dy < 0 ? (-hh - m - y) / dy : Infinity;
    const t = min(tx, ty);
    return [x + dx * t, y + dy * t];
  };
  // How far east the approach turns on to final.
  const xTurn = () => min(1.2, hw - 0.22);

  const spawn = (p: Plane, wait = floor(rnd(0, 260))) => {
    Object.assign(p, {
      trail: [],
      t: 0,
      a: 1,
      i: 0,
      s: 0,
      ph: -1,
      laps: 0,
      d: 0,
      gone: false,
      wait,
      cs: pick(airlines) + floor(rnd(10, 990)),
    });
    if (p.kind === "arr") {
      const name = pick(Object.keys(stacks));
      const st = stacks[name];
      const [fx, fy] = st.p;
      const from = edge(fx, fy, st.th + PI + rnd(-0.2, 0.2));
      const side = sign(fy);
      const dy = side * rnd(0.27, 0.35);
      [p.x, p.y] = from;
      p.h = atan2(fy - p.y, fx - p.x);
      p.v = V;
      // From a western stack: an eastbound downwind on that side, then base
      // and final. From an eastern one: a base leg straight in.
      const pattern: Leg[] =
        fx < 0
          ? [{ to: [-0.18, dy] }, { to: [xTurn(), dy] }]
          : [{ to: [min(0.85, xTurn()), side * rnd(0.17, 0.24)] }];
      p.legs = [
        { to: st.p, r: 0.03 },
        { hold: name },
        ...pattern,
        { final: true },
        { roll: true },
      ];
    } else if (p.kind === "dep") {
      p.x = RWY;
      p.y = yN;
      p.h = PI;
      p.v = 0.0004;
      p.a = 0;
      // Most turn out to the west; some come round outside the stacks and
      // leave to the east.
      const s = pick([-1, 1]);
      p.legs =
        random() < 0.4
          ? [
              { to: [-0.42, yN] },
              { to: [-0.85, s * 0.5] },
              { to: [-0.45, s * min(0.98, hh - 0.12)] },
              { to: [hw + 0.4, s * rnd(0.8, 1) * min(1, hh - 0.1)] },
            ]
          : [
              { to: [-0.42, yN] },
              { to: edge(-0.42, yN, PI + s * rnd(0.15, 0.8), 0.4) },
            ];
    } else {
      const from = edge(0, 0, rnd(0, TAU));
      const mid: Pt = [rnd(-1, 1) * max(0.6, hw - 0.5), rnd(-0.75, 0.75)];
      [p.x, p.y] = from;
      p.h = atan2(mid[1] - p.y, mid[0] - p.x);
      p.v = 0.0028;
      p.legs = [
        { to: mid, r: 0.08 },
        { to: edge(mid[0], mid[1], p.h + rnd(-0.5, 0.5), 0.4) },
      ];
    }
  };

  const steer = (p: Plane, tx: number, ty: number) => {
    let d = atan2(ty - p.y, tx - p.x) - p.h;
    d = atan2(sin(d), cos(d));
    p.h += max(-TURN, min(TURN, d));
  };
  // A right turn on to a heading; true once it is reached.
  const turn = (p: Plane, to: number) => {
    let d = (to - p.h) % TAU;
    if (d < 0) d += TAU;
    if (d <= TURN || d > TAU - 0.001) {
      p.h = to;
      return true;
    }
    p.h += TURN;
    return false;
  };
  // An arrival leaves its stack only when its slot on final is clear of the
  // others; otherwise it flies another lap (three at most).
  const release = (p: Plane, name: string) => {
    let [x, y] = stacks[name].p;
    let d = 0;
    for (const l of p.legs.slice(p.i + 1)) {
      if (!("to" in l)) break;
      d += hypot(l.to[0] - x, l.to[1] - y);
      [x, y] = l.to;
    }
    const eta = now + (d + hypot(0.6 - x, yS - y)) / V;
    etas = etas.filter((e) => e > now - 60);
    if (p.laps < 3 && etas.some((e) => abs(e - eta) < GAP)) return false;
    etas.push(eta);
    return true;
  };
  const advance = (p: Plane) => {
    p.i++;
    p.s = 0;
    p.ph = -1;
  };

  const step = (p: Plane) => {
    if (p.wait > 0) {
      p.wait--;
      return;
    }
    const leg = p.legs[p.i];
    if (!leg) {
      p.gone = true;
      return;
    }
    if ("to" in leg) {
      steer(p, leg.to[0], leg.to[1]);
      if (p.kind === "dep") {
        p.v = min(0.003, p.v * 1.008 + 0.000003);
        p.a = min(1, p.a + 0.03);
      }
      // A waypoint it cannot turn tightly enough to reach is given up, not
      // circled for ever.
      if (
        hypot(leg.to[0] - p.x, leg.to[1] - p.y) < (leg.r ?? 0.05) ||
        ++p.s > 1600
      )
        advance(p);
    } else if ("hold" in leg) {
      const st = stacks[leg.hold];
      const [fx, fy] = st.p;
      if (p.ph === -1) {
        if (random() < 0.2 && release(p, leg.hold)) advance(p);
        else p.ph = 0;
      } else if (p.ph === 0) {
        if (turn(p, st.th + PI)) {
          p.ph = 1;
          p.d = 0;
        }
      } else if (p.ph === 1) {
        p.d += p.v;
        if (p.d >= HL) p.ph = 2;
      } else if (p.ph === 2) {
        if (turn(p, st.th)) p.ph = 3;
      } else {
        const ux = cos(st.th);
        const uy = sin(st.th);
        const along = (fx - p.x) * ux + (fy - p.y) * uy;
        if (along <= 0) {
          p.laps++;
          p.h = st.th;
          if (release(p, leg.hold)) advance(p);
          else p.ph = 0;
        } else {
          const look = max(0, along - 0.08);
          steer(p, fx - ux * look, fy - uy * look);
        }
      }
    } else if ("final" in leg) {
      steer(p, max(RWY, p.x - 0.16), yS);
      if (p.x < 0.7) p.v = max(V * 0.7, p.v * 0.9988);
      if (p.x <= RWY + 0.02) advance(p);
    } else {
      // Rolling out along the runway, slowing and fading.
      p.h = PI;
      p.y += (yS - p.y) * 0.2;
      p.v *= 0.99;
      p.a -= 0.009;
      if (p.a <= 0) p.gone = true;
    }
    p.x += cos(p.h) * p.v;
    p.y += sin(p.h) * p.v;
    if (++p.t % 4 === 0) {
      p.trail.push([p.x, p.y]);
      if (p.trail.length > 60) p.trail.shift();
    }
    if (p.t > 90 && (abs(p.x) > hw + 0.25 || abs(p.y) > hh + 0.25))
      p.gone = true;
  };
  const tick = () => {
    now++;
    sweep += 0.011;
    for (const p of planes ?? []) {
      step(p);
      if (p.gone) spawn(p);
    }
  };

  // A canvas holds its colours, so they are read from the tokens here and
  // again when the theme changes. Its labels are the site's smallest type.
  const colors = () => {
    const s = getComputedStyle(canvas);
    const v = (n: string) => s.getPropertyValue(n).trim();
    c = {
      ring: v("--n5"),
      ring30: v("--n7"),
      runway: v("--n10"),
      hold: v("--n8"),
      sweep: v("--n4"),
      faint: v("--n9"),
      far: v("--n8"),
      plane: v("--n10"),
      label: v("--n11"),
      // The scale's own label: the site's faint text grey. --n9 is too pale
      // for words on the light theme, though not for lines.
      scale: v("--dim"),
      // The planes with callsigns in ink: the window's purple is its focus.
      hot: v("--n12"),
      mono: v("--mono") || "monospace",
    };
    label =
      0.6875 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  };

  const draw = () => {
    if (!W || !planes) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const X = (x: number) => cx + x * R;
    const Y = (y: number) => cy + y * R;
    const far = hypot(cx, cy);
    g.lineWidth = 1;
    g.font = `${label}px ${c.mono}`;
    g.textBaseline = "alphabetic";

    // The sweep: a soft wedge trailing the beam. Not in the still scope.
    if (!still && "createConicGradient" in g) {
      const tail = 0.55;
      const grad = g.createConicGradient(sweep - tail, cx, cy);
      grad.addColorStop(0, clear(c.sweep));
      grad.addColorStop(tail / TAU, c.sweep);
      grad.addColorStop(tail / TAU + 0.0001, clear(c.sweep));
      g.globalAlpha = 0.6;
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, far, sweep - tail, sweep);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
    }

    // Range rings every 10 nm; the 30 nm ring is the one the count covers.
    for (let k = 1; (k * R) / 3 < far; k++) {
      g.strokeStyle = k === 3 ? c.ring30 : c.ring;
      g.beginPath();
      g.arc(cx, cy, (k * R) / 3, 0, TAU);
      g.stroke();
    }
    g.fillStyle = c.scale;
    g.textAlign = "center";
    g.fillText("30 nm", cx, cy + R + 15);

    // 27L's extended centreline, east of the field, ticked.
    const xe = xTurn() + 0.06;
    g.strokeStyle = c.hold;
    g.setLineDash([2, 5]);
    g.beginPath();
    g.moveTo(X(RWY) + 8, Y(yS));
    g.lineTo(X(xe), Y(yS));
    g.stroke();
    g.setLineDash([]);
    for (let x = 0.3; x < xe; x += 0.3) {
      g.beginPath();
      g.moveTo(X(x), Y(yS) - 3.5);
      g.lineTo(X(x), Y(yS) + 3.5);
      g.stroke();
    }

    // The runways.
    g.lineCap = "round";
    g.lineWidth = 3;
    g.strokeStyle = c.runway;
    for (const y of [yN, yS]) {
      g.beginPath();
      g.moveTo(X(-RWY), Y(y));
      g.lineTo(X(RWY), Y(y));
      g.stroke();
    }
    g.lineCap = "butt";
    g.lineWidth = 1;
    g.fillStyle = c.label;
    g.fillText("27R", cx, Y(yN) - 8);
    g.fillText("27L", cx, Y(yS) + 17);

    // The four stacks: the racetrack, the fix and its name.
    for (const [name, st] of Object.entries(stacks)) {
      const [fx, fy] = st.p;
      const r = HR * R;
      const L = HL * R;
      g.save();
      g.translate(X(fx), Y(fy));
      g.rotate(st.th);
      g.strokeStyle = c.hold;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(-L, 0);
      g.lineTo(0, 0);
      g.arc(0, r, r, -PI / 2, PI / 2);
      g.lineTo(-L, 2 * r);
      g.arc(-L, r, r, PI / 2, PI * 1.5);
      g.stroke();
      g.restore();
      g.setLineDash([]);
      g.strokeStyle = c.label;
      g.beginPath();
      g.moveTo(X(fx), Y(fy) - 5);
      g.lineTo(X(fx) + 4.6, Y(fy) + 3.4);
      g.lineTo(X(fx) - 4.6, Y(fy) + 3.4);
      g.closePath();
      g.stroke();
      g.fillStyle = c.label;
      g.textAlign = st.lab[0] < 0 ? "right" : "left";
      g.fillText(name, X(fx) + st.lab[0], Y(fy) + st.lab[1]);
    }
    g.textAlign = "left";

    // The traffic. A callsign keeps off the names on the scope, the other
    // planes and the other callsigns: `taken` is every box already spoken for.
    type Box = [number, number, number, number];
    const taken: Box[] = [
      [cx - 14, Y(yN) - 20, 28, 14],
      [cx - 14, Y(yS) + 6, 28, 14],
      [cx - 22, cy + R + 4, 44, 14],
    ];
    for (const st of Object.values(stacks))
      taken.push(
        [
          X(st.p[0]) + (st.lab[0] < 0 ? -36 : -7),
          Y(st.p[1]) + st.lab[1] - 12,
          43,
          16,
        ],
        [X(st.p[0]) - 7, Y(st.p[1]) - 7, 14, 13],
      );
    for (const p of planes)
      if (p.wait <= 0 && p.a > 0) taken.push([X(p.x) - 8, Y(p.y) - 8, 16, 16]);
    // Clear of the scope's edges, and of the labels set into the panel's
    // border.
    const inside = (b: Box) =>
      b[0] > 2 && b[0] + b[2] < W - 2 && b[1] > 10 && b[1] + b[3] < H - 10;
    const free = (b: Box) =>
      inside(b) &&
      !taken.some(
        (o) =>
          b[0] < o[0] + o[2] &&
          b[0] + b[2] > o[0] &&
          b[1] < o[1] + o[3] &&
          b[1] + b[3] > o[1],
      );
    for (const p of planes) {
      if (p.wait > 0 || p.a <= 0) continue;
      g.lineWidth = 1.3;
      g.strokeStyle = p.hot ? c.hot : c.faint;
      const n = p.trail.length;
      for (let t = 1; t < n; t++) {
        g.globalAlpha = (t / n) * 0.5 * p.a;
        g.beginPath();
        g.moveTo(X(p.trail[t - 1][0]), Y(p.trail[t - 1][1]));
        g.lineTo(X(p.trail[t][0]), Y(p.trail[t][1]));
        g.stroke();
      }
      g.globalAlpha = p.a;
      g.save();
      g.translate(X(p.x), Y(p.y));
      g.rotate(p.h);
      g.fillStyle = p.hot ? c.hot : p.kind === "ovf" ? c.far : c.plane;
      g.beginPath();
      g.moveTo(7.5, 0);
      g.lineTo(-5.5, -4.6);
      g.lineTo(-2.2, 0);
      g.lineTo(-5.5, 4.6);
      g.closePath();
      g.fill();
      g.restore();
      // A callsign rides beside its plane on whichever corner is clear (it
      // keeps its corner until that is taken) and is dropped on the runway.
      // Never one cut by the scope's edge or set over another name: with no
      // clear corner it waits until one opens.
      const near = hypot(p.x, p.y);
      if (p.hot && near > 0.13) {
        const w = g.measureText(p.cs).width;
        const seats: Pt[] = [
          [10, -9],
          [10, 18],
          [-10 - w, -9],
          [-10 - w, 18],
        ];
        const box = (k: number): Box => [
          X(p.x) + seats[k][0] - 2,
          Y(p.y) + seats[k][1] - 11,
          w + 4,
          14,
        ];
        const from = p.seat ?? 0;
        const k = [0, 1, 2, 3]
          .map((n) => (from + n) % 4)
          .find((n) => free(box(n)));
        if (k !== undefined) {
          p.seat = k;
          taken.push(box(k));
          g.globalAlpha = p.a * min(1, (near - 0.13) / 0.08);
          g.fillStyle = c.label;
          g.fillText(p.cs, X(p.x) + seats[k][0], Y(p.y) + seats[k][1]);
        }
      }
      g.globalAlpha = 1;
    }
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = window.devicePixelRatio || 1;
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    R = min(H / 2 - 26, W / 2 - 14);
    const was = hw;
    hw = W / 2 / R;
    hh = H / 2 / R;
    if (!planes || abs(was - hw) > 0.4) {
      // Fill the scope for its size, and fly it for a while unseen so it is
      // busy from the first frame. Three planes carry callsigns.
      const kinds: Plane["kind"][] =
        W < 520
          ? ["arr", "arr", "arr", "arr", "dep", "ovf", "ovf"]
          : [
              "arr",
              "arr",
              "arr",
              "arr",
              "arr",
              "dep",
              "dep",
              "ovf",
              "ovf",
              "ovf",
              "ovf",
            ];
      etas = [];
      planes = kinds.map((kind, j) => {
        const p = {
          kind,
          hot: j < 2 || (kind === "dep" && kinds[j - 1] !== "dep"),
        } as Plane;
        spawn(p, floor(rnd(0, 900)));
        return p;
      });
      for (let n = 0; n < 1700; n++) tick();
    }
    draw();
  };

  // The simulation steps 60 times a second whatever the screen's refresh
  // rate, so planes fly at the same speed on a 120 Hz display.
  let running = false;
  let raf = 0;
  let last = 0;
  const loop = (ms: number) => {
    raf = requestAnimationFrame(loop);
    // Back from a long pause (a hidden tab): carry on, do not catch up.
    if (last && ms - last > 400) last = ms - STEP;
    let n = last ? min(10, floor((ms - last) / STEP)) : 1;
    if (!n) return;
    last = last ? last + n * STEP : ms;
    for (; n > 0; n--) tick();
    draw();
  };

  colors();
  // Fires once when it starts watching, which draws the first frame: under
  // reduced motion that one busy scope is all there is.
  new ResizeObserver(resize).observe(canvas);
  // The nav button announces a theme change.
  addEventListener("themechange", () => {
    colors();
    draw();
  });

  return {
    run(on: boolean) {
      on &&= !still;
      if (on === running) return;
      running = on;
      last = 0;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(loop);
    },
  };
}
