---
name: colincheung.dev
description: Terminal-native personal site — warm near-black, one cyan signal, Bricolage Grotesque + JetBrains Mono.
colors:
  bg: "oklch(0.165 0.012 80)"
  panel: "oklch(0.205 0.014 80)"
  pane: "oklch(0.185 0.013 80)"
  line: "oklch(0.31 0.018 80)"
  ink: "oklch(0.95 0.01 95)"
  muted: "oklch(0.72 0.02 95)"
  faint: "oklch(0.63 0.02 95)"
  accent: "oklch(0.82 0.15 205)"
  accent-soft: "oklch(0.8 0.08 205)"
  accent-ink: "oklch(0.18 0.05 220)"
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
  poster: "1440px"
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
> [`src/styles/terminal.css`](src/styles/terminal.css); this file explains how to
> apply them so new pages stay on-brand. When you build a new surface, read this
> first, reuse the tokens, and follow the named rules below.

## 1. Overview

**Creative North Star: "The Warm Terminal"**

The site should feel like Colin's own machine booted up in a dark room: a warm
near-black surface, precise monospace chrome, and a single cyan signal that only
ever lights up the thing that matters. It is engineer-native without cosplay —
the homepage runs a *literal* terminal session (tmux panes, `whoami`, a live
clock and weather), and every other page inherits that machine's language
(mono `//` labels, the warm-neutral ramp, one cyan accent) without re-staging
the whole terminal. Confident and a little playful; the work — real metrics, real
systems — does the talking, not adjectives.

This system explicitly rejects the faceless blog-starter default and the
cream/beige "editorial-restraint" background that floods personal sites. It is
not a corporate résumé, not a Bootstrap theme, and not monospace-as-decoration.
Warmth comes from the near-black hue (warm, not cold blue-black) and the display
type, never from a tinted-paper body.

**Key Characteristics:**

- Dark-only, warm near-black (`--bg` OKLCH L 0.165, hue 80) — never pure black, never light.
- Exactly one chromatic color: cyan. Everything else is a warm-neutral ramp.
- Big Bricolage Grotesque display against small JetBrains Mono technical chrome.
- The metric is the accent: numbers/outcomes glow cyan, prose stays muted.
- The literal terminal metaphor is scarce — reserved for the homepage.
- Widths are one three-tier scale: `--w-prose` (`46rem`, reading), `--w-page`
  (`68rem`, content pages) and `--w-poster` (`1440px`, the homepage). Content
  pages center nav, footer, and content on `--w-page` so their edges line up; the
  homepage centers its nav, terminal, and sections on `--w-poster` for the wide
  "booted-up machine" feel. Same system, wider tier, not an exception.

## 2. Colors

A warm-neutral greyscale carrying a single cyan signal. Strategy: **Restrained** —
one accent used on well under 10% of any screen, against a warm dark ramp.

### Primary
- **Signal Cyan** (`--accent`, `oklch(0.82 0.15 205)`): The only chromatic color.
  Reserved for the single most important thing in a view — the metric in a line,
  the current timeline node, the active/hover link border, the terminal `@` and
  prompt. If two things are cyan in one glance, one is wrong.
- **Soft Cyan** (`--accent-soft`, `oklch(0.8 0.08 205)`): The desaturated cyan for
  runs of accented *text* (metric highlights, `//` kickers, inline links) where
  full-chroma cyan would vibrate. Reads as "important" without shouting.
- **Accent Ink** (`--accent-ink`, `oklch(0.18 0.05 220)`): Dark text/ink for the
  rare filled-cyan surface.

### Neutral (the warm ramp, hue 80–95)
- **Ink** (`--ink`, `oklch(0.95 0.01 95)`): Primary text — display headings, names,
  titles on hover. ~16.7:1 on `--bg`.
- **Muted** (`--muted`, `oklch(0.72 0.02 95)`): Body copy, bullet text, resting
  titles, positions. ~7.8:1 on `--bg`.
- **Faint** (`--faint`, `oklch(0.63 0.02 95)`): Small mono metadata — dates, stacks,
  end-caps. ~5.5:1 on `--bg` (still AA, even at 10–12px).
- **Background** (`--bg`, `oklch(0.165 0.012 80)`): The warm near-black body.
- **Panel / Pane** (`--panel` `0.205`, `--pane` `0.185`): Slightly raised warm
  surfaces for terminal panes; used sparingly.
- **Line** (`--line`, `oklch(0.31 0.018 80)`): All hairlines, borders, timeline
  spines, tag outlines, section rules.

### Print
The CV re-declares the tokens inside `@media print` to flip the terminal palette to
ink-on-white for a clean PDF: `--bg`/`--panel`/`--pane` become `#ffffff`, `--ink`
`#111111`, `--muted` `#333333`, `--faint` `#5a5a5a`, `--line` `#d5d5d5`, and both
cyans become `#0e7490` (a print-safe teal). Site chrome (nav and footer) is hidden
and entries use `break-inside: avoid`. This is the only place the palette
legitimately leaves the dark ramp.

### Named Rules
**The One Signal Rule.** Cyan is the only hue on the page and marks the single most
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
is the machine chrome (labels, dates, code, terminal). Loaded via Google Fonts
`@import` in `terminal.css`.

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
than casting shadows. Exactly two shadows are sanctioned: the **cyan focus/state
glow** (a response to state, never ambient) and the **terminal window's ambient
lift** (the one floating set-piece on the homepage).

### Glow / Shadow Vocabulary
- **Accent focus ring** — the **`--ring`** token (`0 0 0 4px color-mix(in oklch, var(--accent) 20%, transparent)`):
  the current timeline node and hovered/focused interactive nodes.
- **Ambient hero wash** — the **`--wash`** token (a faint `var(--accent) 12%` radial bloom),
  applied on `.shell` and the homepage `.t`. Atmosphere, not a card shadow.
- **Terminal window lift** (`box-shadow: 0 40px 80px -40px rgba(0, 0, 0, 0.7)` on
  `.term`): The only dark drop shadow in the system. It floats the tmux window over
  the page as the homepage's one physical object. Never reuse it on cards, inputs,
  or other surfaces.

### Named Rules
**The Flat-By-Default Rule.** No drop shadows on cards, inputs, or other surfaces. Depth =
tonal layering + hairlines. The two allowed shadows are the cyan state glow and the
homepage terminal window's ambient lift, nothing else.

## 5. Components

### Navigation
- Shared `Nav.astro` (content pages) mirrors the homepage `.t-nav`. A mono mark
  `colin@glasgow:~$` (the `@` is cyan, `:~$` faint) on the left; mono links
  (`0.72rem`, tracking 0.1em, `--muted`) on the right.
- **Hover/active:** color shifts to `--ink` with a cyan `border-bottom`.
- Links: **BLOG**, **CV**. (No About; contact lives on the homepage.)
- Centered on `--w-page`, so the mark lines up with the content's left edge and
  the links line up with its right edge (and with the footer).

### Footer
- Shared `SiteFooter.astro`: `COLIN CHEUNG` (mono, `--muted`) + `© {year} · BUILT
  IN GLASGOW` (`--faint`), centered on `--w-page`, `1px` top rule. Same width as
  the nav.

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
- Blog index and CV share a vertical spine (`1px var(--line)`) with a **node** per
  entry: an 8–9px dot, `--bg` fill, `2px solid var(--faint)` ring. The **current /
  active** node switches its ring to `--accent` plus the cyan focus glow. A mono
  date rail sits to the left of the spine; body content to the right.
- **CV date rail:** a `--rail` variable (5.75rem) drives the spine offset, the grid
  column, and the node position together so they always line up. Each role shows the
  end date on top (`now` in `--accent` for the current role, else month + year) and
  the start date below, dialed down to `--muted`/`--faint` so it does not compete. On
  mobile (≤640px) the rail collapses to one left spine with the dates inline.

### Metric Highlight (signature)
- `.hl` — inline `<b>` in `--accent-soft`, weight 600, `tabular-nums`. Wraps the
  one number/outcome in a sentence. This is the visual thesis of the whole site.

### Blog Post (long-form reading)
- Posts render on the shared `Base` shell via `BlogPost.astro`, max-width `42rem`:
  a `// writing` back-kicker, a Bricolage display title (`clamp(2rem, 5.5vw, 3.1rem)`,
  weight 800), and a mono meta line (date · N min read).
- **`.prose`** styles the slotted Markdown: body ink `oklch(0.87 0.012 95)` (a notch
  brighter than `--muted` for sustained reading), line-height `1.72`, measure ~65ch.
  Headings are Bricolage `--ink`; links are `--accent-soft` with a cyan bottom-border;
  list markers and the blockquote rule are cyan.
- **Code:** fenced blocks are rendered by Expressive Code (`github-dark`); inline code
  is a mono chip on a faint `--ink` 10% wash. Never hand-restyle Expressive Code blocks.

### Terminal Session (homepage only)
- The `.term` tmux mock: title bar with traffic-light dots, panes (`whoami`,
  `~/projects`, `writing`), a live status bar with clock/date/weather. This is the
  scarce set-piece — do not reproduce it on other pages.
- The homepage centers its nav, terminal, and sections on `--w-poster` (the widest
  scale tier); the hero name sits at `--w-page` so it stays inset from the terminal.

## 6. Do's and Don'ts

### Do:
- **Do** keep the palette to the warm-neutral ramp plus one cyan. Body text ≥ 4.5:1,
  large/bold ≥ 3:1 (the ramp is tuned so `--ink`/`--muted`/`--faint` all pass on `--bg`).
- **Do** put the metric in `--accent-soft` and leave the sentence `--muted` — the
  number is the accent.
- **Do** mark sections with the lowercase `// kicker` system.
- **Do** pair big Bricolage Grotesque display with small JetBrains Mono chrome; keep
  display tracking ≥ −0.04em.
- **Do** center nav, footer, and page content on `--w-page` so their edges line up;
  give long-form posts the narrower `--w-prose` reading measure.
- **Do** provide a `prefers-reduced-motion` fallback for every animation; keep the
  cyan glow reserved for state (hover/focus/current).
- **Do** reach for the derived tokens instead of re-mixing or hardcoding: `--accent-line`
  (inline borders), `--ring` (focus/current glow), `--wash` (hero bloom), the motion
  scale (`--dur-fast`/`--dur-slow`, `--ease`/`--ease-out`) with the shared `rise`
  keyframe, and the width scale (`--w-prose`/`--w-page`/`--w-poster`).

### Don't:
- **Don't** use the cream / beige / paper "editorial-restraint" body background, or
  any light theme. This site is warm near-black, dark-only.
- **Don't** treat monospace as costume. Mono is earned technical chrome; the *full*
  terminal metaphor is homepage-only — don't cosplay a terminal on other pages.
- **Don't** add a second accent hue, gradient text, or `background-clip: text`.
- **Don't** use cards as the default container, nested cards, or `border-left`/
  `border-right` colored side-stripes on cards, list items, callouts, or alerts.
  Depth is tonal + hairlines. (The sole exception: the prose blockquote's 2px cyan
  left rule, a standard long-form convention, never a card stripe.)
- **Don't** add drop shadows on cards, inputs, or other surfaces. The only shadows are the
  cyan state glow and the homepage terminal window's ambient lift.
- **Don't** over-round: the terminal window caps at `14px`, chips/nodes are
  full pills, everything else stays ≤ `7px`. Never 16-32px "insanely rounded".
- **Don't** ship the generic SaaS/Bootstrap/AI-blog-starter default look — if it
  reads as a template, it's wrong.
