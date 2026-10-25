// Puts a before and an after recording side by side in one labelled GIF that
// plays in sync, so a PR reader compares one moment, not two loops. With
// --still <seconds>, also writes the two frames at that moment as a PNG.
//
//   pnpm compare <before.gif> <after.gif> <out.gif> [--still <seconds>]
//
// Record both with `pnpm record` so they scroll at the same pace.

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const stillAt = args.indexOf("--still");
const still = stillAt >= 0 ? args.splice(stillAt, 2)[1] : null;
const [before, after, out] = args;
if (!before || !after || !out) {
  console.error(
    "usage: pnpm compare <before.gif> <after.gif> <out.gif> [--still <seconds>]",
  );
  process.exit(1);
}

const duration = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      file,
    ]).toString(),
  );
const length = Math.max(duration(before), duration(after));

// The shorter clip holds its last frame, so both end together.
const font =
  process.platform === "win32"
    ? "fontfile='C\\:/Windows/Fonts/consola.ttf':"
    : "font=monospace:";
const label = (text) =>
  `fps=10,tpad=stop_mode=clone:stop_duration=${length},` +
  `drawtext=${font}text=${text}:x=10:y=10:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6`;
const sideBySide =
  `[0]${label("BEFORE")},pad=iw+8:ih:0:0:white[a];[1]${label("AFTER")}[b];` +
  "[a][b]hstack=inputs=2";

const ffmpeg = (...a) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...a]);
ffmpeg(
  "-i",
  before,
  "-i",
  after,
  "-filter_complex",
  `${sideBySide},split[x][y];[x]palettegen=max_colors=128:stats_mode=diff[p];[y][p]paletteuse=dither=bayer:bayer_scale=5`,
  "-t",
  String(length),
  out,
);
console.log(out);

if (still) {
  const png = out.replace(/\.gif$/, "-still.png");
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
}
