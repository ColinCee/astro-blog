---
title: "One button beat my dissertation AI"
subtitle: "My 2018 agent won 81% of games. Holding shoot wins 82%."
stat: "81% vs 82%"
statLabel: "my agent vs one button"
figures:
  - label: "My 2018 agent"
    value: "81%"
  - label: "Holding shoot"
    value: "82%"
  - label: "Best 2026"
    value: "100%"
pubDate: "Oct 21 2026"
---
<figure class="fig">
<p class="fig__k">Same level and seed, half speed</p>
<div class="vids">
<figure class="vid"><figcaption><b>Holding shoot</b>, no learning: won, 42 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
</figure>

In [part 1](/blog/dissertation-revival-speed/) Claude got my 2018 code training 65× faster. With runs that cheap I wanted to see if today's methods could beat what I built as an undergrad. My agent won 81% of Aliens games, which I was pretty happy with back then, until it turned out holding the shoot button and doing nothing else wins 82%.

I never checked that in 2018, and Claude didn't think to at first either. Overnight the second model it had checking its work noticed two runs of one of its new agents (PPO, a different kind of learner) got exactly the same scores, so Claude guessed they were just holding one button and checked. On two of the other three games I used, one button wins every single game.[^results]

## Did my 2018 agent learn anything?

Yes, and the score is how you can tell. It gets 50 points a game against the button's 36, because it also shoots the protective bases in front of the aliens instead of just waiting for them to drift into the shots.

## What actually beats the button?

Quick rundown of the terms in the tables:

- **DQN** is the method DeepMind used on Atari in 2015, it learns a score for each move from the screen and plays the best one. My 2018 agent was DQN plus two tricks from later papers, Double DQN and prioritised replay.
- **Rainbow** is DQN with six of those later improvements combined, including both of mine.
- **Network** is the part that turns the screen into scores. Standard is the 3-layer one from the 2015 paper, bigger is IMPALA with 15 layers.
- **Reward** is what it's told is good. Points is the score, win is just +1 for a win and −1 for a loss, and 2018 is my reward, that plus −0.5 on every move of a lost game.
- **Frames** is how many frames of the game it practised on. 1M is what my 2018 agent got, 5M is five times that, about 17 minutes a run.

Each table changes one thing and keeps the rest the same, first with the 1M frames my 2018 agent got, then with five times that.

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

With 1M frames none of them clearly beat the button, and runs vary a lot.[^runs] With 5M they all get past it, and the bigger network helps DQN the most.

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

My 2018 reward was the best at 1M frames, which is why it helped back then, but it mostly taught "don't lose". With 5M frames the plain win reward wins every game, even on levels it never trained on. I didn't run the win-only rewards at 1M.

## Is winning even the right measure?

<figure class="fig">
<p class="fig__k">Aliens, points scored a game</p>
<table class="ctab"><thead><tr><th>Who</th><th class="ctab__v">Points a game</th></tr></thead><tbody>
<tr><td>MCTS, no learning</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:1.000"></i><b>77.8</b></span></td></tr>
<tr><td>Best DQN, bigger network, 5M</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.803"></i><b>62.5</b></span></td></tr>
<tr class="ctab--hi"><td>My 2018 agent</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.644"></i><b>50.1</b></span></td></tr>
<tr><td>Me, playing in 2018</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.548"></i><b>42.6</b></span></td></tr>
<tr class="ctab--none"><td>Hold shoot</td><td class="ctab__v"><span class="ctab__bar"><i style="--w:0.467"></i><b>36.3</b></span></td></tr>
</tbody></table>
</figure>

Not really. I won every game I played back in 2018 but only scored 43, so the hard part of Aliens is the score. The best learning agent now gets 62.5, and a tree search (MCTS) that just simulates moves ahead with no training at all gets 78.

## What did I learn?

- **Check the dumbest baseline first.** Holding one button doesn't need any training and I never tried it.
- **Run everything more than once.** My two 2018 runs of the same agent were 10 to 17 points apart.
- **Claude wrote all of the code, but it liked to stop early.** I pushed back six times in about 2½ hours.[^log]
- **I was the least informed person on my own dissertation.** About a third of my messages were me learning things like PPO and IMPALA.
- **There's still stuff to check.** The agents see 4 stacked frames and hold each move for 4, so I suspect some positions just can't be reached. MCTS picks a move every frame, which might be part of why it scores so much more.

[^results]: Deceptizelda (hold right) and Wafer Thin Mints (any direction). All numbers from [the results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md).
[^runs]: Modern DQN's three runs won 42% to 84%. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^log]: From my Claude Code session log, 18 and 19 October 2026.
