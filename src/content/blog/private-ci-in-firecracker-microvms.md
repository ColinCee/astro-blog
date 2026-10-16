---
title: "CI Faster Than GitHub's, for Free"
description: "Faster than GitHub's runner, no minutes used, one throwaway VM per job."
stat: "1.3× faster"
pubDate: "Oct 16 2026"
---
## Results

<figure class="fig">
<div class="split">
<div><p class="fig__k">Run start to done</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>26 s</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0.769"></i><b>20 s</b></div></div>
<div><p class="fig__k">Minutes used per job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>1 min</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0"></i><b>0</b></div></div>
</div>
<figcaption>From GitHub starting the run to done: about 1.3× faster, and no minutes. The same commit on both, 5 runs each, in one session.</figcaption>
</figure>

That's an Intel N100 mini PC running CI for cortex, a private Python/TypeScript project.[^perf] GitHub bills every job as at least a minute.[^rounding]

## Why not GitHub's runners

On GitHub's Free plan, private repos get 2,000 free minutes a month,[^minutes] and a few projects with small commits burn through them. A self-hosted runner fixes that, but a CI job is just code from the repo, and on a home server it runs next to everything else in the house. So each job gets its own throwaway box: the internet, and nothing else. Being faster than GitHub came later, as a bonus.

## Why Firecracker

The rule was that a job doesn't share the host's kernel, which is what Firecracker is built for.[^firecracker] Escape a container and you're on the box with Home Assistant; escape a VM and you still have to get past the hypervisor and Firecracker's jailer. That ruled out six of the eight sandboxes I tried, Docker included.

<figure class="fig">
<p class="fig__k">Own kernel</p>
<div class="dot"><span>QEMU VM</span><i style="--x:0.988"></i><b>39.5 s</b></div>
<div class="dot dot--after"><span>Firecracker</span><i style="--x:0.357"></i><b>14.3 s</b></div>
<p class="fig__k">Shares the host's kernel, so ruled out</p>
<div class="dot"><span>firejail</span><i style="--x:0.258"></i><b>10.3 s</b></div>
<div class="dot"><span>systemd-nspawn</span><i style="--x:0.260"></i><b>10.4 s</b></div>
<div class="dot"><span>systemd hardening</span><i style="--x:0.265"></i><b>10.6 s</b></div>
<div class="dot"><span>No sandbox</span><i style="--x:0.268"></i><b>10.7 s</b></div>
<div class="dot"><span>Rootless Podman</span><i style="--x:0.268"></i><b>10.7 s</b></div>
<div class="dot"><span>Docker</span><i style="--x:0.282"></i><b>11.3 s</b></div>
<div class="dot"><span>Incus container</span><i style="--x:0.475"></i><b>19 s</b></div>
<figcaption>A separate test: the same cortex check, offline with warm caches, under each sandbox, on one axis from 0 to 40 s.</figcaption>
</figure>

Of the two left, QEMU was nearly three times slower, mostly boot and disk. Firecracker costs about 4 seconds against no sandbox, 0.8 of it booting. It also means jobs can have `sudo`, which is fine in a VM you throw away.

## How it works

1. A small Python supervisor[^supervisor] polls GitHub for queued jobs every 2 seconds (unchanged answers are free).
2. It asks GitHub for a just-in-time runner:[^jit] a one-off registration that takes exactly one job, after which GitHub removes the runner.
3. It boots a fresh Firecracker VM and hands it only that registration. The GitHub token itself never leaves the PC, so a job that breaks out can't touch the repo's settings or register more runners.
4. The VM gets a copy of a cache disk with main's packages, and its image already has the tools and actions, so nothing but the code downloads.
5. The job runs, and the VM is deleted with everything it wrote.

The full design is in the runbook.[^runbook]

<figure class="fig">
<p class="fig__k">Where the 6 seconds go</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>26 s</b></div>
<div class="cmp"><span>Pickup</span><i style="--w:0.038;margin-left:96.2%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp"><span>Set up, checkout</span><i style="--w:0.038;margin-left:92.3%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp"><span>Tools, installs</span><i style="--w:0.192;margin-left:73.1%;background:var(--muted)"></i><b>&minus;5 s</b></div>
<div class="cmp"><span>Tests</span><i style="--w:0.038;margin-left:73.1%;background:var(--muted)"></i><b>+1 s</b></div>
<div class="cmp cmp--after"><span>Mini PC</span><i style="--w:0.769"></i><b>20 s</b></div>
<figcaption>The same runs as above, medians, drawn to scale. The rest, GitHub's own bookkeeping between steps, takes the same on both; the tests' extra second is noise.</figcaption>
</figure>

Almost all of it is tool setup and installs: 7 s on GitHub, 2 s from the cache disk. Pickup is a second quicker too; a VM is already booted and waiting.

## From 51 seconds to 20

<figure class="fig">
<p class="fig__k">Run start to done, each stage on today's commit</p>
<div class="cmp"><span>GitHub</span><i style="--w:0.510"></i><b>26 s</b></div>
<div class="cmp"><span>First version</span><i style="--w:1.000"></i><b>51 s</b></div>
<div class="cmp"><span>+ tools in the image</span><i style="--w:0.941"></i><b>48 s</b></div>
<div class="cmp"><span>+ one VM waiting</span><i style="--w:0.725"></i><b>37 s</b></div>
<div class="cmp"><span>+ cache disk</span><i style="--w:0.549"></i><b>28 s</b></div>
<div class="cmp cmp--after"><span>+ front-load the rest</span><i style="--w:0.392"></i><b>20 s</b></div>
<figcaption>Every stage rebuilt and run in one session alongside GitHub, 5 runs each. The isolation is identical in every stage; only the speed changes differ.</figcaption>
</figure>

- Node, uv and Python baked into the VM image, so the tools stop downloading per job: 3 s.
- One VM kept booted and waiting, for 450 MB of RAM: 11 s, the biggest single step.
- A cache disk with main's packages, instead of restoring GitHub's caches: 9 s.
- The rest front-loaded: the actions unpacked in the image and `setup-uv` and `setup-node` dropped, leaving one install step that copies `node_modules` from the disk when the lockfile matches and runs `uv sync --no-install-project`: 8 s.

I also sped up cortex's own tests (TypeScript 7's compiler, slow checks first), but every bar here runs the same commit, GitHub included, so that's on both sides. The biggest part left is the tests.

## What didn't help

### More CPUs

4 vCPUs instead of 2 changed nothing; a few slow tests set the time.

### Snapshots

I built it properly: a snapshot taken right after a real build of main, restored as the waiting VM in 11 to 15 ms. It saved about a second, all of it `uv sync`, which `--no-install-project` now gets anyway. Boot was never the slow part, each snapshot needs a 4.1 GB memory file, and every restored VM starts with the same random-number state, which Firecracker's docs warn about.[^snapshots]

### A second waiting VM

The second of two simultaneous jobs finished 4 seconds sooner, but the average per job didn't move. Not worth another 440 MB of RAM.

### Smaller tweaks

Mounting `node_modules` instead of copying it, reading packages into memory ahead of time, turning off CPU mitigations and tuning pytest workers were all either noise or slower.

## Limitations

This is fast because it's tuned for one repo, not because self-hosting is fast.

- Prewarming is per repo. A new language, action or lockfile means rebuilding the image or the cache disk.
- A changed lockfile falls back to a normal install from the cached packages, and every green push to main has to upload a fresh cache.
- Only one repo gets the waiting VM. Others boot first, about 11 s slower.
- It's one small machine: two jobs at a time, Linux only, no failover.
- Kernel and runner upgrades are mine to do.
- One repo, 5 runs per setup, whole-second timestamps. GitHub alone varied from 24 s to 32 s.

[^perf]: Every number in this post: [CI runner performance](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md), in my homelab repo.
[^rounding]: GitHub, [Actions minute multipliers](https://docs.github.com/en/billing/reference/actions-minute-multipliers): partial minutes are rounded up per job.
[^minutes]: GitHub, [billing for GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
[^firecracker]: [Firecracker](https://firecracker-microvm.github.io/).
[^supervisor]: The supervisor: [`scripts/ci_supervisor.py`](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py).
[^jit]: GitHub, [ephemeral runners for autoscaling](https://docs.github.com/en/actions/reference/runners/self-hosted-runners): just-in-time runners are de-registered after one job.
[^runbook]: [CI runner runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).
[^snapshots]: Firecracker, [random for clones](https://github.com/firecracker-microvm/firecracker/blob/main/docs/snapshotting/random-for-clones.md).
