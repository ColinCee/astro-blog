---
title: "Beating my 2018 dissertation AI"
subtitle: "From 50 points a game to 83, and from 81% wins to 99.7%."
stat: "50 → 83"
statLabel: "points a game, 2018 vs 2026"
figures:
  - label: "My 2018 agent"
    value: "50 pts, 81%"
  - label: "Best 2026 agent"
    value: "83 pts, 99.7%"
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

My 2018 agent scores 50 points a game and wins 81% of Aliens games. The best agent we got to scores 83 and wins 299 games out of 300. It even beats a tree search that plans every move, and no learning agent came close to that before. All the code and results are in [my dissertation repo](https://github.com/ColinCee/GVGAI-Dissertation).

## How did we beat it?

<figure class="fig">
<p class="fig__k">How we beat my 2018 agent: each step adds one change. Average of 3 runs, the line is their spread</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r pts__r--base"><span class="pts__k"><b>My 2018 agent</b><small>1M frames, my 2018 reward</small></span><span class="pts__t" style="--a:0.557;--b:0.557;--lo:0.524;--hi:0.575"><i></i><s></s></span><em>50.1</em><em class="pts__w">81%</em></div>
<div class="pts__r"><span class="pts__k"><b>Today's DQN</b><small>same 1M frames, points reward</small></span><span class="pts__t" style="--a:0.439;--b:0.439;--lo:0.379;--hi:0.487"><i></i><s></s></span><em>39.5</em><em class="pts__w">57%</em></div>
<div class="pts__r"><span class="pts__k"><b>+ more practice</b><small>5M frames</small></span><span class="pts__t" style="--a:0.439;--b:0.651;--lo:0.637;--hi:0.672"><i></i><i class="pts__more"></i><s></s></span><em>58.6<small>+19</small></em><em class="pts__w">89%</em></div>
<div class="pts__r"><span class="pts__k"><b>+ win + points reward</b><small>reward</small></span><span class="pts__t" style="--a:0.651;--b:0.656;--lo:0.640;--hi:0.669"><i></i><i class="pts__more"></i><s></s></span><em>59.0<small>+0</small></em><em class="pts__w">98.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>+ bigger network</b><small>network</small></span><span class="pts__t" style="--a:0.656;--b:0.698;--lo:0.686;--hi:0.706"><i></i><i class="pts__more"></i><s></s></span><em>62.9<small>+4</small></em><em class="pts__w">100%</em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>+ a move every 2 frames</b><small>how often it moves</small></span><span class="pts__t" style="--a:0.698;--b:0.918;--lo:0.910;--hi:0.925"><i></i><i class="pts__more"></i><s></s></span><em>82.6<small>+20</small></em><em class="pts__w">99.7%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

It took four changes, and two of them did most of the work: more practice, and moving more often. Each chart below changes one thing at a time and keeps the rest the same. Grey is where the step before got to, and orange is what a change added. The three lines are the same in every chart: holding the shoot button, my 2018 agent, and a tree search called MCTS.

## Which method?

My 2018 agent is [DQN](https://www.nature.com/articles/nature14236), the method DeepMind used on Atari in 2015. It learns a score for each move from the screen, then plays the best one. I added two tricks from later papers. [Rainbow](https://arxiv.org/abs/1710.02298) is DQN with six of those tricks combined.[^rainbow] [PPO](https://arxiv.org/abs/1707.06347) is a different kind of learner that picks moves directly.

<figure class="fig">
<p class="fig__k">Which method? All 1M frames, points reward</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r pts__r--base"><span class="pts__k"><b>My 2018 agent</b><small>DQN + 2 tricks, my 2018 reward</small></span><span class="pts__t" style="--a:0.557;--b:0.557;--lo:0.524;--hi:0.575"><i></i><s></s></span><em>50.1</em><em class="pts__w">81%</em></div>
<div class="pts__r"><span class="pts__k"><b>Rainbow</b><small>DQN + 6 tricks</small></span><span class="pts__t" style="--a:0.480;--b:0.480;--lo:0.469;--hi:0.492"><i></i><s></s></span><em>43.2</em><em class="pts__w">66%</em></div>
<div class="pts__r"><span class="pts__k"><b>DQN</b><small>today's version</small></span><span class="pts__t" style="--a:0.439;--b:0.439;--lo:0.379;--hi:0.487"><i></i><s></s></span><em>39.5</em><em class="pts__w">57%</em></div>
<div class="pts__r"><span class="pts__k"><b>PPO</b><small>a different kind of learner</small></span><span class="pts__t" style="--a:0.418;--b:0.418;--lo:0.404;--hi:0.426"><i></i><s></s></span><em>37.6</em><em class="pts__w">82%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

With the same 1M frames of practice my agent got, none of them clearly beat it, and the runs vary a lot.[^runs] PPO wins 82% while scoring the least, which looked odd.

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

My agent did learn something though. It gets 50 points a game against the button's 36, because it also shoots the bases in front of the aliens. So from here on, I look at points as well as wins.

## How much does practice help?

<figure class="fig">
<p class="fig__k">How much practice? 1M frames, then 5M. Points reward</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r"><span class="pts__k"><b>DQN</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.439;--b:0.651;--lo:0.637;--hi:0.672"><i></i><i class="pts__more"></i><s></s></span><em>58.6<small>+19</small></em><em class="pts__w">89%</em></div>
<div class="pts__r"><span class="pts__k"><b>Rainbow</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.480;--b:0.633;--lo:0.614;--hi:0.646"><i></i><i class="pts__more"></i><s></s></span><em>57.0<small>+14</small></em><em class="pts__w">93%</em></div>
<div class="pts__r"><span class="pts__k"><b>PPO</b><small>1M → 5M frames</small></span><span class="pts__t" style="--a:0.418;--b:0.510;--lo:0.489;--hi:0.543"><i></i><i class="pts__more"></i><s></s></span><em>45.9<small>+8</small></em><em class="pts__w">83%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

A lot. With 5M frames, DQN and Rainbow both get past my agent on points and wins. That's about 17 minutes a run now, which would've been 2 or 3 days in 2018.

## Which reward works best?

The reward is what the agent gets told is good. Points is just the game score. Win is +1 for a win and −1 for a loss. My 2018 reward was the win reward plus −0.5 on every move of a lost game.

<figure class="fig">
<p class="fig__k">Which reward? All DQN, 5M frames</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 5</b></span><span class="pts__t" style="--a:0.662;--b:0.662;--lo:0.626;--hi:0.694"><i></i><s></s></span><em>59.6</em><em class="pts__w">97.7%</em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>win + points ÷ 10</b></span><span class="pts__t" style="--a:0.656;--b:0.656;--lo:0.640;--hi:0.669"><i></i><s></s></span><em>59.0</em><em class="pts__w">98.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>points</b><small>the usual</small></span><span class="pts__t" style="--a:0.651;--b:0.651;--lo:0.637;--hi:0.672"><i></i><s></s></span><em>58.6</em><em class="pts__w">89%</em></div>
<div class="pts__r"><span class="pts__k"><b>points + win</b></span><span class="pts__t" style="--a:0.643;--b:0.643;--lo:0.636;--hi:0.654"><i></i><s></s></span><em>57.9</em><em class="pts__w">92%</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 20</b></span><span class="pts__t" style="--a:0.627;--b:0.627;--lo:0.607;--hi:0.644"><i></i><s></s></span><em>56.5</em><em class="pts__w">100%</em></div>
<div class="pts__r pts__r--base"><span class="pts__k"><b>2018 (mine)</b></span><span class="pts__t" style="--a:0.536;--b:0.536;--lo:0.534;--hi:0.539"><i></i><s></s></span><em>48.2</em><em class="pts__w">91%</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 10, 10-step</b><small>learns 10 moves ahead at once</small></span><span class="pts__t" style="--a:0.507;--b:0.507;--lo:0.498;--hi:0.521"><i></i><s></s></span><em>45.6</em><em class="pts__w">83%</em></div>
<div class="pts__r"><span class="pts__k"><b>win</b></span><span class="pts__t" style="--a:0.494;--b:0.494;--lo:0.483;--hi:0.514"><i></i><s></s></span><em>44.5</em><em class="pts__w">100%</em></div>
<div class="pts__r"><span class="pts__k"><b>win, points only on a win</b></span><span class="pts__t" style="--a:0.484;--b:0.484;--lo:0.474;--hi:0.496"><i></i><s></s></span><em>43.5</em><em class="pts__w">99.3%</em></div>
<div class="pts__r"><span class="pts__k"><b>win + points ÷ 10, 20-step</b><small>learns 20 moves ahead at once</small></span><span class="pts__t" style="--a:0.476;--b:0.476;--lo:0.468;--hi:0.482"><i></i><s></s></span><em>42.8</em><em class="pts__w">86%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

The best mix was the win reward plus a tenth of the points. A fifth scores about the same but dies more often. Win alone wins every game but doesn't care about points. My 2018 reward did its job back then, but with more practice it falls behind. Learning several moves ahead at once made it worse, and so did paying points only on a win.

## Does a bigger network help?

The network is the part that turns the screen into a score for each move. The bigger one is [IMPALA](https://arxiv.org/abs/1802.01561), from 2018.

<figure class="fig">
<p class="fig__k">Does a bigger network help? DQN, 5M frames, win + points reward</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r"><span class="pts__k"><b>Standard</b><small>3 layers, from 2015</small></span><span class="pts__t" style="--a:0.656;--b:0.656;--lo:0.640;--hi:0.669"><i></i><s></s></span><em>59.0</em><em class="pts__w">98.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>Bigger (IMPALA)</b><small>15 layers</small></span><span class="pts__t" style="--a:0.656;--b:0.698;--lo:0.686;--hi:0.706"><i></i><i class="pts__more"></i><s></s></span><em>62.9<small>+4</small></em><em class="pts__w">100%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

A bit, and it won every test game. But it takes about twice as long to train.

## How often should it move?

This is the one I never thought about in 2018. The agent holds each move for 4 frames, which is DeepMind's Atari setup. I suspected that makes some shots and positions impossible to reach. A tree search called MCTS picks a move every frame, and it scores 78 with no training at all.

<figure class="fig">
<p class="fig__k">How often should it move? DQN, 5M frames, win + points reward</p>
<div class="pts" style="--r1:0.403; --r2:0.557; --r3:0.864;">
<span class="pts__h"></span><span class="pts__h"></span><span class="pts__h pts__wh">points</span><span class="pts__h pts__wh">won</span>
<div class="pts__r"><span class="pts__k"><b>Every 4 frames</b><small>standard network</small></span><span class="pts__t" style="--a:0.656;--b:0.656;--lo:0.640;--hi:0.669"><i></i><s></s></span><em>59.0</em><em class="pts__w">98.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>Every 2 frames</b><small>standard network</small></span><span class="pts__t" style="--a:0.656;--b:0.849;--lo:0.832;--hi:0.866"><i></i><i class="pts__more"></i><s></s></span><em>76.4<small>+17</small></em><em class="pts__w">95.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>Every frame</b><small>standard network</small></span><span class="pts__t" style="--a:0.656;--b:0.874;--lo:0.869;--hi:0.878"><i></i><i class="pts__more"></i><s></s></span><em>78.7<small>+20</small></em><em class="pts__w">99.7%</em></div>
<div class="pts__r"><span class="pts__k"><b>Every 4 frames</b><small>bigger network</small></span><span class="pts__t" style="--a:0.698;--b:0.698;--lo:0.686;--hi:0.706"><i></i><s></s></span><em>62.9</em><em class="pts__w">100%</em></div>
<div class="pts__r pts__r--hi"><span class="pts__k"><b>Every 2 frames</b><small>bigger network</small></span><span class="pts__t" style="--a:0.698;--b:0.918;--lo:0.910;--hi:0.925"><i></i><i class="pts__more"></i><s></s></span><em>82.6<small>+20</small></em><em class="pts__w">99.7%</em></div>
<span></span><span class="pts__axis"><span style="--x:0.403">holding shoot: 36</span><span style="--x:0.557">2018: 50</span><span style="--x:0.864">MCTS: 78</span></span><span></span><span></span>
</div>
</figure>

Moving every frame took it from 59 points to 79, about the same as MCTS. Moving every 2 frames with the bigger network got 83, and it won 299 of 300 games.[^moves] It does take longer to train, about 53 minutes a run instead of 14.

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
