// PreToolUse hook: when a command opens or edits a PR on a branch that changes
// the site, remind the agent to show the change (the pr-visuals skill). It runs
// on every shell command but prints nothing for the rest, so the agent only
// reads it when a PR is made.

import { execFileSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const command: string = JSON.parse(input).tool_input?.command ?? "";
if (!/\bgh(\.exe)?["']?\s+(-R\s+\S+\s+)?pr\s+(create|edit)\b/.test(command))
  process.exit(0);
// Files being attached means the visuals are already going up.
if (command.includes("--attach")) process.exit(0);

// What the branch changed. If the base can't be found, remind anyway: a
// reminder that wasn't needed costs less than one that never came.
const changed = (() => {
  try {
    return execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
})();
if (changed !== null && !/^(src|public)\//m.test(changed)) process.exit(0);

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext:
        'This branch may change the site. If it changes how a page looks or moves, the PR needs a "What it looks like" section: follow the pr-visuals skill (.claude/skills/pr-visuals/SKILL.md) before or right after this command.',
    },
  }),
);
