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
<div><p class="fig__k">Minutes billed per job</p>
<div class="cmp" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>GitHub</span><i style="--w:1"></i><b>1 min</b></div>
<div class="cmp cmp--after" style="grid-template-columns:4.5rem minmax(0,1fr) 3.5rem"><span>Mini PC</span><i style="--w:0"></i><b>0</b></div></div>
</div>
<figcaption>Median of 5 runs, Python 3.15 on both. GitHub rounds each job up to a minute; private repos get 2,000 free a month.</figcaption>
</figure>

Measured on an Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. Every number is in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## How it works

1. **Watch.** A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) asks GitHub every 2 seconds whether a job is waiting. That's free: GitHub doesn't count a repeat question with the same answer.
2. **Get a one-job pass.** GitHub hands out a runner registration that works for that job and nothing else.
3. **Boot a fresh VM.** The pass goes in through Firecracker's metadata service. My GitHub token never leaves the PC.
4. **Run, then bin it.** The job runs, and the VM is deleted along with everything it wrote, however the job ends.

<figure class="fig">
<p class="fig__k">One push</p>
<div class="stack"><span style="--w:3"></span><span style="--w:1"></span><span class="is-data" style="--w:33"></span></div>
<ul class="legend"><li><b>3 s</b> GitHub queues it</li><li><b>1 s</b> a VM picks it up</li><li class="is-data"><b>33 s</b> the job runs</li></ul>
</figure>

Pickup takes a second because one VM is always booted and waiting. The VMs can reach the internet, but not the PC, my home network or each other. The full design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

## Why Firecracker

I had one rule: a job doesn't share the host's kernel. Break out of a container and you're on the host; break out of a VM and there's still a hypervisor in the way. That ruled out seven of the nine sandboxes I tried, from Docker and Podman to firejail and systemd hardening.

<figure class="fig">
<p class="fig__k">Same job, offline</p>
<div class="cmp"><span>No sandbox</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<div class="cmp cmp--after"><span>Firecracker</span><i style="--w:0.362"></i><b>14.3 s</b></div>
<div class="cmp"><span>QEMU VM</span><i style="--w:1"></i><b>39.5 s</b></div>
</figure>

Of the two VMs left, QEMU was almost three times slower than no sandbox, mostly booting and reading disk. Firecracker adds about 4 seconds: 0.8 to boot, the rest from running on virtual CPUs.

The sandbox doesn't sort out the network by itself, so the VMs get firewall rules of their own.

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

- **Tools in the image.** Node, uv and Python come baked into the VM, so nothing downloads per job: `setup-node` went from 7 s to 1 s and `uv sync` from 3 s to 1 s. I also cut polling from every 10 seconds to every 2.
- **One VM kept warm.** Saves about 8 seconds, and it's mostly the GitHub runner starting up, not the VM booting. The waiting VM costs about 450 MB of RAM.

## Dead ends

- **More CPUs.** 4 vCPUs instead of 2 made no difference. Half the tests finish in under 2 seconds; a few slow ones decide the time.
- **Snapshots.** Boot is already under a second, and Firecracker's docs warn against restoring the same snapshot for every job.

## Surprises

- **An out-of-memory job hung its VM for an hour.** systemd had stopped the task that was meant to end the VM. Now the VM reboots whenever its task ends, which takes Firecracker down with it.
- **GitHub only saves a cache when the job passes.** The package caches did nothing until the suite went green on Linux.
- **The VM found a bug.** It runs Python 3.15 and my PC 3.13. A test faked "today" by replacing `time.time`, which `date.today()` stopped using in 3.15. It would have broken at my next upgrade.
- **GitHub's runner found another.** The suite hung there for 11 minutes. Tests that fake `time.sleep` were also faking the sleep that `subprocess` waits with on Linux before Python 3.15.

## Why not just use GitHub's runners

Speed isn't the reason: they're about level. It's the minutes and the box. A few projects with small commits use up 2,000 minutes a month, and this PC gets through roughly a month of them every 5 hours at 378 jobs an hour. And every job runs somewhere I control, kept away from everything else on my home network.
