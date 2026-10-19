---
title: "My 2018 Dissertation, 65× Faster"
shortTitle: "My Dissertation, 65× Faster"
description: "The game-playing AI I wrote from scratch as a student still learns the same way. Training now takes 11 minutes instead of 12 hours."
stat: "12 h → 11 min"
figures:
  - label: "2018"
    value: "12 h"
  - label: "2026"
    value: "11 min"
pubDate: "Oct 20 2026"
---
## Results

<figure class="fig">
<div class="vids">
<figure class="vid vid--hi"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>, retrained in 2026</figcaption></figure>
</div>
<figcaption>Aliens. The agent sees only the screen and the score.</figcaption>
</figure>

For my final-year project at Strathclyde in 2018, I wrote an AI that learns to play video games from the screen. One training run took 12 hours. This October I gave the code to Claude to see how far it could get with today's tools. The same agent now trains in **11 minutes**, and learns the way it did in 2018.[^speed]

<figure class="fig" data-widget="race" data-ticks="1000000" data-unit="frames" data-max="43200">
<p class="fig__k">One training run: a million frames of play</p>
<div class="ctl"><button type="button">Play</button><input type="range" min="0" max="1000" value="0" step="1" aria-label="Time since training started"><output>0 s</output></div>
<div class="cmp" data-secs="43200" style="grid-template-columns:5rem minmax(0,1fr) 7.6rem"><span>2018</span><i style="--w:0"></i><b></b></div>
<div class="cmp" data-secs="660" style="grid-template-columns:5rem minmax(0,1fr) 7.6rem"><span>2026</span><i style="--w:0"></i><b></b></div>
<figcaption>Same agent, same settings. Press play or drag: the clock runs to 12 hours.</figcaption>
</figure>

Part 1 of 3. [Part 2](/blog/dissertation-revival-beating-2018/): beating it. [Part 3](/blog/dissertation-revival-research-speed/): what research at this speed is like.

## Written from scratch

In 2018 there was nothing to plug in. DeepMind's DQN and the three improvements I used were two years old, so I wrote them from the papers: the memory the agent learns from, the training loop, the reward.[^methods]

## It still learns the same way

Claude rebuilt it on today's software, kept every setting, even my bugs, and trained it three times.

<figure class="fig">
<p class="fig__k">Aliens: wins so far</p>
<div class="chart chart--narrow">
<svg viewBox="0 0 320 222" role="img" aria-label="Wins so far over 2,000 training games. My 2018 run ends at 876 wins; the three 2026 runs end between 792 and 869.">
<line class="ax" x1="34" x2="312" y1="180" y2="180"/><text x="29" y="184" text-anchor="end">0</text>
<line class="ax" x1="34" x2="312" y1="123" y2="123"/><text x="29" y="127" text-anchor="end">300</text>
<line class="ax" x1="34" x2="312" y1="67" y2="67"/><text x="29" y="71" text-anchor="end">600</text>
<line class="ax" x1="34" x2="312" y1="10" y2="10"/><text x="29" y="14" text-anchor="end">900</text>
<text x="34" y="194" text-anchor="start">0</text>
<text x="173" y="194" text-anchor="middle">1,000</text>
<text x="312" y="194" text-anchor="end">2,000</text>
<polygon class="band" points="34.1,180.0 39.7,179.6 45.3,178.7 50.8,177.9 56.4,177.4 61.9,177.2 67.5,176.6 73.1,176.0 78.6,175.1 84.2,174.0 89.7,173.6 95.3,172.8 100.9,171.3 106.4,170.4 112.0,169.2 117.5,168.1 123.1,166.2 128.7,163.6 134.2,161.5 139.8,158.3 145.3,155.3 150.9,153.0 156.5,150.5 162.0,147.5 167.6,145.1 173.1,141.3 178.7,137.5 184.3,134.3 189.8,129.8 195.4,124.5 200.9,121.8 206.5,117.3 212.1,113.1 217.6,108.8 223.2,104.3 228.7,99.3 234.3,93.9 239.9,89.1 245.4,84.4 251.0,79.1 256.5,73.5 262.1,68.6 267.7,63.5 273.2,58.0 278.8,52.9 284.3,46.5 289.9,40.4 295.5,34.2 301.0,27.9 306.6,21.7 312.0,15.9 312.0,30.4 306.6,35.5 301.0,40.4 295.5,46.5 289.9,51.2 284.3,56.3 278.8,61.9 273.2,66.9 267.7,70.8 262.1,76.1 256.5,82.5 251.0,88.0 245.4,92.4 239.9,96.7 234.3,102.0 228.7,106.1 223.2,110.7 217.6,114.8 212.1,119.7 206.5,124.5 200.9,128.4 195.4,132.8 189.8,137.3 184.3,141.1 178.7,144.5 173.1,147.7 167.6,150.3 162.0,153.6 156.5,156.0 150.9,158.7 145.3,160.7 139.8,162.6 134.2,164.7 128.7,166.4 123.1,168.7 117.5,169.8 112.0,171.5 106.4,172.8 100.9,174.7 95.3,175.5 89.7,176.2 84.2,176.8 78.6,177.2 73.1,177.4 67.5,177.9 61.9,178.7 56.4,179.2 50.8,179.4 45.3,179.6 39.7,180.0 34.1,180.0" style="fill:color-mix(in oklch, var(--muted) 45%, transparent)"/>
<polyline class="ln hi" points="34.1,180.0 39.7,179.4 45.3,179.4 50.8,178.9 56.4,178.3 61.9,178.1 67.5,177.7 73.1,177.4 78.6,177.2 84.2,175.8 89.7,174.3 95.3,173.0 100.9,172.1 106.4,171.1 112.0,170.4 117.5,168.9 123.1,167.0 128.7,165.1 134.2,163.8 139.8,161.5 145.3,158.5 150.9,155.3 156.5,150.9 162.0,147.9 167.6,143.4 173.1,139.8 178.7,135.4 184.3,131.1 189.8,126.0 195.4,121.4 200.9,117.5 206.5,111.4 212.1,107.1 217.6,103.3 223.2,98.4 228.7,94.4 234.3,89.7 239.9,85.4 245.4,79.9 251.0,74.0 256.5,68.6 262.1,63.8 267.7,58.9 273.2,53.3 278.8,48.5 284.3,43.1 289.9,36.8 295.5,31.5 301.0,26.1 306.6,19.8 312.0,14.5"/>
<text x="194" y="74" text-anchor="end" class="hi">2018</text>
<text x="242" y="118" text-anchor="start" class="ink">2026 ×3</text>
<text x="173" y="218" text-anchor="middle">training games →</text>
</svg>
</div>
<figcaption>My 2018 run finished with 876 wins out of 2,000 games; the three 2026 runs, 792 to 869.</figcaption>
</figure>

It also found two real bugs in my code. Fixing them changed little.[^bugs]

## Where the 12 hours went

Mostly waiting. The game paused for 25 ms every frame so people could watch, and saved every frame as an image file for the agent to read back.[^improvements]

<figure class="fig" data-grow>
<p class="fig__k">One game, frames per second (log scale)</p>
<div class="cmp"><span>2018</span><i style="--w:0.215"></i><b>34</b></div>
<div class="cmp"><span>No 25 ms pause</span><i style="--w:0.353"></i><b>75</b></div>
<div class="cmp"><span>No image files</span><i style="--w:0.810"></i><b>1,017</b></div>
<div class="cmp cmp--after"><span>2026</span><i style="--w:0.974"></i><b>2,590</b></div>
<figcaption>Four of the 30 changes. A replay test checked each one changed nothing in the games.</figcaption>
</figure>

## What that buys

This project trained 241 times in 15 hours. At 2018's speed, about 280 days. [Part 2](/blog/dissertation-revival-beating-2018/) is what I did with them.

[^speed]: 1 million frames on an RTX 4090 with the machine to itself (about 25 minutes with other runs sharing it). 2018: a GTX 980. Every number: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md).
[^methods]: DQN (2015), Double DQN (2015), prioritised replay (2016) and dueling networks (2016), on four games from the General Video Game AI competition. Python 3.6 and Keras then; Python 3.14 and PyTorch now.
[^bugs]: Rewards were credited one move late, and prioritised replay lacked its correction weights. Fixed: 48.2 points against 50.1, one run.
[^improvements]: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/IMPROVEMENTS.md), each change with its before, after and a tagged commit. A test replays recorded games and fails if one pixel differs.
