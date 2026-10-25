---
name: writing-posts
description: How to plan, write, chart and ship a post on Colin's blog in his voice. Use when writing, rewording, reviewing or publishing a post in this repo, or making its figures or LinkedIn card.
---

# Writing a post

Colin is a visual reader who skims. A post is one story, results first, in his own voice, with a figure wherever a figure says it better than a paragraph. The figure components and tokens are in `DESIGN.md`; frontmatter and privacy rules are in `AGENTS.md`.

## 1. Settle the story before any figure

- **One story, one comparison.** Say it in a line first ("Jest 7 min → Vitest 23 s", "73% → 99%"). Every section serves it, and anything else becomes a sentence or goes.
- **Hook, problem, fix, in that order**, with the result scannable at the top (stat, figures, a chart or clip).
- **One baseline, used everywhere.** It's the first row of every chart, and every number agrees across text, charts, the card and the frontmatter. Jumping between baselines loses his trust faster than anything.
- **Apples to apples.** Change one thing at a time against the same baseline, on the same test set. Leave out anything both sides share.
- **Gauge depth.** Ask what he already knows about the domain (a few options) before deciding how much background to give. Define jargon on first use, as a link or a one-line list item.
- **Draft the content high level first**, then the figures, then the wording.

## 2. His voice

Write how he talks in chat: casual, conversational British English, first person.

- **Hedge where he would.** Use phrases like "I kind of assumed", "to be honest", "as far as I can tell". No absolutes, and no invented consensus ("everyone says", "the common take").
- **Sentences run on the way he talks.** Comma run-ons are fine. Never write clipped fragments ("Not once. 1,370 times.") or punchy one-liners. No semicolons, no em dashes, active voice.
- **About three sentences a paragraph, each a new fact.** Cut what the previous sentence or a figure already says, and end on a nudge to the next part.
- **Headings are questions or dates**, never "Background" or "Results".
- **Keep his words.** When he's written a passage, fix only facts and grammar, and tell him what changed. Never "tidy" it into your prose.
- **Less is more.** No bold lead-ins on every bullet, no restating the chart, no detail a curious reader can follow a link to.

## 3. Numbers and claims

- **Measured data only.** No estimates or demo data when the real thing can be run. Get his OK before any GPU run.
- **Comparisons get a significance test** (e.g. Welch's t-test over 5 runs, p < 0.05). Fix the decision rule before looking: a tie keeps the simpler or cheaper option. Never pick or headline the better-looking number after the fact.
- **Don't overclaim.** Untested gaps say "could be luck", a single run says so, and a caveat goes in a one-line footnote.
- **Sources sit next to the claim** as inline links. A footnote is a one-line caveat or method note, never a paragraph, and there's no separate sources section.
- **Fact-check before publishing.** An independent agent (Fable or Opus) recomputes every number from the raw data and reads the post cold.

## 4. Figures

Show, don't ask: build the change or two or three distinct variations, put them in front of him, then iterate.

- **Pick the form by the job.** Bars drawn to scale for A vs B. A step chart for sequential improvements. A dot plot for comparing options. A bridge chart for where time goes. A grid of squares for time at a glance. Trees or arrows for structure. Never plain boxes with text in them, and skip 3D or click-to-reveal unless it explains better than a still.
- **Chart basics, every time.**
  - A short title above.
  - Axis titles with units, e.g. "win rate (%)".
  - The baseline first and striped.
  - One accent (orange) for the result or the option kept.
  - Changes in green (real gain), red (real drop) or grey (could be luck), with a key on the chart.
  - Numbers aligned in their own columns, and even row spacing.
  - The same font sizes everywhere, nothing under 11px.
- **No text jammed under a chart.** Labels go on the marks, and explanation goes in one sentence of prose before or after.
- **Every mark is explained somewhere.** That covers a range bracket, a dashed reference line and a Δ. Do it once, in the key or in the line under the first chart.
- **Interaction is a bonus, never required.** Hover can fade the other rows, but nothing should force a click to understand.
- **Check every figure at phone width and in both themes**, with nothing overflowing its box.
- **Gameplay clips or recordings beat charts for the hook.** Captions are short, e.g. "73% wins / this game: won, 57 points".

## 5. Ship

1. Branch, and show him a local preview link (the dev server on his Tailscale name works from his phone).
2. Before merging:
   - `pubDate` is the publish day.
   - Series posts link to each other.
   - Work posts name nothing private.
   - The linked repos are pushed, so links show the current page.
   - `pnpm check` passes.
   - An independent review is done.
3. Merge, watch the deploy, then load the live page.
4. For LinkedIn, make a 4:5 card in the blog's look (gameplay or the one key chart, the headline number pair, one tagline). Add a short post in his voice: what he wanted to find out, the result, one interesting aside, then the link.
