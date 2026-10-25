// Records a page as GIFs for a pull request: a phone scrolling down it and a
// desktop watching it load. Needs a running server and ffmpeg on PATH.
//
//   pnpm record <base-url> <out-dir> [path] [--until <selector>] [--hold <selector>]
//
// The phone scrolls in flicks with a pause after each, like a reader, until
// the bottom of --until is on screen (default: two and a half screens).
// --hold pushes <selector> below the fold first, to show what happens when it
// starts off screen. Output: <out-dir>/phone.gif and <out-dir>/desktop.gif.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
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
    "usage: pnpm record <base-url> <out-dir> [path] [--hold <selector>]",
  );
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const shots = [
  { name: "phone", width: 390, height: 844, gif: 320, scroll: true },
  { name: "desktop", width: 1280, height: 800, gif: 800, scroll: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const dir = mkdtempSync(join(tmpdir(), "record-"));
  const size = { width: s.width, height: s.height };
  // Warm the dev server first, so its first-load reload isn't recorded.
  const warm = await browser.newPage({ viewport: size });
  await warm.goto(base + path);
  await warm.waitForTimeout(2000);
  await warm.close();

  const ctx = await browser.newContext({
    viewport: size,
    recordVideo: { dir, size },
  });
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
  await page.goto(base + path);
  if (s.scroll) {
    await page.waitForTimeout(1200);
    const done = () =>
      page.evaluate(
        ([sel, max]) => {
          const el = sel && document.querySelector(sel);
          const atEnd =
            scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
          if (atEnd) return true;
          return el
            ? el.getBoundingClientRect().bottom <= innerHeight
            : scrollY >= max;
        },
        [until, s.height * 2.5],
      );
    while (!(await done())) {
      for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 15);
        await page.waitForTimeout(16);
      }
      await page.waitForTimeout(1300);
    }
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(4500);
  }
  await ctx.close();

  const video = join(dir, readdirSync(dir)[0]);
  const gif = join(out, `${s.name}.gif`);
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    video,
    "-vf",
    `fps=12,scale=${s.gif}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5`,
    gif,
  ]);
  rmSync(dir, { recursive: true, force: true });
  console.log(gif);
}
await browser.close();
