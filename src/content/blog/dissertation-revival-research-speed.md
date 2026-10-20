---
title: "The least informed person on my own dissertation"
subtitle: "Claude didn't trust my 2018 results, and it was right not to."
stat: "6 push-backs"
statLabel: "in 2½ hours"
pubDate: "Oct 22 2026"
---
When I handed my 2018 dissertation to Claude I expected it to update the code and maybe tidy up my results. What I didn't expect was for it to not trust them. The morning after, while I was asleep, it checked what you get by just holding the shoot button in Aliens, and it's 82%, basically the same as my agent's 81%. In 2018 I never thought to check that.[^results]

[Part 1](/blog/dissertation-revival-speed/) covers how training got 65× faster. This one is about what the 28 hours of working with it were actually like.

## What did I actually ask for?

On a Sunday morning I gave it my report and the old code, and then mostly let it run, stepping in at a handful of points:

<figure class="fig">
<p class="fig__k">The 28 hours: what Claude worked on, and eight turning points from me</p>
<div class="chart">
<svg viewBox="0 0 640 150" role="img" aria-label="About 28 hours: Claude worked through, with eight turning points from me, numbered below">
<rect class="band" x="304" y="8" width="194" height="112"/><text x="401" y="22" text-anchor="middle">asleep, runs going</text>
<text x="16" y="40">Me</text>
<line class="ax" x1="16" x2="624" y1="58" y2="58"/>
<circle class="hi" cx="16" cy="58" r="8"/><text x="16" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">1</text>
<circle class="hi" cx="78" cy="58" r="8"/><text x="78" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">2</text>
<circle class="hi" cx="180" cy="58" r="8"/><text x="180" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">3</text>
<circle class="hi" cx="236" cy="58" r="8"/><text x="236" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">4</text>
<circle class="hi" cx="266" cy="58" r="8"/><text x="266" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">5</text>
<circle class="hi" cx="505" cy="58" r="8"/><text x="505" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">6</text>
<circle class="hi" cx="543" cy="58" r="8"/><text x="543" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">7</text>
<circle class="hi" cx="588" cy="58" r="8"/><text x="588" y="62" text-anchor="middle" style="fill:var(--accent-ink);font-weight:700">8</text>
<text x="16" y="86">Claude</text>
<rect class="mk" x="28" y="92" width="103" height="12" rx="1"><title>revive + speed up</title></rect>
<rect class="mk" x="132" y="92" width="132" height="12" rx="1"><title>2018 replay, today's agents</title></rect>
<rect class="mk" x="267" y="92" width="222" height="12" rx="1"><title>overnight: a dozen queues of runs</title></rect>
<rect class="mk" x="491" y="92" width="51" height="12" rx="1"><title>button check, reward</title></rect>
<rect class="mk" x="544" y="92" width="79" height="12" rx="1"><title>all games, docs</title></rect>
<text x="16" y="138" text-anchor="start">Sun 10:39</text>
<text x="301" y="138" text-anchor="middle">midnight</text>
<text x="624" y="138" text-anchor="end">Mon 14:08</text>
</svg>
</div>
</figure>

1. Asked it to update everything, retrain, improve on the findings, and get each big decision reviewed by a second AI model.
2. Pushed back on stopping, six times in about 2½ hours, starting with "You stopped too early with the optimizations."
3. Asked why my 2018 agent was beating today's.
4. Asked whether my 2018 reward was "kinda hacky", and what would have been better.
5. Went to bed and told it "don't stop early", so it queued runs all night.
6. Asked what reward the research recommends, and why an experiment took hours, not minutes.
7. Told it to run the reward it recommended on all four games.
8. Asked if it was enough to stop, then asked for these posts.

## Why did I keep having to tell it not to stop?

Left alone it would wrap up after the obvious wins. Within a few hours it was happy with the speed and ready to move on, so I pushed back six times in about 2½ hours, starting with "You stopped too early with the optimizations". By then a run was already down from 12 hours to 34 minutes, but the rest of part 1, down to 11 minutes, only came after I pushed. When I went to bed I told it "don't stop early", and it queued runs all night.

## Why didn't it trust the results?

This was the bit I didn't see coming. In the first hour it compared my 2018 agent against random play, which I'd done in 2018 too. But overnight one of its new agents, PPO, played exactly the same 50 test games as just holding shoot, game for game. So the next morning it ran the simplest policies it could against every game, random moves and every button held down the whole time. Holding shoot wins 82% of Aliens games, and on two of the other games one button wins every single game.

That means my 2018 agent's 81% didn't prove much on its own, and neither did most of the new results. My agent did learn something, it scores 50 points a game against the button's 36, but without that check I'd never have known which of my win rates meant anything.

## So who actually did what?

<figure class="fig">
<div class="split">
<div><p class="fig__k">Claude</p>
<div class="boxes"><div class="box">All the code<small>engine fixes, the 2018 port, Rainbow, PPO, IMPALA</small></div><div class="box">Checks I hadn't done in 2018<small>replaying recorded games pixel for pixel; the one-button baseline</small></div><div class="box">The experiment plan<small>what to run overnight, and when to stop</small></div></div></div>
<div><p class="fig__k">Me</p>
<div class="boxes"><div class="box box--fast">The question<small>how far can this get?</small></div><div class="box box--fast">Telling it to keep going<small>its default was to wrap up early</small></div><div class="box box--fast">Asking why<small>about a third of my messages were me learning PPO and IMPALA</small></div></div></div>
</div>
</figure>

It wrote all of the code, came up with the checks I hadn't done and planned what to run overnight. About a third of my messages were me trying to learn things like PPO and IMPALA, and I spent about an hour working out why it had picked Rainbow, which is a strange position to be in on your own dissertation.

## What's still unsolved?

Two of the problems need the agent to go looking for things, it can't learn about the far door if it never gets there.

<figure class="fig">
<p class="fig__k">Deceptizelda: the near door for 2 points, or the far one for 10</p>
<div class="map">
<img src="/blog/gvgai/deceptizelda-level0.png" alt="Deceptizelda level 0: a maze with the player bottom left, a key and a door bottom right, three spiders in the corridors above, and a second door reached only through the maze" width="260" height="240">
<svg viewBox="0 0 260 240" aria-hidden="true">
<polyline class="ln" points="210,210 30,210 30,30 230,30 230,90 70,90 70,170 230,170" style="stroke-dasharray:5 4;stroke:var(--ink)"/>
<polyline class="ln hi" points="30,210 210,210 230,210" style="stroke-width:3"/>
<circle cx="230" cy="210" r="13" class="ring hi"/>
<circle cx="230" cy="170" r="13" class="ring"/>
</svg>
</div>
<ul class="legend"><li class="is-data">Key, then the near door, 2 points, which is what every agent does</li><li>Back through the spiders to the far door, 10 points, which only I did</li></ul>
</figure>

- **Deceptizelda's big exit.** Even a reward paying 1 extra point for it didn't help, the agents just never get there to find out.
- **Chase.** No learning agent has won a single game, so a win/lose reward never even fires.
- **MCTS.** A tree search that tries moves ahead in a copy of the game scores 78 on Aliens with no training at all, against 62 for the best learning agent, and 50 simulations a move is enough.

<figure class="fig">
<p class="fig__k">Same level and seed, the best learning agent against MCTS</p>
<div class="vids">
<figure class="vid"><figcaption><b>Best learning agent</b>, up to 5M ticks: won, 60 points</figcaption><video data-rate="0.5" muted loop playsinline preload="none" poster="/blog/gvgai/aliens-dqn-impala.png"><source src="/blog/gvgai/aliens-dqn-impala.webm" type="video/webm"><source src="/blog/gvgai/aliens-dqn-impala.mp4" type="video/mp4"></video></figure>

The next thing to try would be an exploration bonus, rewarding the agent for seeing something new, which seems to be what people normally try for this.

## What would I do differently?

Even without the speed, I'd run everything three times instead of once, since the noise between runs is 10 to 17 percentage points of wins and that was probably hiding what actually worked. And I'd check the simplest possible baseline first, holding one button, before trusting any win rate. It doesn't even need any training, and I never did it.

[^results]: Numbers from [the results](https://github.com/ColinCee/GVGAI-Dissertation/blob/master/2026-revival/RESULTS.md). Timeline and quotes from my Claude Code session log, 18 and 19 October 2026.
