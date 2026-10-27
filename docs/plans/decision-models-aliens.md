# Can a cheap decision model play Aliens with no training?

Plan only, nothing run yet. Follows the `deciding` skill.

## 1. The question

With no training on Aliens, do the new "decision models" (Cloudflare's Clef, TypeSafe's Jev) beat the no-training players in part 2: holding shoot (82% wins, 42 pts) and MCTS (100%, 78 pts)? The final agent from part 2 (99%, 83 pts) is the target to beat, not a fair rival: it practised for 5M frames.

The one thing that changes between rows is who picks the move. The game, levels, test games and scoring are all the same.

## 2. What is already known

- [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) (TypeSafe, 15 Sep 2026): scores up to 255 fixed choices in one pass, with no text written out. It reads text only, and responses take 70 to 500 ms from the US west coast. Price is $0.042 per million input tokens. Early access only. Their only game demo is Doom from a text state at 10 calls a second, and they say a non-AI bot plays it better.
- [Clef](https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/) (Cloudflare, 1 Oct 2026): open weights (Apache 2.0), built on Qwen. It uses the same API as Jev and runs on Workers AI as `@cf/cloudflare/clef` (27B), `clef-flash` (9B) and `clef-omni`. It takes up to 4 images, and the [Clef-omni post](https://blog.cloudflare.com/clef-faster-cheaper-multimodal/) gives about 150 ms median for an image. Price per million input tokens: flash $0.038, Clef $0.24, omni $0.15. Cloudflare published no game demos.
- Nobody has published results of either model playing a game from pixels or scoring wins. The existing evidence can't answer the question, so it needs a run.

## 3. Ground truth

The engine's own win/loss and points. No model makes the labels.

## 4. A fair comparison (fixed before any scored game)

- **Games:** the same evaluation as part 2 (`agents/evaluate.py`): Aliens levels 0–2, greedy, 2000 ticks counts as a loss, 5 blocks of 100 games on seeds 0–4. That's the same test games the agents and hold-shoot were scored on.
- **A move every 2 frames**, the same as the final agent.
- **Input:** Jev reads text only, so every model gets the same text state built from the engine's sprite positions (`light_obs=False` turns the per-tick observations back on), so a gap comes from the model and not the input. Clef-omni on the screen image is a separate row.
- **Prompt:** one fixed description of the game and the 3 moves (left, right, shoot). I'll check it on a dozen recorded frames from `tools.record`, then freeze it. The model is told nothing about the scored games.
- **Rows:** hold shoot (have), random (have), MCTS (have), Clef-flash text, Jev text, final agent (have). Clef 27B and Clef-omni on images are left out to save money. Add them only if flash or Jev beats holding shoot.
- **Short state:** the avatar's column, plus the nearest aliens, bombs and shields as grid positions. That's about 200 tokens, against about 500 for the whole grid.
- **Decision rule:** a model "plays" if it beats holding shoot on wins, using Welch's t-test over the 5 blocks with p < 0.05, the same test as part 2. A tie keeps the cheaper option.

## 5. Cost and time (est)

Aliens games last about 430 ticks, so about 215 calls a game, or about 107k calls per model over 500 games. At about 200 tokens a call, that's about 21M tokens per model.

| Model | Cost for 500 games (est) | Free allowance |
|---|---|---|
| Clef-flash | ~$0.80 | Workers AI gives 10,000 neurons a day, about 2.9M flash tokens, so about 70 games a day for free |
| Jev | ~$0.90 | New accounts reportedly get $5 of credit |

The order: first a free pilot of 100 Clef-flash games in 2 days of free allowance. If it doesn't come close to holding shoot (82%), stop there. Otherwise, run the full 500 games on both models, under $2 in total.

Delay only costs time. The game waits for each move, so slow models still play the same game.

## 5b. Input options, measured 26 Oct

Jev reads images too ([docs](https://docs.typesafe.ai/images): an `assets` map plus the `TypeSafe-Danger-Zone-Images: true` header, still marked not ready for production), at the same price per token as text. Images must be at least 280 pixels tall, so the 300×110 frame is scaled up to 764×280, and one call then costs 966 tokens, measured with a real frame. A text call costs about 560 tokens, measured over 2 test games, and about 360 of those are the question. 500 games is about 107k calls.

| Row | Input | 100-game pilot (est) | 500 games (est) |
|---|---|---|---|
| Jev, picked features | ship, nearest aliens and bombs, shield columns (`baselines/jev.py`) | $0.50 | $2.50 |
| Jev, whole grid | the engine's 30×11 grid as characters: everything on the screen, nothing picked out | $0.65 | $3.20 |
| Jev, image | the same frame the agents see (one frame, not 4), scaled to 764×280 | $0.90 | $4.40 |
| Clef-flash, image | the same frame | free, over ~5 days | $2.50 |
| Clef-omni, image | same | $2 | $10 |

Jev on the image is the fairest row, because it gets the same input as the agents. The whole grid is the fair text version, because it has the same information as the pixels. The picked features hand Jev a hint (nearest first). Clef rows need a Workers AI token, and past the free allowance they need Workers Paid ($5 a month).

## Results so far (26 Oct, jev-latest, text state)

Block 0 is the games the agents were scored on with --seed 0: 8 streams of 13 games, all 104 scored. Holding shoot was replayed on the same games.

| Player | Won | Points |
|---|---|---|
| Holding shoot | 84 / 104 | 36.6 |
| Jev, plain, streams 0–1 only | 15 / 26 | 43.0 |
| Jev + bomb line (`--warn`) | 83 / 104 | 48.2 |
| Final agent (its own block-0 evaluation) | 100 / 100 | 83.3 |

- All 11 losses of plain Jev were a bomb 1–2 rows above the ship. `--warn` adds one line listing the bombs within 2 columns of the ship. It was picked after seeing streams 0–1, and on unseen streams 2–7 it won 61 of 78.
- Moves take 194 ms at the median. A game costs about $0.006. $0.83 spent so far.

### Review (Fable, 26 Oct) and the free rule check

- The engine doesn't replay games exactly: holding shoot twice on the same seeds won 93 and then 89 of 104. So compare 104-game blocks, never game by game.
- The prompt said shield hits were wasted, but they score 1 point. Fixed for any later Jev run, and points include shield hits.
- Block 0 is a pilot, because `--warn` was chosen after seeing it.
- `--rule` (no model): shoot, but step away from any bomb within 2 columns and 3 rows above, using the same positions Jev gets. Over 5 blocks of 104 games it won 99.2% (blocks 100, 96, 100, 100, 100) with 42.2 points. Holding shoot's saved 5-block baseline is 82.4% with 37.3 points (Welch t = 15 on wins, 11.7 on points).
- So a 5-line rule on the same input wins far more often than Jev (99% against 80%), and Jev only does better on points (48 against 42). Jev's edge is in aiming, not in staying alive.

### State as JSON, block 0 (jev-latest, `--warn --json --v1`, 26 Oct)

The same facts and question wording as the block-0 text run, with the state sent as a JSON object (plus `can_shoot`, the text's "you cannot shoot until it lands"). Results: 78 of 104 won (75.0%), 41.3 points, 604 tokens a call. The text run on the same games: 83 of 104 (79.8%), 48.2 points, 564 tokens. The win gap could be luck (z = 0.8). Points are lower with JSON (Welch t = 4.0 per game, but games don't replay exactly). So JSON is no better, and the text state stays. $2.19 spent on scored games in total.

### jev-preview, block 1 (fixed shield wording, `--warn`)

80 of 104 won (77%), 44.0 points, 584 tokens a call, 199 ms a move. All 24 losses were deaths. On the same block, the rule won 104 of 104 (42.1 points) and holding shoot's saved run won 82% (38.2 points). That's no better than jev-latest's pilot (80%, 48.2), though the model, the prompt and the block all changed together. $1.46 spent on scored games.

## 6. How it plugs in

A new player in `baselines/` (copying `baselines/trivial.py`) that calls the model's API for each move. It goes through `agents/evaluate.py`, so its numbers line up with every row in part 2. Results go in `results/` like every other run.
