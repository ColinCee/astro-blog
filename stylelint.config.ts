import { readFileSync } from "node:fs";
import type { Config } from "stylelint";

// Every colour and text size is a role from tokens.css, and every line-height
// and weight one of the few below (DESIGN.md, Colours and Type). A line that
// must break a rule says why on the line before:
// /* stylelint-disable-next-line <rule> -- why */
const TOKENS = ["src/styles/tokens.css", "src/styles/scales.css"];
const sizes = [...readFileSync(TOKENS[0], "utf8").matchAll(/(--text-[\w-]+):/g)]
  .map((m) => m[1])
  .join("|");

export default {
  overrides: [
    { files: ["**/*.astro", "**/*.mdx"], customSyntax: "postcss-html" },
    // The design page shows the scales themselves.
    {
      files: ["src/pages/design.astro"],
      rules: {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-value-disallowed-list": null,
      },
    },
  ],
  ignoreFiles: TOKENS,
  reportDescriptionlessDisables: true,
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  rules: {
    "color-no-hex": true,
    "color-named": "never",
    // Any case: CSS function names are case-insensitive.
    "function-disallowed-list": [
      /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)$/i,
    ],
    // A step of a scale is for the roles in tokens.css to pick, and the
    // retired names are gone.
    "declaration-property-value-disallowed-list": {
      "/.*/": [
        /var\(--(n|v|ok|warn|danger)\d/,
        /--(bg|panel|pane|well|muted|faint|line-strong|accent-text|accent-hover|win-bg|win-line|win-tile)(?![\w-])/,
      ],
    },
    "declaration-property-value-allowed-list": {
      // A role, or a role scaled by a figure's --k.
      "font-size": [
        new RegExp(
          `^(var\\((${sizes})\\)|calc\\(var\\((${sizes})\\) \\* (var\\(--k, 1\\)|max\\(1, var\\(--k, 1\\)\\))\\))$`,
        ),
        "inherit",
      ],
      "line-height": ["1", "1.3", "1.6", "inherit"],
      "font-weight": ["200", "300", "400", "500", "600", "inherit"],
      font: ["inherit"],
    },
  },
} satisfies Config;
