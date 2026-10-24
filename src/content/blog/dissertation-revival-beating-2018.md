---
title: "Beating my 2018 dissertation AI"
subtitle: "From 81% of games won to 99.7%, and from 50 points a game to 83."
stat: "81% → 99.7%"
statLabel: "games won, 2018 vs 2026"
figures:
  - label: "My 2018 agent"
    value: "81%, 50 pts"
  - label: "Best 2026 agent"
    value: "99.7%, 83 pts"
pubDate: "Oct 21 2026"
---
<figure class="fig">
<p class="fig__k">Same level and seed, half speed</p>
<div class="vids">
<figure class="vid"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png" aria-label="My 2018 agent playing Aliens, winning with 57 points"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>Best 2026 agent</b>: won, 85 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-2026-best.png" aria-label="The best 2026 agent playing the same game, winning with 85 points"><source src="/blog/gvgai/aliens-dqn-2026-best.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-2026-best.mp4" type="video/mp4"></video></figure>
</div>
</figure>

In [part 1](/blog/dissertation-revival-speed/) Claude got my 2018 code training 65× faster. With runs that cheap, I wanted to see if today's methods could beat what I built as an undergrad.

My 2018 agent wins 81% of Aliens games and scores 50 points a game. The best agent we got to wins 299 games out of 300 and scores 83. It even beats a tree search that plans every move, and no learning agent came close to that before. All the code and results are in [my dissertation repo](https://github.com/ColinCee/GVGAI-Dissertation).

## How did we beat it?

<figure class="fig">
<p class="fig__k">How we beat my 2018 agent: each step adds one change. Average of 3 runs, the line is their spread</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r pts__r--base"><span class="pts__k"><b>My 2018 agent</b><small>1M frames, my 2018 reward</small></span><span class="pts__t" style="--a:0.813;--b:0.813;--lo:0.660;--hi:0.920"><i></i><s></s></span><em>81%</em><em class="pts__w">50.1</em></div>
<div class="pts__r"><span class="pts__k"><b>Today's DQN</b><small>same 1M frames, points reward</small></span><span class="pts__t" style="--a:0.567;--b:0.567;--lo:0.420;--hi:0.840"><i></i><s></s></span><em>57%<small class="pts__minus">−25</small></em><em class="pts__w">39.5<small class="pts__minus">−11</small></em></div>
<div class="pts__r"><span class="pts__k"><b>+ more practice</b><small>5M frames</small></span><span class="pts__t" style="--a:0.567;--b:0.887;--lo:0.840;--hi:0.940"><i></i><i class="pts__more"></i><s></s></span><em>89%<small>+32</small></em><em class="pts__w">58.6<small>+19</small></em></div>
<div class="pts__r"><span class="pts__k"><b>+ win + points reward</b><small>reward</small></span><span class="pts__t" style="--a:0.887;--b:0.987;--lo:0.980;--hi:1.000"><i></i><i class="pts__more"></i><s></s></span><em>98.7%<small>+10</small></em><em class="pts__w">59.0<small class="pts__same">±0</small></em></div>
<div class="pts__r"><span class="pts__k"><b>+ bigger network</b><small>network</small></span><span class="pts__t" style="--a:0.987;--b:1.000;--lo:1.000;--hi:1.000"><i></i><i class="pts__more"></i><s></s></span><em>100%<small>+1</small></em><em class="pts__w">62.9<small>+4</small></em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>+ a move every 2 frames</b><small>how often it moves</small></span><span class="pts__t" style="--a:0.997;--b:0.997;--lo:0.990;--hi:1.000"><i></i><s></s></span><em>99.7%<small class="pts__same">±0</small></em><em class="pts__w">82.6<small>+20</small></em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

Winning comes first, and points only break ties between agents that win. As far as I know, that's how the GVGAI competition ranks them too. So the bars are games won, and points sit next to them.

More practice did most of the work on wins, and the new reward took it to almost every game. After that, moving more often didn't change wins, but it added 20 points. Each chart below changes one thing at a time and keeps the rest the same. Grey is where the step before got to, and orange is what a change added. The dashed line is the same in every chart: what you win by just holding the shoot button.

## Which method?

My 2018 agent is [DQN](https://www.nature.com/articles/nature14236), the method DeepMind used on Atari in 2015. It learns a score for each move from the screen, then plays the best one. I added two tricks from later papers. [Rainbow](https://arxiv.org/abs/1710.02298) is DQN with six of those tricks combined.[^rainbow] [PPO](https://arxiv.org/abs/1707.06347) is a different kind of learner that picks moves directly.

<figure class="fig">
<p class="fig__k">Which method? All 1M frames, points reward</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r"><span class="pts__k"><b>PPO</b><small>a different kind of learner</small></span><span class="pts__t" style="--a:0.820;--b:0.820;--lo:0.780;--hi:0.860"><i></i><s></s></span><em>82%</em><em class="pts__w">37.6</em></div>
<div class="pts__r pts__r--base"><span class="pts__k"><b>My 2018 agent</b><small>DQN + 2 tricks, my 2018 reward</small></span><span class="pts__t" style="--a:0.813;--b:0.813;--lo:0.660;--hi:0.920"><i></i><s></s></span><em>81%</em><em class="pts__w">50.1</em></div>
<div class="pts__r"><span class="pts__k"><b>Rainbow</b><small>DQN + 6 tricks</small></span><span class="pts__t" style="--a:0.660;--b:0.660;--lo:0.620;--hi:0.720"><i></i><s></s></span><em>66%</em><em class="pts__w">43.2</em></div>
<div class="pts__r"><span class="pts__k"><b>DQN</b><small>today's version</small></span><span class="pts__t" style="--a:0.567;--b:0.567;--lo:0.420;--hi:0.840"><i></i><s></s></span><em>57%</em><em class="pts__w">39.5</em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

With the same 1M frames of practice my agent got, none of them clearly beat it, and the runs vary a lot.[^runs] PPO wins about as often as my agent while scoring the least, which looked odd.

## Was 81% even good?

Not really. Holding the shoot button, and nothing else, wins 82% of Aliens games. That's exactly what PPO had learned.

<figure class="fig">
<p class="fig__k">Same level and seed, half speed: holding shoot against my 2018 agent</p>
<div class="vids">
<figure class="vid"><figcaption><b>Holding shoot</b>, no learning: won, 42 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
</figure>

I never checked that in 2018. To be honest, Claude didn't think to at first either. Overnight, the second model it had checking its work spotted two PPO runs with exactly the same scores. Claude guessed they were just holding one button, so it checked.[^results]

My agent did learn something though. It gets 50 points a game against the button's 36, because it also shoots the bases in front of the aliens. So the button is the bar to beat on wins, and points show who actually learned to play.

## How much does practice help?

<figure class="fig">
<p class="fig__k">How much practice? 1M frames, then 5M. Points reward</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r"><span class="pts__k"><b>Rainbow</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.660;--b:0.927;--lo:0.900;--hi:0.980"><i></i><i class="pts__more"></i><s></s></span><em>93%<small>+27</small></em><em class="pts__w">57.0<small>+14</small></em></div>
<div class="pts__r"><span class="pts__k"><b>DQN</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.567;--b:0.887;--lo:0.840;--hi:0.940"><i></i><i class="pts__more"></i><s></s></span><em>89%<small>+32</small></em><em class="pts__w">58.6<small>+19</small></em></div>
<div class="pts__r"><span class="pts__k"><b>PPO</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.827;--b:0.827;--lo:0.760;--hi:0.920"><i></i><s></s></span><em>83%<small class="pts__same">±0</small></em><em class="pts__w">45.9<small>+8</small></em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

A lot. With 5M frames, DQN and Rainbow both win more often than my agent, and score more too. That's about 17 minutes a run now, which would've been 2 or 3 days in 2018.

## Which reward works best?

The reward is what the agent gets told is good. Points is just the game score. Win is +1 for a win and −1 for a loss. My 2018 reward was the win reward plus −0.5 on every move of a lost game.

<figure class="fig">
<p class="fig__k">Which reward? All DQN, 5M frames</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 20</b></span><span class="pts__t" style="--a:1.000;--b:1.000;--lo:1.000;--hi:1.000"><i></i><s></s></span><em>100%</em><em class="pts__w">56.5</em></div>
<div class="pts__r"><span class="pts__k"><b>win</b></span><span class="pts__t" style="--a:1.000;--b:1.000;--lo:1.000;--hi:1.000"><i></i><s></s></span><em>100%</em><em class="pts__w">44.5</em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>win + points ÷ 10</b></span><span class="pts__t" style="--a:0.987;--b:0.987;--lo:0.980;--hi:1.000"><i></i><s></s></span><em>98.7%</em><em class="pts__w">59.0</em></div>
<div class="pts__r"><span class="pts__k"><b>win, points only on a win</b></span><span class="pts__t" style="--a:0.993;--b:0.993;--lo:0.980;--hi:1.000"><i></i><s></s></span><em>99.3%</em><em class="pts__w">43.5</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 5</b></span><span class="pts__t" style="--a:0.977;--b:0.977;--lo:0.950;--hi:1.000"><i></i><s></s></span><em>97.7%</em><em class="pts__w">59.6</em></div>
<div class="pts__r"><span class="pts__k"><b>points + win</b></span><span class="pts__t" style="--a:0.920;--b:0.920;--lo:0.900;--hi:0.940"><i></i><s></s></span><em>92%</em><em class="pts__w">57.9</em></div>
<div class="pts__r pts__r--base"><span class="pts__k"><b>2018 (mine)</b></span><span class="pts__t" style="--a:0.907;--b:0.907;--lo:0.860;--hi:0.940"><i></i><s></s></span><em>91%</em><em class="pts__w">48.2</em></div>
<div class="pts__r"><span class="pts__k"><b>points</b><small>the usual</small></span><span class="pts__t" style="--a:0.887;--b:0.887;--lo:0.840;--hi:0.940"><i></i><s></s></span><em>89%</em><em class="pts__w">58.6</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 10, 20-step</b><small>learns 20 moves ahead at once</small></span><span class="pts__t" style="--a:0.857;--b:0.857;--lo:0.770;--hi:0.910"><i></i><s></s></span><em>86%</em><em class="pts__w">42.8</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 10, 10-step</b><small>learns 10 moves ahead at once</small></span><span class="pts__t" style="--a:0.830;--b:0.830;--lo:0.820;--hi:0.850"><i></i><s></s></span><em>83%</em><em class="pts__w">45.6</em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

Win alone wins every game, but it doesn't care about points. The best mix was the win reward plus a tenth of the points, which still wins almost every game and scores 59. A fifth scores about the same but loses more often. My 2018 reward did its job back then, but with more practice it falls behind. Learning several moves ahead at once made it worse, and so did paying points only on a win.

## Does a bigger network help?

The network is the part that turns the screen into a score for each move. The bigger one is [IMPALA](https://arxiv.org/abs/1802.01561), from 2018.

<figure class="fig">
<p class="fig__k">Does a bigger network help? DQN, 5M frames, win + points reward</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r"><span class="pts__k"><b>Standard</b><small>3 layers, from 2015</small></span><span class="pts__t" style="--a:0.987;--b:0.987;--lo:0.980;--hi:1.000"><i></i><s></s></span><em>98.7%</em><em class="pts__w">59.0</em></div>
<div class="pts__r"><span class="pts__k"><b>Bigger (IMPALA)</b><small>15 layers</small></span><span class="pts__t" style="--a:0.987;--b:1.000;--lo:1.000;--hi:1.000"><i></i><i class="pts__more"></i><s></s></span><em>100%<small>+1</small></em><em class="pts__w">62.9<small>+4</small></em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

It won every test game and scored 4 more points. But it takes about twice as long to train.

## How often should it move?

This is the one I never thought about in 2018. The agent holds each move for 4 frames, which is DeepMind's Atari setup. I suspected that makes some shots and positions impossible to reach. A tree search called MCTS picks a move every frame, and it scores 78 with no training at all.

<figure class="fig">
<p class="fig__k">How often should it move? DQN, 5M frames, win + points reward</p>
<div class="pts" style="--r1:0.820;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">won</span><span class="pts__h pts__wh">points</span>
<div class="pts__r"><span class="pts__k"><b>Every 4 frames</b><small>standard network</small></span><span class="pts__t" style="--a:0.987;--b:0.987;--lo:0.980;--hi:1.000"><i></i><s></s></span><em>98.7%</em><em class="pts__w">59.0</em></div>
<div class="pts__r"><span class="pts__k"><b>Every 2 frames</b><small>standard network</small></span><span class="pts__t" style="--a:0.957;--b:0.957;--lo:0.930;--hi:0.990"><i></i><s></s></span><em>95.7%<small class="pts__minus">−3</small></em><em class="pts__w">76.4<small>+17</small></em></div>
<div class="pts__r"><span class="pts__k"><b>Every frame</b><small>standard network</small></span><span class="pts__t" style="--a:0.987;--b:0.997;--lo:0.990;--hi:1.000"><i></i><i class="pts__more"></i><s></s></span><em>99.7%<small>+1</small></em><em class="pts__w">78.7<small>+20</small></em></div>
<div class="pts__r"><span class="pts__k"><b>Every 4 frames</b><small>bigger network</small></span><span class="pts__t" style="--a:1.000;--b:1.000;--lo:1.000;--hi:1.000"><i></i><s></s></span><em>100%</em><em class="pts__w">62.9</em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>Every 2 frames</b><small>bigger network</small></span><span class="pts__t" style="--a:0.997;--b:0.997;--lo:0.990;--hi:1.000"><i></i><s></s></span><em>99.7%<small class="pts__same">±0</small></em><em class="pts__w">82.6<small>+20</small></em></div>
<span></span><span class="pts__axis"><span style="--x:0.820">holding shoot: 82%</span></span><span></span><span></span>
</div>
</figure>

Wins hardly move, since they were already near the top. Points are where it shows. Moving every frame took it from 59 points to 79, about the same as MCTS. Moving every 2 frames with the bigger network got 83, and it won 299 of 300 games.[^moves] It does take longer to train, about 53 minutes a run instead of 14.

## Why does it still lose 1 game in 300?

I replayed the lost games. As far as I can tell, every loss is the same thing: a bomb lands on the ship while it sits still and shoots.

I think the reward is to blame. Each point is worth +0.1, and a game has about 40 kills, so that's roughly +4 in points. A death only costs −1, so a risk for more points is nearly free. The more weight the reward puts on points, the more it dies. With a move every 4 frames, that's 0 deaths in 300 games at points ÷ 20, 4 at points ÷ 10 and 7 at points ÷ 5.

The fix should be a loss that costs more than the points can earn, like ±10 for the result. That's a follow-up for another day.

## What did I learn?

- **Question the settings you copied.** Holding each move for 4 frames came from Atari, and here it cost about 20 points.
- **Check the dumbest baseline first.** Holding one button doesn't need any training, and I never tried it.
- **Run everything more than once.** My two 2018 runs of the same agent were 10 to 17 points apart.
- **Claude wrote all of the code, but it liked to stop early.** I pushed back six times in about 2½ hours.[^log]
- **I was the least informed person on my own dissertation.** About a third of my messages were me learning things like PPO and IMPALA.

[^rainbow]: Double DQN and prioritised replay (my 2018 agent's two), plus dueling networks, multi-step returns, distributional values and noisy networks. [The Rainbow paper](https://arxiv.org/abs/1710.02298)
[^runs]: DQN's three runs won 42% to 84%. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^results]: On two of my other three games, one button wins every game: Deceptizelda (hold right) and Wafer Thin Mints (any direction). [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^moves]: 3 runs of 100 test games each. 1 loss in 300 games on the training levels for each of the two best setups. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
[^log]: From my Claude Code session log, 18 and 19 October 2026.
