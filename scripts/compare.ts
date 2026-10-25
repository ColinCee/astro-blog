// Puts a before and an after side by side, labelled, for a pull request.
//
//   pnpm compare <before> <after> <out> [--still <seconds> | --no-still]
//   pnpm compare --new <after> <out>     a new page or view, labelled NEW
//
// Side by side, or one above the other when they're wider than tall (a
// desktop side by side shrinks to a third in a PR). Two images (.png, .jpg,
// .webp) make one PNG; a smaller one is padded, not stretched. Two videos
// make one MP4 that plays in sync, so a PR reader compares one moment, not
// two loops (record both with `pnpm record` so they scroll on the same
// timetable). For videos it also writes <out>-still.png:
// the two frames at --still, or by default at the moment they differ most.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const flag = (name: string): string | null => {
  const at = args.indexOf(name);
  return at >= 0 ? args.splice(at, 2)[1] : null;
};
const toggle = (name: string): boolean => {
  const at = args.indexOf(name);
  if (at >= 0) args.splice(at, 1);
  return at >= 0;
};
const noStill = toggle("--no-still");
const isNew = toggle("--new");
let still = flag("--still");
const [before, after, out] = isNew ? [null, ...args] : args;
if (!after || !out) {
  console.error(
    "usage: pnpm compare <before> <after> <out> [--still <seconds> | --no-still]\n       pnpm compare --new <after> <out>",
  );
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });

const probe = (file: string, entries: string) =>
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
const ffmpeg = (...a: string[]) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a], {
    maxBuffer: 64 * 1024 * 1024,
  });

const isImage = (f: string) => /\.(png|jpe?g|webp)$/i.test(f);
const font =
  process.platform === "win32"
    ? "fontfile='C\\:/Windows/Fonts/consola.ttf':"
    : "font=monospace:";
const tag = (text: string) =>
  `drawtext=${font}text=${text}:x=16:y=16:fontsize=32:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=10`;

// Nothing to compare against: the one version, labelled.
if (isNew) {
  const video = isImage(after)
    ? []
    : ["-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p"];
  ffmpeg(
    "-i",
    after,
    "-vf",
    `${tag("NEW")},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
    ...video,
    out,
  );
  console.log(out);
  process.exit(0);
}
if (!before) throw new Error("usage: pnpm compare <before> <after> <out>");

const dims = (f: string) =>
  probe(f, "stream=width,height").split(",").map(Number);
const [[w0, h0], [w1, h1]] = [dims(before), dims(after)];
const wide = Math.max(w0, w1);
const tall = Math.max(h0, h1);
const stacked = wide > tall;
const lengths = isImage(before)
  ? [0]
  : [before, after].map((f) => Number(probe(f, "format=duration")));
const length = Math.max(...lengths);

// The shorter clip holds its last frame, so both end together; a smaller
// image is padded at the bottom and right, so both start level.
const label = (text: string) =>
  (length ? `tpad=stop_mode=clone:stop_duration=${length},` : "") +
  `pad=${wide}:${tall}:0:0:white,${tag(text)}`;
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

// The moment the two differ most, while neither is moving: mid-scroll the
// whole page shifts and swamps the real change, and so does the first paint.
// Each measure is the mean brightness of a difference, frame by frame; the
// clips must be the same size, as `pnpm record` makes them.
if (!still) {
  const measure = (graph: string, ...inputs: string[]) =>
    ffmpeg(
      ...inputs.flatMap((f) => ["-i", f]),
      "-filter_complex",
      `${graph},signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`,
      "-f",
      "null",
      "-",
    )
      .toString()
      .split("\n")
      .flatMap((l) => l.match(/YAVG=([\d.]+)/)?.[1] ?? [])
      .map(Number);
  const diff = measure("[0][1]blend=all_mode=difference", before, after);
  const motion = (f: string) => measure("[0]tblend=all_mode=difference", f);
  const [moveA, moveB] = [motion(before), motion(after)];
  const fps = 60;
  let best = { i: diff.length - 1, d: -1 };
  diff.forEach((d, i) => {
    // Still for about 150 ms either side, so it isn't a flick's first frame.
    const still = (m: number[]) =>
      m.slice(Math.max(0, i - 9), i + 10).every((x: number) => x < 0.3);
    if (i / fps >= 0.5 && still(moveA) && still(moveB) && d > best.d)
      best = { i, d };
  });
  still = (best.i / fps).toFixed(2);
  console.log(`most different at ${still}s`);
}
// Past the end of the shorter clip there is no frame to take from it.
still = String(
  Math.min(Number(still), Math.max(0, Math.min(...lengths) - 0.05)),
);
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
if (!existsSync(png)) throw new Error(`no frame at ${still}s for the still`);
console.log(png);
