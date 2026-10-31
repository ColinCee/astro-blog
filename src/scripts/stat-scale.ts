// The two sides of a stat ("12 h → 11 min", "£127 → £826.61") as fractions of
// the larger, so the blog index can draw them to scale like the posts' own
// before/after bars. Each side is read into one base unit per kind (seconds,
// bytes, percent, pounds); null when a side can't be read or the kinds differ.
const UNITS: Record<string, [kind: string, factor: number]> = {
  s: ["time", 1],
  min: ["time", 60],
  h: ["time", 3600],
  KB: ["bytes", 1e3],
  MB: ["bytes", 1e6],
  GB: ["bytes", 1e9],
  "%": ["percent", 1],
  "£": ["pounds", 1],
};

function measure(side: string) {
  const m = side.trim().match(/^(£)?\s*([\d.,]+)\s*(s|min|h|KB|MB|GB|%)?$/);
  if (!m) return null;
  const unit = UNITS[m[1] ?? m[3] ?? ""];
  if (!unit) return null;
  return { kind: unit[0], value: Number(m[2].replace(/,/g, "")) * unit[1] };
}

export function statScale(was: string, now: string) {
  const a = measure(was);
  const b = measure(now);
  if (!a || !b || a.kind !== b.kind || !a.value || !b.value) return null;
  const top = Math.max(a.value, b.value);
  return { was: a.value / top, now: b.value / top };
}
