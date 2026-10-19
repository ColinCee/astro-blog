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
<figure class="vid vid--hi"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>, retrained in 2026</figcaption></figure>
</div>
<figcaption>Aliens. The agent sees only the screen and the score.</figcaption>
</figure>

For my final-year project at Strathclyde in 2018, I wrote an AI that learns to play video games from the screen. One training run took 12 hours. This October I gave the code to Claude to see how far it could get with today's tools. The same agent now trains in **11 minutes**, and learns the way it did in 2018.[^speed]

<figure class="fig" data-grow>
<p class="fig__k">One training run, to scale</p>
<div class="runs"><span>2018</span><div><i style="flex-basis:100%"></i></div><b>12 h</b></div>
<div class="runs runs--hi"><span>2026</span><div><i style="flex-basis:1.53%"></i></div><b>11 min</b></div>
<div class="runs runs--axis"><span></span><div><em>0</em><em>3 h</em><em>6 h</em><em>9 h</em><em>12 h</em></div><b></b></div>
<figcaption>One 2018 run lasts as long as 65 of today's.</figcaption>
</figure>

Part 1 of 3. [Part 2](/blog/dissertation-revival-beating-2018/): beating it. [Part 3](/blog/dissertation-revival-research-speed/): what research at this speed is like.

## Written from scratch

In 2018 there was nothing to plug in. DeepMind's DQN and the three improvements I used were two or three years old, so I wrote them from the papers: about 700 lines of Python around the network.[^methods] This is the loop I built:

<figure class="fig loop">
<svg viewBox="0 -4 340 204" role="img" aria-label="The learning loop: the screen goes into the network, which picks a move; the game moves on. Each move goes into a memory; batches of 32 from the memory train the network.">
<defs><marker id="loop-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:var(--faint)"/></marker></defs>
<path class="arr" d="M282,34 C282,-2 58,-2 58,32"/>
<text x="170" y="24" text-anchor="middle" class="sub">the game moves on</text>
<path class="arr" d="M108,51 H118"/><path class="arr" d="M220,51 H230"/>
<path class="arr" d="M282,68 V148"/><path class="arr" d="M232,167 H222"/><path class="arr" d="M170,150 V70"/>
<text x="164" y="114" text-anchor="end" class="sub">nudge the weights</text>
<g class="mine"><rect x="8" y="34" width="100" height="34" rx="4"/><text x="58" y="49" text-anchor="middle">screen</text><text x="58" y="62" text-anchor="middle" class="sub">grey, ½ size</text></g>
<g><rect x="120" y="34" width="100" height="34" rx="4"/><text x="170" y="49" text-anchor="middle">network</text><text x="170" y="62" text-anchor="middle" class="sub">Keras</text></g>
<g class="mine"><rect x="232" y="34" width="100" height="34" rx="4"/><text x="282" y="49" text-anchor="middle">move</text><text x="282" y="62" text-anchor="middle" class="sub">best or random</text></g>
<g class="mine"><rect x="120" y="150" width="100" height="34" rx="4"/><text x="170" y="165" text-anchor="middle">learn</text><text x="170" y="178" text-anchor="middle" class="sub">32 at a time</text></g>
<g class="mine"><rect x="232" y="150" width="100" height="34" rx="4"/><text x="282" y="165" text-anchor="middle">memory</text><text x="282" y="178" text-anchor="middle" class="sub">100,000 moves</text></g>
<circle class="pulse" r="4" style="offset-path:path('M58,51 L282,51 L282,34 C282,-2 58,-2 58,34 Z')"/>
<circle class="pulse pulse--slow" r="4" style="offset-path:path('M282,51 L282,167 L170,167 L170,51')"/>
</svg>
<ul class="legend"><li class="is-data">Written by hand</li><li>A library (Keras)</li></ul>
<figcaption>Playing (fast loop) and learning (slow loop). The memory replays the moves it learns most from first: prioritised replay.</figcaption>
</figure>

My GTX 980 had 4 GB. Full-colour screens would have needed 39.6 GB of memory and a network of 16.7 million weights, and it simply crashed. So the agent sees the screen in grey at half size: 3.3 GB and 1.5 million weights.[^report] Here is that network, looking at one moment of the game above:

<figure class="fig">
<div class="net"><figure class="slab" tabindex="0"><div class="deck" style="--dw:9rem;aspect-ratio:300/110"><img src="/blog/gvgai/net/2018-input-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-input-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-input-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-input-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>4 frames<small>55 × 150</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:6rem;aspect-ratio:144/48"><img src="/blog/gvgai/net/2018-conv1-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv1-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv1-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv1-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 1<small>32 maps</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:5rem;aspect-ratio:153/45"><img src="/blog/gvgai/net/2018-conv2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 2<small>64 maps</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:4.4rem;aspect-ratio:240/48"><img src="/blog/gvgai/net/2018-conv3-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv3-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv3-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv3-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 3<small>64 maps</small></figcaption></figure><figure class="slab slab--out"><span>3 moves</span><figcaption>&nbsp;<small>shoot, left, right</small></figcaption></figure></div>
<figcaption>The real network, retrained in 2026, at one moment of Aliens. Each layer shows 4 of its maps; bright = active. Tap or hover a layer to face it.</figcaption>
</figure>

In my report I wrote that training "took approximately 12 hours. This is problematic when attempting to test different parameters". It was. I was a student trying things I'd never done before, most ideas were wrong, and each one took a night to find out.

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

Mostly waiting. The game paused for 25 ms every frame so people could watch, and saved every frame as an image file for the agent to read back. Claude removed them one at a time, with a test that replays recorded games and fails if a single pixel changes.[^improvements]

<figure class="fig ladder" data-widget="ladder">
<p class="fig__k">One game, frames per second (log scale)</p>
<svg viewBox="0 0 320 170" role="img" aria-label="Step chart: one game went from 34 to 2,590 frames per second in nine changes; the biggest was sending raw pixels instead of PNG files, 274 to 1,017."></svg>
<p data-out><b>Raw pixels instead of PNG files</b> <span>274 → 1,017 frames/s, <strong>×3.7</strong></span></p>
<script type="application/json">[{"name": "Removed a 25 ms pause per frame", "before": 34, "after": 75, "note": "It paced the game for people watching. My 2018 runs had it too."}, {"name": "Frames decoded in memory", "before": 75, "after": 136, "note": "Instead of written to disk and read back."}, {"name": "Engine sends the image it already made", "before": 136, "after": 200, "note": "Instead of saving it, reading it back and encoding it again."}, {"name": "Sprites scaled once", "before": 200, "after": 233, "note": "Instead of on every draw."}, {"name": "One write per message", "before": 233, "after": 274, "note": "Buffered output, sent in one go."}, {"name": "Raw pixels instead of PNG files", "before": 274, "after": 1017, "note": "No image encoded, written or read per frame. The biggest jump."}, {"name": "Raw bytes instead of text", "before": 1017, "after": 1738, "note": "The frame was sent as text inside JSON: 44% of the engine's time."}, {"name": "No sprite copies the agent never reads", "before": 1738, "after": 2400, "note": "Only tree-search agents need them."}, {"name": "Drawn straight into one reused image", "before": 2400, "after": 2590, "note": "Then the work moved to the training side."}]</script>
<figcaption>Hover or tap a step. Each was measured on its own; the benchmark was tightened partway, so a step can start a little off where the last one ended.</figcaption>
</figure>

Then the training side: the memory moved onto the GPU, and each learning step is recorded once and replayed as a single GPU command. Together: 12 hours to 11 minutes.

## What that buys

This project trained 241 times in 15 hours. At 2018's speed, about 280 days. [Part 2](/blog/dissertation-revival-beating-2018/) is what I did with them.

[^speed]: 1 million frames on an RTX 4090 with the machine to itself (about 25 minutes with other runs sharing it). 2018: a GTX 980. Every number: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md).
[^methods]: DQN (2015), Double DQN (2015), prioritised replay (2016) and dueling networks (2016), on four games from the General Video Game AI competition. Python 3.6 and Keras then; Python 3.14 and PyTorch now. The 2018 code no longer installs.
[^report]: From the 2018 report: 99 kB per full-colour frame × 4 frames × 100,000 samples = 39.6 GB; 8.25 kB in grey at half size = 3.3 GB.
[^bugs]: Rewards were credited one move late, and prioritised replay lacked its correction weights. Fixed: 48.2 points against 50.1, one run.
[^improvements]: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/IMPROVEMENTS.md): all 30 changes, each with its before, after and a tagged commit.
