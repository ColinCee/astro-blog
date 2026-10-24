// A line chart from data, as SVG markup for a W × H drawing. The lines widget
// draws it in the browser at the figure's real width; LineChart.astro draws
// it at build time as the no-script fallback, so the data lives in one place.
// Data: x and y axes with a max, ticks and a title; an optional band of
// [x, low, high]; a line of [x, y]; optional dots of [x, y] (a run known only
// at a few points, joined dashed); labels placed at data points with pixel
// offsets; and a legend drawn in the plot's empty top-left corner.
export type Axis = { max: number; ticks: number[]; title: string };
export type Label = {
  x: number;
  y: number;
  text: string;
  cls?: string;
  anchor?: string;
  dx?: number;
  dy?: number;
};
export type Key = { kind: "line" | "dots" | "band"; text: string };
export type LineData = {
  x: Axis;
  y: Axis;
  band?: number[][];
  line: number[][];
  dots?: number[][];
  labels?: Label[];
  legend?: Key[];
};

const fmt = new Intl.NumberFormat("en-GB");
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The drawing's height for a width: wide charts are 0.42 as tall, within
// 220–300px.
export const chartHeight = (W: number) =>
  Math.round(Math.min(300, Math.max(220, W * 0.42)));

export function lineChart(d: LineData, W: number, H: number): string {
  const out: string[] = [];
  const el = (
    tag: string,
    attrs: Record<string, string | number>,
    text?: string,
  ) => {
    const a = Object.entries(attrs)
      .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
      .join("");
    out.push(
      text === undefined
        ? `<${tag}${a}/>`
        : `<${tag}${a}>${esc(text)}</${tag}>`,
    );
  };
  const L = 52,
    R = 12,
    T = 12,
    B = 44;
  const X = (v: number) => L + (v / d.x.max) * (W - L - R);
  const Y = (v: number) => H - B - (v / d.y.max) * (H - T - B);
  for (const t of d.y.ticks) {
    el("line", { class: "ax", x1: L, x2: W - R, y1: Y(t), y2: Y(t) });
    el("text", { x: L - 6, y: Y(t) + 4, "text-anchor": "end" }, fmt.format(t));
  }
  d.x.ticks.forEach((t, i) => {
    const anchor =
      i === 0 ? "start" : i === d.x.ticks.length - 1 ? "end" : "middle";
    el(
      "text",
      { x: X(t), y: H - B + 17, "text-anchor": anchor },
      fmt.format(t),
    );
  });
  el(
    "text",
    { x: L + (W - L - R) / 2, y: H - 6, "text-anchor": "middle" },
    d.x.title,
  );
  const yt = (T + H - B) / 2;
  el(
    "text",
    {
      x: 11,
      y: yt,
      "text-anchor": "middle",
      transform: `rotate(-90 11 ${yt})`,
    },
    d.y.title,
  );
  if (d.band) {
    const up = d.band.map(([x, , h]) => `${X(x)},${Y(h)}`);
    const down = d.band.map(([x, l]) => `${X(x)},${Y(l)}`).reverse();
    el("polygon", {
      class: "band band--runs",
      points: [...up, ...down].join(" "),
    });
  }
  el("polyline", {
    class: "ln hi",
    points: d.line.map(([x, v]) => `${X(x)},${Y(v)}`).join(" "),
  });
  if (d.dots) {
    el("polyline", {
      class: "ln hi ln--dash",
      points: d.dots.map(([x, v]) => `${X(x)},${Y(v)}`).join(" "),
    });
    for (const [x, v] of d.dots)
      el("circle", { class: "hi", cx: X(x), cy: Y(v), r: 4 });
  }
  (d.legend ?? []).forEach((k, i) => {
    const ky = T + 10 + i * 18,
      kx = L + 10;
    if (k.kind === "band")
      el("rect", {
        class: "band band--runs",
        x: kx,
        y: ky - 5,
        width: 22,
        height: 10,
      });
    else
      el("line", {
        class: k.kind === "dots" ? "ln hi ln--dash" : "ln hi",
        x1: kx,
        x2: kx + 22,
        y1: ky,
        y2: ky,
      });
    if (k.kind === "dots")
      el("circle", { class: "hi", cx: kx + 11, cy: ky, r: 3.5 });
    el("text", { x: kx + 30, y: ky + 4, class: "ink" }, k.text);
  });
  for (const l of d.labels ?? []) {
    el(
      "text",
      {
        x: X(l.x) + (l.dx ?? 0),
        y: Y(l.y) + (l.dy ?? 0),
        "text-anchor": l.anchor ?? "start",
        ...(l.cls ? { class: l.cls } : {}),
      },
      l.text,
    );
  }
  return out.join("");
}
