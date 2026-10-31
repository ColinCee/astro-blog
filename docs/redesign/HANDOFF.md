# Redesign handoff

State of the home-page redesign on 30 Oct 2026, for a fresh session to carry on. Nothing here is built into the site yet; it is comps, a token sheet, research and a list of what was rejected.

## Where things are

| What | Where |
|---|---|
| The design system (principles, tokens, roles, type, shape, marks, the posts kit), the living reference | `src/pages/design.astro`, at `/design/` on the dev server (dev only) |
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
| Round 18: writing in the terminal (won), or a compact section | `comps/shoot18.mts` |
| Round 19: worked at, thin marquee (won) or still | `comps/shoot19.mts` |
| Round 20: a tenure bar under each company, grey or a blue ramp (dropped) | `comps/shoot20.mts` |
| Round 21: the headline result or the industry (with an icon) under each company | `comps/shoot21.mts` |
| Round 22: worked at, locked (icon + start year) | `comps/shoot22.mts` |
| Round 23: separators between the worked-at names (slash won) | `comps/shoot23.mts` |
| Round 24: the worked-at year beside (won) or under the name | `comps/shoot24.mts` |
| Round 25: no icons; the blue on the slashes (won), the years, or nowhere | `comps/shoot25.mts` |
| Round 26: radar with arrows on real-looking routes; a proper cloud | `comps/shoot26.mts` |
| Round 27: a puffier cloud the text fits in, three styles (outline won) | `comps/shoot27.mts` |
| Round 28: the projects list, plain (won) or cards, with short subtitles (won) or none | `comps/shoot28.mts` |
| Round 29: red joins status; accent candidates (teal and magenta dropped after research, four left); controls at 6px; amber dot darkened to 3.4:1 | `comps/round29.html`, live page `accent` switch, `system.html` swatches; `comps/shoot29.mts` |
| Round 30: warm accents (tomato, orange) with the status dots folded into the accent | `comps/shoot30.mts` |
| Round 31–32: violet locked; dark by default, soft light as the toggle | `comps/shoot31.mts` |
| Round 33: real posts in the new system (the site's tokens remapped by `comps/post-reskin.css` over the dev server), and a Posts section in `system.html`: layout, header, figure anatomy, chart palette, the kit, blocks | `comps/shoot33.mts` (needs `blog-dev` on 4331) |
| Stat-line variants, the earlier right-side objects | `comps/stats.html`, `comps/hero-right.html` |
| Research: what polished tool sites and craft portfolios do; status colours, accent hues and control corners in eight design systems | `research/polish-research.md`, `research/palette-research.md`, `research/status-accent-research.md` |
| Every idea tried and dropped, one line each | `../design-rejected.md` (read it before proposing anything) |
| Screenshots of the current state | `shots/` |

Run the comps: `node comps/serve.mts` (port 4390, or `PORT=4391`) and open `/index.html`, which links every round; `/hero-line.html` is the home page as it was decided (the design system moved into the site, `/design/`). Pages reload themselves when a file in `comps/` changes, and saving `cook8.mts` or `tokens.mts` reruns it first. `node comps/shootNN.mts` takes headless screenshots with the repo's Playwright; `node comps/hang.mts <url>` tells you if a page has hung. The `.mts` files are scratch tooling; delete them when the hero is built.

## Design system

`src/pages/design.astro` (`/design/` on the blog dev server; it redirects home in a build) is the design system: the principles, colour scales and roles, type, shape, marks and motion, and the posts kit. Colours come from `comps/tokens.mts` (`node comps/tokens.mts` writes `src/styles/scales.css` for the site, and `scales.css` / `scales.json` for the comps). Update it in the same change as any decision below.

## Decisions Colin has made

- **Colour**: grey chrome from one cool-tinted neutral scale (12 steps); a **purple** accent (hue 308 since 31 Oct; violet 296 chosen 30 Oct over blue, indigo, sky, tomato and orange read muted lavender in dark) as one 6-step spectrum from dark violet up to the accent, shared by both themes, each job one step (31 Oct: the 12-step ramp had 8 unused steps; pale tints read pink or white): results, links, the one-liner's highlight and a hovered control; never chrome, a surface or a large area. Strength set 31 Oct between the first pale violet ("washed out") and full chroma ("too vivid"). Green and amber only as dots and tiny badges; borders cut from the ink at 8% / 14%; dark mode is the same OKLCH scales at other lightnesses. Scales and roles on the design page.
- **Type**: Sora for names and headings, Geist for reading, DM Mono for data. Name in Sora 600, sentence case, 2.6–4.25rem, −0.04em. No big uppercase name, no slogan headline. The one-liners are in **Sora 200**, punchline at 400, −0.03em (round 9; heavier weights were "a bit thick"). The line under the name is only "Senior Software Engineer". Locked in on 30 Oct 2026. Name and headings in **Sora 600** (−0.05em on the name), body in Geist, everything mono in **DM Mono** (round 10; Geist Mono clashed with Sora).
- **Terminal** (rounds 11–16): title `~/ColinOS`, no tmux bar. Left: `whoami` (Colin Cheung 張志權, nothing else), `top -u colin` with one time column in ink, `weather` (live from open-meteo), the cursor. Right pane: `ls -t ~/writing`, the latest five posts (date, title in Geist 400, stat: old grey, new purple, plain comparisons in ink) and "all 8 posts →"; posts come from each post's frontmatter. The writing section below is gone, and so are the shipped bars (the Parquet result is a post; the EDF and BBC results are on the CV). Locked 30 Oct 2026.
- **Worked at**: the thin marquee (Sora 200 names, DM Mono years, no grey band, 70 s loop with an even gap at the seam). Each name with the year he started beside it in DM Mono, a thin slash in Sora between names (the accent at 40%); no icons, no job lengths, which read as job-hopping, and no logos (brand rules, mixed availability, off-palette). Locked 30 Oct 2026.
- **Theme** (round 32): dark is the default; light is a toggle, and soft: page n5, panels n2, well n4, no pure white (bright white panels read as "a flashbang"). A saved choice wins over the default.
- **His switch picks**: corners 8px, depth flat (no borders or shadows on panels; surfaces by tone), density airy, list as a white panel. The terminal follows the theme (white window on the light page).
- **Layout**: name, role and links left; the one-liners right, as a **reel**: the current one, the next one faint underneath, no previous line. One every 5 s, hover pauses, click skips, a thin bar shows the time left (round 8–9). The terminal below with a real gap; worked-at strip, writing list, projects.
- **The figures**, in the diagram style he liked (HTML boxes with one padding rule, edges drawn between boxes from the DOM, slow traffic on the edges, numbers that count up then tick, a cloud shape for "the internet"), left the hero and joined their projects: training → dissertation, radar → flight-tracker, homelab → home-lab, delivery → colincheung.dev, a real Anki card → anki-chinese. Weather and factory are cut. Projects is the **picker** (list left, one figure right; locked 30 Oct 2026).
- **The one-liners** (18 of them, with inline drawings, flip counter and odometer) stay.
- **Radar** (flight-tracker figure, round 26): Heathrow at the centre with runway 27 east–west and the four stacks (BNN, LAM, BIG, OCK) marked. Planes are arrows with a short fading trail, steering to waypoints at a limited turn rate: arrivals from the edge, sometimes a lap of a stack, then downwind, base and a westbound final to land; departures roll west and turn out; overflights cross. Two are blue with callsigns. Drawn at the canvas's display scale.
- **Clouds** (the internet and Cloudflare-edge nodes): one SVG outline, five bumps on a flat base traced from overlapping circles, drawn bigger than the text box so the words sit in its body, as an outline at the diagram's line weight on the panel colour (round 27, locked).

**Locked (30 Oct 2026):** `hero-line.html` has no switches left; the reel, Sora, the pairing and the clean terminal are fixed in it. Rounds 8–11 pages keep the screenshots of what was compared.

## What he said needs refinement (not done)

- Footers: most figures have a mono footer line; "sometimes no text is better". Captions are Colin's words, so the overnight pass (31 Oct) left them; the ones that only restate their figure are listed for him in `docs/redesign/REVIEW.md`.
- Projects list (round 28): no repo count; subtitles cut to a few words ("game AI, 2018 and 2026", "London airspace, live", "one mini-PC, five stacks", "my Mandarin deck", "this site"). The list is plain and locked: no backgrounds, flush with the heading, the open project in ink with a purple slash hanging in the margin, the rest grey, each with its short subtitle.

## Building it into the site (started 30 Oct 2026, on `redesign-figures`)

Done and committed: the tokens (`src/styles/tokens.css` roles over the generated `scales.css`), Sora / Geist / DM Mono, dark by default with the light toggle in the nav, code blocks on the site's theme; posts (titles and headings in Sora, the stat split, flat figures, no caps labels, figure values at DM Mono 500); the hero reel; the terminal (whoami, top, weather, newest five posts); worked at; the blog index, CV, 404 and footer; the design page. `node docs/redesign/comps/shoot-site.mts home,blog,cv,blog/<slug>` shoots any page in dark, light and 375px from the dev server.

Also done: Projects (the picker with its five figures; copy in `src/data/projects.json`, the radar in `src/components/home/projects/radar.ts`), `DESIGN.md`, AGENTS.md and the writing skill. Left: Colin's review of every post's charts, the open points above, and merging the branch (his call). Known: hovering a project opens it, so scrolling the page under a still cursor can open one; the radar's live recolour on a theme switch is wired but not seen. The comps in `docs/redesign/comps/` are the record of what was decided; review now happens on the dev server.

## Rules that bind any further comp

No perspective tricks, no working shell, no git-graph career timeline, no split-flap or LED or ASCII text, nothing copied wholesale from ooting.app. Every box with text gets the same padding. Nothing moves without a visible cause except the slow edge traffic and the counters. Check light, dark and 375px before showing him anything, with a screenshot, not a description. Add to `design-rejected.md` the moment he drops an idea.
