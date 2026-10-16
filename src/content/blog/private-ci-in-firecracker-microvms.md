---
title: "Free CI at Home, Faster Than GitHub's"
shortTitle: "Free CI at home"
description: "Faster than GitHub's runner, no minutes used, one throwaway VM per job."
stat: "0 min"
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
<figcaption>The same job on the same commit, 5 runs each interleaved, Python 3.15 on both. GitHub rounds each job up to a minute; private repos get 2,000 free a month.</figcaption>
</figure>

Measured on an Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. Every number is in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## Why not GitHub's runners

Private repos get 2,000 free minutes a month on GitHub's runners, and a few projects with small commits use them up. A self-hosted runner fixes that, but a CI job is just code from the repo, and on a home server it runs next to everything else: Home Assistant, my other services and the home network.

So I wanted each job in its own throwaway box that can reach the internet and nothing else. Being faster than GitHub came later, as a bonus.

## Why Firecracker

The main requirement was that a job shouldn't share the host's kernel: escaping a VM still leaves a hypervisor in the way. That ruled out seven of the nine sandboxes I tried, including Docker, Podman, firejail and systemd hardening.

<figure class="fig">
<p class="fig__k">Job time</p>
<div class="cmp"><span>No sandbox</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<div class="cmp"><span>Docker</span><i style="--w:0.286"></i><b>11.3 s</b></div>
<div class="cmp cmp--after"><span>Firecracker</span><i style="--w:0.362"></i><b>14.3 s</b></div>
<div class="cmp"><span>QEMU VM</span><i style="--w:1"></i><b>39.5 s</b></div>
<p class="fig__k">Start-up time</p>
<div class="cmp"><span>No sandbox</span><i style="--w:0.010"></i><b>0.1 s</b></div>
<div class="cmp"><span>Docker</span><i style="--w:0.031"></i><b>0.3 s</b></div>
<div class="cmp cmp--after"><span>Firecracker</span><i style="--w:0.082"></i><b>0.8 s</b></div>
<div class="cmp"><span>QEMU VM</span><i style="--w:1"></i><b>9.8 s</b></div>
<figcaption>Same job, offline with warm caches. Docker shares the host's kernel and is here for comparison. Each group drawn to its own scale.</figcaption>
</figure>

Docker is about 3 seconds faster, so why not use it? Because a container shares the kernel with everything else on the PC, including Home Assistant and my other services. One kernel bug or a misconfigured container is then a way onto the host. CI jobs also tend to want root (the VMs give them passwordless `sudo`), which is fine in a throwaway VM and a lot riskier in a container.

Of the two VMs left, QEMU was almost three times slower than running with no sandbox, mostly in boot and disk. Firecracker adds about 4 seconds, of which 0.8 is booting and the rest is running on virtual CPUs.

A sandbox doesn't keep a job off the network by itself, so the VMs also have their own firewall rules.

## How it works

1. A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) on the PC checks GitHub for queued jobs every 2 seconds. GitHub doesn't count a request whose answer hasn't changed, so polling this often is free.
2. For each job, it asks GitHub for a just-in-time runner registration, which is only valid for that one job.
3. It boots a fresh Firecracker VM and passes the registration in through the metadata service. The GitHub token itself stays on the PC.
4. The VM gets its own copy of a cache disk holding main's packages, and its image already has the tools and the actions the workflow uses, so nothing is downloaded or restored per job.
5. The runner in the VM picks up the job. When the job finishes, the VM is deleted along with everything it wrote.

<figure class="fig">
<p class="fig__k">From GitHub to the mini PC</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>31 s</b></div>
<div class="cmp"><span>Queued, picked up</span><i style="--w:0.065;margin-left:93.5%;background:var(--muted)"></i><b>&minus;2 s</b></div>
<div class="cmp"><span>Install</span><i style="--w:0.226;margin-left:71.0%;background:var(--muted)"></i><b>&minus;7 s</b></div>
<div class="cmp"><span>Tests</span><i style="--w:0.032;margin-left:67.7%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp"><span>Bookkeeping</span><i style="--w:0.032;margin-left:64.5%;background:var(--muted)"></i><b>&minus;1 s</b></div>
<div class="cmp cmp--after"><span>Mini PC</span><i style="--w:0.645"></i><b>20 s</b></div>
<figcaption>One push each, same commit, medians of 5 runs, drawn to scale. Start at GitHub's 31 s and take off what each step saves; set up and checkout take 1 s on both. GitHub's install is setup-uv, setup-node, uv sync and npm ci; the mini PC's comes from the cache disk. Bookkeeping is the rest of each job, between and after the steps.</figcaption>
</figure>

Almost all of the 11 seconds is the install: 9 s on GitHub, 2 s here, because the packages are already on the cache disk. Pickup is 2 s quicker too, because there's always one VM booted and waiting. When a push to main passes, it uploads a fresh cache, about 20 seconds more for that push, and the runner rebuilds the disk from it. The VMs can reach the internet, but not the PC, the rest of my home network or each other. The full design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

## From 52 seconds to 20

<figure class="fig">
<p class="fig__k">Run created to job done</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>52 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:0.846"></i><b>44 s</b></div>
<div class="cmp"><span>One VM kept warm</span><i style="--w:0.712"></i><b>37 s</b></div>
<div class="cmp"><span>Cache disk</span><i style="--w:0.635"></i><b>33 s</b></div>
<div class="cmp"><span>Front-load the rest</span><i style="--w:0.404"></i><b>21 s</b></div>
<div class="cmp cmp--after"><span>Faster type check</span><i style="--w:0.385"></i><b>20 s</b></div>
<figcaption>Within a day, measured on real pushes.</figcaption>
</figure>

The big steps, in order:

- Baking Node, uv and Python into the VM image, so nothing downloads per job. I cut polling from every 10 seconds to every 2 at the same time.
- Keeping one VM booted and waiting. That saved about 8 seconds, mostly the GitHub runner starting up rather than the VM booting. The waiting VM uses about 450 MB of RAM.
- A cache disk with main's packages, so the job stops restoring GitHub's caches (6 s down to 1).

Then I moved everything else I could to before the job starts:

- The actions the workflow uses are unpacked in the VM image, so "Set up job" stopped downloading them: 3 s to 1.
- `setup-uv` and `setup-node` are gone, because the tools are already on the job's path.
- `node_modules` is copied from the cache disk when the lockfile matches main's, instead of `npm ci` reinstalling it.
- `uv sync --no-install-project` stops cortex being rebuilt into the environment on every job.
- The slow checks (`tsc`, `ty`, `ruff`) start first, so they overlap the other tests instead of finishing last, which saved about a second.

The last change was in cortex itself: TypeScript 7's native compiler for the type check, with the same strict settings, which took the check from 3.6 s to 1.3 s. Code changes like this and the slow checks first help GitHub's runner too, so the comparison at the top runs the same commit on both. GitHub went from 35 s to 31 s with them.

What's left is mostly the tests, so going lower means faster tests or a faster CPU.

## What didn't help

### More CPUs

Giving a job 4 vCPUs instead of 2 made no difference. Half the tests finish in under 2 seconds, and the time is set by a few slow ones.

### Snapshots

I built it properly: a snapshot of a VM taken right after a real build of main, with the checkout, installs, actions and warm memory, restored as the waiting VM in 11 to 15 ms with fresh randomness and a fresh registration.

- It saved about a second, and all of it was `uv sync`, which `--no-install-project` now gets without a snapshot.
- Boot was never the slow part: the waiting VM already boots before the job arrives.
- It needs a 4.1 GB memory file per snapshot.

<figure class="fig">
<p class="fig__k">Whole job, earlier commit</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>30 s</b></div>
<div class="cmp"><span>Mini PC + disk</span><i style="--w:0.933"></i><b>28 s</b></div>
<div class="cmp"><span>Mini PC + snapshot</span><i style="--w:0.933"></i><b>28 s</b></div>
<p class="fig__k">Whole job, final commit</p>
<div class="cmp"><span>GitHub</span><i style="--w:0.867"></i><b>26 s</b></div>
<div class="cmp cmp--after"><span>Mini PC, final</span><i style="--w:0.567"></i><b>17 s</b></div>
<figcaption>Median of 5 runs each; each group compares the same cortex commit on both sides. The snapshot row is from an earlier round, against a cache disk control of 29 s.</figcaption>
</figure>

### A second waiting VM

With two pushes at once, the second job no longer waits to boot: the last one finished at 29 s instead of 33. But the two jobs then share four cores, so the average per job didn't change, and it holds another 440 MB of RAM.

### Smaller tweaks

- Mounting `node_modules` from the cache disk instead of copying it: the install got a second faster, but the tests got a second slower, because copying had also loaded the files into memory.
- Reading the packages into memory while the VM waits: the tests got 2 to 3 seconds slower, because the reading competed with the job.
- Turning off CPU security mitigations in the VM, and different pytest worker settings: no change beyond noise.

## Things that surprised me

The first cache disk was attached and never used. It needed OverlayFS, which the VM's kernel doesn't have, so every "warm" job quietly started from an empty cache. The timings looked fine; only the job log, with `uv` downloading packages it should already have had, gave it away.

My first snapshot benchmark looked 20 times faster. Every run after the first was failing in under a second, and only checking each step's exit code caught it.

Running CI on Linux found two real bugs in cortex: a test that faked today's date in a way Python 3.15 no longer reads, and tests that hung for 11 minutes on GitHub's runner because faking `time.sleep` also faked the sleep `subprocess` waits with.

## Limitations

This is fast because it's tuned to one repo, not because self-hosting is fast by default. A new project would start near the 52-second first version and need the same work:

- Prewarming is per repo. The tools in the VM image, the actions unpacked in it and the cache disk are all built for cortex's workflow. A different language, a new action or a changed lockfile needs them rebuilt.
- Cache misses fall back to the slow path. A push that changes the lockfile installs from scratch, and a green push to main pays about 20 seconds to upload a fresh cache.
- Only one repo gets the waiting VM. Another repo boots a VM first, about 8 s slower, and the second job in a burst of two waited 11 to 15 s to start.
- It's one small machine. Two jobs at a time, Linux only, and no failover. cortex's Windows checks still run on GitHub.
- It's mine to maintain. Kernel and runner upgrades mean rebuilding the image and re-running the security checks.
- The numbers are narrow. One repo, 5 runs per setup, whole-second timestamps from GitHub. GitHub's own times varied from 26 s to 41 s.
