---
title: "My 2018 Dissertation, 65× Faster"
shortTitle: "My Dissertation, 65× Faster"
description: "Why the game-playing AI I wrote as a student took 12 hours to train in 2018, and how it now trains in 11 minutes with the same results."
stat: "12 h → 11 min"
figures:
  - label: "2018"
    value: "12 h"
  - label: "2026"
    value: "11 min"
pubDate: "Oct 20 2026"
---
<figure class="fig" data-widget="qview" data-src="/blog/gvgai/aliens-2018-agent.json" data-stack="/blog/gvgai/aliens-2018-stacks.png">
<p class="fig__k">My 2018 agent, retrained in 2026. Every 4 ticks it scores its 3 moves and plays the top one.</p>
<div class="vids">
<figure class="vid"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
<div class="qbars" aria-live="off"></div>
<div class="ctl"><button type="button" data-step="-1">← back</button><button type="button" data-play aria-pressed="true">pause</button><button type="button" data-step="1">next →</button><output data-at></output></div>
<div class="peek">
<p class="fig__k">It sees these 4 frames, <span data-seen-ticks></span>, then plays <b data-held-name>shoot</b> for the next 4. Tap a frame to enlarge it.</p>
<div class="peek__seen" data-seen><i></i><i></i><i></i><i></i></div>
<div class="peek__zoom" data-zoom hidden><i></i><small></small></div>
</div>
</figure>

In 2018, for my final year project at Strathclyde University, I wrote an AI that teaches itself to play video games from the screen. I handed the report and code to Claude and told it to find ways to improve it. Now it trains in about 11 minutes instead of 12 hours, with the same results.[^speed]

The bars are its scores: how much reward it expects from each move, from now to the end of the game. It plays the top one. It's DQN, DeepMind's 2015 method, plus two newer tricks.[^methods] Getting those scores right takes about a million frames of practice.

## 2018: the cost of slow feedback loops

<figure class="fig" data-grow>
<p class="fig__k">One training run, to scale: 65 of today's fit in one of 2018's</p>
<div class="runs"><span>2018</span><div><i style="flex-basis:100%"></i></div><b>12 h</b></div>
<div class="runs runs--hi"><span>2026</span><div><i style="flex-basis:1.53%"></i></div><b>11 min</b></div>
<div class="runs runs--axis"><span></span><div><em>0</em><em>3 h</em><em>6 h</em><em>9 h</em><em>12 h</em></div><b></b></div>
</figure>

In 2018 there were no plug-and-play versions of these algorithms, so I wrote it all from the papers and other people's blog posts: about 700 lines of Python.

[My report](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf) said training "took approximately 12 hours. This is problematic when attempting to test different parameters".

It was. Every new idea waited on a full training run, so I'd leave the PC running overnight, or whenever I went out.

## The results still hold

Claude rebuilt it on today's software with every setting kept, and trained it three times.

<figure class="fig" data-widget="lines">
<p class="fig__k">Aliens, wins so far: my two 2018 runs against three 2026 runs</p>
<div class="chart chart--fluid">
<svg viewBox="-18 0 338 222" role="img" aria-label="Wins so far over 2,000 training games. My 2018 run ends at 876 wins; the three 2026 runs end between 792 and 869.">
<text x="-8" y="95" text-anchor="middle" transform="rotate(-90 -8 95)">wins so far</text>
<line class="ax" x1="34" x2="312" y1="180" y2="180"/><text x="29" y="184" text-anchor="end">0</text>
<line class="ax" x1="34" x2="312" y1="123" y2="123"/><text x="29" y="127" text-anchor="end">300</text>
<line class="ax" x1="34" x2="312" y1="67" y2="67"/><text x="29" y="71" text-anchor="end">600</text>
<line class="ax" x1="34" x2="312" y1="10" y2="10"/><text x="29" y="14" text-anchor="end">900</text>
<text x="34" y="194" text-anchor="start">0</text>
<text x="173" y="194" text-anchor="middle">1,000</text>
<text x="312" y="194" text-anchor="end">2,000</text>
<polygon class="band" points="34.1,180.0 39.7,179.6 45.3,178.7 50.8,177.9 56.4,177.4 61.9,177.2 67.5,176.6 73.1,176.0 78.6,175.1 84.2,174.0 89.7,173.6 95.3,172.8 100.9,171.3 106.4,170.4 112.0,169.2 117.5,168.1 123.1,166.2 128.7,163.6 134.2,161.5 139.8,158.3 145.3,155.3 150.9,153.0 156.5,150.5 162.0,147.5 167.6,145.1 173.1,141.3 178.7,137.5 184.3,134.3 189.8,129.8 195.4,124.5 200.9,121.8 206.5,117.3 212.1,113.1 217.6,108.8 223.2,104.3 228.7,99.3 234.3,93.9 239.9,89.1 245.4,84.4 251.0,79.1 256.5,73.5 262.1,68.6 267.7,63.5 273.2,58.0 278.8,52.9 284.3,46.5 289.9,40.4 295.5,34.2 301.0,27.9 306.6,21.7 312.0,15.9 312.0,30.4 306.6,35.5 301.0,40.4 295.5,46.5 289.9,51.2 284.3,56.3 278.8,61.9 273.2,66.9 267.7,70.8 262.1,76.1 256.5,82.5 251.0,88.0 245.4,92.4 239.9,96.7 234.3,102.0 228.7,106.1 223.2,110.7 217.6,114.8 212.1,119.7 206.5,124.5 200.9,128.4 195.4,132.8 189.8,137.3 184.3,141.1 178.7,144.5 173.1,147.7 167.6,150.3 162.0,153.6 156.5,156.0 150.9,158.7 145.3,160.7 139.8,162.6 134.2,164.7 128.7,166.4 123.1,168.7 117.5,169.8 112.0,171.5 106.4,172.8 100.9,174.7 95.3,175.5 89.7,176.2 84.2,176.8 78.6,177.2 73.1,177.4 67.5,177.9 61.9,178.7 56.4,179.2 50.8,179.4 45.3,179.6 39.7,180.0 34.1,180.0" style="fill:color-mix(in oklch, var(--muted) 45%, transparent)"/>
<polyline class="ln hi" points="34.1,180.0 39.7,179.4 45.3,179.4 50.8,178.9 56.4,178.3 61.9,178.1 67.5,177.7 73.1,177.4 78.6,177.2 84.2,175.8 89.7,174.3 95.3,173.0 100.9,172.1 106.4,171.1 112.0,170.4 117.5,168.9 123.1,167.0 128.7,165.1 134.2,163.8 139.8,161.5 145.3,158.5 150.9,155.3 156.5,150.9 162.0,147.9 167.6,143.4 173.1,139.8 178.7,135.4 184.3,131.1 189.8,126.0 195.4,121.4 200.9,117.5 206.5,111.4 212.1,107.1 217.6,103.3 223.2,98.4 228.7,94.4 234.3,89.7 239.9,85.4 245.4,79.9 251.0,74.0 256.5,68.6 262.1,63.8 267.7,58.9 273.2,53.3 278.8,48.5 284.3,43.1 289.9,36.8 295.5,31.5 301.0,26.1 306.6,19.8 312.0,14.5"/>
<text x="194" y="74" text-anchor="end" class="hi">2018: 876</text>
<text x="242" y="118" text-anchor="start" class="ink">2026 ×3</text><text x="242" y="132" text-anchor="start">792–869</text>
<text x="173" y="218" text-anchor="middle">training games →</text>
</svg>
</div>
<script type="application/json">{"x":{"max":2000,"ticks":[0,500,1000,1500,2000],"title":"training games →"},"y":{"max":900,"ticks":[0,300,600,900],"title":"wins so far"},"band":[[1,0,0],[40,0,2],[80,2,7],[120,3,11],[160,4,14],[200,7,15],[240,10,18],[280,14,21],[320,15,26],[360,17,32],[400,20,34],[440,24,37],[480,27,45],[520,38,51],[560,45,57],[600,53,62],[640,60,73],[680,72,87],[720,81,98],[760,92,114],[800,102,130],[840,113,143],[880,126,156],[920,140,171],[960,157,184],[1000,171,205],[1040,187,224],[1080,205,241],[1120,225,265],[1160,249,293],[1200,272,308],[1240,294,331],[1280,319,353],[1320,345,377],[1360,367,400],[1400,390,426],[1440,412,456],[1480,440,480],[1520,463,506],[1560,486,534],[1600,515,564],[1640,550,590],[1680,577,617],[1720,598,645],[1760,625,673],[1800,654,707],[1840,681,738],[1880,706,771],[1920,739,804],[1960,765,838],[2000,792,869]],"line":[[1,0],[40,3],[80,3],[120,6],[160,9],[200,9],[240,12],[280,14],[320,15],[360,21],[400,29],[440,37],[480,42],[520,47],[560,51],[600,59],[640,69],[680,78],[720,86],[760,98],[800,114],[840,130],[880,153],[920,169],[960,193],[1000,213],[1040,236],[1080,258],[1120,285],[1160,310],[1200,331],[1240,362],[1280,385],[1320,406],[1360,432],[1400,452],[1440,477],[1480,500],[1520,529],[1560,560],[1600,589],[1640,614],[1680,640],[1720,671],[1760,695],[1800,725],[1840,757],[1880,785],[1920,815],[1960,847],[2000,876]],"dots":[[0,0],[500,20],[1000,131],[1500,421],[2000,762]],"legend":[{"kind":"line","text":"2018, run 1: 876"},{"kind":"dots","text":"2018, run 2: 762"},{"kind":"band","text":"2026 ×3: 792–869"}]}</script>
</figure>

All three land between my two 2018 runs, which differ from each other by more than the 2026 runs do. Not bad for something I wrote as an undergrad from papers and blog posts.

Claude did find two real bugs in my code. Fixing them barely changed the result.[^bugs]

## Where the 12 hours went

Mostly waiting, not learning.

<figure class="fig">
<p class="fig__k">One frame of the game in 2018: 29 ms, split by what each fix saved</p>
<div class="tlist">
<div class="trow trow--wait"><span><b>Pause</b> so people could watch <small>change 1</small></span><i style="--w:1.000"></i><em>16 ms</em></div>
<div class="trow "><span><b>Image files</b> saved, then read back <small>changes 2, 3, 6, 7</small></span><i style="--w:0.708"></i><em>11 ms</em></div>
<div class="trow "><span><b>Other</b> small overheads <small>changes 4, 5, 8, 9</small></span><i style="--w:0.093"></i><em>1.5 ms</em></div>
<div class="trow trow--hi"><span><b>The game</b> itself</span><i style="--w:0.025"></i><em>0.4 ms</em></div>
</div>
</figure>

Claude cut them out one change at a time. Here are the nine, in order:

<figure class="fig ladder" data-widget="ladder" data-base="The 2018 engine|34 frames/s, with a 25 ms pause and image files on every frame">
<p class="fig__k">One game, sped up change by change. Tap a step.</p>
<svg viewBox="0 0 320 190" role="img" aria-label="Step chart: one game went from 34 to 2,590 frames per second in nine changes; the biggest was sending raw pixels instead of PNG files, 274 to 1,017."></svg>
<p data-out><b>Raw pixels instead of PNG files</b> <span>274 → 1,017 frames/s, <strong>×3.7</strong></span></p>
<script type="application/json">[{"name": "Removed a 25 ms pause per frame", "before": 34, "after": 75, "note": "Pause. It paced the game for people watching. My 2018 runs had it too."}, {"name": "Frames decoded in memory", "before": 75, "after": 136, "note": "Image files. Instead of written to disk and read back."}, {"name": "Engine sends the image it already made", "before": 136, "after": 200, "note": "Image files. Instead of saving it, reading it back and encoding it again."}, {"name": "Sprites scaled once", "before": 214, "after": 233, "note": "Other. Instead of on every draw."}, {"name": "One write per message", "before": 233, "after": 274, "note": "Other. Buffered output, sent in one go."}, {"name": "Raw pixels instead of PNG files", "before": 274, "after": 1017, "note": "Image files. No image encoded, written or read per frame. The biggest jump."}, {"name": "Raw bytes instead of text", "before": 1017, "after": 1738, "note": "Image files. The frame was sent as text inside JSON: 44% of the engine's time."}, {"name": "No sprite copies the agent never reads", "before": 2100, "after": 2400, "note": "Other. Only tree-search agents need them."}, {"name": "Drawn straight into one reused image", "before": 2400, "after": 2590, "note": "Other. Then the work moved to the training side."}]</script>
</figure>

Once the game stopped being the bottleneck, today's GPU did the rest: 11 minutes. Today's agents go further still, at 3 to 11 minutes a run.

## What that buys

This project trained 241 times, in 15 hours of training. At 2018 speed, that's about 280 days.

## How

Claude found each speed-up in the same loop:[^improvements]

1. **Profile** the game to see where the time goes.
2. **Change one thing.**
3. **Time it** on the same benchmark game.
4. **Replay recorded games**, failing if a single pixel differs, so it still plays exactly the same.

## Sources

Every figure, and the files behind it:

- **The replay at the top:** the 2026 rebuild of my 2018 agent (training run 1 of 3) playing Aliens level 0, engine seed 2, recorded with [tools/record.py](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/tools/record.py). Its scores are the network's own values at each decision.
- **One training run, to scale:** 12 hours from [my report](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf) ("training the DQN agent for 2000 episodes took approximately 12 hours"); 11 minutes is the quiet-machine benchmark in [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md).
- **Wins so far:** 2018 run 1 is the first 2,000 games of [the training log](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/results/2018/aliens-ddqn-per-reward.csv) from my report's spreadsheet. 2018 run 2 is the results table in [my report](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf) for the final agent: win rates per 500 games of 4.0, 22.2, 58.0 and 68.2%. The 2026 runs are [these three logs](https://github.com/ColinCee/GVGAI-Dissertation/tree/master/2026-revival/results/curves) (`aliens-ddqn2018-s0` to `s2`).
- **One frame in 2018, and the nine changes:** frames per second before and after each change, from [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/IMPROVEMENTS.md), measured with `bench/game_speed.py`. Each slice of the 29 ms is the time per frame before a change minus the time after.

[^speed]: At 1,550 frames a second on an RTX 4090 with the PC to itself; with other work running, 23 to 34 minutes. All the numbers: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md).
[^methods]: DQN, Double DQN and prioritised replay, on four GVGAI games; dueling networks didn't help on Aliens. All in [my dissertation](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf), with [the 2018 code](https://github.com/ColinCee/GVGAI-Dissertation/tree/master/2018-dissertation).
[^bugs]: Rewards credited one move late, and prioritised replay missing its correction weights. Fixed: 48.2 points vs 50.1. More in [LEARNINGS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/LEARNINGS.md).
[^improvements]: The benchmark was tightened partway, so the steps don't always line up exactly. All 30 changes, with before, after and a commit each: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/IMPROVEMENTS.md).
