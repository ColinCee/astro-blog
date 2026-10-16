---
title: "CI Faster Than GitHub's, for Free"
shortTitle: "Faster than GitHub, for free"
description: "Faster than GitHub's runner, no minutes used, one throwaway VM per job."
stat: "1.5× faster"
pubDate: "Oct 15 2026"
---
## Results

<figure class="fig">
<div class="split">
<div><p class="fig__k">Push to done</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>31 s</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0.645"></i><b>20 s</b></div></div>
<div><p class="fig__k">Minutes used per job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>1 min</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0"></i><b>0</b></div></div>
</div>
<figcaption>About 1.5× faster, 35% less time, and no minutes. The same commit on both, 5 runs each, Python 3.15; GitHub rounds every job up to a minute.</figcaption>
</figure>

That's an Intel N100 mini PC running CI for cortex, a private Python/TypeScript project. Every number is in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## Why not GitHub's runners

Private repos get 2,000 free GitHub minutes a month, and a few projects with small commits burn through them. A self-hosted runner fixes that, but a CI job is just code from the repo, and on a home server it runs next to everything else in the house. So each job gets its own throwaway box: the internet, and nothing else. Being faster than GitHub came later, as a bonus.

## Why Firecracker

The rule was that a job doesn't share the host's kernel. Escape a container and you're on the box with Home Assistant; escape a VM and there's still a hypervisor in the way. That ruled out seven of the nine sandboxes I tried, Docker included.

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
<figcaption>The same job under each sandbox, on one axis from 0 to 40 s.</figcaption>
</figure>

Of the two left, QEMU was nearly three times slower, mostly boot and disk. Firecracker costs about 4 seconds, 0.8 of it booting. It also means jobs can have `sudo`, which is fine in a VM you throw away.

## How it works

1. A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) polls GitHub for queued jobs every 2 seconds (unchanged answers are free).
2. It gets a runner registration from GitHub that works for that one job only.
3. It boots a fresh Firecracker VM and hands it the registration. The GitHub token never leaves the PC.
4. The VM gets a copy of a cache disk with main's packages, and its image already has the tools and actions, so nothing downloads.
5. The job runs, and the VM is deleted with everything it wrote.

<figure class="fig">
<p class="fig__k">From GitHub to the mini PC</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>31 s</b></div>
<div class="cmp"><span>Queued, picked up</span><i style="--w:0.065;margin-left:93.5%;background:var(--muted)"></i><b>&minus;2 s</b></div>
<div class="cmp"><span>Install</span><i style="--w:0.226;margin-left:71.0%;background:var(--muted)"></i><b>&minus;7 s</b></div>
<div class="cmp"><span>Tests</span><i style="--w:0.032;margin-left:67.7%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp"><span>Bookkeeping</span><i style="--w:0.032;margin-left:64.5%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp cmp--after"><span>Mini PC</span><i style="--w:0.645"></i><b>20 s</b></div>
<figcaption>One push each, same commit, drawn to scale. Set up and checkout take 1 s on both.</figcaption>
</figure>

The 11 seconds is almost all install: 9 s on GitHub, 2 s from the cache disk. Pickup is 2 s quicker too, because a VM is always booted and waiting.

## From 52 seconds to 20

<figure class="fig">
<p class="fig__k">Run created to job done</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>52 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:0.846"></i><b>44 s</b></div>
<div class="cmp"><span>One VM kept warm</span><i style="--w:0.712"></i><b>37 s</b></div>
<div class="cmp"><span>Cache disk</span><i style="--w:0.635"></i><b>33 s</b></div>
<div class="cmp"><span>Front-load the rest</span><i style="--w:0.404"></i><b>21 s</b></div>
<div class="cmp cmp--after"><span>Faster type check</span><i style="--w:0.385"></i><b>20 s</b></div>
<figcaption>Real pushes, all within a day: 2.6× faster than the first version.</figcaption>
</figure>

- Node, uv and Python baked into the VM image, so nothing downloads per job.
- One VM kept booted and waiting. That saved about 8 seconds, mostly the GitHub runner starting up, for 450 MB of RAM.
- A cache disk with main's packages, so restoring GitHub's caches went from 6 s to 1.
- Then everything else moved to before the job starts: the actions unpacked in the image, `setup-uv` and `setup-node` dropped, `node_modules` copied from the disk when the lockfile matches, `uv sync --no-install-project`, and the slow checks started first.
- Last, TypeScript 7's native compiler took the type check from 3.6 s to 1.3 s.

Code changes like those last two speed up GitHub too, which is why the comparison at the top runs the same commit on both: GitHub went from 35 s to 31 s with them. What's left is mostly the tests.

## What didn't help

### More CPUs

4 vCPUs instead of 2 changed nothing; a few slow tests set the time.

### Snapshots

I built it properly: a snapshot taken right after a real build of main, restored as the waiting VM in 11 to 15 ms. It saved about a second, all of it `uv sync`, which `--no-install-project` now gets anyway. Boot was never the slow part, and each snapshot needs a 4.1 GB memory file.

<figure class="fig">
<p class="fig__k">Whole job, same commit</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>30 s</b></div>
<div class="cmp"><span>Mini PC + disk</span><i style="--w:0.933"></i><b>28 s</b></div>
<div class="cmp cmp--after"><span>Mini PC + snapshot</span><i style="--w:0.933"></i><b>28 s</b></div>
<figcaption>An earlier commit, before the last tweaks. The snapshot matched the cache disk.</figcaption>
</figure>

### A second waiting VM

The second of two simultaneous jobs finished 4 seconds sooner, but both then shared four cores, so the average didn't move. Not worth another 440 MB of RAM.

### Smaller tweaks

Mounting `node_modules` instead of copying it, reading packages into memory ahead of time, turning off CPU mitigations and tuning pytest workers were all either noise or slower.

## Limitations

This is fast because it's tuned for one repo, not because self-hosting is fast. A new project starts near the 52-second version.

- Prewarming is per repo. A new language, action or lockfile means rebuilding the image or the cache disk.
- A changed lockfile installs from scratch, and a green push to main spends about 20 seconds uploading a fresh cache.
- Only one repo gets the waiting VM. Others boot first, about 8 s slower.
- It's one small machine: two jobs at a time, Linux only, no failover.
- Kernel and runner upgrades are mine to do.
- One repo, 5 runs per setup, whole-second timestamps. GitHub alone varied from 26 s to 41 s.
