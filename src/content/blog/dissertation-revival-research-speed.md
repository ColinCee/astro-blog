---
title: "Eleven Weeks of Research in Two Days"
shortTitle: "Eleven Weeks in Two Days"
description: "What it was like handing my 2018 dissertation to Claude: who did what, what it found that I never checked, and what's still unsolved."
stat: "241 runs in 28 h"
figures:
  - label: "2018, coding"
    value: "11 weeks"
  - label: "2026, with Claude"
    value: "28 h"
pubDate: "Oct 22 2026"
---
## Results

<figure class="fig" data-grow>
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
<figcaption>2018: from the first commit to the finished report, 11 January to 28 March. 2026: a Sunday morning to Monday afternoon, overnight included, 241 training runs.</figcaption>
</figure>

In 2018 the code for my dissertation took eleven weeks, and every idea got one run because each run took a night. This October Claude did it again in two days. It rebuilt the code, reproduced my results, tried the main methods that came after, and found a flaw in how I'd measured it all. I didn't write a line of code.[^results]

This is part 3 of 3. [Part 1](/blog/dissertation-revival-speed/): the 2018 code came back, 65× faster. [Part 2](/blog/dissertation-revival-beating-2018/): beating it, and the button that wins 82%.

## The two days

<figure class="fig">
<div class="chart">
<svg viewBox="0 0 640 150" role="img" aria-label="The 28 and a half hours: Claude worked through, I stepped in eight times, numbered below">
<rect class="band" x="270" y="8" width="228" height="112"/><text x="384" y="22" text-anchor="middle">asleep, runs going</text>
<text x="16" y="40">Me</text>
<line class="ax" x1="16" x2="624" y1="58" y2="58"/>
<circle class="hi" cx="16" cy="58" r="8"/><text x="16" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">1</text>
<circle class="hi" cx="78" cy="58" r="8"/><text x="78" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">2</text>
<circle class="hi" cx="180" cy="58" r="8"/><text x="180" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">3</text>
<circle class="hi" cx="236" cy="58" r="8"/><text x="236" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">4</text>
<circle class="hi" cx="266" cy="58" r="8"/><text x="266" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">5</text>
<circle class="hi" cx="505" cy="58" r="8"/><text x="505" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">6</text>
<circle class="hi" cx="543" cy="58" r="8"/><text x="543" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">7</text>
<circle class="hi" cx="588" cy="58" r="8"/><text x="588" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-size:11px;font-weight:700">8</text>
<text x="16" y="86">Claude</text>
<rect class="mk" x="28" y="92" width="103" height="12" rx="1"><title>revive + speed up</title></rect>
<rect class="mk" x="132" y="92" width="132" height="12" rx="1"><title>2018 replay, today's agents</title></rect>
<rect class="mk" x="267" y="92" width="222" height="12" rx="1"><title>overnight: 13 queues of runs</title></rect>
<rect class="mk" x="491" y="92" width="51" height="12" rx="1"><title>button check, reward</title></rect>
<rect class="mk" x="544" y="92" width="79" height="12" rx="1"><title>all games, docs</title></rect>
<text x="16" y="138" text-anchor="start">Sun 10:39</text>
<text x="301" y="138" text-anchor="middle">midnight</text>
<text x="624" y="138" text-anchor="end">Mon 15:08</text>
</svg>
</div>
<figcaption>Grey: what Claude was working on. Tomato: each time I stepped in, numbered below. Times are approximate (UTC), from the session log.</figcaption>
</figure>

1. Asked it to update everything, retrain, improve on the findings, and get each big decision reviewed by a second AI model.
2. Pushed back: "You stopped too early with the optimizations." Three times.
3. Asked why my 2018 agent was beating today's.
4. Asked whether my 2018 reward was "kinda hacky", and what research says instead.
5. Went to bed: "don't stop early". It queued runs all night.
6. Asked what reward the research recommends, and why an experiment took hours, not minutes.
7. Told it to run the reward it recommended on all four games.
8. Called it done, and asked for these posts.

## Who did what

<figure class="fig">
<div class="split">
<div><p class="fig__k">Claude</p>
<div class="boxes"><div class="box">All the code<small>engine fixes, the 2018 port, Rainbow, PPO, IMPALA</small></div><div class="box">The checks I never did<small>replaying recorded games pixel for pixel; random play and the one-button baseline</small></div><div class="box">The experiment plan<small>what to run overnight, and when to stop</small></div></div></div>
<div><p class="fig__k">Me</p>
<div class="boxes"><div class="box box--fast">The question<small>how far can this get?</small></div><div class="box box--fast">"Keep going"<small>its default was to wrap up early</small></div><div class="box box--fast">"Why?"<small>about a third of my messages were me learning PPO and IMPALA</small></div></div></div>
</div>
</figure>

The most useful thing I did was refuse to let it stop. Left alone it wrapped up after the obvious wins; most of the speed in part 1 came after I pushed back. The most useful thing it did was distrust the results: checking against random play was its idea in the first hour, and so was the one-button check the next morning that reframed part 2.

I also spent an hour lost on why it chose Rainbow. It's an odd feeling to be the least informed person on your own dissertation.

## What's still unsolved

Two problems need the agent to explore, not just learn from what it stumbles into.

<figure class="fig">
<div class="map">
<img src="/blog/gvgai/deceptizelda-level0.png" alt="Deceptizelda level 0: a maze with the player bottom left, a key and a door bottom right, three spiders in the corridors above, and a second door reached only through the maze" width="260" height="240">
<svg viewBox="0 0 260 240" aria-hidden="true">
<polyline class="ln" points="210,210 30,210 30,30 230,30 230,90 70,90 70,170 230,170" style="stroke-dasharray:5 4;stroke:var(--ink)"/>
<polyline class="ln hi" points="30,210 210,210 230,210" style="stroke-width:3"/>
<circle cx="230" cy="210" r="13" class="ring hi"/>
<circle cx="230" cy="170" r="13" class="ring"/>
</svg>
</div>
<ul class="legend"><li class="is-data">Key, then the near door: 2 points. Every agent.</li><li>Back through the spiders to the far door: 10 points. Only me.</li></ul>
<figcaption>Deceptizelda: grab the key and take the near door for 2 points, or fight on to the far one for 10. Every agent, 2018 and 2026, takes the near one. I took the far one when I played it in 2018.</figcaption>
</figure>

- **Deceptizelda's big exit.** Even a reward that pays 1 extra point for it didn't help: the agents never get there to find out.
- **Chase.** No learning agent has won a single game, so a win/lose reward never fires.
- **MCTS.** A tree search that tries moves ahead in a copy of the game scores 78 on Aliens with no training, against 62 for the best learning agent. Fifty simulations per move is enough.

<figure class="fig">
<div class="vids">
<figure class="vid"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-impala.png"><source src="/blog/gvgai/aliens-dqn-impala.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-impala.mp4" type="video/mp4"></video><figcaption><b>Best learning agent</b>, 5M ticks: won, 60 points</figcaption></figure>
<figure class="vid vid--hi"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-mcts.png"><source src="/blog/gvgai/aliens-mcts.webm" type="video/webm"><source src="/blog/gvgai/aliens-mcts.mp4" type="video/mp4"></video><figcaption><b>MCTS</b>, no training, 50 simulations a move: won, 71 points</figcaption></figure>
</div>
<figcaption>The same level and seed. MCTS gets to look ahead in a copy of the game; the learning agent only sees the screen.</figcaption>
</figure>

Next would be an exploration bonus that rewards the agent for seeing something new, which is the standard fix for both.

## If I'd had this in 2018

My dissertation would have had three runs of everything instead of one, so the noise between runs, 10 to 17 points, wouldn't have hidden what worked. It would have had the button baseline, so I'd have known which of my win rates meant anything. And I'd have spent the eleven weeks on the questions instead of on waiting.

The part that was still mine was asking the question, and not accepting the first answer.

[^results]: Numbers: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md). Timeline and quotes: the Claude Code session log, 18 and 19 October 2026.
