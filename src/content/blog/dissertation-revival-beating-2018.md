---
title: "Beating My 2018 Agent, and Holding One Button"
shortTitle: "Beating My 2018 Agent"
description: "With the 2018 code running in minutes, Claude tried today's methods against it. Holding one button turned out to be the real bar."
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
<div class="vids">
<figure class="vid"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b>, 1M ticks of training</figcaption></figure>
<figure class="vid vid--hi"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-best.png"><source src="/blog/gvgai/aliens-dqn-best.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-best.mp4" type="video/mp4"></video><figcaption><b>Best 2026 DQN</b>, 5M ticks, rewarded for winning</figcaption></figure>
</div>
<figcaption>The same level and random seed for both.</figcaption>
</figure>

With five times the training my 2018 agent got, today's DQN wins **every** game of Aliens on every run, on levels it never trained on too. But the number that mattered most turned out to be **82%**: what you win by holding the shoot button and doing nothing else.

This is part 2 of 3. [Part 1](/blog/dissertation-revival-speed/) is how the 2018 code came back and got 29× faster; part 3 is what it's like doing research at this speed.

## Round 1: same budget as 2018

First the fair fight: every agent gets the 1 million game ticks my 2018 agent trained on, three runs each, 50 test games.[^results]

- **Modern DQN**, the 2015 method done properly: 57% wins. Lost to my 2018 agent.
- **Rainbow**, six improvements combined (2017): 66%.
- **A bigger network**, the IMPALA network (2018), more layers with shortcuts between them: up to 85%.
- **PPO**, a different family that learns the moves directly instead of their values: 82%.
- **My 2018 reward on today's DQN**: 85%.

<figure class="fig" data-widget="reveal">
<p class="fig__k">Aliens wins, 1M ticks of training</p>
<div class="chart">
<svg viewBox="0 0 640 262" role="img" aria-label="Aliens win rate at 2018's training budget: modern agents 57 to 85 percent, my 2018 agent 81 percent. Holding shoot wins 82 percent.">
<rect class="band reveal" x="190.0" y="4" width="323" height="228"/>
<text x="180" y="23" text-anchor="end" class="ink">Modern DQN</text>
<rect class="mk" x="190.0" y="13" width="225" height="12" rx="1"><title>Modern DQN: 57% wins, 39.5 points</title></rect>
<text x="421" y="23" class="ink">57%</text>
<text x="180" y="51" text-anchor="end" class="ink">DQN, bigger network</text>
<rect class="mk" x="190.0" y="41" width="288" height="12" rx="1"><title>DQN, bigger network: 73% wins, 52.7 points</title></rect>
<text x="484" y="51" class="ink">73%</text>
<text x="180" y="79" text-anchor="end" class="ink">DQN, 4× updates</text>
<rect class="mk" x="190.0" y="69" width="276" height="12" rx="1"><title>DQN, 4× updates: 70% wins, 53.0 points</title></rect>
<text x="472" y="79" class="ink">70%</text>
<text x="180" y="107" text-anchor="end" class="ink">Rainbow</text>
<rect class="mk" x="190.0" y="97" width="260" height="12" rx="1"><title>Rainbow: 66% wins, 43.2 points</title></rect>
<text x="456" y="107" class="ink">66%</text>
<text x="180" y="135" text-anchor="end" class="ink">Rainbow, bigger network</text>
<rect class="mk" x="190.0" y="125" width="335" height="12" rx="1"><title>Rainbow, bigger network: 85% wins, 54.7 points</title></rect>
<text x="531" y="135" class="ink">85%</text>
<text x="180" y="163" text-anchor="end" class="ink">PPO</text>
<rect class="mk" x="190.0" y="153" width="323" height="12" rx="1"><title>PPO: 82% wins, 37.6 points</title></rect>
<text x="519" y="163" class="ink">82%</text>
<text x="180" y="191" text-anchor="end" class="ink">DQN + 2018 reward</text>
<rect class="mk" x="190.0" y="181" width="335" height="12" rx="1"><title>DQN + 2018 reward: 85% wins, 39.4 points</title></rect>
<text x="531" y="191" class="ink">85%</text>
<text x="180" y="219" text-anchor="end" class="hi">My 2018 agent</text>
<rect class="hi" x="190.0" y="209" width="319" height="12" rx="1"><title>My 2018 agent: 81% wins, 50.1 points</title></rect>
<text x="515" y="219" class="ink">81%</text>
<line class="ref reveal" x1="513" x2="513" y1="2" y2="234"/>
<text class="reveal ink" x="513" y="250" text-anchor="middle">hold shoot: 82%</text>
<text x="190.0" y="250">0%</text><text class="hide-on-reveal" x="584.0" y="250" text-anchor="end">100%</text></svg>
</div>
<div class="ctl"><button type="button" aria-pressed="false">Add the button</button></div>
<figcaption>Each bar is the mean of 3 runs of 50 games (my 2018 agent: the 2018 code replayed 3 times). Runs vary a lot: modern DQN's three won 42% to 84%.</figcaption>
</figure>

## Then Claude checked the button

Before trusting any of it, Claude ran the dumbest policies it could think of: random moves, and every button held down for the whole game. Holding shoot wins 82% of Aliens games. On levels it has never seen, also 82%.

<figure class="fig">
<div class="vids">
<figure class="vid"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video><figcaption><b>Holding shoot</b>, no learning</figcaption></figure>
<figure class="vid vid--hi"><video muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video><figcaption><b>My 2018 agent</b></figcaption></figure>
</div>
<figcaption>Same level, same seed. The aliens drift down into a stream of shots.</figcaption>
</figure>

On two of the other games it's worse: the button wins every game. (Chase nobody wins.)

| Game | Button held all game | Wins |
|---|---|---:|
| Aliens | shoot | 82% |
| Deceptizelda | right | 100% |
| Wafer Thin Mints | any direction | 100% |
| Chase | any | 0% |

And PPO hadn't learned a strategy at all. One PPO run played exactly the same 50 test games as holding shoot, game for game.

So the bar for Aliens is 82%, not 0%. My 2018 agent's 81% wasn't evidence of anything on its own, and neither were half of the 2026 results above. I didn't check this in 2018.

## Did my 2018 agent learn anything?

Yes, and score is how you tell: 50 points a game against the button's 36. In the games it wins it averages 54 points, against 43 for today's DQN with my 2018 reward: it also shoots the protective bases in front of the aliens.

<figure class="fig" data-widget="qview" data-src="/blog/gvgai/aliens-2018-agent.json">
<div class="vids">
<figure class="vid vid--hi"><video muted playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
<div class="qbars" aria-live="off"></div>
<figcaption>What the network thinks of each move, every time it chooses one: the longest bar is the move it makes. PLACEHOLDER_QVIEW_NOTE</figcaption>
</figure>

## Round 2: rewarding the win

Then the reward. Mine, from 2018, gave −0.5 on every move of a game that ended in a loss. It lifted wins (DQN: 57% to 85%) but not score (39 points, close to the button). It mostly taught "don't lose", which on Aliens is close to holding shoot.

The textbook alternative is to reward only what you want: +1 for a win, −1 for a loss. At 2018's budget it didn't help: added to the score, wins fell to 45%. The reason is how slowly a single number at the end of a game reaches the moves that caused it:

<figure class="fig" data-widget="chain" data-moves="150">
<p class="fig__k">One lost game, 150 moves; the only reward is at the end</p>
<div class="chart"><svg viewBox="0 0 600 60" role="img" aria-label="A row of 150 moves; colour shows how much each move has learned that the game was lost"><text x="0" y="12">first move</text><text x="600" y="12" text-anchor="end">−1 at the end</text></svg></div>
<div class="ctl"><input type="range" min="0" max="1750" value="0" step="1" aria-label="Learning updates"><span>updates: <output>0</output></span><button type="button" aria-pressed="false">2018's penalty</button></div>
<p class="fig__k">Moves that have felt it: <span data-reached>none yet</span></p>
<figcaption>A toy, not the real agent: plain Q-learning updates on randomly replayed moves of one game. The end signal crawls back one move at a time. With 2018's penalty every move gets a signal at once, which helps a small budget and also blames good moves in lost games.</figcaption>
</figure>

With five times the practice, 5 million ticks or about 17 minutes a run, the slow signal arrives:

| Reward, 5M ticks | Score | Wins | Unseen levels |
|---|---:|---:|---:|
| Score only (the standard) | 58.6 | 89% | 69% |
| 2018's: outcome + per-move penalty | 48.2 | 91% | 23% |
| **Win/lose only** | 44.5 | **100%** | **100%** |
| **Win/lose + 0.1 × score** | **60.1** | 98% | 94% |
| Holding shoot, for reference | 36.3 | 82% | 82% |

Win/lose alone wins every game on all three runs, including on two levels it never trained on, where the button still gets 82%. Adding a tenth of the score as a tie-break keeps 98% and plays for points too. Reward what you want, and give it enough practice to find out what that means.

PLACEHOLDER_NETWORK

## The leaderboard

<figure class="fig">
<p class="fig__k">Aliens: score against wins</p>
<div class="chart">
<svg viewBox="0 0 640 330" role="img" aria-label="Aliens score against win rate per agent. Holding shoot: 36 points, 82 percent. My 2018 agent: 50 points, 81 percent. Best 2026: 60 to 62 points, 96 to 98 percent. MCTS: 78 points, 100 percent.">
<rect class="band" x="44" y="74" width="580" height="216"/>
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
<text x="620" y="90" text-anchor="end">below the button's 82%</text>
<circle class="mk" cx="114" cy="74" r="4.5" tabindex="0"><title>Hold shoot: 36.3 points, 82% wins, 1M ticks</title></circle>
<text x="108" y="88" text-anchor="end" class="ink">Hold shoot</text>
<circle class="mk" cx="85" cy="269" r="4.5" tabindex="0"><title>Random play: 33.7 points, 8% wins</title></circle>
<text x="93" y="273" text-anchor="start" class="ink">Random play</text>
<circle class="mk" cx="185" cy="27" r="4.5" tabindex="0"><title>Me, 2018: 42.6 points, 100% wins</title></circle>
<text x="185" y="17" text-anchor="middle" class="ink">Me, 2018</text>
<circle class="hi" cx="268" cy="77" r="6" tabindex="0"><title>My 2018 agent: 50.1 points, 81% wins, 1M ticks</title></circle>
<text x="276" y="93" text-anchor="start" class="hi">My 2018 agent</text>
<circle class="mk" cx="150" cy="140" r="4.5" tabindex="0"><title>Modern DQN: 39.5 points, 57% wins, 1M ticks</title></circle>
<text x="158" y="144" text-anchor="start" class="ink">Modern DQN</text>
<circle class="mk" cx="363" cy="56" r="4.5" tabindex="0"><title>DQN, 5M: 58.6 points, 89% wins, 5M ticks</title></circle>
<text x="355" y="60" text-anchor="end" class="ink">DQN, 5M</text>
<circle class="mk" cx="206" cy="27" r="4.5" tabindex="0"><title>Reward: win/lose only: 44.5 points, 100% wins, 5M ticks</title></circle>
<text x="206" y="17" text-anchor="middle" class="ink">win/lose only</text>
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
<figcaption>Tap or hover a dot for its numbers. The shaded band is below the button's 82%; the dashed line is its 36 points. 2026 agents are the mean of 3 runs; "me" is my own 2018 play.</figcaption>
</figure>

Two things still stand out. I won every game as a human but scored 43: winning was never the hard part of Aliens, scoring is. And a tree search (MCTS) that simulates moves ahead with no training at all still scores 78, well above every learning agent.

Part 3 is about how this got done in two days, and what's still unsolved.

[^results]: Every number is from [RESULTS.md](https://github.com/ColinCee/GVGAI-Dissertation/blob/revival-2026/2026-revival/RESULTS.md), except the button on unseen levels (50 games on Aliens levels 3 and 4: 36.5 points, 82%), run for this post.
