// Scripts are TypeScript, which Node runs directly: this fails on any tracked
// .js, .mjs or .cjs file but the few a tool will only read as JavaScript.
//
//   node scripts/no-js.ts

import { execFileSync } from "node:child_process";

// Keep it short: each file with the reason a tool needs it as JavaScript.
const allowed = new Map([
  [".pnpmfile.mjs", "pnpm reads only a JavaScript pnpmfile"],
]);

const found = execFileSync(
  "git",
  ["ls-files", "-z", "--", "*.js", "*.mjs", "*.cjs"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter((f) => f && !allowed.has(f));

if (found.length) {
  console.error(
    `JavaScript files; write them in TypeScript, or add each to the list in scripts/no-js.ts with why a tool needs JavaScript:\n${found.map((f) => `  ${f}`).join("\n")}`,
  );
  process.exit(1);
}
