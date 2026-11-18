// Folders are named for their job, so a reader knows what goes in one and it
// doesn't fill with anything: this fails on a tracked folder with a catch-all
// name.
//
//   node checks/folders.ts

import { execFileSync } from "node:child_process";

const catchAll = new Set([
  "scripts",
  "utils",
  "lib",
  "common",
  "helpers",
  "misc",
  "shared",
]);

const found = new Set<string>();
for (const file of execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0")) {
  const parts = file.split("/").slice(0, -1);
  parts.forEach((part, i) => {
    const folder = parts.slice(0, i + 1).join("/");
    if (catchAll.has(part)) found.add(folder);
  });
}

if (found.size) {
  console.error(
    `Catch-all folder names; name each for its job (AGENTS.md):\n${[...found].map((f) => `  ${f}/`).join("\n")}`,
  );
  process.exit(1);
}
