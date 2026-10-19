---
title: "My 2018 Dissertation, 65× Faster"
shortTitle: "My Dissertation, 65× Faster"
description: "Why the game-playing AI I wrote as a student took 12 hours to train in 2018, and how it now trains in 11 minutes, learning exactly the same way."
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

In 2018, for my final-year project at Strathclyde, I wrote an AI that teaches itself to play video games from the screen. This October I handed the code to Claude. Same agent, same bugs: it now trains in about 11 minutes instead of 12 hours, and learns exactly the same way.[^speed]

The bars are its scores: how much reward it expects from each move, from now to the end of the game. It plays the top one. It's DQN, DeepMind's 2015 method, plus two newer tricks.[^methods] Getting those scores right takes about a million frames of practice.

## 2018: one idea a night

<figure class="fig" data-grow>
<p class="fig__k">One training run, to scale: 65 of today's fit in one of 2018's</p>
<div class="runs"><span>2018</span><div><i style="flex-basis:100%"></i></div><b>12 h</b></div>
<div class="runs runs--hi"><span>2026</span><div><i style="flex-basis:1.53%"></i></div><b>11 min</b></div>
<div class="runs runs--axis"><span></span><div><em>0</em><em>3 h</em><em>6 h</em><em>9 h</em><em>12 h</em></div><b></b></div>
</figure>

There was nothing plug-and-play for this, so I wrote it all from the papers: about 700 lines of Python, on a GTX 980 with 4 GB of memory. Full colour would have needed 39.6 GB just to store the moments it practises on, so I never tried: the agent sees grey at half size, 3.3 GB.

My report said training "took approximately 12 hours. This is problematic when attempting to test different parameters". It was. I was a student trying things I'd never done before, most ideas were wrong, and each one cost a night.

## It still learns the same way

Claude rebuilt it on today's software with every setting kept, and trained it three times.[^runs]

<figure class="fig" data-widget="lines">
<p class="fig__k">Aliens, wins so far: my 2018 run against three 2026 runs</p>
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
<script type="application/json">{"x":{"max":2000,"ticks":[0,500,1000,1500,2000],"title":"training games \u2192"},"y":{"max":900,"ticks":[0,300,600,900],"title":"wins so far"},"band":[[1,0.0,0.0],[41,0.0,2.1],[81,2.1,6.9],[121,3.2,11.1],[161,4.2,13.8],[201,6.9,14.8],[241,11.1,18.0],[281,13.8,21.2],[321,14.8,25.9],[361,16.9,31.8],[401,20.1,33.9],[441,23.8,38.1],[481,28.1,46.1],[521,38.1,50.8],[561,45.0,57.2],[601,54.0,63.0],[641,59.8,73.1],[681,72.0,86.8],[721,81.0,97.9],[761,92.1,114.9],[801,102.2,130.8],[841,112.8,142.9],[881,127.1,156.2],[921,139.8,172.1],[961,157.2,184.8],[1001,171.0,204.9],[1041,187.9,225.0],[1081,205.9,241.9],[1121,226.1,265.8],[1161,249.9,293.8],[1201,273.2,308.1],[1241,293.8,331.9],[1281,319.2,354.2],[1321,345.2,376.9],[1361,366.9,400.8],[1401,391.2,427.2],[1441,412.9,455.8],[1481,441.0,481.2],[1521,463.8,506.1],[1561,487.1,534.2],[1601,516.2,563.8],[1641,550.1,589.8],[1681,578.1,616.8],[1721,598.8,645.9],[1761,625.2,672.9],[1801,654.9,706.8],[1841,681.9,739.1],[1881,706.8,771.9],[1921,739.1,805.2],[1961,765.0,838.1],[2000,792.0,868.8]],"line":[[1,0.0],[41,3.2],[81,3.2],[121,5.8],[161,9.0],[201,10.1],[241,12.2],[281,13.8],[321,14.8],[361,22.2],[401,30.2],[441,37.1],[481,41.8],[521,47.1],[561,50.8],[601,58.8],[641,68.8],[681,78.9],[721,85.8],[761,97.9],[801,113.8],[841,130.8],[881,154.1],[921,169.9],[961,193.8],[1001,212.8],[1041,236.1],[1081,258.9],[1121,285.9],[1161,310.2],[1201,330.9],[1241,363.2],[1281,385.9],[1321,406.1],[1361,432.0],[1401,453.2],[1441,478.1],[1481,500.8],[1521,529.9],[1561,561.2],[1601,589.8],[1641,615.2],[1681,641.1],[1721,670.8],[1761,696.2],[1801,724.8],[1841,758.1],[1881,786.2],[1921,814.8],[1961,848.1],[2000,876.2]],"labels":[{"x":1350,"y":640,"text":"2018: 876","cls":"hi","anchor":"end","dx":-10},{"x":2000,"y":330,"text":"2026 \u00d73","cls":"ink","anchor":"end"},{"x":2000,"y":330,"text":"792\u2013869","anchor":"end","dy":15}]}</script>
</figure>

It also found two real bugs in my code. Fixing them barely changed the result.[^bugs]

## Where the 12 hours went

Mostly waiting, not learning.

<figure class="fig">
<p class="fig__k">One frame of the game in 2018: 29 ms</p>
<div class="tlist">
<div class="trow trow--wait"><span><b>Pause</b> so people could watch <small>change 1</small></span><i style="--w:1.000"></i><em>16 ms</em></div>
<div class="trow "><span><b>Image files</b> saved, then read back <small>changes 2, 3, 6, 7</small></span><i style="--w:0.708"></i><em>11 ms</em></div>
<div class="trow "><span><b>Other</b> small overheads <small>changes 4, 5, 8, 9</small></span><i style="--w:0.093"></i><em>1.5 ms</em></div>
<div class="trow trow--hi"><span><b>The game</b> itself</span><i style="--w:0.025"></i><em>0.4 ms</em></div>
</div>
</figure>

Claude cut those out one change at a time, almost every one checked by a test that replays recorded games and fails if a single pixel changes.[^improvements] Here are the nine, in order:

<figure class="fig ladder" data-widget="ladder" data-base="The 2018 engine|34 frames/s, with a 25 ms pause and image files on every frame">
<p class="fig__k">One game, sped up change by change. Tap a step.</p>
<svg viewBox="0 0 320 190" role="img" aria-label="Step chart: one game went from 34 to 2,590 frames per second in nine changes; the biggest was sending raw pixels instead of PNG files, 274 to 1,017."></svg>
<p data-out><b>Raw pixels instead of PNG files</b> <span>274 → 1,017 frames/s, <strong>×3.7</strong></span></p>
<script type="application/json">[{"name": "Removed a 25 ms pause per frame", "before": 34, "after": 75, "note": "Pause. It paced the game for people watching. My 2018 runs had it too."}, {"name": "Frames decoded in memory", "before": 75, "after": 136, "note": "Image files. Instead of written to disk and read back."}, {"name": "Engine sends the image it already made", "before": 136, "after": 200, "note": "Image files. Instead of saving it, reading it back and encoding it again."}, {"name": "Sprites scaled once", "before": 214, "after": 233, "note": "Other. Instead of on every draw."}, {"name": "One write per message", "before": 233, "after": 274, "note": "Other. Buffered output, sent in one go."}, {"name": "Raw pixels instead of PNG files", "before": 274, "after": 1017, "note": "Image files. No image encoded, written or read per frame. The biggest jump."}, {"name": "Raw bytes instead of text", "before": 1017, "after": 1738, "note": "Image files. The frame was sent as text inside JSON: 44% of the engine's time."}, {"name": "No sprite copies the agent never reads", "before": 2100, "after": 2400, "note": "Other. Only tree-search agents need them."}, {"name": "Drawn straight into one reused image", "before": 2400, "after": 2590, "note": "Other. Then the work moved to the training side."}]</script>
</figure>

Once the game stopped being the bottleneck, today's GPU did the rest: 11 minutes. Today's agents go further still, at 3 to 11 minutes a run.

## What that buys

This project trained 241 times, in 15 hours of training. At 2018 speed, that's about 280 days.

[^speed]: At 1,550 frames a second on an RTX 4090 with the PC to itself; with other work running, 23 to 34 minutes. All the numbers: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md).
[^methods]: [DQN](https://www.nature.com/articles/nature14236), [Double DQN](https://arxiv.org/abs/1509.06461) and [prioritised replay](https://arxiv.org/abs/1511.05952), on four [GVGAI](http://www.gvgai.net/) games. I also tried [dueling networks](https://arxiv.org/abs/1511.06581); they didn't help on Aliens.
[^runs]: The line is the run in my report's training log; the run behind the report's table ended lower, at about 760.
[^bugs]: Rewards credited one move late, and prioritised replay missing its correction weights. Fixed: 48.2 points vs 50.1. More in [LEARNINGS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/LEARNINGS.md).
[^improvements]: The benchmark was tightened partway, so the steps don't always line up exactly. All 30 changes, with before, after and a commit each: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/IMPROVEMENTS.md).
