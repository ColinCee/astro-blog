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

I never checked that in 2018, and Claude didn't think to at first either. Overnight the second model it had checking its work noticed two different PPO runs got exactly the same scores, so Claude guessed they were just holding one button and checked. On two of the other three games I used, one button wins every single game.[^results]

## Did my 2018 agent learn anything?

Yes, and the score is how you can tell. It gets 50 points a game against the button's 36, because it also shoots the protective bases in front of the aliens instead of just waiting for them to drift into the shots.

## What actually beats the button?

<figure class="fig">
<p class="fig__k">Aliens games won, mean of 3 runs, 1M ticks of training unless marked 5M</p>
<div class="cmp"><span>DQN, win-only reward, 5M</span><em class="track"><i style="--w:1.000"></i></em><b>100%</b></div>
<div class="cmp"><span>DQN, bigger network, 5M</span><em class="track"><i style="--w:0.960"></i></em><b>96%</b></div>
<div class="cmp"><span>DQN, standard, 5M</span><em class="track"><i style="--w:0.890"></i></em><b>89%</b></div>
<div class="cmp"><span>Rainbow, bigger network</span><em class="track"><i style="--w:0.850"></i></em><b>85%</b></div>
<div class="cmp cmp--after"><span>Holding shoot</span><em class="track"><i style="--w:0.820"></i></em><b>82%</b></div>
<div class="cmp cmp--after"><span>My 2018 agent</span><em class="track"><i style="--w:0.810"></i></em><b>81%</b></div>
<div class="cmp"><span>Modern DQN</span><em class="track"><i style="--w:0.570"></i></em><b>57%</b></div>
</figure>

At my 2018 budget of 1 million ticks none of today's methods clearly beat the button, and runs vary a lot.[^runs] What got past it was rewarding only the win (+1 or −1 at the end of the game) and giving it five times the practice, about 17 minutes a run. That wins every game, even on levels it never trained on. A bigger network (IMPALA) helps too.

## Is winning even the right measure?

<figure class="fig">
<p class="fig__k">Aliens points a game</p>
<div class="cmp"><span>MCTS, no training</span><em class="track"><i style="--w:1.000"></i></em><b>77.8</b></div>
<div class="cmp"><span>DQN, bigger network, 5M</span><em class="track"><i style="--w:0.803"></i></em><b>62.5</b></div>
<div class="cmp cmp--after"><span>My 2018 agent</span><em class="track"><i style="--w:0.644"></i></em><b>50.1</b></div>
<div class="cmp"><span>Me playing, 2018</span><em class="track"><i style="--w:0.548"></i></em><b>42.6</b></div>
<div class="cmp cmp--after"><span>Holding shoot</span><em class="track"><i style="--w:0.467"></i></em><b>36.3</b></div>
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
