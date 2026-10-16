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
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>35 s</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0.6"></i><b>21 s</b></div></div>
<div><p class="fig__k">Minutes used per job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>1 min</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0"></i><b>0</b></div></div>
</div>
<figcaption>The same job, 5 runs each in the same session, Python 3.15 on both. GitHub rounds each job up to a minute; private repos get 2,000 free a month.</figcaption>
</figure>

Measured on an Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. Every number is in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## How it works

1. A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) on the PC checks GitHub for queued jobs every 2 seconds. GitHub doesn't count a request whose answer hasn't changed, so polling this often is free.
2. For each job, it asks GitHub for a just-in-time runner registration, which is only valid for that one job.
3. It boots a fresh Firecracker VM and passes the registration in through the metadata service. The GitHub token itself stays on the PC.
4. The VM gets its own copy of a cache disk holding main's packages, and its image already has the tools and the actions the workflow uses, so nothing is downloaded or restored per job.
5. The runner in the VM picks up the job. When the job finishes, the VM is deleted along with everything it wrote.

<figure class="fig">
<p class="fig__k">One push</p>
<div class="stack"><span style="--w:3"></span><span class="is-data" style="--w:18"></span></div>
<ul class="legend"><li><b>3 s</b> GitHub queues it and a VM picks it up</li><li class="is-data"><b>18 s</b> the job runs</li></ul>
<figcaption>Run created to done, median of 5 runs: 21 s.</figcaption>
</figure>

Pickup is quick because there's always one VM booted and waiting. When a push to main passes, it uploads a fresh cache, about 20 seconds more for that push, and the runner rebuilds the disk from it. The VMs can reach the internet, but not the PC, the rest of my home network or each other. The full design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

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

## From 52 seconds to 21

<figure class="fig">
<p class="fig__k">Run created to job done</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>52 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:0.846"></i><b>44 s</b></div>
<div class="cmp"><span>One VM kept warm</span><i style="--w:0.712"></i><b>37 s</b></div>
<div class="cmp"><span>Cache disk</span><i style="--w:0.635"></i><b>33 s</b></div>
<div class="cmp cmp--after"><span>Front-load the rest</span><i style="--w:0.404"></i><b>21 s</b></div>
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

What's left of the 18 s job is about 1 s of setup, 1 s of checkout, 2 s of installs and 9 to 10 s of tests, mostly the TypeScript compiler and pytest starting up. Going lower means faster tests or a faster CPU.

## What didn't help

### More CPUs

Giving a job 4 vCPUs instead of 2 made no difference. Half the tests finish in under 2 seconds, and the time is set by a few slow ones.

### Snapshots

I built it properly: a snapshot of a VM taken right after a real build of main, with the checkout, installs, actions and warm memory, restored as the waiting VM in 11 to 15 ms with fresh randomness and a fresh registration.

- It saved about a second, and all of it was `uv sync`, which `--no-install-project` now gets without a snapshot.
- Boot was never the slow part: the waiting VM already boots before the job arrives.
- It needs a 4.1 GB memory file per snapshot.

<figure class="fig">
<p class="fig__k">Whole job</p>
<div class="cmp"><span>GitHub</span><i style="--w:1"></i><b>30 s</b></div>
<div class="cmp"><span>Mini PC + disk</span><i style="--w:0.933"></i><b>28 s</b></div>
<div class="cmp"><span>Mini PC + snapshot</span><i style="--w:0.933"></i><b>28 s</b></div>
<div class="cmp cmp--after"><span>Mini PC, final</span><i style="--w:0.6"></i><b>18 s</b></div>
<figcaption>Median of 5 runs each, same session. The snapshot row is from an earlier round, against a cache disk control of 29 s.</figcaption>
</figure>

### A second waiting VM

With two pushes at once, the second job no longer waits to boot: the last one finished at 29 s instead of 33. But the two jobs then share four cores, so the average per job didn't change, and it holds another 440 MB of RAM.

### Linking `node_modules` instead of copying it

Faster to set up, but the TypeScript check went from 3.6 s to 8.4. Its incremental build info is stored relative to where it lives, and a link moves it.

## Things that surprised me

A job that ran out of memory hung its VM for an hour. systemd had stopped the task that was supposed to shut the VM down. Now the VM reboots whenever its task ends, which also stops Firecracker.

`sudo` hid Node from the jobs. The VM starts the runner with `sudo -u runner`, which resets `PATH`, so the TypeScript test failed with "node is not on PATH". The runner is now started with that `PATH` explicitly.

The first cache disk was attached and never used. Its throwaway write layer needed OverlayFS, which Ubuntu's kernel builds as a module, and the VM has no modules, so every "warm" job started from an empty cache while the timings looked normal. Only the job's own log, with `uv` downloading packages it should already have had, gave it away. Each VM now gets a private copy of the disk instead.

My first snapshot benchmark looked 20 times faster, and was wrong. I'd copied a VM's disk while it was still mounted, so every run after it failed in under a second and the timings looked brilliant. Only checking each step's exit code caught it.

Running CI on a second platform found a real bug. The VM runs Python 3.15 and my PC runs 3.13. One test faked today's date by replacing `time.time`, which `date.today()` no longer reads in 3.15, so it would have broken the next time I upgraded.

GitHub's runner found another one. The suite hung there for 11 minutes, because tests that fake `time.sleep` were also faking the sleep `subprocess` uses to wait on Linux before Python 3.15.

## Why not just use GitHub's runners

Speed is now a bonus rather than the reason: 21 s from push to done against GitHub's 35. It's really the minutes and the isolation. A few projects with small commits use up 2,000 minutes a month, and every job here runs somewhere I control, away from everything else on my home network.
