---
title: "One button beat my dissertation AI"
subtitle: "My 2018 agent won 81% of games. Holding shoot wins 82%."
stat: "81% → 99.7%"
statLabel: "games won, 2018 vs 2026"
figures:
  - label: "My 2018 agent"
    value: "81%"
  - label: "Holding shoot"
    value: "82%"
  - label: "Best 2026"
    value: "99.7%"
pubDate: "Oct 21 2026"
---
<figure class="fig">
<p class="fig__k">Same level and seed, half speed</p>
<div class="vids">
<figure class="vid"><figcaption><b>Holding shoot</b>, no learning: won, 42 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
</figure>

In [part 1](/blog/dissertation-revival-speed/) Claude got my 2018 code training 65× faster. With runs that cheap, I wanted to see if today's methods could beat what I built as an undergrad.

My agent won 81% of Aliens games, and I was pretty happy with that back then. Then we found that holding the shoot button, and nothing else, wins 82%.

I never checked that in 2018. To be honest, Claude didn't think to at first either. Overnight, the second model it had checking its work spotted something odd. Two runs of a new agent called PPO got exactly the same scores. Claude guessed they were just holding one button, so it checked. On two of my other three games, one button wins every single game.[^results]

## Did my 2018 agent learn anything then?

I think so, and the score is how you can tell. It gets 50 points a game against the button's 36. It also shoots the bases in front of the aliens, instead of waiting for the aliens to drift into its shots.

## What beats the button?

Quick rundown of the terms in the tables:

- **DQN** is the method DeepMind used on Atari in 2015. It learns a score for each move from the screen, then plays the best one. My 2018 agent was DQN plus two tricks from later papers.
- **Rainbow** is DQN with six of those later tricks combined, including both of mine.
- **Network** is the part that turns the screen into scores. Standard is the 3-layer one from 2015. Bigger is IMPALA, with 15 layers.
- **Reward** is what it's told is good. Points is the game score. Win is +1 for a win and −1 for a loss. 2018 is my reward, which is the win reward plus −0.5 on every move of a lost game.
- **Frames** is how much of the game it practised on. 1M is what my 2018 agent got, and 5M is five times that.

Each table changes one thing and keeps the rest the same.

<figure class="fig">
<p class="fig__k">Which method? Games won, all rewarded for points, average of 3 runs</p>
<table class="ctab"><thead><tr><th>Agent</th><th>Network</th><th class="ctab__v">1M → 5M</th></tr></thead><tbody>
<tr><td>DQN</td><td>bigger</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.730"></i><i class="ctab__more" style="--w:0.230"></i><b>73% → 96%</b></span></td></tr>
<tr><td>Rainbow</td><td>standard</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.660"></i><i class="ctab__more" style="--w:0.270"></i><b>66% → 93%</b></span></td></tr>
<tr><td>Rainbow</td><td>bigger</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.850"></i><i class="ctab__more" style="--w:0.080"></i><b>85% → 93%</b></span></td></tr>
<tr><td>DQN</td><td>standard</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.570"></i><i class="ctab__more" style="--w:0.320"></i><b>57% → 89%</b></span></td></tr>
<tr class="ctab--none"><td>Hold shoot</td><td>–</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.820"></i><b>82% → 82%</b></span></td></tr>
<tr class="ctab--hi"><td>My 2018 agent</td><td>standard</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.810"></i><b>81% → –</b></span></td></tr>
</tbody></table>
</figure>

With 1M frames, none of them clearly beat the button, and the runs vary a lot.[^runs] With 5M frames, they all get past it.

<figure class="fig">
<p class="fig__k">Which reward? Games won, all DQN with the standard network, average of 3 runs</p>
<table class="ctab"><thead><tr><th>Reward</th><th class="ctab__v">1M → 5M</th></tr></thead><tbody>
<tr><td>win</td><td class="ctab__v"><span class="ctab__bar"><i class="ctab__more" style="--w:1.000"></i><b>– → 100%</b></span></td></tr>
<tr><td>win + points/10</td><td class="ctab__v"><span class="ctab__bar"><i class="ctab__more" style="--w:0.980"></i><b>– → 98%</b></span></td></tr>
<tr><td>points + win</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.450"></i><i class="ctab__more" style="--w:0.470"></i><b>45% → 92%</b></span></td></tr>
<tr class="ctab--hi"><td>2018 (mine)</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.850"></i><i class="ctab__more" style="--w:0.060"></i><b>85% → 91%</b></span></td></tr>
<tr><td>points</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.570"></i><i class="ctab__more" style="--w:0.320"></i><b>57% → 89%</b></span></td></tr>
<tr class="ctab--none"><td>hold shoot</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.820"></i><b>82% → 82%</b></span></td></tr>
</tbody></table>
</figure>

My 2018 reward was the best at 1M frames, so I guess it did its job back then. But it mostly taught the agent not to lose. With 5M frames, the plain win reward wins every game, even on levels it never trained on. I didn't run the win-only rewards at 1M.

## So what made the biggest difference?

It was something I never thought about in 2018. The agent holds each move for 4 frames, which is DeepMind's Atari setup. I suspected that makes some shots and positions impossible to reach. A tree search called MCTS picks a move every frame, and it scored 78 with no training at all. So Claude tried moving every frame, and every 2 frames.

<figure class="fig">
<p class="fig__k">Points a game, win + points reward, 5M frames, average of 3 runs</p>
<table class="ctab"><thead><tr><th>Agent</th><th>Network</th><th>Moves every</th><th class="ctab__v">Points</th></tr></thead><tbody>
<tr><td>DQN</td><td>bigger</td><td>2 frames</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:1.000"></i><b>82.6</b></span></td></tr>
<tr><td>DQN</td><td>standard</td><td>1 frame</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.953"></i><b>78.7</b></span></td></tr>
<tr class="ctab--none"><td>MCTS</td><td>–</td><td>1 frame</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.942"></i><b>77.8</b></span></td></tr>
<tr><td>DQN</td><td>standard</td><td>2 frames</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.925"></i><b>76.4</b></span></td></tr>
<tr><td>DQN</td><td>bigger</td><td>4 frames</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.762"></i><b>62.9</b></span></td></tr>
<tr><td>DQN</td><td>standard</td><td>4 frames</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.714"></i><b>59.0</b></span></td></tr>
<tr class="ctab--hi"><td>My 2018 agent</td><td>standard</td><td>4 frames</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.607"></i><b>50.1</b></span></td></tr>
<tr><td>Me, 2018</td><td>–</td><td>–</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.516"></i><b>42.6</b></span></td></tr>
</tbody></table>
</figure>

Moving every frame took it from 59 points to 79, about the same as MCTS. Moving every 2 frames with the bigger network got 83, and it won 299 of 300 games.[^moves] For reference, I won every game I played in 2018 but only scored 43. It does take longer to train, about 53 minutes a run instead of 14.

## Why does it still lose 1 game in 300?

I replayed the lost games. As far as I can tell, every loss is the same thing: a bomb lands on the ship while it sits still and shoots.

I think the reward is to blame. Each point is worth +0.1, and a game has about 40 kills, so that's roughly +4 in points. A death only costs −1, so a risk for more points is nearly free. The more weight the reward puts on points, the more it dies. With the standard setup, that's 0 deaths in 300 games at 0.05 per point, 4 at 0.1 and 7 at 0.2.

The fix should be a loss that costs more than the points can earn, like ±10 for the result. That's a follow-up for another day.

## What did I learn?

- **Check the dumbest baseline first.** Holding one button doesn't need any training, and I never tried it.
- **Run everything more than once.** My two 2018 runs of the same agent were 10 to 17 points apart.
- **Question the settings you copied.** Holding each move for 4 frames came from Atari, and here it cost about 20 points.
- **Claude wrote all of the code, but it liked to stop early.** I pushed back six times in about 2½ hours.[^log]
- **I was the least informed person on my own dissertation.** About a third of my messages were me learning things like PPO and IMPALA.

[^results]: Deceptizelda (hold right) and Wafer Thin Mints (any direction). All numbers from [the results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md).
[^runs]: Modern DQN's three runs won 42% to 84%. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^moves]: 3 runs of 100 test games each, 1 loss in 300 games on the training levels for each of the two best setups. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^log]: From my Claude Code session log, 18 and 19 October 2026.
