// Records a page as MP4s for a pull request: a phone scrolling down it and a
// desktop watching it load. Needs a running server and ffmpeg on PATH.
//
//   pnpm record <base-url> <out-dir> [path] [--until <selector>] [--hold <selector>]
//
// The phone scrolls in flicks with a pause after each, like a reader, on the
// same timetable every run, so recordings of two versions line up, until
// the bottom of --until is on screen (default: two and a half screens).
// --hold pushes <selector> below the fold first, to show what happens when it
// starts off screen. Output: <out-dir>/phone.mp4 and <out-dir>/desktop.mp4.
//
// Frames come from Chrome's screencast (a sharp JPEG on every repaint), not
// Playwright's video, which is low bitrate and blurs text.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
const [base, out, path = "/"] = args;
if (!base || !out) {
  console.error(
    "usage: pnpm record <base-url> <out-dir> [path] [--until <selector>] [--hold <selector>]",
  );
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const shots = [
  { name: "phone", width: 390, height: 844, scroll: true },
  { name: "desktop", width: 1280, height: 800, scroll: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const size = { width: s.width, height: s.height };
  // Warm the dev server first, so its first-load reload isn't recorded.
  const warm = await browser.newPage({ viewport: size });
  await warm.goto(base + path);
  await warm.waitForTimeout(2000);
  await warm.close();

  const ctx = await browser.newContext({ viewport: size });
  const page = await ctx.newPage();
  if (hold)
    await page.route(base + path, async (route) => {
      const res = await route.fetch();
      const html = (await res.text()).replace(
        "</head>",
        `<style>${hold} { margin-top: 120vh !important; }</style></head>`,
      );
      await route.fulfill({ response: res, body: html });
    });

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
          if (target === null && t >= wait) {
            const el = sel && document.querySelector(sel);
            const limit = document.documentElement.scrollHeight - innerHeight;
            target = Math.min(
              limit,
              el
                ? el.getBoundingClientRect().bottom + scrollY - innerHeight
                : max,
            );
          }
          if (target !== null) {
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
  // The frame on screen when navigation began is stretched back to it.
  const first = Math.max(
    0,
    frames.findLastIndex((f) => f.t <= start),
  );
  frames.splice(0, first);
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
