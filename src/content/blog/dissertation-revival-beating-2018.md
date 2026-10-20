---
title: "Beating My 2018 Agent"
subtitle: "Holding one button turned out to be the real bar."
stat: "82% → 100%"
figures:
  - label: "Hold shoot, no learning"
    value: "82%"
  - label: "My 2018 agent"
    value: "81%"
  - label: "Best 2026"
    value: "100%"
pubDate: "Oct 21 2026"
---
## Results

<figure class="fig">
<p class="fig__k">Same level, same random seed, half speed</p>
<div class="vids">
<figure class="vid"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>, 1M ticks of training: won, 57 points</figcaption></figure>
<figure class="vid vid--hi"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-best.png"><source src="/blog/gvgai/aliens-dqn-best.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-best.mp4" type="video/mp4"></video><figcaption><b>Recommended 2026 DQN</b>, 5M ticks, win/lose + score reward: won, 60 points</figcaption></figure>
</div>
</figure>

With five times the training my 2018 agent got, and rewarded only for winning, today's DQN wins **every** game of Aliens on every run, on levels it never trained on too. Add a little reward for points, as in the clip, and it wins 98% while outscoring my 2018 agent. But the number that mattered most turned out to be **82%**: what you win by holding the shoot button and doing nothing else.

This is part 2 of 3. [Part 1](/blog/dissertation-revival-speed/) is how the 2018 code came back and got 65× faster; [part 3](/blog/dissertation-revival-research-speed/) is what it's like doing research at this speed.

## How it learns

The network looks at the screen and scores each move: all the reward it expects from here to the end of the game. It plays the top score. It can't see the future, so it learns each score from the box after it, shaved by 1% a step (the discount, 0.99). The win at the end reaches back one decision at a time:

<figure class="fig" data-widget="flow" data-n="8" data-gamma="0.99">
<p class="fig__k">One won game, decision by decision. Each box is shaded by its score: how much of the win it expects.</p>
<div class="flow">
<p class="flow__lab">time →</p>
<div class="flow__row"><div class="flow__b" style="--v:0.000"><small>1</small><b>0</b></div><div class="flow__b" style="--v:0.000"><small>2</small><b>0</b></div><div class="flow__b" style="--v:0.000"><small>3</small><b>0</b></div><div class="flow__b" style="--v:0.000"><small>4</small><b>0</b></div><div class="flow__b" style="--v:0.000"><small>5</small><b>0</b></div><div class="flow__b" style="--v:0.980"><small>6</small><b>0.98</b></div><div class="flow__b" style="--v:0.990"><small>7</small><b>0.99</b></div><div class="flow__b" style="--v:1.000"><small>8</small><b>1</b></div><div class="flow__win"><b>+1</b><small>win</small></div></div>
<p class="flow__lab flow__lab--back">← each box learns 0.99 × the score of the box after it</p>
</div>
<div class="ctl"><input type="range" min="0" max="8" value="3" step="1" aria-label="Training passes over the game"><output>after 3 passes</output></div>
</figure>

Points scored along the way are rewards too; Round 2 is about when they mislead.

### Double DQN, my 2018 agent's main trick

Each box learns from the box after it. But a box's score is really one guess per move, and DQN takes the highest. Every guess is a little off, up or down, so the highest is usually one that came out too high:

<figure class="fig">
<p class="fig__k">How box 7 learns from box 8 (illustration)</p>
<div class="chart chart--narrow">
<svg viewBox="0 0 320 250" role="img" aria-label="Box 8 has one guess per move: left 0.92, shoot 1.05, right 0.90. Shoot is really worth 1.00. DQN uses the highest guess as it is, so box 7 learns 0.99 times 1.05, which is 1.04: too high. Double DQN picks shoot, then an older copy of the network guesses 1.01 for it, so box 7 learns 1.00, close to the true 0.99.">
<defs><marker id="dd-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:var(--faint)"/></marker><marker id="dd-head-hi" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:var(--accent)"/></marker></defs>
<text x="160" y="14" text-anchor="middle" class="ink">box 8: one guess per move</text>
<rect x="8" y="24" width="92" height="40" rx="4" style="fill:var(--pane);stroke:var(--line)"/><text x="54" y="40" text-anchor="middle">left</text><text x="54" y="56" text-anchor="middle" class="ink">0.92</text>
<rect x="114" y="24" width="92" height="40" rx="4" style="fill:var(--pane);stroke:var(--ink)"/><text x="160" y="40" text-anchor="middle">shoot</text><text x="160" y="56" text-anchor="middle" class="ink">1.05</text>
<rect x="220" y="24" width="92" height="40" rx="4" style="fill:var(--pane);stroke:var(--line)"/><text x="266" y="40" text-anchor="middle">right</text><text x="266" y="56" text-anchor="middle" class="ink">0.90</text>
<text x="168" y="84">really worth 1.00</text>
<path d="M160,64 V96 H80 V116" class="ax" style="stroke:var(--faint)" marker-end="url(#dd-head)"/>
<path d="M160,96 H240 V116" class="ax" style="stroke:var(--accent)" marker-end="url(#dd-head-hi)"/>
<rect x="4" y="120" width="152" height="104" rx="5" style="fill:var(--pane);stroke:var(--line)"/>
<text x="14" y="140" class="ink" style="font-weight:700">DQN</text>
<text x="14" y="156">uses 1.05 as it is</text>
<text x="14" y="198" class="ink">box 7: 1.04</text><text x="14" y="214">too high</text>
<rect x="164" y="120" width="152" height="104" rx="5" style="fill:var(--pane);stroke:var(--accent)"/>
<text x="174" y="140" class="hi">Double DQN</text>
<text x="174" y="156">picks shoot, then</text>
<text x="174" y="168">an older copy</text>
<text x="174" y="180">guesses 1.01</text>
<text x="174" y="198" class="ink">box 7: 1.00</text><text x="174" y="214">close</text>
<text x="160" y="244" text-anchor="middle">box 7 is truly worth 0.99</text>
</svg>
</div>
</figure>

Across the whole game:

<figure class="fig">
<p class="fig__k">The whole won game after plenty of practice (illustration). Hatched: well above the true score.</p>
<div class="flow">
<p class="flow__lab flow__lab--ink">DQN: each box inherits the next one's optimism and adds its own</p>
<div class="flow__row"><div class="flow__b flow__b--over" style="--v:0.978"><small>1</small><b>1.27</b></div><div class="flow__b flow__b--over" style="--v:0.949"><small>2</small><b>1.23</b></div><div class="flow__b flow__b--over" style="--v:0.920"><small>3</small><b>1.20</b></div><div class="flow__b flow__b--over" style="--v:0.890"><small>4</small><b>1.16</b></div><div class="flow__b flow__b--over" style="--v:0.861"><small>5</small><b>1.12</b></div><div class="flow__b flow__b--over" style="--v:0.830"><small>6</small><b>1.08</b></div><div class="flow__b flow__b--over" style="--v:0.800"><small>7</small><b>1.04</b></div><div class="flow__b" style="--v:0.769"><small>8</small><b>1.00</b></div><div class="flow__win"><b>+1</b><small>win</small></div></div>
<p class="flow__lab flow__lab--ink">Double DQN: small errors, up and down, that don't pile up</p>
<div class="flow__row"><div class="flow__b" style="--v:0.723"><small>1</small><b>0.94</b></div><div class="flow__b" style="--v:0.731"><small>2</small><b>0.95</b></div><div class="flow__b" style="--v:0.723"><small>3</small><b>0.94</b></div><div class="flow__b" style="--v:0.738"><small>4</small><b>0.96</b></div><div class="flow__b" style="--v:0.754"><small>5</small><b>0.98</b></div><div class="flow__b" style="--v:0.746"><small>6</small><b>0.97</b></div><div class="flow__b" style="--v:0.769"><small>7</small><b>1.00</b></div><div class="flow__b" style="--v:0.769"><small>8</small><b>1.00</b></div><div class="flow__win"><b>+1</b><small>win</small></div></div>
</div>
</figure>

My 2018 runs show it for real. Over the last 500 training games, Double DQN won 57% to DQN's 35%.[^ddqn]

<figure class="fig">
<p class="fig__k">My 2018 runs: what the network expected one moment to be worth, in points, over training</p>
<div class="chart chart--narrow">
<svg viewBox="-18 0 338 190" role="img" aria-label="Average score the network expected per moment over training, 2018. Plain DQN starts very high (off the chart) and comes down to about 10; Double DQN starts near 0 and rises to about 9.">
<text x="-8" y="89" text-anchor="middle" transform="rotate(-90 -8 89)">points expected</text>
<line class="ax" x1="30" x2="310" y1="164" y2="164"/><text x="25" y="168" text-anchor="end">0</text>
<line class="ax" x1="30" x2="310" y1="89" y2="89"/><text x="25" y="93" text-anchor="end">10</text>
<line class="ax" x1="30" x2="310" y1="14" y2="14"/><text x="25" y="18" text-anchor="end">20</text>
<polyline class="ln" points="30.0,14.0 32.8,14.0 35.6,14.0 38.4,14.0 41.2,14.0 44.0,14.0 46.8,14.0 49.6,14.0 52.4,14.0 55.2,36.6 58.0,40.8 60.8,39.0 63.6,37.8 66.4,50.1 69.2,57.9 72.0,56.1 74.8,48.6 77.6,51.3 80.5,62.1 83.3,61.0 86.1,59.9 88.9,60.3 91.7,54.7 94.5,50.1 97.3,51.8 100.1,42.7 102.9,38.7 105.7,45.3 108.5,50.4 111.3,53.6 114.1,59.3 116.9,60.0 119.7,57.6 122.5,50.8 125.3,51.3 128.1,61.8 130.9,61.1 133.7,52.1 136.5,57.1 139.3,60.4 142.1,63.9 144.9,53.1 147.7,52.1 150.5,59.4 153.3,59.8 156.1,66.1 158.9,60.4 161.7,61.4 164.5,58.6 167.3,64.8 170.1,56.2 172.9,54.9 175.7,56.0 178.5,63.9 181.4,69.2 184.2,68.3 187.0,69.1 189.8,68.4 192.6,69.7 195.4,71.5 198.2,72.9 201.0,68.3 203.8,73.0 206.6,72.2 209.4,69.9 212.2,70.7 215.0,68.2 217.8,67.7 220.6,74.2 223.4,76.1 226.2,79.4 229.0,79.7 231.8,81.2 234.6,78.9 237.4,76.5 240.2,75.4 243.0,78.7 245.8,74.6 248.6,75.1 251.4,76.4 254.2,75.7 257.0,80.0 259.8,87.3 262.6,91.4 265.4,85.3 268.2,82.0 271.0,81.4 273.8,81.1 276.6,83.1 279.4,87.5 282.3,87.3 285.1,84.8 287.9,86.8 290.7,87.7 293.5,84.4 296.3,78.4 299.1,81.5 301.9,86.7 304.7,91.3 307.5,87.5 310.0,86.6"/>
<polyline class="ln hi" points="30.0,168.2 32.8,167.7 35.6,165.8 38.4,163.9 41.2,162.6 44.0,161.4 46.8,160.1 49.6,159.1 52.4,158.3 55.2,157.6 58.0,157.1 60.8,156.9 63.6,156.7 66.4,155.8 69.2,154.8 72.0,153.1 74.8,152.3 77.6,151.9 80.5,150.8 83.3,149.2 86.1,147.9 88.9,146.7 91.7,146.2 94.5,144.8 97.3,142.8 100.1,141.1 102.9,139.7 105.7,138.4 108.5,137.5 111.3,135.9 114.1,134.7 116.9,133.0 119.7,132.6 122.5,132.0 125.3,132.1 128.1,131.4 130.9,131.3 133.7,131.0 136.5,130.3 139.3,129.8 142.1,129.0 144.9,127.6 147.7,126.7 150.5,125.6 153.3,124.9 156.1,124.1 158.9,122.2 161.7,120.2 164.5,118.5 167.3,117.7 170.1,117.9 172.9,118.0 175.7,118.6 178.5,118.1 181.4,119.1 184.2,118.6 187.0,118.0 189.8,114.9 192.6,114.8 195.4,115.5 198.2,115.5 201.0,113.5 203.8,112.4 206.6,110.5 209.4,110.9 212.2,112.3 215.0,111.6 217.8,111.9 220.6,110.2 223.4,108.7 226.2,107.8 229.0,107.5 231.8,108.1 234.6,106.3 237.4,106.2 240.2,104.9 243.0,105.0 245.8,104.9 248.6,103.8 251.4,102.0 254.2,102.0 257.0,102.4 259.8,103.2 262.6,100.7 265.4,99.3 268.2,98.3 271.0,98.8 273.8,100.2 276.6,101.4 279.4,99.6 282.3,98.0 285.1,100.1 287.9,101.0 290.7,99.9 293.5,97.8 296.3,96.8 299.1,97.6 301.9,98.6 304.7,96.8 307.5,95.2 310.0,96.1"/>
<text x="34" y="10" class="ink">↑ DQN starts off the chart, up to 900</text><text x="310" y="34" text-anchor="end" class="ink">DQN: talks itself down</text>
<text x="310" y="157" text-anchor="end" class="hi">Double DQN: rises as it learns</text>
<text x="30" y="184">start</text><text x="170" y="184" text-anchor="middle">training →</text><text x="310" y="184" text-anchor="end">end</text>
</svg>
</div>
</figure>

Its other trick was prioritised replay: practising the moments it guessed worst more often.[^per]

## Round 1: same budget as 2018

First the fair fight: every agent gets the 1 million game ticks my 2018 agent trained on, three runs each, 50 test games.[^results] In the race:

- **Modern DQN**: the 2015 method, done properly.
- **Rainbow** (2017): six improvements combined, both my tricks among them.
- **A bigger network** (IMPALA, 2018), for DQN and Rainbow: more layers, with shortcuts between them.
- **4× updates**: DQN learning four times as often.
- **PPO**: a different family that learns the moves directly instead of their scores.
- **My 2018 reward** on today's DQN.

<figure class="fig" data-widget="reveal">
<p class="fig__k">Aliens wins after 1M ticks of training, mean of 3 runs</p>
<div class="cmp-ref reveal-ref" style="--ref:0.82">
<div class="cmp"><span>Modern DQN</span><em class="track"><i style="--w:0.57" title="Modern DQN: 57% wins, 39.5 points"></i></em><b>57%</b></div>
<div class="cmp"><span>DQN, bigger network</span><em class="track"><i style="--w:0.73" title="DQN, bigger network: 73% wins, 52.7 points"></i></em><b>73%</b></div>
<div class="cmp"><span>DQN, 4× updates</span><em class="track"><i style="--w:0.70" title="DQN, 4× updates: 70% wins, 53.0 points"></i></em><b>70%</b></div>
<div class="cmp"><span>Rainbow</span><em class="track"><i style="--w:0.66" title="Rainbow: 66% wins, 43.2 points"></i></em><b>66%</b></div>
<div class="cmp"><span>Rainbow, bigger network</span><em class="track"><i style="--w:0.85" title="Rainbow, bigger network: 85% wins, 54.7 points"></i></em><b>85%</b></div>
<div class="cmp"><span>PPO</span><em class="track"><i style="--w:0.82" title="PPO: 82% wins, 37.6 points"></i></em><b>82%</b></div>
<div class="cmp"><span>DQN + 2018 reward</span><em class="track"><i style="--w:0.85" title="DQN + 2018 reward: 85% wins, 39.4 points"></i></em><b>85%</b></div>
<div class="cmp cmp--after"><span>My 2018 agent</span><em class="track"><i style="--w:0.81" title="My 2018 agent: 81% wins, 50.1 points"></i></em><b>81%</b></div>
</div>
<p class="fig__k reveal">Dashed line: holding shoot and nothing else, 82%</p>
<div class="ctl"><button type="button" aria-pressed="false">Add the button</button></div>
</figure>

Three of them beat my 2018 agent's 81%.[^runs3] Then Claude checked something I never had.

## Then Claude checked the button

The next morning Claude ran the dumbest policies it could think of against every game: random moves, and every button held down for the whole game. Holding shoot wins 82% of Aliens games. On levels it has never seen, also 82%.

<figure class="fig">
<p class="fig__k">Same level, same seed: the aliens drift down into a stream of shots</p>
<div class="vids">
<figure class="vid"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video><figcaption><b>Holding shoot</b>, no learning: won, 42 points</figcaption></figure>
<figure class="vid vid--hi"><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption></figure>
</div>
</figure>

On two of the other games it's worse: the button wins every game. (On Chase no learning agent wins at all.)

| Game | Button held all game | Wins |
|---|---|---:|
| Aliens | shoot | 82% |
| Deceptizelda | right | 100% |
| Wafer Thin Mints | any direction | 100% |
| Chase | any | 0% |

And PPO hadn't learned a strategy at all. One PPO run played exactly the same 50 test games as holding shoot, game for game.

So the bar for Aliens is 82%, not 0%. My 2018 agent's 81% wasn't evidence of anything on its own, and neither were half of the 2026 results above. I didn't check this in 2018.

## Did my 2018 agent learn anything?

Yes, and score is how you tell: 50 points a game against the button's 36. In the games it wins it averages 54 points, against 43 for today's DQN with my 2018 reward: it also shoots the protective bases in front of the aliens. Its attention shows it:

<figure class="fig">
<p class="fig__k">Where it looks: brighter means it matters more to its move. Mostly the bases, then the lowest aliens.</p>
<div class="vids">
<figure class="vid vid--hi"><video data-rate="1" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-saliency.png"><source src="/blog/gvgai/aliens-2018-saliency.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-saliency.mp4" type="video/mp4"></video></figure>
</div>
</figure>
## Round 2: rewarding the win

Then the reward. Mine, from 2018, gave +1 or −1 for the result, plus −0.5 on every move of a game that ended in a loss. It lifted wins (DQN: 57% to 85%) but not score (39 points, close to the button). It mostly taught "don't lose", which on Aliens is close to holding shoot.

The textbook alternative is to drop the penalty and reward only what you want: +1 for a win, −1 for a loss. At 2018's budget it didn't help: added to the score, wins fell to 45%. The reason is how slowly a single number at the end of a game reaches the moves that caused it. 2018's penalty got round that by signalling every move at once, which also blames good moves in games that were lost. Try both:

<figure class="fig" data-widget="chain" data-moves="150">
<p class="fig__k">The same row of boxes at real length: one lost game, 150 moves, a −1 at the end. Drag to practise (a toy, not the real agent).</p>
<div class="chart"><svg viewBox="0 0 600 60" role="img" aria-label="A row of 150 moves; colour shows how much each move has learned that the game was lost"><text x="0" y="12">first move</text><text x="600" y="12" text-anchor="end">−1 at the end</text></svg></div>
<div class="ctl"><input type="range" min="0" max="1750" value="0" step="1" aria-label="Learning updates"><span>updates: <output>0</output></span><button type="button" aria-pressed="false">2018's penalty</button></div>
<p class="fig__k">Moves that have felt it: <span data-reached>none yet</span></p>
</figure>

With five times the practice, 5 million ticks or about 17 minutes a run, the slow signal arrives:

| Reward, 5M ticks | Score | Wins | Unseen levels |
|---|---:|---:|---:|
| Score only (the standard) | 58.6 | 89% | 69% |
| 2018's: outcome + per-move penalty | 48.2 | 91% | 23% |
| **Win/lose only** | 44.5 | **100%** | **100%** |
| **Win/lose + 0.1 × score** | **60.1** | 98% | 94% |
| Holding shoot, for reference | 36.3 | 82% | 82% |

Win/lose alone wins every game on all three runs, including on two levels it never trained on, where the button still gets 82%. Adding a tenth of the score as a tie-break keeps 98% and plays for points too. Reward what you want. It just needs the practice.

The other thing that helped was the network, the part that turns the screen into a score for each move. The 2015 one shrinks the screen to 12 × 36 in one step. IMPALA keeps far more detail for longer, with shortcuts that let each stage skip ahead. It costs 2 to 3 times the time per tick, and gives the best Aliens score: 62.5 points, 96% wins.

<figure class="fig">
<p class="fig__k">One moment of Aliens inside each trained network; bright means more active. Tap a layer to face it.</p>
<p class="fig__k">2015 DQN network: 3 layers, 1.55M weights</p>
<div class="net"><figure class="slab" tabindex="0"><div class="deck" style="--dw:9rem;aspect-ratio:300/110"><img src="/blog/gvgai/net/2018-input-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-input-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-input-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-input-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>4 frames<small>55 × 150</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:6rem;aspect-ratio:144/48"><img src="/blog/gvgai/net/2018-conv1-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv1-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv1-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv1-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 1<small>32 maps, 12 × 36</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:5rem;aspect-ratio:153/45"><img src="/blog/gvgai/net/2018-conv2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 2<small>64, 5 × 17</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:4.4rem;aspect-ratio:240/48"><img src="/blog/gvgai/net/2018-conv3-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv3-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv3-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv3-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 3<small>64, 3 × 15</small></figcaption></figure><figure class="slab slab--out"><span>3 moves</span><figcaption>&nbsp;<small>via 512</small></figcaption></figure></div>
<p class="fig__k">IMPALA network: 15 layers in 3 stages, 2.3M weights</p>
<div class="net"><figure class="slab" tabindex="0"><div class="deck" style="--dw:9rem;aspect-ratio:300/110"><img src="/blog/gvgai/net/impala-input-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-input-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-input-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-input-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>4 frames<small>55 × 150</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:8rem;aspect-ratio:75/28"><img src="/blog/gvgai/net/impala-stage1-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage1-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage1-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage1-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 1<small>16, 28 × 75</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:6rem;aspect-ratio:114/42"><img src="/blog/gvgai/net/impala-stage2-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage2-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage2-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage2-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 2<small>32, 14 × 38</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:4.4rem;aspect-ratio:114/42"><img src="/blog/gvgai/net/impala-stage3-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage3-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage3-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage3-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 3<small>32, 7 × 19</small></figcaption></figure><figure class="slab slab--out"><span>3 moves</span><figcaption>&nbsp;<small>via 512</small></figcaption></figure></div>
</figure>

## The leaderboard

<figure class="fig">
<p class="fig__k">Aliens: score against wins. Tap a dot for its numbers.</p>
<div class="chart">
<svg viewBox="-18 0 658 330" role="img" aria-label="Aliens score against win rate per agent. Holding shoot: 36 points, 82 percent. My 2018 agent: 50 points, 81 percent. Best 2026: 60 to 62 points, 96 to 98 percent. MCTS: 78 points, 100 percent.">
<rect class="band" x="44" y="74" width="580" height="216"/>
<text x="-8" y="152" text-anchor="middle" transform="rotate(-90 -8 152)">games won</text>
<text x="38" y="294" text-anchor="end">0%</text>
<text x="38" y="228" text-anchor="end">25%</text>
<text x="38" y="163" text-anchor="end">50%</text>
<text x="38" y="97" text-anchor="end">75%</text>
<text x="38" y="31" text-anchor="end">100%</text>
<line class="ax" x1="44" x2="44" y1="14" y2="290"/><text x="44" y="308" text-anchor="middle">30</text>
<line class="ax" x1="156" x2="156" y1="14" y2="290"/><text x="156" y="308" text-anchor="middle">40</text>
<line class="ax" x1="267" x2="267" y1="14" y2="290"/><text x="267" y="308" text-anchor="middle">50</text>
<line class="ax" x1="379" x2="379" y1="14" y2="290"/><text x="379" y="308" text-anchor="middle">60</text>
<line class="ax" x1="490" x2="490" y1="14" y2="290"/><text x="490" y="308" text-anchor="middle">70</text>
<line class="ax" x1="602" x2="602" y1="14" y2="290"/><text x="602" y="308" text-anchor="middle">80</text>
<line class="ref" x1="114" x2="114" y1="14" y2="290"/>
<text x="334" y="326" text-anchor="middle">score per game →</text>
<text x="620" y="90" text-anchor="end">below the button's 82%</text><text x="118" y="240" text-anchor="start">← button: 36 points</text>
<circle class="mk" cx="114" cy="74" r="4.5" tabindex="0"><title>Hold shoot: 36.3 points, 82% wins</title></circle>
<text x="108" y="88" text-anchor="end" class="ink">Hold shoot</text>
<circle class="mk" cx="85" cy="269" r="4.5" tabindex="0"><title>Random play: 33.7 points, 8% wins</title></circle>
<text x="93" y="273" text-anchor="start" class="ink">Random play</text>
<circle class="mk" cx="185" cy="27" r="4.5" tabindex="0"><title>Me playing, 2018: 42.6 points, 100% wins</title></circle>
<text x="177" y="31" text-anchor="end" class="ink">Me playing</text>
<circle class="hi" cx="268" cy="77" r="6" tabindex="0"><title>My 2018 agent: 50.1 points, 81% wins, 1M ticks</title></circle>
<text x="276" y="93" text-anchor="start" class="hi">My 2018 agent</text>
<circle class="mk" cx="150" cy="140" r="4.5" tabindex="0"><title>Modern DQN: 39.5 points, 57% wins, 1M ticks</title></circle>
<text x="158" y="144" text-anchor="start" class="ink">Modern DQN</text>
<circle class="mk" cx="363" cy="56" r="4.5" tabindex="0"><title>DQN, 5M: 58.6 points, 89% wins, 5M ticks</title></circle>
<text x="355" y="60" text-anchor="end" class="ink">DQN, 5M</text>
<circle class="mk" cx="206" cy="27" r="4.5" tabindex="0"><title>Reward: win/lose only: 44.5 points, 100% wins, 5M ticks</title></circle>
<text x="214" y="42" text-anchor="start" class="ink">win/lose only</text>
<circle class="hi" cx="380" cy="32" r="6" tabindex="0"><title>Reward: win/lose + 0.1 × score: 60.1 points, 98% wins, 5M ticks</title></circle>
<text x="372" y="24" text-anchor="end" class="hi">win/lose + score</text>
<circle class="hi" cx="406" cy="38" r="6" tabindex="0"><title>DQN, bigger network: 62.5 points, 96% wins, 5M ticks</title></circle>
<text x="414" y="54" text-anchor="start" class="hi">bigger network</text>
<circle class="mk" cx="195" cy="43" r="4.5" tabindex="0"><title>PPO, win/lose only: 43.5 points, 94% wins, 5M ticks</title></circle>
<text x="187" y="47" text-anchor="end" class="ink">PPO, win/lose</text>
<circle class="mk" cx="577" cy="27" r="4.5" tabindex="0"><title>MCTS, no training: 77.8 points, 100% wins</title></circle>
<text x="569" y="19" text-anchor="end" class="ink">MCTS, no training</text>
</svg>
</div>
</figure>

Two things still stand out. I won every game I played in 2018 but scored 43: winning was never the hard part of Aliens, scoring is. And a tree search (MCTS) that simulates moves ahead with no training at all still scores 78, well above every learning agent.

[Part 3](/blog/dissertation-revival-research-speed/) is about how this got done in two days, and what's still unsolved.

[^results]: Every number is from [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md), except the button on unseen levels (50 games on Aliens levels 3 and 4: 36.5 points, 82%), run for this post.
[^ddqn]: From the training logs in [my dissertation](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf). My 2018 DQN had no older copy at all, so the gap is both changes together.
[^per]: In 2018 it scored more points but didn't win more (54% vs 57%); see [my dissertation](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2018-dissertation/report.pdf).
[^runs3]: My 2018 agent: the 2018 code replayed 3 times. Runs vary a lot: modern DQN's three won 42% to 84%.
