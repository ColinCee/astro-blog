---
name: colincheung.dev
description: Terminal-native personal site — Stone (warm grey) light theme and a warm near-black dark theme, one tomato signal, Bricolage Grotesque + JetBrains Mono.
colors:
  bg: "oklch(0.905 0.008 85)"
  panel: "oklch(0.92 0.008 85)"
  pane: "oklch(0.935 0.008 85)"
  line: "oklch(0.82 0.011 85)"
  ink: "oklch(0.22 0.012 85)"
  muted: "oklch(0.42 0.013 85)"
  faint: "oklch(0.49 0.013 85)"
  accent: "oklch(0.55 0.19 32)"
  accent-soft: "oklch(0.49 0.17 32)"
  accent-ink: "oklch(0.98 0.01 60)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 8vw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 3vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  xs: "1px"
  sm: "4px"
  badge: "5px"
  row: "7px"
  md: "10px"
  window: "14px"
  pill: "999px"
spacing:
  section: "clamp(3rem, 7vw, 5rem)"
  gutter: "clamp(1rem, 4vw, 3rem)"
  page: "68rem"
  prose: "46rem"
  poster: "90rem"
components:
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  kicker:
    textColor: "{colors.accent-soft}"
    typography: "{typography.label}"
  tag:
    textColor: "{colors.muted}"
    backgroundColor: "transparent"
    rounded: "{rounded.pill}"
    padding: "0.18rem 0.62rem"
  metric:
    textColor: "{colors.accent-soft}"
---

# Design System: colincheung.dev

> Single source of truth for the visual system. Tokens live in
> [`src/styles/tokens.css`](src/styles/tokens.css); this file explains how to
> apply them so new pages stay on-brand. When you build a new surface, read this
> first, reuse the tokens, and follow the named rules below.

## 1. Overview

**Creative North Star: "The Warm Terminal, in Daylight"**

> **Palette update (Oct 2026):** the site now has two themes from one token set
> and follows the system setting (no toggle). **Stone** (light, default) is a warm
> grey page at ~90% lightness with raised surfaces one step lighter, chosen so
> large areas do not glare. **Dark** is the original warm near-black. The accent
> moved from cyan to tomato (see
> "Colour" below). Token values in `tokens.css` are authoritative; values
> below are given as light / dark.

### Colour
One accent hue, tomato (`--accent`, `--accent-soft`), on a warm neutral ramp. The
accent marks results and metrics, links, and active or hover states, and nothing
else. A four-hue version (teal, ochre, indigo alongside tomato) was tried and
dropped in Oct 2026: it read as busy and less cohesive. Hierarchy comes from type
size and weight, the three neutral text steps (`--ink`, `--muted`, `--faint`), and
the two surface steps, not from more colours. No gradients on surfaces.

### Typography standards (enforced by `tests/typography.spec.ts`)
| Rule | Value | Why |
|---|---|---|
| Body text (long-form) | 16-19px at every screen size | Below 16 strains; above ~19 reads as heavy in Bricolage. |
| Body line-height | 1.5-1.8 (currently 1.65) | WCAG 1.4.12 asks for at least 1.5. |
| Line length | 45-90 characters (currently ~88) | 45-75 is the classic ideal; WCAG 1.4.8 suggests 80. 88 is a deliberate choice for a wider column; do not go past 90. |
| Smallest text anywhere | 11px (`0.6875rem`) | Mono labels and metadata. Nothing smaller, including on phones. |
| Contrast | 4.5:1 body, 3:1 large text | WCAG 1.4.3 (not yet automated). |
| Units | rem for every size and width | So the large-screen scaling below applies to everything. |

The test measures the rendered page at phone, laptop, 2560 and 3840 widths and
fails if any rule is broken. Change a number here and in the test together.

### Large screens
The root font size scales gently with the viewport above ~1600px
(`clamp(100%, 0.85rem + 0.15vw, 110%)` on `html`): 16px on a laptop, about 17.4px
at 2560, capped at 17.6px. Every size and width is in rem, so type, columns and
spacing grow together. A stronger scale (20px at 2560) was tried and read as too
big.

**Key Characteristics:**

- Light (Stone) and dark themes from one token set, switched by `prefers-color-scheme`. Never cream, never pure white, never pure black.
- Exactly one chromatic color: tomato. Everything else is a warm-neutral ramp.
- Big Bricolage Grotesque display against small JetBrains Mono technical chrome.
- The metric is the accent: numbers/outcomes glow tomato, prose stays muted.
- The literal terminal metaphor is scarce — reserved for the homepage.
- Widths are one three-tier scale: `--w-prose` (`46rem`, reading), `--w-page`
  (`68rem`, content pages) and `--w-poster` (`90rem`, the homepage). Content
  pages center nav, footer, and content on `--w-page` so their edges line up; the
  homepage centers its nav, terminal, and sections on `--w-poster` for the wide
  "booted-up machine" feel. Same system, wider tier, not an exception.

## 2. Colors

A warm-neutral greyscale carrying a single tomato signal. Strategy: **Restrained** —
one accent used on well under 10% of any screen, against a warm neutral ramp.

### Primary
- **Signal Tomato** (`--accent`, `oklch(0.55 0.19 32)` / `oklch(0.75 0.17 38)`): The only chromatic color.
  Reserved for the single most important thing in a view — the metric in a line,
  the current timeline node, the active/hover link border, the terminal `@` and
  prompt. If two things are tomato in one glance, one is wrong.
- **Soft Tomato** (`--accent-soft`, `oklch(0.49 0.17 32)` / `oklch(0.79 0.11 38)`): The desaturated tomato for
  runs of accented *text* (metric highlights, `//` kickers, inline links) where
  full-chroma tomato would vibrate. Reads as "important" without shouting.
- **Accent Text** (`--accent-text`): small accented text (pane labels, result values,
  status-bar tabs). In light it is Soft Tomato, because Signal Tomato on the light
  surfaces is under the 4.5:1 text needs; in dark it is Signal Tomato.
- **Accent Ink** (`--accent-ink`, `oklch(0.98 0.01 60)` / `oklch(0.2 0.04 40)`): Text on
  the rare filled-tomato surface.

### Neutral (the warm ramp, hue 80–95)
- **Ink** (`--ink`, `oklch(0.22 0.012 85)` / `oklch(0.95 0.01 95)`): Primary text —
  display headings, names, titles on hover.
- **Muted** (`--muted`, `oklch(0.42 0.013 85)` / `oklch(0.72 0.02 95)`): Body copy,
  bullet text, resting titles, positions.
- **Faint** (`--faint`, `oklch(0.49 0.013 85)` / `oklch(0.63 0.02 95)`): Small mono
  metadata — dates, stacks, end-caps. Still AA at 11px.
- **Prose ink** (`--prose-ink`, `oklch(0.27 0.012 85)` / `oklch(0.87 0.012 95)`): Post
  body text, a notch softer than `--ink` for sustained reading.
- **Background** (`--bg`, `oklch(0.905 0.008 85)` / `oklch(0.165 0.012 80)`): Stone /
  the warm near-black body.
- **Panel / Pane** (`--panel` `0.92` / `0.205`, `--pane` `0.935` / `0.185`): Slightly
  raised warm surfaces for terminal panes and figures; used sparingly.
- **Line** (`--line`, `oklch(0.82 0.011 85)` / `oklch(0.31 0.018 80)`): All hairlines,
  borders, timeline spines, tag outlines, section rules.

### Print
The CV re-declares the tokens inside `@media print` to flip the terminal palette to
ink-on-white for a clean PDF: `--bg`/`--panel`/`--pane` become `#ffffff`, `--ink`
`#111111`, `--muted` `#333333`, `--faint` `#5a5a5a`, `--line` `#d5d5d5`, and both
tomatos become `#0e7490` (a print-safe teal). Site chrome (nav and footer) is hidden
and entries use `break-inside: avoid`. This is the only place the palette
legitimately leaves the two themes.

### Named Rules
**The One Signal Rule.** Tomato is the only hue on the page and marks the single most
important element in view. Keep it under ~10% of any screen; its rarity is the
whole point. Never introduce a second accent hue.

**The Metric Is The Accent Rule.** In prose, the number or outcome gets
`--accent-soft`; the surrounding sentence stays `--muted`. Titles are muted at
rest and shift to `--ink` only on hover. The eye should land on the result first.

## 3. Typography

**Display / Body Font:** Bricolage Grotesque (with `ui-sans-serif, system-ui`)
**Label / Data Font:** JetBrains Mono (with `ui-monospace, Menlo`)
**CJK:** `--cjk` stack (PingFang TC / Noto Sans TC/SC) for names like 張志權.

**Character:** One expressive humanist-grotesque display paired with one precise
monospace — contrast on a real axis (proportional vs. fixed, warm vs. technical),
never two similar sans-serifs. Bricolage carries voice and scale; JetBrains Mono
is the machine chrome (labels, dates, code, terminal). Loaded from Google Fonts
by a `<link>` in `components/site/Head.astro`, with preconnects.

### Hierarchy
- **Display** (Bricolage 800, `clamp(2.4rem, 8vw, 7.5rem)`, lh 0.86–0.9, tracking −0.03em):
  Hero name and page titles only. One per view.
- **Headline** (Bricolage 700, `clamp(1.4rem, 3vw, 2.2rem)`, tracking −0.02em):
  Section-level statements (hot takes, reach-out line).
- **Title** (Bricolage 600–700, `clamp(1.15rem, 2vw, 1.5rem)`, tracking −0.01em):
  Card/row titles, company names, project names.
- **Body** (Bricolage 400–500, ~0.9–1rem, lh 1.5, max 65–75ch): Prose, bullets,
  ledes (leaning 500 weight for ledes).
- **Label** (JetBrains Mono, 0.62–0.75rem, tracking 0.06–0.14em): Kickers, dates,
  tags, nav links, stacks, status bars, the terminal mark.

### Named Rules
**The `//` Kicker System.** Sections are marked with a lowercase mono comment —
`// experience`, `// writing`, `// hot takes` — in `--accent-soft` or `--muted`.
This is the site's deliberate, named section grammar. It is NOT the banned
all-caps tracked eyebrow; keep it lowercase, mono, and comment-prefixed. Do not
replace it with `01 / 02` numbered markers.

**The −0.04em Floor.** Display tracking never goes tighter than −0.03/−0.04em.
Letters must not touch.

## 4. Elevation

Flat by default. Depth comes from the warm-neutral ramp and 1px `--line`
hairlines, not shadows. Surfaces (`--panel`, `--pane`) step up in lightness rather
than casting shadows. Exactly two shadows are sanctioned: the **tomato focus/state
glow** (a response to state, never ambient) and the **terminal window's ambient
lift** (the one floating set-piece on the homepage).

### Glow / Shadow Vocabulary
- **Accent focus ring** — the **`--ring`** token (`0 0 0 4px color-mix(in oklch, var(--accent) 20%, transparent)`):
  the current timeline node and hovered/focused interactive nodes.
- **Ambient hero wash** — the **`--wash`** token (a faint `var(--accent) 8%` radial bloom),
  applied on `.shell`, the frame every page sits in. Atmosphere, not a card shadow.
- **Terminal window lift** — the **`--lift`** token on `.term` (a soft warm shadow in
  light, `0 40px 80px -40px rgba(0, 0, 0, 0.7)` in dark): The only drop shadow in the system. It floats the tmux window over
  the page as the homepage's one physical object. Never reuse it on cards, inputs,
  or other surfaces.

### Named Rules
**The Flat-By-Default Rule.** No drop shadows on cards, inputs, or other surfaces. Depth =
tonal layering + hairlines. The two allowed shadows are the tomato state glow and the
homepage terminal window's ambient lift, nothing else.

## 5. Components

### Navigation
- One `components/site/Nav.astro` on every page. A mono mark
  `colin@glasgow:~$` (the `@` is tomato, `:~$` faint) on the left; mono links
  (`0.72rem`, tracking 0.1em, `--muted`) on the right.
- **Hover/active:** color shifts to `--ink` with a tomato `border-bottom`.
- Links: **BLOG**, **CV**. (No About; contact lives on the homepage.)
- Centered on `--w-page`, so the mark lines up with the content's left edge and
  the links line up with its right edge (and with the footer). On the homepage it
  spans `--w-poster` and hides its links below 560px.

### Footer
- One `components/site/Footer.astro`: `COLIN CHEUNG` (mono, `--muted`) + `© {year}
  · BUILT IN GLASGOW` (`--faint`), centered on `--w-page`, `1px` top rule. Same width
  as the nav. On the homepage it spans `--w-poster`, its meta is `--muted`, and it
  ends with `LAST DEPLOY <commit>`.

### Kicker
- The `//` mono section label. `--accent-soft` (or `--muted`), `0.75rem`, tracking
  0.06em, lowercase. Precedes every section.

### Tags / Chips
- Mono, `0.68rem`, `--muted`, `1px solid var(--line)`, `border-radius: 999px`,
  `0.18rem 0.62rem` padding. Transparent fill. Used for skill and tech lists.
- No fill and no hover state — they are quiet texture, not controls.

### Links (inline)
- `--accent-soft` text with a `1px` **`--accent-line`** (`color-mix(accent 40%)`) `border-bottom`
  that goes solid `--accent` on hover. Never underlined by default; the border is the
  affordance.

### Timeline (signature component)
- Blog index, CV, and long-form article navigation share a vertical spine
  (`1px var(--line)`) with a **node** per entry: an 8–9px dot, `--bg` fill,
  `2px solid var(--faint)` ring. The **current / active** node switches its ring to
  `--accent` plus the tomato focus glow. A mono date rail sits to the left of the
  spine; body content to the right.
- **CV date rail:** a `--rail` variable (5.75rem) drives the spine offset, the grid
  column, and the node position together so they always line up. Each role shows the
  end date on top (`now` in `--accent` for the current role, else month + year) and
  the start date below, dialed down to `--muted`/`--faint` so it does not compete. On
  mobile (≤640px) the rail collapses to one left spine with the dates inline.
- **Article timeline (`layouts/Post.astro`):** the third use of the spine, and it is
  in the flow of the article, not a sidebar. When a post opens with three or more
  dated `##` headings (`16 December: they move the flight`), the layout splits the
  rendered Markdown at those headings and renders each section as a timeline entry.
  The date prefix is parsed off the heading (headings carry no year, so the last
  dated one is anchored to `pubDate` and the list is walked backwards) and the rest
  of the heading becomes the entry's title.
- At `64rem`+ the date sits in the left margin as a sticky column (large day
  numeral, mono month and year, then the wait since the previous entry: `next day`,
  `+3 days`, `+8 weeks`, `+3 months`), with the spine and a node in the gap. Below
  that the spine runs down the left edge and the date sits inline above the title.
- A `// timeline` line above the list gives the first and last dates and the total
  span in days. Node state is the ring alone: unread `--faint`, passed filled
  `--accent`, current `--accent` plus the `--ring` glow.
- Undated sections after the run (takeaways, reflections) render as ordinary prose
  below the timeline. Only use dated headings when the post really is a sequence.
- This replaced the earlier sticky scroll-linked rail (Oct 2026).

### Shipped pane (homepage terminal)
- The terminal's right-top, active pane (`1:shipped`). Each row is one improvement
  with a `before` bar (`--bar`) and an `after` bar (`--accent`) drawn to scale
  (after ÷ before), plus a mono `WHERE · WHEN` meta. Data lives in
  `src/data/shipped.json`. Bars grow in once after the panes rise.

### Projects (homepage section)
- `// projects` sits below the companies strip as five flat neutral tiles (`--pane`,
  `--line` border, 10px radius), each with a live piece of the project under its
  header: the dissertation agent playing with the network's value for each move
  (`AgentPane`), a simulated radar of the London airspace (`RadarPane`, no network
  calls), the homelab's Compose stacks, one real card from the Anki deck that flips
  on hover or tap, and this site's own commit → build → live line from the commit it
  was built from. At rest the only colour is a small accent dot; hover turns the
  border and arrow accent and swaps the `~/projects/…` path for where the project
  really lives. 1, 2 or 3 columns; the dissertation tile spans two. The live parts
  boot in once, a beat apart, when the section scrolls into view.

### Writing (homepage section)
- `// writing`: the newest post is a lead panel (same flat surface as the
  tiles) with a filled `latest` tag, title, and a stat
  chip with its `statLabel` beside it; the remaining posts are hairline rows (mono date, title, chip)
  ending in an `All posts` row.
- **Stat chip** (`.chip`): the post's `stat` frontmatter as a mono pill on a 10%
  accent tint. Posts without a `stat` show no chip.

### Homepage motion
- Hero name: each word rises out of its own mask on load.
- Sections below the terminal carry `data-reveal` and rise in on scroll (armed by
  JS; visible without it).
- A faint dot grid sits behind the hero and terminal and fades out down the page.
  Over it, contour lines drawn on a canvas: still until the mouse moves across the
  hero, then they drift for a moment and dip under the cursor.
- Things that move on their own: the one-liner under the name rotates every few
  seconds, the status-bar clock ticks, the companies strip scrolls (with a pause
  button), and the project tiles run once they scroll into view. Reduced motion
  stops all of them and shows each at rest.
- The status bar and footer carry the commit the page was built from (`built 2h
  ago · abc1234`), so the page says when it was last deployed.
- The lead post's headline figure is outlined behind its panel in the writing
  section, in the display face.

### Metric Highlight (signature)
- `.hl` — inline `<b>` in `--accent-soft`, weight 600, `tabular-nums`. Wraps the
  one number/outcome in a sentence. This is the visual thesis of the whole site.

### Blog Post (long-form reading)
- Posts render on the shared `Base` shell via `layouts/Post.astro`; the prose styles are `styles/prose.css`. Below `64rem` it is a
  single `--w-prose` column. At `64rem` and up the post sits on `--w-page`, inset by
  `--rail` (`9rem`) plus `--rail-gap` (`3.5rem`), so timeline dates sit in the left
  margin and plain and timeline posts share one left edge. Content carries a `// writing` back-kicker, a Bricolage display title
  (`clamp(2rem, 5.5vw, 3.1rem)`, weight 800), and a mono meta line (date · N min read).
- **Headline stat:** the post's `stat` renders under the title as one large number in
  the accent between hairlines, its `statLabel` above it in mono caps.
- **Quotes** are excerpts on the raised surface (`--pane`, `--line`, 10px radius), so
  quoted documents read differently from narration. **Ordered lists** are numbered
  takeaways: hairline-separated rows with mono accent numerals.
- **Body size:** `--prose-size`, 16-17px (`clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)`),
  line-height 1.65. Larger sizes read as heavy in Bricolage; do not raise it.
- **Figures** are components in `src/components/figures/`, used by name in a
  post's MDX (no import needed): give them the raw numbers and they compute the
  bars, positions and shares. Each one's styles sit beside it as a `.css` file,
  global and under `.prose`, all loaded for every post through `figures.css` in
  the order they apply. `<Fig title caption grow>` is the frame: one raised panel,
  a short title above, a caption below; `grow` animates its bars in once when seen.
  Inside it: `<Cmp>` (before/after bars to scale; `from` makes a step of a
  waterfall, `ref` a dashed reference line, `cols` the column widths), `<Dots>` (a
  dot plot on one axis, in titled groups), `<Stack>` (one bar split into shares,
  with a legend), `<Split>` + `<Panel title>` (panels side by side),
  `<RowsVsColumns>` (records as JSON lines against columns), `<Boxes>` (a row of
  jobs or steps), `<Runs>` (blocks on a shared time axis: how long each run takes
  and how many fit), `<Splits>` (bars cut into parts with a key above; a part with
  no text is a sliver whose time goes after the bar; `est` rows are estimates,
  drawn lighter), `<Breakdown>` (one row per part of a total: explanation,
  bar, time and share) and `<Pts>` (win rate as the bar with the runs' range,
  win rate and points beside it; each change from `prev` green for a real gain,
  `--loss` red for a real drop, faint when the test can't tell it from luck, by the `real` flags; the kept
  row alone in the accent; `base` stripes the 2018 baseline; one dashed line
  for holding shoot; a key under the number columns names that line and says green / red is a real change and grey could be luck; column titles centred, linking the post's footnote on the test). `<Days then now thenLabel nowLabel>` draws time as one square a day, the `now` days lit in the accent. Recordings are `<Clip src label rate hi>` (pixelated, playing only while
  on screen and never on their own under reduced motion); anything inside a Clip
  is its caption, and several sit side by side in a `<div class="vids">`. A post told as numbered steps can carry `<Recipe steps until>`: a
  panel floating in the right margin (only where the margin fits it), the passed
  steps in ink and the current one in the accent, shown from the "Step 1"
  heading until the `until` one.
  Marks are neutral; only the result takes the accent. Aim for at least one figure
  per post so no screen is text alone. Explanations sit next to what they explain
  (a short title above, labels on the marks), not in a paragraph under the figure.
  Every chart axis says what it measures and in what units. Figure text comes in two
  sizes only, at any screen width: 11px for titles, ticks and notes, 12.8px for labels
  on the marks and values. SVG charts get there through `--k` (set by the layout
  script), so their text never scales with the drawing.
- **Interactive figures** are components too, and load `src/scripts/widgets.ts`
  only on posts that use one: `<LineChart>` (a line chart from data: axes, an
  optional band, a line, dots and a legend; one function in
  `src/scripts/line-chart.ts` draws it at build time as the no-script fallback and
  in the browser at the figure's real width), `<Ladder>` (a step chart of a
  sequence of speed changes, x axis the change number; tap or drag across a step
  for its detail) and `<QView>` (a recording with the network's value for each
  move under it, a `.player` bar to pause and step one decision at a time, and a
  `.peek` block showing the four frames that decision saw, cut from a sprite
  sheet). Charts drawn in code run full width with text at true size.
- **Figure types only the unpublished dissertation posts use** (Parts 2 and 3, on
  the `dissertation-revival` branch, still written as HTML): `.ctl` (pill buttons
  and range inputs at least 44px tall), `.net` / `.slab` / `.deck` (a network's
  layers as tilted stacks of real activation maps), `.map` (a route over a game
  screen), `.gains` / `.gain` (before → after with a log-scale bar of the
  multiplier), `.loop` (a process diagram with a dot running each loop), `.arch` /
  `.cube` (a network as 3D blocks sized by each layer's shape), `details.more`,
  `.flow` (a game as a row of decision boxes shaded by score) and the `chain`,
  `reveal`, `pick` and `flow` widgets. Their styles are kept, marked, in
  `src/components/figures/`; turn each into a component when its post moves to MDX.
- **Post header:** title, then the headline stat (when set), and the meta row: date
  and read time (prose words only, at 200 a minute; figures do not count). Header, prose, timeline and footer all share one measure, `--measure` (44rem),
  so every block on a post (text, figures, code, tables) has the same left and
  right edge. Wider "breakout" figures and code were tried and rejected (Oct 2026).
- **Reading progress:** a 2px accent bar fixed to the top of the viewport.
- **Post footer:** `older` / `newer` links by publish date, then `all writing`.
- **Sections:** each `##` gets a hairline above it so long posts scan as sections.
- **`.prose`** styles the slotted Markdown: `--prose-ink`, `--prose-size`, line-height
  `1.65`, measure `--measure` (`44rem`). Headings are Bricolage `--ink`; links are
  `--accent-soft` with a tomato bottom-border; list markers and the blockquote rule
  are tomato.
- **A wide screen grows the type, never the measure.** The measure is in rem, so it
  grows only with the root size on large monitors (see "Large screens"); the answer
  to a cramped big monitor is a filled margin, not a longer line.
- **Tables** are hairline data rails, not boxes: no outer border, a single
  `--line` rule under a mono `--faint` header row, and `--line` at 55% between
  rows. Column alignment in the Markdown drives the styling — a `---:`
  column renders mono, `tabular-nums` and `nowrap` so figures align on the decimal.
  Below `40rem` the table scrolls horizontally in its own overflow container.
- **Code:** fenced blocks are rendered by Expressive Code (`github-light` /
  `github-dark`, following the system setting); inline code
  is a mono chip on a faint `--ink` 10% wash. Never hand-restyle Expressive Code blocks.

### Terminal Session (homepage only)
- The `.term` tmux mock: title bar with traffic-light dots, panes (`whoami`,
  `shipped`, `writing`), and a status bar with the build, date and a live clock.
  Glasgow's live weather is a `$ weather` command in the `whoami` pane. This is the
  scarce set-piece — do not reproduce it on other pages.
- The `writing` pane reads the **blog collection** (newest three, then "All posts"), so
  publishing a post updates the homepage on its own. Titles are short, so the same
  `title` fits here. Never hard-code the post list here again.
- The homepage centers its nav, terminal, and sections on `--w-poster` (the widest
  scale tier); the hero name sits at `--w-page` so it stays inset from the terminal.

## 6. Do's and Don'ts

### Do:
- **Do** keep the palette to the warm-neutral ramp plus one tomato. Body text ≥ 4.5:1,
  large/bold ≥ 3:1 (the ramp is tuned so `--ink`/`--muted`/`--faint` all pass on `--bg`).
- **Do** put the metric in `--accent-soft` and leave the sentence `--muted` — the
  number is the accent.
- **Do** mark sections with the lowercase `// kicker` system.
- **Do** pair big Bricolage Grotesque display with small JetBrains Mono chrome; keep
  display tracking ≥ −0.04em.
- **Do** center nav, footer, and page content on `--w-page` so their edges line up;
  give long-form posts the narrower `--w-prose` reading measure.
- **Do** provide a `prefers-reduced-motion` fallback for every animation; keep the
  tomato glow reserved for state (hover/focus/current).
- **Do** reach for the derived tokens instead of re-mixing or hardcoding: `--accent-line`
  (inline borders), `--ring` (focus/current glow), `--wash` (hero bloom), the motion
  scale (`--dur-fast`/`--dur-slow`, `--ease`/`--ease-out`) with the shared `rise`
  keyframe, and the width scale (`--w-prose`/`--w-page`/`--w-poster`).

### Don't:
- **Don't** use the cream / beige / paper "editorial-restraint" body background.
  Stone is warm grey, not paper.
- **Don't** treat monospace as costume. Mono is earned technical chrome; the *full*
  terminal metaphor is homepage-only — don't cosplay a terminal on other pages.
- **Don't** add a second accent hue, gradient text, or `background-clip: text`.
- **Don't** use cards as the default container, nested cards, or `border-left`/
  `border-right` colored side-stripes on cards, list items, callouts, or alerts.
  Depth is tonal + hairlines. (The sole exception: the prose blockquote's 2px tomato
  left rule, a standard long-form convention, never a card stripe.)
- **Don't** add drop shadows on cards, inputs, or other surfaces. The only shadows are the
  tomato state glow and the homepage terminal window's ambient lift.
- **Don't** over-round: the terminal window caps at `14px`, chips/nodes are
  full pills, everything else stays ≤ `7px`. Never 16-32px "insanely rounded".
- **Don't** ship the generic SaaS/Bootstrap/AI-blog-starter default look — if it
  reads as a template, it's wrong.
