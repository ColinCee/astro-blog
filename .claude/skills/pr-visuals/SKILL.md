---
name: pr-visuals
description: Show a front-end change in its pull request, with before/after screenshots or a synced side-by-side video. Use when opening or updating a PR that changes how a page looks or moves.
---

# Showing a change in its PR

Colin wants to see a visual change from the PR itself, before he merges, without running the site. Every PR that changes how a page looks or moves gets a "What it looks like" section near the top of its body.

## Decide what to show

That part is yours, per PR: which page and path, which interaction, and which views changed (phone, desktop, or both).

- **A still change** (layout, colour, copy): screenshots, before and after.
- **Motion** (animation, scroll behaviour, loading): one side-by-side MP4 that plays in sync, plus a still of the moment that shows the difference.
- Never GIFs (laggy, blurry) and never two separate clips (they loop out of step).

## Make the files

The commands do the mechanics; the recipe, including building each version in its own worktree, is at the top of `scripts/record.mjs`.

1. Build and serve each version as it ships (`pnpm astro build`, `pnpm astro preview --port <n>`), each on its own port.
2. `pnpm record <url> <dir> [path] [--until <selector>] [--hold <selector>]` for each version. It writes `phone.mp4` and `desktop.mp4`, with live content frozen so only the code differs.
3. `pnpm compare <before> <after> <out>`. Two images make one PNG. Two videos make one MP4 plus `<out>-still.png`, taken at the moment they differ most while nothing moves. Pass `--still <s>` to choose the moment, or `--no-still` when no single frame shows the change.
4. Look at each still before using it. If it doesn't show the change, pick the moment yourself or leave the still out.

## Put them in the PR

- In the body file, reference each file by local path. A video goes alone in its own paragraph as `![](./phone.mp4)`; an image as `![what it shows](./phone-still.png)`.
- Upload with `gh pr create` or `gh pr edit` plus `--body-file <file> --attach <file>` for each file. This needs gh 2.103 or later; 2.58 has no `--attach`.
- Then open the PR page and check that each video and image sits where you put it. A reference gh didn't rewrite stays as dead text.
- Videos must stay under 10 MB.

## Limits

- Scroll position matches between runs to the pixel, but when an animation starts can vary by about 0.3s, so don't read fine timing differences from the clips.
- The scroll goes by position, so if the content above moved between versions, the two sides show different content at the same moment.
