---
name: writing-posts
description: How to plan, write, chart and ship a post on Colin's blog in his voice. Use when writing, rewording, reviewing or publishing a post in this repo, or making its figures or LinkedIn card.
---

# Writing a post

Colin is a visual reader who skims. A post is one story, results first, in his own voice, with a figure wherever a figure says it better than a paragraph. The figure components and tokens are in `DESIGN.md`; frontmatter and privacy rules are in `AGENTS.md`.

Work in this order: the story in a line, the sections, the figures, then the wording. Show him built things (a figure, two or three distinct versions on the same facts), not plans.

## 1. The story

- **One story, said in a line first** ("Jest 7 min → Vitest 23 s", "23 minutes a day to save 2"). Hook, problem, fix, with the result scannable at the top: the stat, then a chart or clip.
- **Every section answers a question this story's reader would ask.** Anything that can't change the verdict (a sceptic's control, a second method that agrees, a model the plain numbers don't need) is one line in a collapsed panel or a footnote. The Anki post lost a whole section proving "it was really the Writing cards": whichever way it came out, he kept them off.
- **A section has one shape:** a short heading, a one-line answer ("Yes, measurably so.", "Hell no."), then the figure. A line after it may use a number from the figure to move the story on, never to explain the figure. Headings are a question ("How did we beat it?"), a plain statement ("PPO actually wins more at 1M frames") or, in a sequence, a date ("16 December: they move the flight", which also builds the timeline in `DESIGN.md`). Only the last can be a label ("Closing remarks"). Never report-speak like "Background".
- **The title is the hook, the stat is the result.** The title is a claim or question about the reader's world ("Why you might not need to handwrite Chinese", "CI faster than GitHub's"), not a number they can't place yet. `stat` is the headline result, `statLabel` what it measures in a reader's words ("flashcards a day"), and there is no subtitle. The same words go on the card, the index and the embed.
- **The headline number covers the whole story:** what was lost and gained, net of what he'd have paid anyway. Ask him which figure he means.
- **One baseline, like for like, everywhere.** It is the first row of every chart, and every number agrees across text, charts, card and frontmatter. Change one thing at a time against it, compare the same things before and after (the same characters against their own past, not two groups that differ in other ways), and leave out what both sides share. What can't be separated gets one line at the end, not a section.
- **Name each thing once, in the reader's words, and use it everywhere:** text, figures, the script. "Reading" and "Writing" cards, not the deck's own "Recognition" and "Listening".
- **Why he looked is part of the story.** Ask what made him try it and how it felt, and close on that in his words. What he says it feels like is also a lead to measure: he felt new characters were harder, and the log showed 13% → 21% wrong.
- **Gauge depth.** Ask him (a few options) how much his readers know before deciding the background. Jargon is defined on first use, as a link or a one-line list item.
- **In a timeline, each row is one turn of the story and makes sense alone,** in months not exact dates, with no code or number that needs context.

## 2. His voice

Write how he talks in chat and writes himself: casual, conversational British English, "I" for his own work and "we" for what he and Claude did. His 2018 dissertation and the passages he has written into posts are the reference; Claude's prose isn't.

- **Keep his words.** In a passage he wrote, fix only facts and real grammar errors (not his missing commas or run-ons) and tell him what changed. Never tidy it into your prose or change how sure he sounds.
- **Plain, with no AI drama.** He states strong claims straight ("Take a look at the massive difference in speed") and hedges where he's unsure ("I think", "kind of"). He can't stand manufactured contrast ("It isn't X. It's Y."), invented consensus ("everyone thinks"), clipped fragments ("Not once. 1,370 times.") or one-line punchlines and polished closers ("practice still wins").
- **Sentences run on the way he talks,** joined by commas, "but", "so" and "and". Openers he uses: "However", "So", "Fundamentally", "What it does is", "I remember". No semicolons, no em dashes, active voice.
- **Everyday words:** "vs" not "against", "pretty decent", "kinda mid", "cool". His verdict goes in the way he'd say it to a friend.
- **No term he'd have to ask about.** "The estimate", "what I measured", "points" and "the forecast" all stopped him. Say "the result, like 35%", "what I actually got", "20% → 35%".
- **Reach for a short list before a dense sentence.** He rewrote paragraph after paragraph of the handwriting post as bullets, because they explain things more simply. Two or more parallel facts, numbers, steps or options go in a list under a short lead-in ("Two places:", "An average review took:"), each bullet one plain line. Prose is for the connecting thought and how it felt. No bold lead-in on every bullet, and no detail a link can carry.
- **One finding per sentence, about three sentences a paragraph.** Two or more numbers go in the figure or a short list, never stacked in a sentence. He can't follow "it went from 20% to 35%, which is 14.2 points worse (95% CI 9.6 to 18.8)". Cut what a figure or the last sentence already says, don't explain what a later section covers, and end on a nudge to the next part.
- **He explains through story and scale:** a short history to set the scene, a comparison that makes a number land (a coin flip, atoms in the universe), a memory, a question that sets up the next part.
- **Only what he knows.** No "because" he didn't measure, no stacked parenthetical asides. A detail that matters gets its own sentence or a footnote.
- **Open with the thing and why he tried it,** not a recap of the last part.

## 3. Numbers and claims

- **Measured data only.** No estimates or demo data when the real thing can be run; an estimate that stays says so in its label ("~", a row's `note`). Get his OK before any GPU run.
- **Private data: measure a fake one at full scale.** A script (DuckDB for data) makes a dataset of the same shape and size; commit it, a small sample and the measuring script, and take every number after the hook from it. Say it's fake once and never tune it to hit a number.
- **One way to say each number,** the same everywhere (1.4×, not also "31% less"). A reduction is a % smaller ("−66%"), never a ×. In figures numbers are symbols and digits: "< $0.01", "~ 200 ms".
- **Anything that could be noise gets a test,** with the rule fixed before looking: a tie keeps the simpler or cheaper option, and the better-looking number is never picked afterwards.
- **Stats in the standard form, explained once.** A result reads "23 minutes (95% CI 17 to 29, p < 0.001)": a short section near the top says what the three parts are, and the methods sit in a collapsed panel at the end. Explain a range his way: every result has some luck in it, the range is how far luck could have moved it, and if the luckiest case on one side is still worse than the unluckiest on the other it isn't luck. Explaining the stats properly is its own post.
- **The body uses the simple, current number** ("about 2 minutes"); where it could end up goes in a footnote.
- **Don't overclaim.** An untested gap says "could be luck", a single run says so, and one person's data says that too.
- **Sources sit next to the claim** as inline links, with a cited article or law named in the link. A footnote is a short caveat, method note or reference, and there is no sources section.
- **Fact-check before he reads it for the last time, and again before publishing.** A fresh agent on another model recomputes every number from the raw data and reads the post cold; every number in the post must come out of the linked script.

## 4. Figures

The figures in his recent posts are the standard. A figure sits next to its text with a short title above it.

- **Pick the form by the job.** Bars to scale for A vs B, a step chart for improvements in sequence, a dot plot for options (with a whisker when there is a range), a bridge for where time goes, a grid of squares for time at a glance, trees or arrows for structure. Never plain boxes with text in them, and no 3D or click-to-reveal unless it explains more than a still.
- **A figure stands on its own.** He should never need to be told how to read it, and ideally the text doesn't talk about it at all. The title says what is counted, the axis is named with its unit, the key and any marker's name are on the chart, and a range is drawn whenever one is quoted. If it needs explaining, or he asks "what is that line?", it's the wrong figure: one measure, fewer series.
- **No captions, and no paragraph explaining a figure.** In the handwriting post he deleted every caption and every paragraph that walked through a chart. The most a figure gets underneath is a few words of fact it can't carry itself ("35 days before vs after"). Text near it can quote one of its numbers ("So on characters I already knew I went from 7% wrong to 11%") but never says what the chart shows or how to read it.
- **Chart basics:** the baseline first and striped, one accent (`--accent`) for the result or the option kept, changes in green (`--gain`), red (`--loss`) or grey (could be luck) with a key, numbers aligned in their own columns, even rows, text sizes from `DESIGN.md` and nothing under 11px.
- **He halved the Jest post the same way,** by deleting text that repeated its figures. If a sentence only says what a chart already shows, it goes.
- **A post in steps shows each step the same way,** each ending on the same before → after bars on one scale, and the closing chart follows the post's order.
- **A mechanism is drawn on a few real rows with the whole file's sizes,** animated only when that explains more than a still (a quick move, a hold of about 7 s, hover pauses it).
- **Colour links what belongs together;** the accent everywhere ties nothing. No strikethrough: grey the text and label it.
- **Deep detail goes in a collapsed panel** linked from the sentence that needs it (`[how X works](#internals)` to `<details class="more" id="internals">`).
- **Interaction is a bonus, never required,** and nothing scrolls sideways: wrap long code (`wrap` after the language) and show a few fields of a record, not all.
- **Check every figure at phone width and in both themes.** In MDX an inline SVG sits on one line.
- **A recording beats a chart for the hook,** with a short caption ("73% wins / this game: won, 57 points").

## 5. Ship

1. Work on a branch and give him a preview link: the localhost address on his PC, where his browser live-reloads, and the dev server's Tailscale name for his phone.
2. While he is rewording in his editor, don't rewrite the post on disk under him, because his editor saves its copy over yours. Give him the text, or make the edit and tell him to reload the file first. Wrap the prose (`pnpm format`) and commit his draft only once he says he's done.
3. Before merging:
   - He has read the draft and said publish. Ask it with his last content decision, so that yes covers publishing.
   - `pubDate` is the publish day, series posts link to each other, work posts name nothing private, and linked repos are pushed.
   - `pnpm og` has rendered the link-preview card (`public/og/<slug>.png`) from the final title and stat.
   - `pnpm check` passes and the independent review is done.
4. Merge, watch the deploy, then load the live page.
5. For LinkedIn, make a 4:5 card in the blog's look (gameplay or one chart, plus the post's verdict in numbers, not the `stat` again; the Anki card shows "23 min to save 2, +21 min a day", not "32 → 9 min") and a short post in his voice: what he wanted to find out, the result, one aside, the link. About five one-line paragraphs; the numbers are on the card, so the text gives the verdict in words.
6. Then improve this skill, every post. Compare the first draft with what shipped (`git diff` of the post between the first commit and the merge) and go back through what he said along the way. Whatever he deleted, rewrote, questioned or had to explain twice is a rule this skill got wrong or didn't have. Fix the rule where it lives, with the example from this post, and remove any rule that pushed the wrong way. Rewrite, don't append: the skill stays about this length, so a new lesson replaces or merges with an old one. Ship it as its own pull request and tell him in a few bullets what changed.
