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

Quick rundown of what's being compared, since they all differ in a few ways:

- **DQN** is the method DeepMind used on Atari in 2015. It looks at the screen and learns a score for each move, then plays the best one. My 2018 agent was DQN plus two tricks from later papers, Double DQN and prioritised replay.
- **Rainbow** is DQN with six of those later improvements combined, including both of my tricks.
- **Network** is the part that turns the screen into scores. The standard one is the 3-layer network from the 2015 paper, the bigger one is IMPALA, 15 layers.
- **Reward** is what it gets told is good. A points reward is the usual choice, a win reward is just +1 for a win and −1 for a loss, and my 2018 reward was that plus −0.5 on every move of a game it lost.
- **Training** is how many frames of the game it gets to practise on. 1M frames is what my 2018 agent got, 5M is five times that, about 17 minutes a run.

<figure class="fig">
<p class="fig__k">Aliens games won, average of 3 training runs each</p>
<div class="tlist">
<div class="trow"><span><b>DQN</b><small>standard network, win reward, 5M frames</small></span><i style="--w:1.000"></i><em>100%</em></div>
<div class="trow"><span><b>DQN</b><small>bigger network, points reward, 5M frames</small></span><i style="--w:0.960"></i><em>96%</em></div>
<div class="trow"><span><b>DQN</b><small>standard network, points reward, 5M frames</small></span><i style="--w:0.890"></i><em>89%</em></div>
<div class="trow"><span><b>Rainbow</b><small>bigger network, points reward, 1M frames</small></span><i style="--w:0.850"></i><em>85%</em></div>
<div class="trow trow--wait"><span><b>Holding shoot</b><small>no learning</small></span><i style="--w:0.820"></i><em>82%</em></div>
<div class="trow trow--hi"><span><b>My 2018 agent</b><small>standard network, my 2018 reward, 1M frames</small></span><i style="--w:0.810"></i><em>81%</em></div>
<div class="trow"><span><b>DQN</b><small>standard network, points reward, 1M frames</small></span><i style="--w:0.570"></i><em>57%</em></div>
</div>
</figure>

With the same 1M frames my 2018 agent got, none of them clearly beat the button, and runs vary a lot.[^runs] What got past it was the win reward and five times the practice. That wins every game, even on levels it never trained on. The bigger network helps too, mostly with the score.

## Is winning even the right measure?

<figure class="fig">
<p class="fig__k">Aliens points a game</p>
<div class="tlist">
<div class="trow"><span><b>MCTS</b><small>no learning, searches moves ahead</small></span><i style="--w:1.000"></i><em>77.8</em></div>
<div class="trow"><span><b>DQN</b><small>bigger network, points reward, 5M frames</small></span><i style="--w:0.803"></i><em>62.5</em></div>
<div class="trow trow--hi"><span><b>My 2018 agent</b><small>standard network, my 2018 reward, 1M frames</small></span><i style="--w:0.644"></i><em>50.1</em></div>
<div class="trow"><span><b>Me</b><small>playing it myself in 2018</small></span><i style="--w:0.548"></i><em>42.6</em></div>
<div class="trow trow--wait"><span><b>Holding shoot</b><small>no learning</small></span><i style="--w:0.467"></i><em>36.3</em></div>
</div>
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
