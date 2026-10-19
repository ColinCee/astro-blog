# GVGAI clips

Recorded with `tools/record.py` in the GVGAI-Dissertation repository (`2026-revival/`), on the CPU. Run from `2026-revival/`, with `<out>` set to this folder. With `--verify`, the tool replays each game through the agent's own evaluation loop and checks that the result is the same. Every clip below passed. For MCTS it checks every frame.

Only the files the posts use are kept here. `aliens-random.*`, `deceptizelda-hold-right.*` and the `features/` grids were made by the commands below but not kept; `net/` holds four maps per layer cut from the `features/` grids (the four with the most contrast).

Each video shows one engine tick per frame, scaled up 2× with nearest-neighbour. The `.png` is the poster, taken from the middle of the game. Each `.json` has the result and every decision: `tick`, `action`, `score` so far, and `q` (the network's value for each action) for the learning agents. The JSON also records the speed: 30 fps here means 30 ticks/s, 0.75× the 40 ticks/s the 2018 engine ran at for human viewers.

## Aliens: level 0, engine seed 2 (every Aliens clip)

| File | Agent | Result | Command (`uv run python -m tools.record --verify --out <out> --game aliens --level 0 --seed 2 ...`) |
|---|---|---|---|
| `aliens-2018-agent.*` | 2018 agent (`weights/aliens-ddqn2018-s0-agent.pt`, weights from the last target sync) | win, 57, 446 ticks | `--agent ddqn2018:weights/aliens-ddqn2018-s0-agent.pt --name aliens-2018-agent` |
| `aliens-hold-shoot.*` | shoot (`ACTION_USE`) held all game | win, 42, 448 ticks | `--agent hold:use --name aliens-hold-shoot` |
| `aliens-random.*` | a random move every 4 ticks, `default_rng(3)` | loss, 38, 581 ticks | `--agent random:3 --name aliens-random` |
| `aliens-dqn-best.*` | modern DQN, preset `dqn-outcome-score01` | win, 60, 477 ticks | `--agent modern:weights/aliens-dqn-outcome-score01-s0.pt:dqn-outcome-score01 --name aliens-dqn-best` |
| `aliens-dqn-impala.*` | DQN with the IMPALA network, preset `dqn-impala` | win, 60, 497 ticks | `--agent modern:weights/aliens-dqn-impala-long-s0.pt:dqn-impala --name aliens-dqn-impala` |
| `aliens-mcts.*` | the engine's MCTS, 50 iterations per move, search seed 0 | win, 71, 402 ticks | `--agent mcts:50:0 --name aliens-mcts` |

**Why level 0, seed 2.** I played the 2018 agent on levels 0–2 with engine seeds 0–7. Its evaluation averages 51.8 points and wins 92% of games. Seed 2 on level 0 is a win with a typical score and length: 57 points, close to the median of the level's wins (58), in 446 ticks (median 446). It is not the best game.

| Level | Seed 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| 0 | win 59 | win 58 | **win 57** | win 58 | loss 42 | win 58 | win 56 | win 56 |
| 1 | win 53 | win 57 | loss 41 | win 58 | win 58 | win 57 | win 57 | loss 30 |
| 2 | win 53 | loss 8 | win 52 | loss 36 | loss 36 | win 53 | win 50 | win 53 |

**Random play.** The random player's score depends on its own seed. Over 50 evaluation games it averages 33.7 (median 35) and wins 8%. On this level and seed I tried rng seeds 0–5: 1, 40, 17, 38, 4 and 3 points, all losses. I used seed 3 (38 points), the closest to the median. Seed 0's 71-tick game would have been unusually short.

**Compared with each agent's evaluation:** hold-shoot averages 36.3 points with 82% wins; the best modern DQN 60.3 with 96%; IMPALA 62.0 with 98%; MCTS-50 77.9 with 100%. So MCTS scored a little below its average in this game (71). The modern networks run in fp32 on the CPU here, but were evaluated in bf16 on the GPU, so a near-tied move could go the other way. The game above is the CPU's.

## Deceptizelda

| File | What | Command |
|---|---|---|
| `deceptizelda-hold-right.*` | right held all game, level 0, seed 2: win, 2 points, 10 ticks. It picks up the key (+1) and walks into the small exit (+1). Played at **4 fps** (4 ticks/s), because 10 ticks at 30 fps would last a third of a second. | `--game deceptizelda --level 0 --seed 2 --fps 4 --agent hold:right --name deceptizelda-hold-right` |
| `deceptizelda-level0.png` / `.json` | Start frame of level 0, scaled 2× (260×240). The JSON has the tile size (10 px native, 20 px in the PNG) and each object's tile, with pixel corner and centre in the PNG: small exit (`smallgoal`) col 11 row 10, centre (230, 210); big exit (`largegoal`) col 11 row 8, centre (230, 170); key col 10 row 10, centre (210, 210); avatar col 1 row 10; three spiders. It also lists the game rules that mention each object: the small exit needs the key, wins and gives +1; the big exit wins and gives +10, with or without the key. | `--game deceptizelda --level 0 --seed 2 --still --name deceptizelda-level0` |

I tried hold-right on levels 0 and 2 with seeds 0–3: every game was a win, 2 points in 10 ticks. Levels 0 and 2 are the same map.

## features/: inside the networks

`--game aliens --level 0 --seed 2 --agent ddqn2018:weights/aliens-ddqn2018-s0-agent.pt --features weights/aliens-dqn-impala-long-s0.pt --out <out>/features --name features`

The moment is tick 221 of the 2018 agent's game above, the decision nearest mid-game (`features-frame.png`). Each network gets the input it would have had at that moment, both 4×55×150:

- the 2018 network: the agent's actual stack, four consecutive ticks, greyscale and halved with Lanczos (`features-2018-input.png`);
- IMPALA: gray-half frames at ticks 209, 213, 217 and 221, the stack it would see deciding on tick 221 (`features-impala-input.png`).

Each layer's PNG shows up to 16 channels in a 4-wide grid. Each channel is scaled to its own min..max, so brightness can't be compared between channels. `features.json` has each layer's shape (channels × h × w), kernel and stride, parameter count, the linear heads, the total, and the Q-values at that moment.

| Network | Layers (output shape) | Parameters |
|---|---|---|
| 2018 (Nature DQN) | conv1 32×12×36, conv2 64×5×17, conv3 64×3×15 (after ReLU), linear 512, linear 3 | 1,554,595 (1.48M in the first linear layer) |
| IMPALA | 3 stages of conv, max-pool and 2 residual blocks: 16×55×150 → pool 16×28×75; 32×28×75 → 32×14×38; 32×14×38 → 32×7×19; linear 512, linear 3 | 2,278,867 (2.18M in the first linear layer) |

## Notes

- The 2018 weights file is the training checkpoint from episode 1,777, saving the weights from the last target sync. The reported run trained for 2,000 episodes, so these are not quite its final weights.
- MCTS has to plan with the engine's forward model, so it plays inside the engine and the frames come from the engine too. The tool gives MCTS the same game seed the Python environment uses for engine seed 2, on the same 10-pixel tiles. `--verify` replays its moves in the Python environment, and every frame matched.
