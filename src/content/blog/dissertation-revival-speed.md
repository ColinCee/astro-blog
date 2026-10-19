---
title: "My 2018 Dissertation, 29× Faster"
shortTitle: "My Dissertation, 29× Faster"
description: "I gave Claude my undergrad AI project. The same agent now trains in 25 minutes instead of 12 hours, and learns the same way."
stat: "12 h → 25 min"
figures:
  - label: "2018, one run"
    value: "12 h"
  - label: "2026, same agent"
    value: "25 min"
pubDate: "Oct 20 2026"
---
## Results

<figure class="fig">
<div class="vids">
<figure class="vid vid--hi"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>, retrained in 2026</figcaption></figure>
</div>
<figcaption>Aliens, one of the four games in the dissertation. The agent sees only the pixels and the score, and has to learn to shoot the aliens before they land.</figcaption>
</figure>

In 2018 my final-year project taught an AI to play video games, and one training run took about 12 hours. This October I gave the whole thing to Claude, the AI coding agent, to see how far it could get with today's tools. Two days later the same agent, with the same settings and even the same bugs, trains in about **25 minutes** (11 on a quiet machine) and learns the same way it did in 2018.[^results]

<figure class="fig" data-widget="race" data-ticks="1000000" data-max="43200">
<p class="fig__k">One million game ticks of training (a tick is one frame of the game)</p>
<div class="ctl"><button type="button">Play</button><input type="range" min="0" max="1000" value="0" step="1" aria-label="Time since training started"><output>0 s</output></div>
<div class="cmp" data-secs="43200" style="grid-template-columns:8.5rem minmax(0,1fr) 7.6rem"><span>2018, GTX 980</span><i style="--w:0"></i><b></b></div>
<div class="cmp" data-secs="1500" style="grid-template-columns:8.5rem minmax(0,1fr) 7.6rem"><span>Same agent, 2026</span><i style="--w:0"></i><b></b></div>
<div class="cmp" data-secs="240" style="grid-template-columns:8.5rem minmax(0,1fr) 7.6rem"><span>Today's DQN</span><i style="--w:0"></i><b></b></div>
<figcaption>Drag or press play: the clock runs from zero to 12 hours. The 2026 rows are the 2018 agent rebuilt (about 25 min: 23 to 34 across three runs on a busy PC, 11 with the machine to itself) and a modern DQN (3 to 5 min).</figcaption>
</figure>

This is part 1 of 3. [Part 2](/blog/dissertation-revival-beating-2018/) is about using that speed to beat my 2018 results, and [part 3](/blog/dissertation-revival-research-speed/) about what it's like doing research this fast.

## 2018: the 2016 state of the art, by hand

The project took the deep Q-network (DQN), the method DeepMind used to learn Atari games from pixels in 2015, and the three improvements published in the year after it: Double DQN, prioritised replay and dueling networks. It tested them on four games from the General Video Game AI competition (GVGAI), against a tree search and against me.

I didn't use a reinforcement learning library; I wrote the agent myself: the replay memory, the sum tree that prioritised replay samples from, the training loop and the reward. Keras ran the network, on a GTX 980 with 4 GB of memory. Then each idea cost a night.

<figure class="fig" data-grow>
<p class="fig__k">2018 → 2026, the same project</p>
<div class="gains">
<div class="gain"><span>GPU memory</span><em>4 GB → <b>24 GB</b></em><i style="--w:0.389"></i><strong>×6</strong></div>
<div class="gain"><span>Runs at once</span><em>1 → <b>3</b></em><i style="--w:0.239"></i><strong>×3</strong></div>
<div class="gain"><span>One game, ticks/s</span><em>34 → <b>2,590</b></em><i style="--w:0.940"></i><strong>×76</strong></div>
<div class="gain"><span>Training, ticks/s</span><em>23 → <b>~1,550</b></em><i style="--w:0.913"></i><strong>×67</strong></div>
<div class="gain gain--hi"><span>One training run</span><em>12 h → <b>25 min</b></em><i style="--w:0.730"></i><strong>×29</strong></div>
</div>
<figcaption>Bars are on a log scale: how many times bigger (or faster) 2026 is. Training speed is the 2018 agent itself. 2018: a GTX 980, Python 3.6, Keras 2 and TensorFlow 1 (no longer installs), with the replay memory, sum tree and training loop written by hand. 2026: an RTX 4090, Python 3.14 and PyTorch 2.14. Training speed is on a quiet machine; 25 min is the typical run with other work on the PC.</figcaption>
</figure>

## Does the 2018 code hold up?

Claude ported my agent to PyTorch and kept everything, including things that look like mistakes: raw 0–255 pixels into the network, each reward credited one move late, training only at the end of each game. It found my undocumented settings in the code, not in the report.[^quirks] Then it ran the agent three times on today's engine.

<figure class="fig">
<p class="fig__k">Aliens wins per 500 training games, final 2018 agent</p>
<div class="chart">
<svg viewBox="0 0 640 230" role="img" aria-label="Win rate per 500 training games: 2018 report 4, 22, 58, 68 percent; 2026 replay 8, 30, 57, 69 percent">
<line class="ax" x1="40" x2="630" y1="196" y2="196"/><text x="34" y="200" text-anchor="end">0%</text>
<line class="ax" x1="40" x2="630" y1="150" y2="150"/><text x="34" y="154" text-anchor="end">25%</text>
<line class="ax" x1="40" x2="630" y1="105" y2="105"/><text x="34" y="109" text-anchor="end">50%</text>
<line class="ax" x1="40" x2="630" y1="60" y2="60"/><text x="34" y="64" text-anchor="end">75%</text>
<line class="ax" x1="40" x2="630" y1="14" y2="14"/><text x="34" y="18" text-anchor="end">100%</text>
<rect class="bar" x="77" y="189" width="34" height="7"><title>2018 report: 4%</title></rect>
<rect class="hi" x="117" y="181" width="34" height="15"><title>2026 replay, mean of 3 runs: 8% (runs 6 to 10%)</title></rect>
<line class="ax" style="stroke:var(--ink)" x1="134" x2="134" y1="178" y2="185"/>
<text x="94" y="184" text-anchor="middle">4</text><text x="134" y="173" text-anchor="middle" class="ink">8</text>
<text x="114" y="218" text-anchor="middle">games 1–500</text>
<rect class="bar" x="224" y="156" width="34" height="40"><title>2018 report: 22%</title></rect>
<rect class="hi" x="264" y="141" width="34" height="55"><title>2026 replay, mean of 3 runs: 30% (runs 28 to 31%)</title></rect>
<line class="ax" style="stroke:var(--ink)" x1="281" x2="281" y1="140" y2="145"/>
<text x="241" y="151" text-anchor="middle">22</text><text x="281" y="135" text-anchor="middle" class="ink">30</text>
<text x="261" y="218" text-anchor="middle">games 501–1000</text>
<rect class="bar" x="372" y="90" width="34" height="106"><title>2018 report: 58%</title></rect>
<rect class="hi" x="412" y="92" width="34" height="104"><title>2026 replay, mean of 3 runs: 57% (runs 53 to 61%)</title></rect>
<line class="ax" style="stroke:var(--ink)" x1="429" x2="429" y1="85" y2="100"/>
<text x="389" y="85" text-anchor="middle">58</text><text x="429" y="80" text-anchor="middle" class="ink">57</text>
<text x="409" y="218" text-anchor="middle">games 1001–1500</text>
<rect class="bar" x="519" y="72" width="34" height="124"><title>2018 report: 68%</title></rect>
<rect class="hi" x="559" y="70" width="34" height="126"><title>2026 replay, mean of 3 runs: 69% (runs 64 to 75%)</title></rect>
<line class="ax" style="stroke:var(--ink)" x1="576" x2="576" y1="58" y2="78"/>
<text x="536" y="67" text-anchor="middle">68</text><text x="576" y="53" text-anchor="middle" class="ink">69</text>
<text x="556" y="218" text-anchor="middle">games 1501–2000</text>
</svg>
</div>
<ul class="legend"><li>2018 report, one run</li><li class="is-data">2026 replay, mean of 3 runs (line: lowest to highest)</li></ul>
<figcaption>The same learning curve eight years apart. 2018's own two runs of this agent differed by 10 to 17 points, so this is as close as it gets.</figcaption>
</figure>

It reproduces on Aliens, and on Wafer Thin Mints (35% wins against 2018's 33%). My hand-written code was doing what the papers described. Claude also found two real bugs in it, the late reward and prioritised replay without its correction weights; fixing them changed little (48.2 points against 50.1, one run).

## Where the 12 hours went

Almost none of it was learning. The game engine I used paused for 25 ms every tick so people could watch, and every frame was saved to disk as a PNG and read back. Each of those went, one change at a time, with a test that replays recorded games and fails if a single pixel or score differs.[^golden]

<figure class="fig">
<p class="fig__k">One game, ticks per second (log scale)</p>
<div class="chart">
<svg viewBox="0 0 640 260" role="img" aria-label="Ticks per second for one Aliens game, log scale, from 34 in 2018 to 2,590 after nine engine changes">
<line class="ax" x1="44" x2="620" y1="211" y2="211"/><text x="38" y="215" text-anchor="end">30</text>
<line class="ax" x1="44" x2="620" y1="162" y2="162"/><text x="38" y="166" text-anchor="end">100</text>
<line class="ax" x1="44" x2="620" y1="117" y2="117"/><text x="38" y="121" text-anchor="end">300</text>
<line class="ax" x1="44" x2="620" y1="68" y2="68"/><text x="38" y="72" text-anchor="end">1,000</text>
<line class="ax" x1="44" x2="620" y1="23" y2="23"/><text x="38" y="27" text-anchor="end">3,000</text>
<polyline class="ln" points="44,200 102,200 102,169 159,169 159,146 217,146 217,131 274,131 274,125 332,125 332,119 390,119 390,69 447,69 447,48 505,48 505,36 562,36 562,33 620,33"/>
<circle class="mk" cx="73" cy="200" r="5"><title>2018 engine: 34 ticks/s</title></circle>
<circle class="mk" cx="130" cy="169" r="3.5"><title>no 25 ms sleep: 75 ticks/s</title></circle>
<circle class="mk" cx="188" cy="146" r="3.5"><title>frame decoded in memory: 136 ticks/s</title></circle>
<circle class="mk" cx="246" cy="131" r="3.5"><title>PNG sent, not re-saved: 200 ticks/s</title></circle>
<circle class="mk" cx="303" cy="125" r="3.5"><title>sprites cached: 233 ticks/s</title></circle>
<circle class="mk" cx="361" cy="119" r="3.5"><title>buffered socket: 274 ticks/s</title></circle>
<circle class="mk" cx="418" cy="69" r="3.5"><title>raw pixels, no PNG: 1,017 ticks/s</title></circle>
<circle class="mk" cx="476" cy="48" r="3.5"><title>raw bytes, not text: 1,738 ticks/s</title></circle>
<circle class="mk" cx="534" cy="36" r="3.5"><title>no sprite copies: 2,400 ticks/s</title></circle>
<circle class="mk hi" cx="591" cy="33" r="5"><title>drawn straight to one image: 2,590 ticks/s</title></circle>
<text x="73" y="220" text-anchor="middle" class="ink">34</text>
<text x="591" y="21" text-anchor="middle" class="hi">2,590</text>
<text x="130" y="159" text-anchor="middle">no sleep</text>
<text x="418" y="59" text-anchor="middle">raw pixels</text>
<text x="44" y="248">9 engine changes, in order →</text>
</svg>
</div>
<figcaption>Hover or tap a dot for the change. Measured with random play; the benchmark was tightened partway, so neighbouring steps can differ by a few percent from the next row's starting point.</figcaption>
</figure>

The biggest single jump was sending raw pixels instead of PNG files: 274 to 1,017 ticks per second. Then the learning side: replay memory on the GPU, each training step recorded once on the GPU and replayed as a single command, and the network choosing moves while it trains. A modern DQN now trains at about 9,000 ticks per second, and three train side by side on one PC.[^improvements]

<figure class="fig" data-grow>
<p class="fig__k">Everything this project trained: 241 runs, 554M ticks</p>
<div class="cmp"><span>At 2018's speed</span><i style="--w:1"></i><b>~280 days</b></div>
<div class="cmp cmp--after"><span>In 2026</span><i style="--w:0.0022"></i><b>15 h</b></div>
<figcaption>The 2018 figure is an estimate: the same ticks at the 23 ticks per second my 2018 agent trained at.</figcaption>
</figure>

## What the speed buys

In 2018 every bug took a night to check, so I tested a handful of ideas, once each. In 2026 one evening was enough for three runs of every variant, a second look at the reward, and newer methods like Rainbow and PPO. That's [part 2](/blog/dissertation-revival-beating-2018/): trying to beat my 2018 agent, and finding out what "beat" should mean.

[^results]: Every number here is from [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md) in my dissertation repo. The 2018 time is from the original report.
[^quirks]: Among them: a learning-rate decay, squared-error loss, exploration held at 100% for 20,000 moves and then lowered over 1,000 games, and the target network synced every 5,000 moves.
[^golden]: Four games recorded with fixed seeds on the unmodified engine. Every later change had to reproduce every tick's state and pixels.
[^improvements]: All 30 changes, each with its before and after and a tagged commit: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/IMPROVEMENTS.md).
