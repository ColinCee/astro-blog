---
title: "My 2018 Dissertation, 65× Faster"
shortTitle: "My Dissertation, 65× Faster"
description: "How the game-playing AI I wrote as a student learns, in a few pictures. Then why training it took 12 hours in 2018 and takes 11 minutes now."
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

First, what "learns" means here.

## A score for every move

The network looks at the screen and scores each move: how many points it expects if it plays it. Then it plays the top score. To get those scores right:

1. **It starts out playing at random**, on purpose, and trusts its own scores a little more each game.
2. **After each move it checks** what happened: the reward, plus its own score for the next moment.
3. **It nudges its guess** towards that.

A million frames of nudging later, the scores are worth playing by. That's DQN, DeepMind's 2015 method.[^methods]

<figure class="fig">
<p class="fig__k">The network, 1.5 million weights. Each block is drawn to its layer's shape; the square is the window the next layer slides across it.</p>
<div class="arch"><figure class="arch__l"><div class="cube" style="--w:5.4rem;--h:3.27rem;--d:0.70rem;--slices:4"><i style="background-image:url(/blog/gvgai/aliens-2018-stacks.png);background-size:400% 11100%;background-position:100% 49.0909%"></i><i></i><i></i><s style="--kw:0.053"></s></div><figcaption><b>screen</b><small>4 frames</small><small>55 × 150</small></figcaption></figure><span class="arch__to" aria-hidden="true">→<small>8×8<br>step 4</small></span><figure class="arch__l"><div class="cube" style="--w:3.60rem;--h:2.08rem;--d:1.98rem;--slices:8"><i></i><i></i><i></i><s style="--kw:0.111"></s></div><figcaption><b>layer 1</b><small>32 maps</small><small>12 × 36</small></figcaption></figure><span class="arch__to" aria-hidden="true">→<small>4×4<br>step 2</small></span><figure class="arch__l"><div class="cube" style="--w:2.47rem;--h:1.34rem;--d:2.80rem;--slices:16"><i></i><i></i><i></i><s style="--kw:0.176"></s></div><figcaption><b>layer 2</b><small>64 maps</small><small>5 × 17</small></figcaption></figure><span class="arch__to" aria-hidden="true">→<small>3×3<br>step 1</small></span><figure class="arch__l"><div class="cube" style="--w:2.32rem;--h:1.04rem;--d:2.80rem;--slices:16"><i></i><i></i><i></i></div><figcaption><b>layer 3</b><small>64 maps</small><small>3 × 15</small></figcaption></figure><span class="arch__to" aria-hidden="true">→<small>all</small></span><figure class="arch__l"><div class="cube" style="--w:0.50rem;--h:5.00rem;--d:0.50rem"><i></i><i></i><i></i></div><figcaption><b>512 units</b><small>sees it all</small></figcaption></figure><span class="arch__to" aria-hidden="true">→</span><figure class="arch__l"><div class="cube cube--hi" style="--w:0.50rem;--h:1.40rem;--d:0.50rem"><i></i><i></i><i></i></div><figcaption><b>3 scores</b><small>one per move</small><small>highest wins</small></figcaption></figure></div>
</figure>

My version added two newer tricks.

### Double DQN: don't trust the luckiest guess

Every score is a guess, and the best-looking guess is usually one the network overrated. That matters because the agent plays whatever it scores highest, and learns each score from the next one. Overrate a move and it plays it more, and the overrating leaks back into every moment before it. The scores stop meaning "what I'll actually get", so it can't tell a good move from a lucky one.

Double DQN gets a second opinion from an older copy of the network. My 2018 runs show the difference:[^ddqn]

<figure class="fig">
<p class="fig__k">What the network expected one moment to be worth, over training (2018)</p>
<div class="chart chart--narrow">
<svg viewBox="0 0 320 190" role="img" aria-label="Average score the network expected per moment over training, 2018. Plain DQN starts very high (off the chart) and comes down to about 10; Double DQN starts near 0 and rises to about 9.">
<line class="ax" x1="30" x2="310" y1="164" y2="164"/><text x="25" y="168" text-anchor="end">0</text>
<line class="ax" x1="30" x2="310" y1="89" y2="89"/><text x="25" y="93" text-anchor="end">10</text>
<line class="ax" x1="30" x2="310" y1="14" y2="14"/><text x="25" y="18" text-anchor="end">20</text>
<polyline class="ln" points="30.0,14.0 32.8,14.0 35.6,14.0 38.4,14.0 41.2,14.0 44.0,14.0 46.8,14.0 49.6,14.0 52.4,14.0 55.2,36.6 58.0,40.8 60.8,39.0 63.6,37.8 66.4,50.1 69.2,57.9 72.0,56.1 74.8,48.6 77.6,51.3 80.5,62.1 83.3,61.0 86.1,59.9 88.9,60.3 91.7,54.7 94.5,50.1 97.3,51.8 100.1,42.7 102.9,38.7 105.7,45.3 108.5,50.4 111.3,53.6 114.1,59.3 116.9,60.0 119.7,57.6 122.5,50.8 125.3,51.3 128.1,61.8 130.9,61.1 133.7,52.1 136.5,57.1 139.3,60.4 142.1,63.9 144.9,53.1 147.7,52.1 150.5,59.4 153.3,59.8 156.1,66.1 158.9,60.4 161.7,61.4 164.5,58.6 167.3,64.8 170.1,56.2 172.9,54.9 175.7,56.0 178.5,63.9 181.4,69.2 184.2,68.3 187.0,69.1 189.8,68.4 192.6,69.7 195.4,71.5 198.2,72.9 201.0,68.3 203.8,73.0 206.6,72.2 209.4,69.9 212.2,70.7 215.0,68.2 217.8,67.7 220.6,74.2 223.4,76.1 226.2,79.4 229.0,79.7 231.8,81.2 234.6,78.9 237.4,76.5 240.2,75.4 243.0,78.7 245.8,74.6 248.6,75.1 251.4,76.4 254.2,75.7 257.0,80.0 259.8,87.3 262.6,91.4 265.4,85.3 268.2,82.0 271.0,81.4 273.8,81.1 276.6,83.1 279.4,87.5 282.3,87.3 285.1,84.8 287.9,86.8 290.7,87.7 293.5,84.4 296.3,78.4 299.1,81.5 301.9,86.7 304.7,91.3 307.5,87.5 310.0,86.6"/>
<polyline class="ln hi" points="30.0,168.2 32.8,167.7 35.6,165.8 38.4,163.9 41.2,162.6 44.0,161.4 46.8,160.1 49.6,159.1 52.4,158.3 55.2,157.6 58.0,157.1 60.8,156.9 63.6,156.7 66.4,155.8 69.2,154.8 72.0,153.1 74.8,152.3 77.6,151.9 80.5,150.8 83.3,149.2 86.1,147.9 88.9,146.7 91.7,146.2 94.5,144.8 97.3,142.8 100.1,141.1 102.9,139.7 105.7,138.4 108.5,137.5 111.3,135.9 114.1,134.7 116.9,133.0 119.7,132.6 122.5,132.0 125.3,132.1 128.1,131.4 130.9,131.3 133.7,131.0 136.5,130.3 139.3,129.8 142.1,129.0 144.9,127.6 147.7,126.7 150.5,125.6 153.3,124.9 156.1,124.1 158.9,122.2 161.7,120.2 164.5,118.5 167.3,117.7 170.1,117.9 172.9,118.0 175.7,118.6 178.5,118.1 181.4,119.1 184.2,118.6 187.0,118.0 189.8,114.9 192.6,114.8 195.4,115.5 198.2,115.5 201.0,113.5 203.8,112.4 206.6,110.5 209.4,110.9 212.2,112.3 215.0,111.6 217.8,111.9 220.6,110.2 223.4,108.7 226.2,107.8 229.0,107.5 231.8,108.1 234.6,106.3 237.4,106.2 240.2,104.9 243.0,105.0 245.8,104.9 248.6,103.8 251.4,102.0 254.2,102.0 257.0,102.4 259.8,103.2 262.6,100.7 265.4,99.3 268.2,98.3 271.0,98.8 273.8,100.2 276.6,101.4 279.4,99.6 282.3,98.0 285.1,100.1 287.9,101.0 290.7,99.9 293.5,97.8 296.3,96.8 299.1,97.6 301.9,98.6 304.7,96.8 307.5,95.2 310.0,96.1"/>
<text x="310" y="22" text-anchor="end" class="ink">DQN: starts sky-high,</text><text x="310" y="34" text-anchor="end" class="ink">then talks itself down</text>
<text x="310" y="157" text-anchor="end" class="hi">Double DQN: rises as it learns</text>
<text x="30" y="184">start of training</text><text x="310" y="184" text-anchor="end">end</text>
</svg>
</div>
</figure>

<figure class="fig" data-grow>
<p class="fig__k">And the payoff: Aliens wins in the last 500 of 2,000 training games</p>
<div class="cmp"><span>DQN</span><i style="--w:0.35"></i><b>35%</b></div>
<div class="cmp cmp--after"><span>Double DQN</span><i style="--w:0.57"></i><b>57%</b></div>
</figure>

<details class="more">
<summary>Why a second opinion fixes it</summary>

<figure class="fig dice" data-widget="dice">
<p class="fig__k">Three moves, all truly worth 1 (dashed line). Each network guesses with random error; the outlined bar is the pick.</p>
<div class="dice__grid" data-grid></div>
<div class="dice__out">
<div><span>Same network picks and scores</span><b data-same>…</b></div>
<div class="is-hi"><span>Older copy scores the pick</span><b data-other>…</b></div>
</div>
<div class="ctl"><button type="button" data-roll="1">New guesses</button><button type="button" data-roll="200">200 more</button><output data-avg></output></div>
</figure>

</details>

### Prioritised replay: practise the mistakes

The agent keeps its last 100,000 moments and practises on random ones. Prioritised replay picks the ones it got most wrong more often.[^per]

<figure class="fig">
<p class="fig__k">How often each stored moment gets practised (illustration). Tomato: the ones it guessed worst.</p>
<div class="chart chart--narrow">
<svg viewBox="0 0 320 84" role="img" aria-label="Thirty-six stored moments as bars. Most are short and alike; four are tall, drawn in the accent: the moments the network guessed worst, picked far more often.">
<line class="ax" x1="4" x2="316" y1="64" y2="64"/>
<rect class="bar" x="4" y="54" width="6" height="10"/><rect class="bar" x="12.8" y="56" width="6" height="8"/><rect class="bar" x="21.6" y="52" width="6" height="12"/><rect class="bar" x="30.4" y="57" width="6" height="7"/><rect class="bar" x="39.2" y="55" width="6" height="9"/><rect class="bar" x="48" y="50" width="6" height="14"/><rect class="bar" x="56.8" y="56" width="6" height="8"/><rect class="bar hi" x="65.6" y="16" width="6" height="48"/><rect class="bar" x="74.4" y="53" width="6" height="11"/><rect class="bar" x="83.2" y="57" width="6" height="7"/><rect class="bar" x="92" y="55" width="6" height="9"/><rect class="bar" x="100.8" y="51" width="6" height="13"/><rect class="bar" x="109.6" y="56" width="6" height="8"/><rect class="bar" x="118.4" y="54" width="6" height="10"/><rect class="bar" x="127.2" y="58" width="6" height="6"/><rect class="bar hi" x="136" y="24" width="6" height="40"/><rect class="bar" x="144.8" y="55" width="6" height="9"/><rect class="bar" x="153.6" y="52" width="6" height="12"/><rect class="bar" x="162.4" y="56" width="6" height="8"/><rect class="bar" x="171.2" y="54" width="6" height="10"/><rect class="bar" x="180" y="57" width="6" height="7"/><rect class="bar" x="188.8" y="50" width="6" height="14"/><rect class="bar" x="197.6" y="55" width="6" height="9"/><rect class="bar" x="206.4" y="56" width="6" height="8"/><rect class="bar hi" x="215.2" y="8" width="6" height="56"/><rect class="bar" x="224" y="53" width="6" height="11"/><rect class="bar" x="232.8" y="57" width="6" height="7"/><rect class="bar" x="241.6" y="54" width="6" height="10"/><rect class="bar" x="250.4" y="52" width="6" height="12"/><rect class="bar" x="259.2" y="56" width="6" height="8"/><rect class="bar" x="268" y="55" width="6" height="9"/><rect class="bar hi" x="276.8" y="30" width="6" height="34"/><rect class="bar" x="285.6" y="57" width="6" height="7"/><rect class="bar" x="294.4" y="53" width="6" height="11"/><rect class="bar" x="303.2" y="55" width="6" height="9"/><rect class="bar" x="312" y="56" width="4" height="8"/>
<text x="4" y="80">oldest</text><text x="160" y="80" text-anchor="middle">stored moments →</text><text x="316" y="80" text-anchor="end">newest</text>
</svg>
</div>
</figure>

## 2018: one idea a night

<figure class="fig" data-grow>
<p class="fig__k">One training run, to scale: 65 of today's fit in one of 2018's</p>
<div class="runs"><span>2018</span><div><i style="flex-basis:100%"></i></div><b>12 h</b></div>
<div class="runs runs--hi"><span>2026</span><div><i style="flex-basis:1.53%"></i></div><b>11 min</b></div>
<div class="runs runs--axis"><span></span><div><em>0</em><em>3 h</em><em>6 h</em><em>9 h</em><em>12 h</em></div><b></b></div>
</figure>

There was nothing plug-and-play for this, so I wrote it all from the papers: about 700 lines of Python, on a GTX 980 with 4 GB of memory. Full-colour screens crashed it, which is why the agent sees grey at half size.[^report]

Here's what it pays attention to:[^saliency]

<figure class="fig">
<p class="fig__k">Where it looks: brighter means it matters more to its move. Mostly the bases, then the lowest aliens.</p>
<div class="vids">
<figure class="vid vid--hi"><video data-rate="1" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-saliency.png"><source src="/blog/gvgai/aliens-2018-saliency.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-saliency.mp4" type="video/mp4"></video></figure>
</div>
</figure>

My report said training "took approximately 12 hours. This is problematic when attempting to test different parameters". It was. I was a student trying things I'd never done before, most ideas were wrong, and each one cost a night.

## It still learns the same way

Claude rebuilt it on today's software with every setting kept, and trained it three times.[^runs]

<figure class="fig">
<p class="fig__k">Aliens, wins so far: my 2018 run against three 2026 runs</p>
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
<text x="194" y="74" text-anchor="end" class="hi">2018: 876</text>
<text x="242" y="118" text-anchor="start" class="ink">2026 ×3</text><text x="242" y="132" text-anchor="start">792–869</text>
<text x="173" y="218" text-anchor="middle">training games →</text>
</svg>
</div>
</figure>

It also found two real bugs in my code. Fixing them barely changed the result.[^bugs]

## Where the 12 hours went

Mostly waiting, not learning.[^frame]

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
<p class="fig__k">One game, frames per second (log scale). 0 is the 2018 engine; tap a step.</p>
<svg viewBox="0 0 320 170" role="img" aria-label="Step chart: one game went from 34 to 2,590 frames per second in nine changes; the biggest was sending raw pixels instead of PNG files, 274 to 1,017."></svg>
<p data-out><b>Raw pixels instead of PNG files</b> <span>274 → 1,017 frames/s, <strong>×3.7</strong></span></p>
<script type="application/json">[{"name": "Removed a 25 ms pause per frame", "before": 34, "after": 75, "note": "Pause. It paced the game for people watching. My 2018 runs had it too."}, {"name": "Frames decoded in memory", "before": 75, "after": 136, "note": "Image files. Instead of written to disk and read back."}, {"name": "Engine sends the image it already made", "before": 136, "after": 200, "note": "Image files. Instead of saving it, reading it back and encoding it again."}, {"name": "Sprites scaled once", "before": 214, "after": 233, "note": "Other. Instead of on every draw."}, {"name": "One write per message", "before": 233, "after": 274, "note": "Other. Buffered output, sent in one go."}, {"name": "Raw pixels instead of PNG files", "before": 274, "after": 1017, "note": "Image files. No image encoded, written or read per frame. The biggest jump."}, {"name": "Raw bytes instead of text", "before": 1017, "after": 1738, "note": "Image files. The frame was sent as text inside JSON: 44% of the engine's time."}, {"name": "No sprite copies the agent never reads", "before": 2100, "after": 2400, "note": "Other. Only tree-search agents need them."}, {"name": "Drawn straight into one reused image", "before": 2400, "after": 2590, "note": "Other. Then the work moved to the training side."}]</script>
</figure>

Once the game stopped being the bottleneck, today's GPU did the rest: 11 minutes. Today's agents go further still, at 3 to 11 minutes a run.

## What that buys

This project trained 241 times, in 15 hours of training. At 2018 speed, that's about 280 days.

- [Part 2](/blog/dissertation-revival-beating-2018/): what I did with them.
- [Part 3](/blog/dissertation-revival-research-speed/): what research is like at this speed.

[^speed]: At 1,550 frames a second on an RTX 4090 with the PC to itself; with other work running, 23 to 34 minutes. All the numbers: [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md).
[^methods]: DQN (2015), Double DQN (2015) and prioritised replay (2016), on four GVGAI games. I also tried dueling networks; they didn't help on Aliens, so the final agent leaves them out.
[^ddqn]: From my 2018 report's training logs; the curves are smoothed. My 2018 DQN had no older copy at all, so the gap is both changes together.
[^per]: It scored more points but didn't win more (54% vs 57%), until I changed the reward.
[^report]: Full colour would have needed 39.6 GB of memory; grey at half size, 3.3 GB (2018 report).
[^saliency]: Gradient × input, made with `tools/saliency.py` in the dissertation repo.
[^runs]: The line is the run in my report's training log. The report's table came from a second run that ended lower (about 760 wins); my two 2018 runs differed by 10 to 17 points.
[^bugs]: Rewards credited one move late, and prioritised replay missing its correction weights. Fixed: 48.2 points vs 50.1.
[^frame]: 34 frames a second is 29.4 ms a frame; each slice is what a change saved. Training in 2018 also spent another 14 ms per frame learning, one sample at a time.
[^improvements]: The benchmark was tightened partway, so the steps don't always line up exactly. All 30 changes, with before, after and a commit each: [IMPROVEMENTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/IMPROVEMENTS.md).
