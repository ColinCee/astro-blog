# Reviewing the redesign (31 Oct 2026)

Two local branches, nothing pushed:

- **`redesign-figures`**: the migration, finished, audited and reviewed. `pnpm check` passes (types, lint, build, deploy dry run, 48 tests).
- **`redesign-cook`**: four new ideas built on top of it, in a second checkout at `D:/Claude Projects/astro-blog-cook`. `pnpm check` passes there too (49 tests).

## Where to look

- Migration: start `blog-dev` (or `pnpm dev`), then http://localhost:4331/, `/blog/`, each post, `/cv/`, and `/design/` (the design system, dev only).
- New ideas: in the cook checkout run `pnpm dev --port 4332`, then http://localhost:4332/blog/ and any long post on a wide screen.
- One-page summary: `docs/redesign/shots/morning.png`. Each figure in dark, light and 375px: `node docs/redesign/comps/shoot-figs.mts <slug>` (sheets in `docs/redesign/shots/figs/`).

## What changed overnight on `redesign-figures`

- **Visual audit of all 8 posts, every figure in 3 views; 25 findings, all fixed or answered:**
  - Purple marks only a result: the line chart's 2026 band, not the 2018 runs.
  - Time splits are two greys.
  - These went neutral: the Jev label, the "after" boxes, the engines in the losing columns, the frames header and timer, the ladder's picked column, and the player's slider at rest.
  - Every `//` label is the faint grey.
  - Light-mode grey text is darker: it read 4.3:1, now 4.85:1.
  - Fake 700 bold in figures (DM Mono stops at 500) is now 500.
  - The win-rate axis no longer runs "75100" together on phones.
  - The dot plot has an axis.
  - Bars use the bar greys, not the text grey.
- **Code blocks:** the site's own theme, made from the palette (names and strings in ink, keywords quieter, comments faint, no purple), set in DM Mono with 8px corners.
- **Independent review: 20 findings, all the real ones fixed:**
  - Printed posts had near-white code on white paper; printing now switches to the light theme.
  - The one-liner reel has a real skip button, so keyboard and reduced-motion users can reach every line. Hover, focus, off-screen or a hidden tab pause it.
  - Reduced motion listed each company three times; now once.
  - Without JS, four project figures were unreachable; now all five show.
  - Phones had no CV link or theme button on the homepage.
  - `/design/` was in the sitemap.
  - Counters ran off-screen.
  - Dead code is removed.
- **Projects:**
  - Hovering a project only opens it when the mouse moves, not when the page scrolls under it.
  - The delivery figure's numbers are real: the build's commit, the post count, and the visitor's own time to first byte.
  - Project figures keep purple for their results only.
- **Brand:** the link-preview image (`public/og.png`) and the favicon are in the new design. They were still the old tomato.

## New on `redesign-cook`

1. **A share card per post** (`public/og/<slug>.png`, rendered by `pnpm og` from the frontmatter): the title and the headline result, the new value in purple. LinkedIn and Slack show it when a post is shared.
2. **Every figure draws itself in** the first time it is seen: bars grow row by row, dots pop onto their axis, lines draw. Without JS or under reduced motion they are simply there.
3. **A section guide on long posts:** on wide screens, the sections in the empty left margin, sticky, the one being read in white.
4. **Before and after to scale on the blog index:** two thin bars under each post's result, so "12 h → 11 min" looks as big as it is.

## Decisions for you

- **Words I changed:**
  - "orange" → "purple" in Part 2 ("purple is the final agent"), so the sentence matches the chart.
  - No other words in any post changed.
  - Two figures' markup changed: jest-to-vitest's diagrams highlight fewer things, and the firecracker dot plot gained `unit="s"`.
- **Captions that only restate their figure** (they are your words, so I left them):
  - JSONL fig 1, "…95% smaller.", repeats the headline stat.
  - ts-jest fig 2, "The type-check moves out of the test run…", says what the boxes show.
  - Firecracker fig 1, "…about 1.3× faster, and no minutes…", restates its bars.
- **Made-up "live" numbers** in the home-lab figure (1,284 blocked, 212 seen today, 19.5°C inside, ticking up). The design principle is "real over decorative". Wire them to the real homelab, or label them as samples?
- **Purple results in columns:** the terminal and the blog index show a purple value on every row. The CV now keeps its six highlights in ink, so there are fewer purple things there. Keep the columns purple, or make them ink too?
- **The reading progress bar** at the top of posts is purple, which is chrome. Keep it?
- **Privacy:** `.claude/launch.json` (committed in this public repo) contains your Tailscale machine name. Fine, or remove it?

## Not done

- No push, no PR, no merge.
- The files another session staged (`docs/plans/`, `.impeccable/`, `{}`) are untouched and uncommitted.
