# Redesign handoff

State of the home-page redesign on 30 Oct 2026, for a fresh session to carry on. Nothing here is built into the site yet; it is comps, a token sheet, research and a list of what was rejected.

## Where things are

| What | Where |
|---|---|
| The design system (tokens, roles, type, corners, rules), as a page | `comps/system.html` |
| The token generator (OKLCH scales, contrast check) | `comps/tokens.mts` → `comps/scales.json` |
| The current hero comp: name left, cycling figures right | `comps/hero-figures.html` (built by `comps/cook7.mts` from `comps/console-v3.html`) |
| The whole home page in the new system, with the switches | `comps/console-v3.html` |
| Stat-line variants, the earlier right-side objects | `comps/stats.html`, `comps/hero-right.html` |
| Research: what polished tool sites and craft portfolios do | `research/polish-research.md`, `research/palette-research.md` |
| Every idea tried and dropped, one line each | `../design-rejected.md` (read it before proposing anything) |
| Screenshots of the current state | `shots/` |

Run the comps: `node comps/serve.mts` then open http://localhost:4390/index.html (the index links every round). `node comps/shoot.mts` takes headless screenshots with the repo's Playwright; `node comps/hang.mts <url>` tells you if a page has hung. The `.mts` files are scratch tooling; delete them when the hero is built.

## Decisions Colin has made

- **Colour**: grey chrome; one indigo-blue accent with two jobs (the new value of a result that got better, and links); green and amber only as dots and tiny badges; borders cut from the ink at 8% / 14%; dark mode is the same OKLCH scales at other lightnesses. All in `system.html`.
- **Type**: Geist and Geist Mono. Name at 600, sentence case, 2.6–4.25rem, −0.04em. No big uppercase name, no slogan headline.
- **His switch picks**: corners 8px, depth flat (no borders or shadows on panels; surfaces by tone), density airy, list as a white panel. The terminal follows the theme (white window on the light page).
- **Layout**: name and role left, the one-liner and links under them, one object right (the "fan layout"); the terminal below with a real gap; worked-at strip, writing list, projects as before.
- **The object**: a panel of figures in the diagram style he liked: HTML boxes with one padding rule, edges drawn between boxes from the DOM, slow traffic on the edges, numbers that count up then tick, every box a link, a cloud shape for anything that is "the internet". Figures cycle every 9 s with a dot strip; hover pauses.
- **The one-liners** (18 of them, with inline drawings, flip counter and odometer) stay. Options built: left under the name (today), bigger in ink, or as "fig. 0" in the rotation.

## What he said needs refinement (not done)

- Weather figure: the text is too long. Cut to temperature and one line.
- Footers: most figures have a mono footer line; "sometimes no text is better". Drop footers that only restate the figure.
- The one-liner rotates every 4 s and the figures every 9 s; with 18 one-liners and 7 figures the two rhythms will fight. Decide one rhythm (for example: the one-liner only changes when fig. 0 is shown, or the one-liner stays on the left and does not get a slide).
- Factory figures (tokens, PRs, deploys, review wait) are placeholders marked "sample figures". Wire to real data or cut the figure. Pipeline, homelab, training and radar numbers are real or already labelled simulated.
- Weather should read from open-meteo at build or on the client; the page-delivery figure's numbers (build time, bytes on the wire, edge count) can come from the build.

## Building it into the site, when he says go

1. `src/styles/tokens.css`: replace with the scales and roles from `system.html` (one `:root` block light, one `[data-theme="dark"]`). Keep the typography test rules (16–19px body, 1.5–1.8 line height, 45–90ch, 11px minimum, rem units).
2. `src/components/site/Head.astro`: load Geist and Geist Mono instead of Bricolage and JetBrains.
3. A theme toggle in `Nav.astro` writing `data-theme` on `<html>` and localStorage, light first.
4. `Hero.astro`: the two-column hero; keep the one-liner script and drawings as they are; port the figures from `hero-figures.html` as small components reading `src/data/*.json` (shipped, homelab-stacks, skills, anki-cards). The edge-drawing and number-ticking script is ~40 lines; keep it one script.
5. `Terminal.astro` and panes: drop the always-dark palette; use the page tokens; 8px corners; flat.
6. Writing list: stat variant B (old value struck in grey, new value in the accent; plain comparisons stay ink).
7. Rewrite `DESIGN.md` from `system.html`, and update `AGENTS.md`: the "One tomato per glance" rule and DESIGN.md's Metric Is The Accent Rule go stale.
8. Reduced motion: no edge traffic, no ticking, no cycling; the first figure static.

## Rules that bind any further comp

No perspective tricks, no working shell, no git-graph career timeline, no split-flap or LED or ASCII text, nothing copied wholesale from ooting.app. Every box with text gets the same padding. Nothing moves without a visible cause except the slow edge traffic and the counters. Check light, dark and 375px before showing him anything, with a screenshot, not a description. Add to `design-rejected.md` the moment he drops an idea.
