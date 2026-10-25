// Records a page as MP4s for a pull request: a phone scrolling down it and a
// desktop watching it load. Needs ffmpeg on PATH.
//
//   pnpm record <base-url> <out-dir> [path] [--until <selector>] [--hold <selector>] [--cache <dir>]
//
// Before and after, as shipped, each on its own port:
//   git worktree add --detach ../before <ref>     (then in ../before:)
//   pnpm install --frozen-lockfile && pnpm astro build && pnpm astro preview --port 4401
//   pnpm record http://localhost:4401 <tmp>/before / --until .term   (same for after)
//   pnpm compare <tmp>/before/phone.mp4 <tmp>/after/phone.mp4 <tmp>/phone.mp4
//   then stop the servers and `git worktree remove` the copies.
//
// The phone scrolls in flicks with a pause after each, like a reader, on the
// same timetable every run, so recordings of two versions line up, until
// the bottom of --until is on screen (default: two and a half screens).
// --hold pushes <selector> below the fold first, to show what happens when it
// starts off screen. Output: <out-dir>/phone.mp4 and <out-dir>/desktop.mp4.
//
// Frames come from Chrome's screencast (a sharp JPEG on every repaint), not
// Playwright's video, which is low bitrate and blurs text.
//
// So the two versions differ only where the code does: the clock is fixed,
// Math.random is seeded, and anything from another origin (an API, fonts) is
// answered from --cache, shared by both runs (default: a folder in the temp
// directory; delete it to refresh). The scroll goes by position, so a version
// whose content above moved shows different content at the same moment.
// Scroll position matches between runs to the pixel, but when an animation
// starts can still vary by about 0.3s from run to run, so don't read fine
// timing differences from the clips.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args.splice(at, 2)[1] : null;
};
const hold = flag("--hold");
const until = flag("--until");
const cache = flag("--cache") ?? join(tmpdir(), "record-cache");
const [base, out, path = "/"] = args;
// Git Bash turns a bare "/" into its install folder; run from PowerShell, or
// set MSYS_NO_PATHCONV=1.
if (!path.startsWith("/")) {
  console.error(`path must start with "/", got ${path}`);
  process.exit(1);
}
if (!base || !out) {
  console.error(
    "usage: pnpm record <base-url> <out-dir> [path] [--until <selector>] [--hold <selector>] [--cache <dir>]",
  );
  process.exit(1);
}
mkdirSync(out, { recursive: true });
mkdirSync(cache, { recursive: true });
const origin = new URL(base).origin;

const shots = [
  { name: "phone", width: 390, height: 844, scroll: true },
  { name: "desktop", width: 1280, height: 800, scroll: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const size = { width: s.width, height: s.height };
  const ctx = await browser.newContext({ viewport: size });
  // Only the date is fixed, not the clock: Playwright's clock would also fake
  // performance.timeOrigin and performance.now, which the timetable and the
  // trimming below rely on.
  await ctx.addInitScript(() => {
    const fixed = Date.UTC(2026, 0, 1, 12);
    const Real = Date;
    globalThis.Date = class extends Real {
      constructor(...a) {
        super(...(a.length ? a : [fixed]));
      }
      static now() {
        return fixed;
      }
    };
    let seed = 42;
    Math.random = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  await ctx.route("**/*", async (route) => {
    const req = route.request();
    if (!req.url().startsWith(origin)) {
      const key = join(
        cache,
        createHash("sha1").update(req.url()).digest("hex"),
      );
      if (!existsSync(`${key}.json`)) {
        const res = await route.fetch();
        // Keep only what worked, so a failed call is retried next run.
        if (res.status() !== 200) return route.fulfill({ response: res });
        writeFileSync(`${key}.body`, await res.body());
        writeFileSync(
          `${key}.json`,
          JSON.stringify({ status: res.status(), headers: res.headers() }),
        );
      }
      const { status, headers } = JSON.parse(
        readFileSync(`${key}.json`, "utf8"),
      );
      // The saved body is already decoded, so drop what described the wire.
      delete headers["content-encoding"];
      delete headers["content-length"];
      return route.fulfill({
        status,
        headers,
        body: readFileSync(`${key}.body`),
      });
    }
    if (hold && req.resourceType() === "document") {
      const res = await route.fetch();
      const html = await res.text();
      if (!html.includes("</head>"))
        throw new Error(`--hold: no </head> in ${req.url()}`);
      return route.fulfill({
        response: res,
        body: html.replace(
          "</head>",
          `<style>${hold} { margin-top: 120vh !important; }</style></head>`,
        ),
      });
    }
    return route.continue();
  });
  // Load it once first, so fonts and scripts come from cache in the take.
  const warm = await ctx.newPage();
  await warm.goto(base + path);
  await warm.waitForTimeout(1500);
  await warm.close();
  const page = await ctx.newPage();

  // Chrome sends a frame whenever the page repaints, with its time.
  const frames = [];
  const cdp = await ctx.newCDPSession(page);
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 92,
    maxWidth: s.width,
    maxHeight: s.height,
  });

  // The scroll runs inside the page on a timetable measured from the start of
  // navigation, so two versions recorded separately are at the same place at
  // the same moment. Scrolling from here instead drifts: each step's round
  // trip and the smooth-scroll animation vary from run to run.
  if (s.scroll)
    await page.addInitScript(
      ([sel, max]) => {
        const wait = 1200; // read the top first
        const flick = 350; // one thumb flick, easing out
        const pause = 1300; // then read
        let from = 0;
        let target = null;
        const step = () => {
          const t = performance.now();
          if (t >= wait) {
            // Measured once, when the first flick starts. Measuring every
            // frame lets one odd reading end a run's scroll early, and then
            // the two versions no longer line up.
            if (target === null) {
              const el = sel && document.querySelector(sel);
              const limit = document.documentElement.scrollHeight - innerHeight;
              target = Math.min(
                limit,
                el
                  ? el.getBoundingClientRect().bottom + scrollY - innerHeight
                  : max,
              );
            }
            const dist = Math.round(innerHeight * 0.4);
            const into = t - wait;
            const n = Math.floor(into / (flick + pause));
            const k = Math.min(1, (into - n * (flick + pause)) / flick);
            const y = Math.min(target, n * dist + dist * (1 - (1 - k) ** 3));
            if (y !== from) scrollTo({ top: y, behavior: "instant" });
            from = y;
            if (y >= target) {
              window.__scrolled = true;
              return;
            }
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      [until, s.height * 2.5],
    );

  await page.goto(base + path);
  if (s.scroll) {
    await page.waitForFunction(() => window.__scrolled, null, {
      timeout: 60_000,
    });
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(4500);
  }
  // Both clips start the moment navigation began.
  const start = (await page.evaluate(() => performance.timeOrigin)) / 1000;
  const end = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  await ctx.close();

  // Each frame lasts until the next one; ffmpeg's concat list says how long.
  // Frames from before navigation (the blank page) are dropped, and the first
  // frame after it is stretched back to the start.
  const kept = frames.filter((f) => f.t >= start);
  if (!kept.length) throw new Error(`no frames recorded for ${s.name}`);
  frames.splice(0, frames.length, ...kept);
  frames[0].t = start;
  const dir = mkdtempSync(join(tmpdir(), "record-"));
  const list = frames.map((f, i) => {
    const file = join(dir, `${String(i).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(f.data, "base64"));
    const next = frames[i + 1]?.t ?? Math.max(end, f.t + 0.5);
    return `file '${file.replaceAll("\\", "/")}'\nduration ${(next - f.t).toFixed(4)}`;
  });
  const last = join(dir, `${String(frames.length - 1).padStart(5, "0")}.jpg`);
  writeFileSync(
    join(dir, "list.txt"),
    `${list.join("\n")}\nfile '${last.replaceAll("\\", "/")}'\n`,
  );
  const mp4 = join(out, `${s.name}.mp4`);
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    join(dir, "list.txt"),
    "-vf",
    "fps=60,scale=trunc(iw/2)*2:trunc(ih/2)*2",
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
    mp4,
  ]);
  rmSync(dir, { recursive: true, force: true });
  console.log(mp4);
}
await browser.close();
