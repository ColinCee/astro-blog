---
title: "How Claude redid my 2018 dissertation in 28 hours"
subtitle: "What handing my old dissertation to Claude was actually like."
stat: "11 weeks → 28 h"
statLabel: "start to finish"
figures:
  - label: "2018, coding"
    value: "11 weeks"
  - label: "2026, with Claude"
    value: "28 h"
pubDate: "Oct 22 2026"
---
<figure class="fig" data-grow>
<p class="fig__k">Start to finish, 2018 against 2026</p>
<div class="split">
<div><p class="fig__k">2018: me, a GTX 980</p>
<div class="cmp"><span>Time</span><i style="--w:1"></i><b>11 weeks</b></div>
<div class="cmp"><span>Commits</span><i style="--w:0.6"></i><b>56</b></div>
<div class="cmp"><span>Runs per idea</span><i style="--w:0.33"></i><b>1</b></div></div>
<div><p class="fig__k">2026: me, Claude, an RTX 4090</p>
<div class="cmp cmp--after"><span>Time</span><i style="--w:0.015"></i><b>28 h</b></div>
<div class="cmp cmp--after"><span>Commits</span><i style="--w:1"></i><b>94</b></div>
<div class="cmp cmp--after"><span>Runs per idea</span><i style="--w:1"></i><b>3</b></div></div>
</div>
</figure>

In 2018 my dissertation took eleven weeks, from the first commit on 11 January to handing the report in on 28 March, and almost every idea only got one run because each run took a night. This October I handed it all to Claude and it did the lot again in about 28 hours, from a Sunday morning to Monday afternoon with the night in between. It rebuilt the code, reproduced my results, tried the main methods that came out after, and found a flaw in how I'd measured it all. I didn't write any of the code myself.[^results]

[Part 1](/blog/dissertation-revival-speed/) covers how it got 65× faster. This one is about what working like that was actually like.

## What did the two days look like?

<figure class="fig">
<p class="fig__k">The 28 hours: what Claude worked on, and eight turning points from me</p>
<div class="chart">
<svg viewBox="0 0 640 150" role="img" aria-label="About 28 hours: Claude worked through, with eight turning points from me, numbered below">
<rect class="band" x="304" y="8" width="194" height="112"/><text x="401" y="22" text-anchor="middle">asleep, runs going</text>
<text x="16" y="40">Me</text>
<line class="ax" x1="16" x2="624" y1="58" y2="58"/>
<circle class="hi" cx="16" cy="58" r="8"/><text x="16" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">1</text>
<circle class="hi" cx="78" cy="58" r="8"/><text x="78" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">2</text>
<circle class="hi" cx="180" cy="58" r="8"/><text x="180" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">3</text>
<circle class="hi" cx="236" cy="58" r="8"/><text x="236" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">4</text>
<circle class="hi" cx="266" cy="58" r="8"/><text x="266" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">5</text>
<circle class="hi" cx="505" cy="58" r="8"/><text x="505" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">6</text>
<circle class="hi" cx="543" cy="58" r="8"/><text x="543" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">7</text>
<circle class="hi" cx="588" cy="58" r="8"/><text x="588" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">8</text>
<text x="16" y="86">Claude</text>
<rect class="mk" x="28" y="92" width="103" height="12" rx="1"><title>revive + speed up</title></rect>
<rect class="mk" x="132" y="92" width="132" height="12" rx="1"><title>2018 replay, today's agents</title></rect>
<rect class="mk" x="267" y="92" width="222" height="12" rx="1"><title>overnight: a dozen queues of runs</title></rect>
<rect class="mk" x="491" y="92" width="51" height="12" rx="1"><title>button check, reward</title></rect>
<rect class="mk" x="544" y="92" width="79" height="12" rx="1"><title>all games, docs</title></rect>
<text x="16" y="138" text-anchor="start">Sun 10:39</text>
<text x="301" y="138" text-anchor="middle">midnight</text>
<text x="624" y="138" text-anchor="end">Mon 14:08</text>
</svg>
</div>
</figure>

1. Asked it to update everything, retrain, improve on the findings, and get each big decision reviewed by a second AI model.
2. Pushed back on stopping, six times in about 2½ hours, starting with "You stopped too early with the optimizations."
3. Asked why my 2018 agent was beating today's.
4. Asked whether my 2018 reward was "kinda hacky", and what would have been better.
5. Went to bed and told it "don't stop early", so it queued runs all night.
6. Asked what reward the research recommends, and why an experiment took hours, not minutes.
7. Told it to run the reward it recommended on all four games.
8. Asked if it was enough to stop, then asked for these posts.

## So who actually did what?

<figure class="fig">
<div class="split">
<div><p class="fig__k">Claude</p>
<div class="boxes"><div class="box">All the code<small>engine fixes, the 2018 port, Rainbow, PPO, IMPALA</small></div><div class="box">Checks I hadn't done in 2018<small>replaying recorded games pixel for pixel; the one-button baseline</small></div><div class="box">The experiment plan<small>what to run overnight, and when to stop</small></div></div></div>
<div><p class="fig__k">Me</p>
<div class="boxes"><div class="box box--fast">The question<small>how far can this get?</small></div><div class="box box--fast">Telling it to keep going<small>its default was to wrap up early</small></div><div class="box box--fast">Asking why<small>about a third of my messages were me learning PPO and IMPALA</small></div></div></div>
</div>
</figure>

The thing I did that mattered most was probably just not letting it stop, left alone it would wrap up after the obvious wins. The first 21× in part 1 came before I pushed back, but the rest of it, and all the work on training speed, came after. On its side, it kept checking the results instead of trusting them, random play was its idea in the first hour and so was the one-button check the next morning, which is where the 82% for holding shoot came from.

I also spent about an hour trying to work out why it had picked Rainbow, which is a strange position to be in on your own dissertation.

## What's still unsolved?

Two of the problems need the agent to go looking for things, it can't learn about the far door if it never gets there.

<figure class="fig">
<p class="fig__k">Deceptizelda: the near door for 2 points, or the far one for 10</p>
<div class="map">
<img src="/blog/gvgai/deceptizelda-level0.png" alt="Deceptizelda level 0: a maze with the player bottom left, a key and a door bottom right, three spiders in the corridors above, and a second door reached only through the maze" width="260" height="240">
<svg viewBox="0 0 260 240" aria-hidden="true">
<polyline class="ln" points="210,210 30,210 30,30 230,30 230,90 70,90 70,170 230,170" style="stroke-dasharray:5 4;stroke:var(--ink)"/>
<polyline class="ln hi" points="30,210 210,210 230,210" style="stroke-width:3"/>
<circle cx="230" cy="210" r="13" class="ring hi"/>
<circle cx="230" cy="170" r="13" class="ring"/>
</svg>
</div>
<ul class="legend"><li class="is-data">Key, then the near door, 2 points, which is what every agent does</li><li>Back through the spiders to the far door, 10 points, which only I did</li></ul>
</figure>

- **Deceptizelda's big exit.** Even a reward paying 1 extra point for it didn't help, the agents just never get there to find out.
- **Chase.** No learning agent has won a single game, so a win/lose reward never even fires.
- **MCTS.** A tree search that tries moves ahead in a copy of the game scores 78 on Aliens with no training at all, against 62 for the best learning agent, and 50 simulations a move is enough.

<figure class="fig">
<p class="fig__k">Same level and seed, the best learning agent against MCTS</p>
<div class="vids">
<figure class="vid"><figcaption><b>Best learning agent</b>, up to 5M ticks: won, 60 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-impala.png"><source src="/blog/gvgai/aliens-dqn-impala.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-impala.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>MCTS</b>, no training, 50 simulations a move: won, 71 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-mcts.png"><source src="/blog/gvgai/aliens-mcts.webm" type="video/webm"><source src="/blog/gvgai/aliens-mcts.mp4" type="video/mp4"></video></figure>
</div>
</figure>

The next thing to try would be an exploration bonus, rewarding the agent for seeing something new, which seems to be what people normally try for this.

## What if I'd had this in 2018?

I'd have had three runs of everything instead of one, and the noise between runs is 10 to 17 percentage points of wins, so it was probably hiding what actually worked. I'd probably also have had the button baseline and known which of my win rates meant anything, and the eleven weeks wouldn't have been mostly waiting on training.


[^results]: Numbers from [the results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md). Timeline and quotes from my Claude Code session log, 18 and 19 October 2026.
