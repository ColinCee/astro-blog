import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Every colour is a role from src/styles/tokens.css (DESIGN.md, Colours): no
// colour typed by hand, no step of a scale, no one-off mix, and none of the
// retired names. A line that must break this says why on itself or the line
// before ("colour exception: ..."); a file that must, says so once at its
// top ("colour exception (file): ...").
const SOURCE = "src";
const SKIP = new Set([
  "src/styles/tokens.css",
  "src/styles/scales.css",
  "src/styles/code-theme.ts",
  "src/pages/design.astro",
]);
const RULES: [string, RegExp][] = [
  [
    "a step of a scale",
    /var\(--(?:n|v|ok|warn|danger)\d+[,)]|["'`]--(?:n|v)\d+["'`]/,
  ],
  ["a one-off mix", /color-mix\(/],
  [
    "a retired name",
    /--(?:bg|panel|pane|well|muted|faint|line-strong|accent-text|accent-hover|win-bg|win-line|win-tile)(?![\w-])/,
  ],
];
// Colours typed by hand, looked for where a style is set: in markup a "#"
// starts a link, and elsewhere in a script a hex can be data.
const LITERAL: [string, RegExp] = [
  "a colour typed by hand",
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color|light-dark)\(|^\s*[a-z-]+:\s*(?:white|black|red|green|blue|gray|grey)\b/i,
];
const SETS_STYLE = /\bstyle=|\.style\b|setProperty|fillStyle|strokeStyle/;

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(dir, e.name))
      : /\.(astro|css|ts)$/.test(e.name)
        ? [join(dir, e.name).replaceAll("\\", "/")]
        : [],
  );

test("every colour is a role", () => {
  const found: string[] = [];
  for (const file of files(SOURCE)) {
    if (SKIP.has(file)) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes("colour exception (file):")) continue;
    const lines = text.split("\n");
    // In an .astro file, only what is inside a <style> block or a style
    // attribute is a style.
    let inStyle = file.endsWith(".css");
    lines.forEach((line, i) => {
      if (file.endsWith(".astro")) {
        if (/<style\b/.test(line)) inStyle = true;
        if (/<\/style>/.test(line)) inStyle = false;
      }
      const excused =
        line.includes("colour exception:") ||
        (lines[i - 1] ?? "").includes("colour exception:");
      if (excused) return;
      const styled = inStyle || SETS_STYLE.test(line);
      for (const [what, re] of styled ? [...RULES, LITERAL] : RULES)
        if (re.test(line)) found.push(`${file}:${i + 1} ${what}`);
    });
  }
  expect(found, "colours that are not a role").toEqual([]);
});
