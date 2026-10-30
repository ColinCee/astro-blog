# Redesign handoff

State of the home-page redesign on 30 Oct 2026, for a fresh session to carry on. Nothing here is built into the site yet; it is comps, a token sheet, research and a list of what was rejected.

## Where things are

| What | Where |
|---|---|
| The design system (tokens, roles, type, corners, rules), as a page | `comps/system.html` |
| The token generator (OKLCH scales, contrast check) | `comps/tokens.mts` → `comps/scales.json` |
| The current hero comp: name left, cycling figures right | `comps/hero-figures.html` (built by `comps/cook7.mts` from `comps/console-v3.html`) |
| The whole home page in the new system, with the switches | `comps/console-v3.html` |
| Round 8: one-liner right, figures moved into Projects (bare / panel / reel; cards / picker) | `comps/round8.html` (screenshots), `comps/hero-line.html` (live, built by `comps/cook8.mts`, shot by `comps/shoot8.mts`) |
| Round 9: the reel with only the next line, in nine light typefaces | `comps/round9.html` (shot by `comps/shoot9.mts`); same live page, `face` switch |
| Round 10: font pairings next to Sora (mono face; name in Geist or Sora) | `comps/round10.html` (shot by `comps/shoot10.mts`); live page, `pair` switch |
| Round 11: the terminal cleaned up | `comps/shoot11.mts` |
| Round 12: shipped bars with a label on each bar, one legend, or nothing (none won) | `comps/shoot12.mts` |
| Round 13: whoami and weather back; the right pane as shipped, now list or both | live page, `term` switch; `comps/shoot13.mts` |
| Round 14: commands only, across the width or in one column (dropped) | `comps/shoot14.mts` |
| Round 15–16: the CV in the terminal's right pane, as a timeline or a list (dropped) | `comps/shoot15.mts` |
| Round 17: the terminal, locked | `comps/shoot17.mts` |
| Round 18: writing in the terminal, or a compact section | live page, `writing` switch; `comps/shoot18.mts` |
| Stat-line variants, the earlier right-side objects | `comps/stats.html`, `comps/hero-right.html` |
| Research: what polished tool sites and craft portfolios do | `research/polish-research.md`, `research/palette-research.md` |
| Every idea tried and dropped, one line each | `../design-rejected.md` (read it before proposing anything) |
| Screenshots of the current state | `shots/` |

Run the comps: `node comps/serve.mts` (`PORT=4391` to pick another port) then open http://localhost:4390/index.html (the index links every round). `node comps/shoot.mts` takes headless screenshots with the repo's Playwright; `node comps/hang.mts <url>` tells you if a page has hung. The `.mts` files are scratch tooling; delete them when the hero is built.

## Decisions Colin has made

- **Colour**: grey chrome; one indigo-blue accent with two jobs (the new value of a result that got better, and links); green and amber only as dots and tiny badges; borders cut from the ink at 8% / 14%; dark mode is the same OKLCH scales at other lightnesses. All in `system.html`.
- **Type**: Geist and Geist Mono. Name at 600, sentence case, 2.6–4.25rem, −0.04em. No big uppercase name, no slogan headline. The one-liners are in **Sora 200**, punchline at 400, −0.03em (round 9; heavier weights were "a bit thick"). The line under the name is only "Senior Software Engineer". Locked in on 30 Oct 2026. Name and headings in **Sora 600** (−0.05em on the name), body in Geist, everything mono in **DM Mono** (round 10; Geist Mono clashed with Sora).
- **Terminal** (rounds 11–16): title `~/ColinOS`, no tmux bar. Left: `whoami` (Colin Cheung 張志權, nothing else), `top -u colin` with one time column in ink, `weather` (live from open-meteo), the cursor. Right pane: shipped, bars without labels (grey above is before, blue below is after), the Parquet item marked EDF Energy with its title linking to the post, and "the full cv →" under it. The worked-at strip stays below. Locked 30 Oct 2026.
- **His switch picks**: corners 8px, depth flat (no borders or shadows on panels; surfaces by tone), density airy, list as a white panel. The terminal follows the theme (white window on the light page).
- **Layout**: name, role and links left; the one-liners right, as a **reel**: the current one, the next one faint underneath, no previous line. One every 5 s, hover pauses, click skips, a thin bar shows the time left (round 8–9). The terminal below with a real gap; worked-at strip, writing list, projects.
- **The figures**, in the diagram style he liked (HTML boxes with one padding rule, edges drawn between boxes from the DOM, slow traffic on the edges, numbers that count up then tick, a cloud shape for "the internet"), left the hero and joined their projects: training → dissertation, radar → flight-tracker, homelab → home-lab, delivery → colincheung.dev, a real Anki card → anki-chinese. Weather and factory are cut. Projects is the **picker** (list left, one figure right; locked 30 Oct 2026).
- **The one-liners** (18 of them, with inline drawings, flip counter and odometer) stay.

**Locked (30 Oct 2026):** `hero-line.html` now has only the open choice as a switch (`writing`); the reel, Sora, the pairing and the clean terminal are fixed in it. Rounds 8–11 pages keep the screenshots of what was compared.

## What he said needs refinement (not done)

- Footers: most figures have a mono footer line; "sometimes no text is better". Drop footers that only restate the figure.
- Writing (round 18, `writing` switch; he finds the section "too big and not that cool"): `term`, the latest five posts in the terminal's right pane in place of shipped (`ls -t ~/writing`, date, title, stat; "all 8 posts →"), and no writing section; or `compact`, shipped stays and the section becomes two columns of title and stat, no panel or dates. Posts come from each post's frontmatter.
- The page-delivery figure's numbers (build time, bytes on the wire, edge count) can come from the build.

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
