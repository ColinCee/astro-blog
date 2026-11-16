// The Glasgow panel's live reading (open-meteo, no key): the temperature
// now, the sky in words, and today's 24 hours as one line with "now" on it.
// The panel ships with dashes; this fills them in, and says "live" in the
// border when it has, or "offline" when it could not. No stand-in numbers:
// a reading is real or it is a dash.
//
// It asks again every half hour while the tab is showing, and when the tab
// is shown again with a reading older than that. If asking again fails, the
// reading stays and the border stops saying "live": it says "last seen" and
// the time of that reading.
import type { WindowCtx } from "./context";

// Asked for in Glasgow's own time, so "now" is the right hour in summer too.
const API =
  "https://api.open-meteo.com/v1/forecast?latitude=55.8642&longitude=-4.2518&current=temperature_2m,weather_code&hourly=temperature_2m&forecast_days=1&timezone=Europe%2FLondon";

// WMO weather code to words.
const SKY: Record<number, string> = {
  0: "clear",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  85: "snow showers",
  86: "snow showers",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm",
};

// How long a reading stands before it is asked for again, in ms.
const REFETCH_MS = 30 * 60_000;

type Answer = {
  current?: {
    time?: unknown;
    temperature_2m?: unknown;
    weather_code?: unknown;
  };
  hourly?: { temperature_2m?: unknown };
};

// A real minus sign, not the hyphen a number prints with.
const signed = (n: number) => String(n).replace("-", "−");

export function initWeather(app: HTMLElement, boot: WindowCtx["boot"]) {
  const panel = app.querySelector<HTMLElement>('[data-pn="wx"]');
  if (!panel) return;
  const one = (hook: string) =>
    panel.querySelector<HTMLElement>(`[data-wx-${hook}]`)!;
  const note = one("note");
  const plot = one("plot");
  const here = one("here");
  const cross = one("cross");
  const dot = one("dot");

  // The line draws once it has both its data and its turn in the opening
  // round (at once, where there is no round).
  let ready = false;
  let turn = !boot.running();
  const draw = () => {
    if (ready && turn) plot.classList.add("is-drawn");
  };
  boot.onVisit((name) => {
    if (name !== "wx") return;
    turn = true;
    draw();
  });

  // What the border says at rest: nothing until the first answer, then
  // "live", "offline", or when the reading on show was taken. The pointer
  // borrows the border while it is over the plot.
  let rest = "";
  let reading = false;
  const say = (words: string) => {
    rest = words;
    if (!reading) note.textContent = words;
  };

  // Today hour by hour, on a scale of whole degrees around the day's range.
  // `h` is the hours on show and `now` the hour the reading was taken; both
  // change when a later answer lands, so everything below reads them afresh.
  let h: number[] = [];
  let now = -1;
  let lo = 0;
  let hi = 1;
  const X = (i: number) => (i / (h.length - 1)) * 100;
  const Y = (v: number) => ((hi - v) / (hi - lo)) * 100;
  const place = (el: HTMLElement, i: number) => {
    el.style.left = `${X(i)}%`;
    if (el !== cross) el.style.top = `${Y(h[i])}%`;
    el.hidden = false;
  };

  // Seat the "now" label: centred over its dot, or stepped to one side when
  // the line climbs through that spot or the plot ends there.
  const tag = here.firstElementChild as HTMLElement;
  const seat = () => {
    const n = h.length - 1;
    const W = plot.clientWidth;
    const H = plot.clientHeight;
    if (!W || here.hidden) return;
    const half = tag.offsetWidth / 2;
    const foot = (Y(h[now]) / 100) * H - 7; // the label's lower edge
    const lineAt = (x: number) => {
      const f = Math.max(0, Math.min(n, (x / W) * n));
      const a = Math.floor(f);
      const b = Math.min(n, a + 1);
      return ((Y(h[a]) + (Y(h[b]) - Y(h[a])) * (f - a)) / 100) * H;
    };
    const clear = (mid: number) =>
      mid - half >= -4 &&
      mid + half <= W + 6 &&
      [0, 0.25, 0.5, 0.75, 1].every(
        (t) => lineAt(mid - half + t * 2 * half) >= foot + 1,
      );
    const side = [0, -1, 1].find((d) => clear((now / n) * W + d * (half - 3)));
    here.dataset.seat = side === -1 ? "l" : side === 1 ? "r" : "";
    // On the dashed top line, the label breaks it.
    here.classList.toggle("is-cut", foot > -2 && foot - tag.offsetHeight < 2);
  };
  window.addEventListener("resize", seat);

  // The pointer reads any hour: a hairline, a dot, and the reading in the
  // border where "live" was.
  plot.addEventListener("pointermove", (e) => {
    const n = h.length - 1;
    if (n < 1) return;
    const r = plot.getBoundingClientRect();
    const i = Math.max(
      0,
      Math.min(n, Math.round(((e.clientX - r.left) / r.width) * n)),
    );
    place(cross, i);
    place(dot, i);
    reading = true;
    const hour = document.createElement("span");
    const temp = document.createElement("span");
    hour.textContent = `${String(i).padStart(2, "0")}:00`;
    temp.textContent = `${signed(Math.round(h[i] * 10) / 10)}°`;
    note.replaceChildren(hour, " ", temp);
  });
  plot.addEventListener("pointerleave", () => {
    cross.hidden = dot.hidden = true;
    reading = false;
    note.textContent = rest;
  });

  const chart = (hours: number[], at: number) => {
    h = hours;
    now = at;
    const n = h.length - 1;
    lo = Math.floor(Math.min(...h));
    hi = Math.max(Math.ceil(Math.max(...h)), lo + 1);
    // The plot's viewBox is 230 by 100.
    const pts = h
      .map((v, i) => `${(X(i) * 2.3).toFixed(1)},${Y(v).toFixed(1)}`)
      .join("L");
    one("line").setAttribute("d", `M${pts}`);
    one("area").setAttribute("d", `M${pts}L230,100L0,100Z`);
    one("hi").textContent = `${signed(hi)}°`;
    one("lo").textContent = `${signed(lo)}°`;
    // A hairline left on the hours this replaces would be in the wrong
    // place, so the pointer's reading ends until it moves again.
    cross.hidden = dot.hidden = true;
    reading = false;
    if (now >= 0 && now <= n) {
      place(here, now);
      seat();
    } else here.hidden = true;
    ready = true;
    draw();
  };

  // When the last answer landed, and the time on its reading ("13:15").
  let got = 0;
  let taken = "";
  const load = () =>
    fetch(API)
      .then((r) => r.json())
      .then((d: Answer) => {
        const c = d.current;
        if (typeof c?.temperature_2m !== "number")
          throw new Error("no reading");
        one("temp").textContent = signed(Math.round(c.temperature_2m));
        one("text").textContent = SKY[c.weather_code as number] ?? "";
        got = Date.now();
        taken = typeof c.time === "string" ? c.time.slice(11, 16) : "";
        // With no hours in the answer, the reading alone.
        const hours = d.hourly?.temperature_2m;
        if (
          Array.isArray(hours) &&
          hours.length > 1 &&
          hours.every((v) => typeof v === "number")
        )
          chart(hours, taken ? Number(taken.slice(0, 2)) : -1);
        say("live");
      })
      .catch(() => {
        // An earlier reading stays, and is no longer called live.
        say(got ? `last seen ${taken || "earlier"}` : "offline");
      });

  load();
  setInterval(() => {
    if (!document.hidden) load();
  }, REFETCH_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - got >= REFETCH_MS) load();
  });
}
