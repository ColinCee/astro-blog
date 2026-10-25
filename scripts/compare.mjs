// Puts a before and an after side by side, labelled, for a pull request.
//
//   pnpm compare <before> <after> <out> [--still <seconds> | --no-still]
//
// Side by side, or one above the other when they're wider than tall (a
// desktop side by side shrinks to a third in a PR). Two images (.png, .jpg,
// .webp) make one PNG; a smaller one is padded, not stretched. Two videos
// make one MP4 that plays in sync, so a PR reader compares one moment, not
// two loops (record both with `pnpm record` so they scroll on the same
// timetable). For videos it also writes <out>-still.png:
// the two frames at --still, or by default at the moment they differ most.

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args.splice(at, 2)[1] : null;
};
const noStill = args.includes("--no-still");
if (noStill) args.splice(args.indexOf("--no-still"), 1);
let still = flag("--still");
const [before, after, out] = args;
if (!before || !after || !out) {
  console.error(
    "usage: pnpm compare <before> <after> <out> [--still <seconds> | --no-still]",
  );
  process.exit(1);
}

const probe = (file, entries) =>
  execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    entries,
    "-of",
    "csv=p=0",
    file,
  ])
    .toString()
    .trim();
const ffmpeg = (...a) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], {
    maxBuffer: 64 * 1024 * 1024,
  });

const isImage = (f) => /\.(png|jpe?g|webp)$/i.test(f);
const dims = (f) => probe(f, "stream=width,height").split(",").map(Number);
const [[w0, h0], [w1, h1]] = [dims(before), dims(after)];
const wide = Math.max(w0, w1);
const tall = Math.max(h0, h1);
const stacked = wide > tall;
const length = isImage(before)
  ? 0
  : Math.max(
      ...[before, after].map((f) => Number(probe(f, "format=duration"))),
    );

const font =
  process.platform === "win32"
    ? "fontfile='C\\:/Windows/Fonts/consola.ttf':"
    : "font=monospace:";
// The shorter clip holds its last frame, so both end together; a smaller
// image is padded at the bottom and right, so both start level.
const label = (text) =>
  (length ? `tpad=stop_mode=clone:stop_duration=${length},` : "") +
  `pad=${wide}:${tall}:0:0:white,` +
  `drawtext=${font}text=${text}:x=16:y=16:fontsize=32:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=10`;
const sideBySide = stacked
  ? `[0]${label("BEFORE")},pad=iw:ih+16:0:0:white[a];[1]${label("AFTER")}[b];[a][b]vstack=inputs=2`
  : `[0]${label("BEFORE")},pad=iw+16:ih:0:0:white[a];[1]${label("AFTER")}[b];[a][b]hstack=inputs=2`;

if (isImage(before)) {
  ffmpeg("-i", before, "-i", after, "-filter_complex", sideBySide, out);
  console.log(out);
  process.exit(0);
}

ffmpeg(
  "-i",
  before,
  "-i",
  after,
  "-filter_complex",
  `${sideBySide},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
  "-t",
  String(length),
  "-c:v",
  "libx264",
  "-crf",
  "20",
  "-preset",
  "slow",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  out,
);
console.log(out);
if (noStill) process.exit(0);

// The moment the two differ most: the mean brightness of their difference,
// frame by frame. Needs both clips the same size, as `pnpm record` makes them.
if (!still) {
  const log = ffmpeg(
    "-i",
    before,
    "-i",
    after,
    "-filter_complex",
    "[0][1]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
    "-f",
    "null",
    "-",
  ).toString();
  let best = { t: 0, diff: -1 };
  let t = 0;
  for (const line of log.split("\n")) {
    const time = line.match(/pts_time:([\d.]+)/);
    if (time) t = Number(time[1]);
    const v = line.match(/YAVG=([\d.]+)/);
    if (v && Number(v[1]) > best.diff) best = { t, diff: Number(v[1]) };
  }
  still = best.t.toFixed(2);
  console.log(`most different at ${still}s`);
}
// Past the end there is no frame to take: use the last one.
still = String(Math.min(Number(still), Math.max(0, length - 0.05)));
const png = out.replace(/\.mp4$/, "-still.png");
ffmpeg(
  "-ss",
  still,
  "-i",
  before,
  "-ss",
  still,
  "-i",
  after,
  "-filter_complex",
  sideBySide,
  "-frames:v",
  "1",
  png,
);
console.log(png);
