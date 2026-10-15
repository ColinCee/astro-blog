---
title: "Free CI at Home, as Fast as GitHub's"
shortTitle: "Free CI at home"
description: "As fast as GitHub's runner, no minutes used, one throwaway VM per job."
stat: "0 min"
pubDate: "Oct 15 2026"
---
## Results

<figure class="fig">
<p class="fig__k">The whole CI job, median of 5 runs</p>
<div class="cmp"><span>GitHub ubuntu-latest</span><i style="--w:0.944"></i><b>34 s</b></div>
<div class="cmp cmp--after"><span>Mini PC, in a VM</span><i style="--w:1"></i><b>36 s</b></div>
<p class="fig__k">One push, start to finish</p>
<div class="stack"><span style="--w:3"></span><span style="--w:1"></span><span class="is-data" style="--w:33"></span></div>
<ul class="legend"><li><b>~3 s</b> GitHub creates the run</li><li><b>~1 s</b> a waiting VM takes the job</li><li class="is-data"><b>33 s</b> the job runs, 13 s of it tests</li></ul>
<p class="fig__k">The same job, three ways</p>
<div class="cmp"><span>No sandbox</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<div class="cmp cmp--after"><span>Firecracker VM</span><i style="--w:0.362"></i><b>14.3 s</b></div>
<div class="cmp"><span>Full QEMU VM</span><i style="--w:1"></i><b>39.5 s</b></div>
<figcaption>Top: the same job and Python on both, one at a time. Middle: about 4 seconds from push to running job. Bottom: the job alone, offline with warm caches, so the sandbox is the only difference. Each part drawn to its own scale.</figcaption>
</figure>

Measured on one Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. Full numbers are in the [performance write-up](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## How it works

1. A Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) on the PC polls GitHub every 2 seconds for queued jobs. Unchanged answers don't count against the rate limit, so this is free.
2. For each job it asks GitHub for a just-in-time runner registration that works for exactly one job.
3. It boots a fresh microVM and passes the registration in through Firecracker's metadata service. The GitHub token never enters a VM.
4. The runner inside takes the job. When the job ends, however it ends, the VM and everything it wrote are deleted.

VMs reach the internet but not the PC, the home network or each other, and nothing can connect in. One VM is kept booted and waiting so the next job doesn't wait for a boot. The full design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

## Why Firecracker

The rule was that a job must not share the host's kernel. A container escape lands on the host; a VM escape has to get through a hypervisor first. That ruled out seven of the nine sandboxes I measured before speed came into it: no sandbox, systemd hardening, firejail, nspawn, Docker and rootless Podman (10.3 to 11.3 s), and an Incus container (19.0 s).

Of the two left, the QEMU VM was almost three times slower than no sandbox, mostly in boot and disk. Firecracker costs about 4 seconds: 0.8 to boot, the rest from running on virtual CPUs.

The network is a separate problem. Most of the containers could reach the home network without a firewall, and so could a VM, so the VMs get firewall rules of their own.

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
<figcaption>A real push to cortex at each stage. Each group is drawn to its own scale; the 3 to 4 s bar at 4 s.</figcaption>
</figure>

- **Tools in the image.** Node, uv and Python ship in the VM image, so nothing downloads per job. `setup-node` went from 7 s to 1 s and `uv sync` from 3 s to 1 s. Polling also went from every 10 seconds to every 2.
- **One VM kept warm.** This saves about 8 seconds, almost all of it the GitHub runner starting up, not the VM booting. It costs about 450 MB of RAM while it waits.


## Dead ends

- **4 vCPUs instead of 2.** No faster. Half the tests finish in under 2 seconds, and a few slow ones decide the time.
- **Firecracker snapshots.** Boot is already under a second, and restoring the same snapshot for every job is unsafe, as Firecracker's own docs say.

## Surprises

- **An out-of-memory job hung its VM for an hour.** systemd had stopped the task meant to end the VM. Now the VM reboots, which ends Firecracker, whenever its task ends.
- **GitHub only saves a cache when the job passes.** The package caches did nothing until the suite was green on Linux.
- **A second platform found a real bug.** The VM runs Python 3.15 and the PC 3.13. A test faked "today" by replacing `time.time`, which `date.today()` stopped reading in 3.15, so it would have broken at my next upgrade.
- **GitHub's runner found another.** The suite hung there for 11 minutes. Tests that fake `time.sleep` also faked the sleep that `subprocess` waits with on Linux before Python 3.15, so one test lost its steps and the next spun for ever.

## Why not GitHub's runners

Private repos get 2,000 free minutes a month, and a few projects with small commits use that up. Running two VMs at once, this PC gets through 378 jobs an hour, roughly a month of those minutes every 5 hours.

GitHub's own `ubuntu-latest` runner is about level: 34 s against 36 s for the same job, Python 3.15 on both, over five runs each. Two vCPUs of a server CPU keep up with the N100's four cores, and Firecracker's 4 seconds is about the gap. The win is no minutes, and jobs that run in a box I control instead of next to everything else on my home network.
