import { expect, test } from "@playwright/test";
import { styleLines } from "./style-scan";

// Every colour is a role from src/styles/tokens.css (DESIGN.md, Colours): no
// colour typed by hand, no step of a scale, no one-off mix, and none of the
// retired names. Exceptions are marked as style-scan.ts says, with "colour".
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

test("every colour is a role", () => {
  const found: string[] = [];
  for (const { at, text, styled } of styleLines("colour", SKIP))
    for (const [what, re] of styled ? [...RULES, LITERAL] : RULES)
      if (re.test(text)) found.push(`${at} ${what}`);
  expect(found, "colours that are not a role").toEqual([]);
});
