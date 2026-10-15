---
title: "Free CI at Home, as Fast as GitHub's"
shortTitle: "Free CI at home"
description: "As fast as GitHub's runner, no minutes used, one throwaway VM per job."
stat: "0 min"
pubDate: "Oct 15 2026"
---
## Results

<figure class="fig">
<div class="split">
<div><p class="fig__k">Same job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:0.944"></i><b>34 s</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:1"></i><b>36 s</b></div></div>
<div><p class="fig__k">Minutes used per job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>1 min</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0"></i><b>0</b></div></div>
</div>
<figcaption>Median of 5 runs, Python 3.15 on both. GitHub rounds each job up to a minute; private repos get 2,000 free a month.</figcaption>
</figure>

Measured on an Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. Every number is in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## How it works

1. A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) on the PC checks GitHub for queued jobs every 2 seconds. GitHub doesn't count a request whose answer hasn't changed, so polling this often is free.
2. For each job, it asks GitHub for a just-in-time runner registration, which is only valid for that one job.
3. It boots a fresh Firecracker VM and passes the registration in through the metadata service. The GitHub token itself stays on the PC.
4. The runner in the VM picks up the job. When the job finishes, the VM is deleted along with everything it wrote.

<figure class="fig">
<p class="fig__k">One push</p>
<div class="stack"><span style="--w:3"></span><span style="--w:1"></span><span class="is-data" style="--w:33"></span></div>
<ul class="legend"><li><b>3 s</b> GitHub queues it</li><li><b>1 s</b> a VM picks it up</li><li class="is-data"><b>33 s</b> the job runs</li></ul>
<figcaption>A real push before the benchmark: 37 s end to end.</figcaption>
</figure>

Pickup only takes a second because there's always one VM booted and waiting. The VMs can reach the internet, but not the PC, the rest of my home network or each other. The full design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

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

## Speed-ups

<figure class="fig">
<p class="fig__k">Run created to job running</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>12 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:1"></i><b>12 s</b></div>
<div class="cmp cmp--after"><span>One VM kept warm</span><i style="--w:0.333"></i><b>3 to 4 s</b></div>
<p class="fig__k">Run created to job done</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>52 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:0.846"></i><b>44 s</b></div>
<div class="cmp cmp--after"><span>One VM kept warm</span><i style="--w:0.712"></i><b>37 s</b></div>
<figcaption>Each group drawn to its own scale.</figcaption>
</figure>

Two changes made most of the difference. The first was baking Node, uv and Python into the VM image, so nothing is downloaded per job: `setup-node` went from 7 s to 1 s and `uv sync` from 3 s to 1 s. I cut polling from every 10 seconds to every 2 at the same time.

The second was keeping one VM booted and waiting. That saved about 8 seconds, and most of it turned out to be the GitHub runner starting up rather than the VM booting. The waiting VM uses about 450 MB of RAM.

## What didn't help

Giving a job 4 vCPUs instead of 2 made no difference. Half the tests finish in under 2 seconds, and the time is set by a few slow ones.

Snapshots were the obvious next idea: snapshot a VM just after a build of main and restore it for every job. Restoring really is fast, 13 to 113 ms, but boot was never the slow part, because the waiting VM already hides it. Against a plain disk holding main's caches and installs, the snapshot saved about 0.3 s of work (16.9 s against 17.2 s). It also takes 30 s to make, needs a 1.2 GB memory file per slot, and every restored VM starts with identical memory, random-number state included, which Firecracker's own docs warn against.

The part worth having is the warm disk on its own: main's caches and installs on a read-only disk take a job from about 21.5 s of work to about 17 s.

## Things that surprised me

A job that ran out of memory hung its VM for an hour. systemd had stopped the task that was supposed to shut the VM down. Now the VM reboots whenever its task ends, which also stops Firecracker.

My first snapshot benchmark looked 20 times faster, and was wrong. I'd copied a VM's disk while it was still mounted, so every run after it failed in under a second and the timings looked brilliant. Only checking each step's exit code caught it.

GitHub only saves a cache when the job passes, so the package caches did nothing until the suite was green on Linux.

Running CI on a second platform found a real bug. The VM runs Python 3.15 and my PC runs 3.13. One test faked today's date by replacing `time.time`, which `date.today()` no longer reads in 3.15, so it would have broken the next time I upgraded.

GitHub's runner found another one. The suite hung there for 11 minutes, because tests that fake `time.sleep` were also faking the sleep `subprocess` uses to wait on Linux before Python 3.15.

## Why not just use GitHub's runners

It isn't about speed, since they're about level. It's the minutes and the isolation. A few projects with small commits use up 2,000 minutes a month, and this PC gets through roughly a month of them every 5 hours at 378 jobs an hour. Every job also runs somewhere I control, away from everything else on my home network.
