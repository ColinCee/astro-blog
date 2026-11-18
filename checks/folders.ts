// Folders are named for their job, so a reader knows what goes in one and it
// doesn't fill with anything: this fails on a tracked folder with a catch-all
// name but the few on the list below.
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

// Keep it short: each folder with why it stays for now.
const allowed = new Map([
  ["src/scripts", "the pages' browser modules; to split by job on its own"],
]);

const found = new Set<string>();
for (const file of execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0")) {
  const parts = file.split("/").slice(0, -1);
  parts.forEach((part, i) => {
    const folder = parts.slice(0, i + 1).join("/");
    if (catchAll.has(part) && !allowed.has(folder)) found.add(folder);
  });
}

if (found.size) {
  console.error(
    `Catch-all folder names; name each for its job, or add it to the list in checks/folders.ts with why it stays:\n${[...found].map((f) => `  ${f}/`).join("\n")}`,
  );
  process.exit(1);
}
