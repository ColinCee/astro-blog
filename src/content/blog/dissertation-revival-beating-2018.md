---
title: "Beating my 2018 agent"
subtitle: "Holding one button wins 82% of the time, which I never checked in 2018."
stat: "82% → 100%"
statLabel: "button vs 5× the training"
figures:
  - label: "Hold shoot, no learning"
    value: "82%"
  - label: "My 2018 agent"
    value: "81%"
  - label: "Best 2026"
    value: "100%"
pubDate: "Oct 21 2026"
---
<figure class="fig">
<p class="fig__k">Same level, same random seed, half speed</p>
<div class="vids">
<figure class="vid"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>Best 2026 DQN</b>: won, 60 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-best.png"><source src="/blog/gvgai/aliens-dqn-best.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-best.mp4" type="video/mp4"></video></figure>
</div>
</figure>

In [part 1](/blog/dissertation-revival-speed/) Claude got my 2018 code training 65× faster. My 2018 agent was DQN with two tricks on top, Double DQN and prioritised replay, all written from the papers. With runs that cheap the next question was whether today's methods could beat what I built as an undergrad, and they can, today's DQN with five times the training wins every game of Aliens even on levels it never trained on. The number I keep coming back to though is 82%, which is what you get by just holding the shoot button and doing nothing else.

## Can today's methods beat it with the same budget?

To keep it fair every agent got the same 1 million game ticks my 2018 agent trained on, three runs each and 50 test games.[^results] The line up:

- **Modern DQN**: the 2015 method as it's usually implemented now.
- **Rainbow** (2017): six improvements combined, including both of my tricks.
- **A bigger network** (IMPALA, 2018), for both DQN and Rainbow: more layers, with shortcuts between them.
- **4× updates**: DQN learning four times as often.
- **PPO**: a different family that learns which move to make directly instead of scoring them.
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

Three edged past my 2018 agent's 81%, all within noise.[^runs3]

## What does holding one button get you?

The next morning Claude ran the simplest policies it could against every game, random moves and every button held down for the whole game. Holding shoot wins 82% of Aliens games, and on levels it's never seen it's also 82%.

<figure class="fig">
<p class="fig__k">Same level and seed, the aliens drift down into the shots</p>
<div class="vids">
<figure class="vid"><figcaption><b>Holding shoot</b>, no learning: won, 42 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-hold-shoot.png"><source src="/blog/gvgai/aliens-hold-shoot.webm" type="video/webm"><source src="/blog/gvgai/aliens-hold-shoot.mp4" type="video/mp4"></video></figure>
<figure class="vid vid--hi"><figcaption><b>My 2018 agent</b>: won, 57 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-agent.png"><source src="/blog/gvgai/aliens-2018-agent.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-agent.mp4" type="video/mp4"></video></figure>
</div>
</figure>

On two of the other games it's even worse, the button wins every game. (On Chase no learning agent wins at all.)

| Game | Button held all game | Wins |
|---|---|---:|
| Aliens | shoot | 82% |
| Deceptizelda | right | 100% |
| Wafer Thin Mints | any direction | 100% |
| Chase | any | 0% |

PPO had learned nothing but the button. One PPO run played exactly the same 50 test games as holding shoot, game for game.

So the bar for Aliens is 82% rather than 0%, which means my 2018 agent's 81% didn't prove anything on its own and nor did any of the 2026 win rates above. I never checked this in 2018.

## Did my 2018 agent learn anything?

Yes, and the score is how you can tell, 50 points a game against the button's 36. In the games it wins it averages 54 points, against 43 for today's DQN with my 2018 reward, because it also shoots the protective bases in front of the aliens. You can see it in where it looks:

<figure class="fig">
<p class="fig__k">Where it looks, brighter matters more: mostly the bases, then the lowest aliens</p>
<div class="vids">
<figure class="vid vid--hi"><video data-rate="1" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-2018-saliency.png"><source src="/blog/gvgai/aliens-2018-saliency.webm" type="video/webm"><source src="/blog/gvgai/aliens-2018-saliency.mp4" type="video/mp4"></video></figure>
</div>
</figure>
## What should you reward?

Then there's the reward. Mine from 2018 gave +1 or −1 for the result, plus −0.5 on every move of a game that ended in a loss. It lifted wins (DQN went from 57% to 85%) but not the score (39 points, close to the button). Mostly it taught "don't lose", which on Aliens is pretty close to just holding shoot.

The textbook alternative is to drop the penalty and only reward what you actually want, +1 for a win and −1 for a loss. At 2018's budget it didn't help though, added to the score wins fell to 45%. The problem is how slowly a single number at the end of a game gets back to the moves that caused it, because each move learns its score from the move after it, so a win or a loss only creeps back one move at a time. My 2018 penalty got round that by hitting every move at once, which also blames the good moves in games that were lost. Try both:

<figure class="fig" data-widget="chain" data-moves="150">
<p class="fig__k">One lost game at real length, 150 moves and a −1 at the end. Drag to practise (toy model)</p>
<div class="chart"><svg viewBox="0 0 600 60" role="img" aria-label="A row of 150 moves; colour shows how much each move has learned that the game was lost"><text x="0" y="12">first move</text><text x="600" y="12" text-anchor="end">−1 at the end</text></svg></div>
<div class="ctl"><input type="range" min="0" max="1750" value="0" step="1" aria-label="Learning updates"><span>updates: <output>0</output></span><button type="button" aria-pressed="false">2018's penalty</button></div>
<p class="fig__k">Moves that have felt it: <span data-reached>none yet</span></p>
</figure>

With five times the practice, 5 million ticks or about 17 minutes a run, the slow signal does get there:

| Reward, 5M ticks | Score | Wins | Unseen levels |
|---|---:|---:|---:|
| Score only (the standard) | 58.6 | 89% | 69% |
| 2018's: outcome + per-move penalty | 48.2 | 91% | 23% |
| **Win/lose only** | 44.5 | **100%** | **100%** |
| **Win/lose + 0.1 × score** | **60.1** | 98% | 94% |
| Holding shoot, for reference | 36.3 | 82% | 82% |

Win/lose alone wins every game on all three runs, including on two levels it never trained on where the button still gets 82%. Adding a tenth of the score as a tie-break keeps 98% and plays for points too. So rewarding only what you want does work here, it just needed about five times the practice to get there.

## Does a bigger network help?

The network is the part that turns the screen into a score for each move. The 2015 one shrinks the screen down to 12 × 36 in one step, while IMPALA keeps a lot more detail for longer, with shortcuts that let each stage skip ahead. It's 2 to 3 times slower per tick but gets the best Aliens score, 62.5 points and 96% wins.

<figure class="fig">
<p class="fig__k">One moment of Aliens inside each trained network, brighter is more active. Tap a layer.</p>
<p class="fig__k">2015 DQN network: 3 layers, 1.55M weights</p>
<div class="net"><figure class="slab" tabindex="0"><div class="deck" style="--dw:9rem;aspect-ratio:300/110"><img src="/blog/gvgai/net/2018-input-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-input-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-input-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-input-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>4 frames<small>55 × 150</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:6rem;aspect-ratio:144/48"><img src="/blog/gvgai/net/2018-conv1-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv1-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv1-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv1-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 1<small>32 maps, 12 × 36</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:5rem;aspect-ratio:153/45"><img src="/blog/gvgai/net/2018-conv2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 2<small>64, 5 × 17</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:4.4rem;aspect-ratio:240/48"><img src="/blog/gvgai/net/2018-conv3-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/2018-conv3-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/2018-conv3-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/2018-conv3-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>layer 3<small>64, 3 × 15</small></figcaption></figure><figure class="slab slab--out"><span>3 moves</span><figcaption>&nbsp;<small>via 512</small></figcaption></figure></div>
<p class="fig__k">IMPALA network: 15 layers in 3 stages, 2.3M weights</p>
<div class="net"><figure class="slab" tabindex="0"><div class="deck" style="--dw:9rem;aspect-ratio:300/110"><img src="/blog/gvgai/net/impala-input-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-input-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-input-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-input-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>4 frames<small>55 × 150</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:8rem;aspect-ratio:75/28"><img src="/blog/gvgai/net/impala-stage1-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage1-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage1-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage1-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 1<small>16, 28 × 75</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:6rem;aspect-ratio:114/42"><img src="/blog/gvgai/net/impala-stage2-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage2-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage2-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage2-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 2<small>32, 14 × 38</small></figcaption></figure><figure class="slab" tabindex="0"><div class="deck" style="--dw:4.4rem;aspect-ratio:114/42"><img src="/blog/gvgai/net/impala-stage3-res2-0.png" alt="" loading="lazy" style="--i:0"><img src="/blog/gvgai/net/impala-stage3-res2-1.png" alt="" loading="lazy" style="--i:1"><img src="/blog/gvgai/net/impala-stage3-res2-2.png" alt="" loading="lazy" style="--i:2"><img src="/blog/gvgai/net/impala-stage3-res2-3.png" alt="" loading="lazy" style="--i:3"></div><figcaption>stage 3<small>32, 7 × 19</small></figcaption></figure><figure class="slab slab--out"><span>3 moves</span><figcaption>&nbsp;<small>via 512</small></figcaption></figure></div>
</figure>

## So where does everything land?

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
<circle class="hi" cx="406" cy="38" r="6" tabindex="0"><title>DQN, bigger network: 62.5 points, 96% wins, up to 5M ticks</title></circle>
<text x="414" y="54" text-anchor="start" class="hi">bigger network</text>
<circle class="mk" cx="195" cy="43" r="4.5" tabindex="0"><title>PPO, win/lose only: 43.5 points, 94% wins, 5M ticks</title></circle>
<text x="187" y="47" text-anchor="end" class="ink">PPO, win/lose</text>
<circle class="mk" cx="577" cy="27" r="4.5" tabindex="0"><title>MCTS, no training: 77.8 points, 100% wins</title></circle>
<text x="569" y="19" text-anchor="end" class="ink">MCTS, no training</text>
</svg>
</div>
</figure>

I won every game I played back in 2018 but only scored 43, so the hard part of Aliens seems to be the score rather than winning. The best learning agent now gets 62.5 points and wins 96%, which outscores both me and my 2018 agent.

[^results]: All numbers from [the results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md), except the button on unseen levels (Aliens levels 3 and 4, 50 games), run for this post.
[^runs3]: My 2018 agent here is the 2018 code replayed 3 times. Runs vary a lot, modern DQN's three won 42% to 84%. [Results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md)
