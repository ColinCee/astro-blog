---
title: "Push to Running CI Job in 4 Seconds, on a Mini PC at Home"
shortTitle: "Private CI in Firecracker microVMs"
description: "CI for my private repos now runs at home, each job in a Firecracker microVM that is thrown away afterwards. It uses no GitHub minutes and costs about 4 seconds a job."
stat: "37 s"
figures:
  - label: "GitHub minutes used"
    value: "0"
  - label: "Sandbox cost per job"
    value: "~4 s"
  - label: "Push to finished job"
    value: "~37 s"
pubDate: "Oct 15 2026"
---
CI for my private GitHub repos now runs on a mini PC at home. Each job gets its own Firecracker microVM, booted for that job and thrown away when it ends.

A push is a running job in about **4 seconds** and a finished one in about **37**. The sandbox costs about 4 seconds a job, and none of it counts against GitHub's minutes.

The numbers are from one Intel N100 mini PC (4 cores, 16 GB) running CI for cortex, a private Python/TypeScript project with about 280 tests. The full write-up is in my [homelab repo](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## Why bother

Private repos get 2,000 free minutes a month on GitHub's runners.

A self-hosted runner on a home server fixes that, but a CI job is just code from the repo. On a home server it runs next to everything else in the house. I wanted each job in a box that can reach the internet and nothing else, and is gone when the job ends.

## Picking a sandbox

I had one hard requirement: the job must not share the host's kernel. A container escape lands on the host; a VM escape has to get through a hypervisor first.

That ruled out seven of the nine options I tried before speed mattered. Of the two left, one was three times slower than no sandbox and the other cost about 4 seconds.

<figure class="fig">
<p class="fig__k">Own kernel</p>
<div class="cmp"><span>Incus VM (QEMU)</span><i style="--w:1"></i><b>39.5 s</b></div>
<div class="cmp cmp--after"><span>Firecracker</span><i style="--w:0.362"></i><b>14.3 s</b></div>
<div class="cmp"><span>No sandbox, for scale</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<p class="fig__k">Shares the host's kernel, so ruled out</p>
<div class="rows" style="white-space:normal"><span>No sandbox, systemd, firejail: 10.3 to 10.7 s</span><span>nspawn, Docker, rootless Podman: 10.4 to 11.3 s</span><span>Incus container: 19.0 s</span></div>
<figcaption>The same job, offline with warm caches, on the same machine. Bars drawn to scale.</figcaption>
</figure>

Firecracker boots in about 0.8 seconds, and the rest of its 4 seconds comes from running on virtual CPUs. The QEMU VM lost most of its time in boot and disk.

The network is a separate question. Most of the containers could reach the home network unless I added a firewall, and a VM is no different, so the VMs get firewall rules of their own.

## How it works

<figure class="fig">
<div class="boxes"><div class="box">GitHub<small>a job is queued</small></div><div class="box">Supervisor on the PC<small>holds the GitHub token</small></div><div class="box box--fast">Throwaway microVM<small>gets a one-job registration</small></div><div class="box">The internet<small>and nothing else</small></div></div>
<figcaption>Left to right: the token stays on the PC, and each VM only sees a registration for its own job.</figcaption>
</figure>

A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) polls GitHub every 2 seconds for queued jobs. That's free, because GitHub doesn't count a conditional request whose answer hasn't changed.

For each job it asks GitHub for a just-in-time runner registration that works for exactly one job, boots a fresh VM, and passes the registration in through Firecracker's metadata service. The GitHub token never enters a VM.

VMs reach the internet, but not the PC, the home network or each other, and nothing can connect in. Up to two run at once, which is 378 jobs an hour, roughly what 2,000 GitHub minutes buy in a month every 5 hours. The design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

## From 52 seconds to 37

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

**Tools in the image.** Node, uv and Python ship in the VM image, so nothing downloads per job: `setup-node` went from 7 seconds to 1 and `uv sync` from 3 to 1. The same step also cut polling from every 10 seconds to 2.

**One VM kept warm.** This saves about 8 seconds, and almost none of it is the VM booting. It's the GitHub runner starting up inside it. The waiting VM costs about 450 MB of RAM.

13 of the job's 33 seconds are the tests. To be fair to GitHub, its own `ubuntu-latest` runner picked the job up in about 3 seconds too and got through the setup in about the same time. The win isn't speed. It's no minutes, and a box I control.

## What didn't help

- **4 vCPUs instead of 2.** Half the tests finish in under 2 seconds, and a few slow ones decide the time.
- **Firecracker snapshots.** Boot is already under a second, and restoring the same snapshot for every job is unsafe, as Firecracker's own docs say.

## What surprised me

**A job that ran out of memory hung its VM for an hour.** systemd had stopped the task meant to end the VM. Now the VM reboots, which ends Firecracker, whenever its task ends.

**GitHub only saves a cache when the job passes.** The package caches did nothing until the suite was green on Linux.

**A second platform found a real bug.** The VM runs Python 3.15 and the PC 3.13. A test faked "today" by replacing `time.time`, which `date.today()` stopped reading in 3.15, so it would have broken at my next Python upgrade.
