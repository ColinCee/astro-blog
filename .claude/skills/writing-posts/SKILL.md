---
name: writing-posts
description: How to plan, write, chart and ship a post on Colin's blog in his voice. Use when writing, rewording, reviewing or publishing a post in this repo, or making its figures or LinkedIn card.
---

# Writing a post

Colin is a visual reader who skims. A post is one story, results first, in his own voice, with a figure wherever a figure says it better than a paragraph. The figure components and tokens are in `DESIGN.md`; frontmatter and privacy rules are in `AGENTS.md`.

## 1. Settle the story before any figure

- **One story, one comparison.** Say it in a line first ("Jest 7 min → Vitest 23 s", "73% → 99%"). Every section serves it, and anything else becomes a sentence or goes.
- **Hook, problem, fix, in that order**, with the result scannable at the top (the stat, then a chart or clip).
- **One baseline, used everywhere.** It's the first row of every chart, and every number agrees across text, charts, the card and the frontmatter. Jumping between baselines loses his trust faster than anything.
- **Apples to apples.** Change one thing at a time against the same baseline, on the same test set. Leave out anything both sides share.
- **Gauge depth.** Ask him (a few options) how much his readers already know about the domain before deciding how much background to give. Define jargon on first use, as a link or a one-line list item.
- **Title short and catchy, and it says the result** ("CI faster than GitHub's"). The `stat` is the result and `statLabel` says what it measures, and that's all the frontmatter says about it: no subtitle. Use the same words on the card, the index and the embed.
- **An overall limitation gets a line at the end** when the comparison isn't fully like for like, not a section.
- **Draft the content high level first**, then the figures, then the wording.
- **When he asks for versions, make them distinct** in opening, structure, figures and depth, on the same facts.

## 2. His voice

Write how he talks in chat and writes himself: casual, conversational British English. Use "I" for his own work and memories, and "we" for what he and Claude did together. His 2018 dissertation and the passages he's written into posts are the reference; Claude's own prose isn't.

- **Say things plainly, without AI drama.** He states strong claims straight ("Take a look at the massive difference in speed") and hedges where he's unsure ("I think", "kind of", "to be honest"). What he can't stand is manufactured contrast and invented consensus: "It isn't X. It's Y.", "everyone thinks", "the common take", clipped fragments ("Not once. 1,370 times."), one-line punchlines.
- **Sentences run on the way he talks**, joined by commas, "but", "so" and "and". He sometimes opens with "However", "So", "Contrary to popular belief", "What it does is", "fundamentally" and "I remember". No semicolons, no em dashes, active voice.
- **He explains through story and scale.** He'll give a short history to set the scene (Deep Blue, then Watson, then AlphaGo in his dissertation), a comparison that makes a number land (atoms in the universe), a memory ("leave the PC running overnight"), and a question that sets up the next part ("why not have multiple agents playing at the same time?").
- **About three sentences a paragraph, each a new fact.** Cut what the previous sentence or a figure already says, never explain what a later section covers, and end on a nudge to the next part.
- **Headings are short**: a question ("How did we beat it?"), a plain statement ("PPO actually wins more at 1M frames"), or a date ("16 December: they move the flight") when the post is a sequence (three dated headings build the timeline in `DESIGN.md`). Only the closing section can be a plain label ("Closing remarks"). Never use report-speak like "Background" or "Results and discussion".
- **Everyday words, not writerly ones.** "vs", not "against" ("48 points vs 37"). "spamming shoot", "pretty decent", "kinda mid", "cool". His verdict goes in straight, the way he'd say it to a friend ("It's kinda mid, at least for this use-case"). Never a polished closing line ("practice still wins") or a neat summary of what something is "great for".
- **Only what he knows, not reasons you inferred.** Don't add a "because" he didn't measure ("because it moves around and picks its targets"), and don't stack parenthetical asides ("(I used version 1.14, from October 2026)"). A detail that matters gets its own plain sentence or a footnote.
- **Open with the thing and why he tried it**, in his words ("I wanted to see it in action after seeing it play Doom"), not a recap of the last part. A link to the earlier part can sit later or in passing.
- **Keep his words.** When he's written a passage, fix only facts and real grammar errors (not his missing commas or run-ons), and tell him what changed. Never "tidy" it into your prose, and never upgrade or downgrade how sure he sounds.
- **Less is more, formatted for scanning.** Lists and tables are for things with real structure, like his dissertation's numbered "Fully Deterministic - …" definitions, not decoration. No bold lead-ins on every bullet, no restating the chart, no detail a curious reader can follow a link to.

## 3. Numbers and claims

- **In figures, numbers are symbols and digits, not words:** "< $0.01", "~ 200 ms", "1 game", not "under 1¢", "about 200 ms", "a game".
- **One way to say each number** (1.4×, not also "31% less time"), the same everywhere.
- **A reduction is a % smaller ("−66%"), never a ×**, which reads as if it got bigger.
- **Measured data only.** No estimates or demo data when the real thing can be run. If an estimate has to stay, mark it (`est`) so it draws lighter. Get his OK before any GPU run.
- **When the real data is private, measure a fake one at full scale.** A few toy rows give sizes and ratios that aren't right. Make a fake dataset the same shape and size with a script (DuckDB for data), commit the script, a small sample and the measuring script, link them, and take every number after the hook from it. The real result stays as the hook. Say it's fake once, without hedging about how good the guess is, and never tune it to hit a number.
- **Comparisons that could be noise get a significance test** (e.g. Welch's t-test over 5 runs, p < 0.05). Fix the decision rule before looking: a tie keeps the simpler or cheaper option. Never pick or headline the better-looking number after the fact.
- **Don't overclaim.** Untested gaps say "could be luck", a single run says so, and a caveat on one claim goes in a one-line footnote.
- **Sources sit next to the claim** as inline links. A footnote is a one-line caveat or method note, never a paragraph, and there's no separate sources section.
- **Fact-check before publishing.** A fresh agent on another model recomputes every number from the raw data and reads the post cold.

## 4. Figures

Show, don't ask: build the change or two or three distinct variations, put them in front of him, then iterate. The figures in his recent posts are the standard. Numbered captions underneath ("Figure 5.1: Comparison of…", as in his dissertation) suit a report, where figures float away from the text that cites them. In a post the figure sits next to its text, so it gets a short title above and, at most, a one-line caption below for a note.

- **Pick the form by the job.** Bars drawn to scale for A vs B. A step chart for sequential improvements. A dot plot for comparing options. A bridge chart for where time goes. A grid of squares for time at a glance. Trees or arrows for structure. Never plain boxes with text in them, and skip 3D or click-to-reveal unless it explains better than a still.
- **A post in steps shows each step the same way.** Each step's figure ends with the same whole-file before → after bars, on one scale, and the closing step chart follows the post's order from the baseline, with nothing else mixed in.
- **A mechanism is drawn on a few real rows; its sizes are the whole file's.** Animate how it works when that explains more than a still (text that rearranges itself, looping slowly: a quick move, a hold of about 7 s, hover or focus pausing it, a tab stopping it).
- **Colour links what belongs together.** Matching neutral styles tie a value to its dictionary entry; the accent everywhere ties nothing.
- **Chart basics, every time.**
  - A short title above.
  - Axis titles with units, e.g. "win rate (%)".
  - The baseline first and striped.
  - One accent (`--accent`, violet) for the result or the option kept.
  - Changes in green (`--gain`, real gain), red (`--loss`, real drop) or grey (could be luck), with a key on the chart.
  - Numbers aligned in their own columns, and even row spacing.
  - Text sizes as in `DESIGN.md`, nothing under 11px.
- **No text jammed under a chart.** Labels go on the marks, and explanation goes in one sentence of prose before or after. If the chart already shows it, that sentence goes too: he cut the Jest vs Vitest post by half just by deleting prose that restated its figures.
- **Deep detail goes in a collapsed panel**, linked from the one sentence that needs it (`[how X works](#internals)` to a `<details class="more" id="internals">`, which the post layout opens on the jump), not explained inline.
- **In MDX an inline SVG sits on one line**, or the parser breaks it.
- **Every mark is explained somewhere.** That covers a range bracket, a dashed reference line and a Δ. Do it once, in the key or the first chart's caption.
- **Interaction is a bonus, never required.** Hover can fade the other rows, but nothing should force a click to understand.
- **Check every figure at phone width and in both themes**, with nothing overflowing its box.
- **Nothing scrolls sideways.** Colin finds horizontal scrolling terrible: no long code lines, tables or figures that need it. Pretty-print a record and show a few of its fields, or wrap the code block (`wrap` after the language).
- **A recording, when there is one, beats a chart for the hook.** Captions are short, e.g. "73% wins / this game: won, 57 points".

## 5. Ship

1. Branch, and show him a local preview link (the dev server on his Tailscale name works from his phone).
2. Before merging:
   - He has read the draft and said publish. Ask it with his last content decision (a title, a final figure), so his yes to that covers publishing too.
   - `pubDate` is the publish day.
   - Series posts link to each other.
   - Work posts name nothing private.
   - The linked repos are pushed, so links show the current page.
   - `pnpm check` passes.
   - An independent review is done.
3. Merge, watch the deploy, then load the live page.
4. For LinkedIn, make a 4:5 card in the blog's look (gameplay or the one key chart, the headline number pair, one tagline). Add a short post in his voice: what he wanted to find out, the result, one interesting aside, then the link. Keep it to about five one-line paragraphs: the numbers are on the card, so the text gives the verdict in words ("It's kinda mid") and doesn't repeat them.
