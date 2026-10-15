---
title: "My Private CI Runs on a Mini PC Now, Each Job in Its Own VM"
shortTitle: "Private CI in Firecracker microVMs"
description: "Every CI job for my private repos now runs at home in a Firecracker microVM that is thrown away afterwards. A push is a running job in about 4 seconds, and it uses no GitHub minutes."
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
Every CI job for my private GitHub repos now runs on a mini PC at home. Each one gets its own Firecracker microVM, booted for that job and thrown away when it ends.

A push is a running job in about **4 seconds** and a finished one in about **37**. The sandbox costs about 4 seconds per job compared with no isolation at all, and none of it counts against GitHub's minutes.

Every number here was measured on one Intel N100 mini PC (4 cores, 16 GB of RAM) running CI for cortex, a private Python/TypeScript project: `uv sync`, `npm ci` and about 280 tests that also run ruff, ty and tsc. The full write-up is in my [homelab repo](https://github.com/ColinCee/homelab/blob/main/docs/ci-runner-performance.md).

## Why bother

GitHub gives private repos 2,000 free minutes a month on its own runners. That sounds like plenty until you have a few projects and a habit of pushing small commits.

The obvious fix is a self-hosted runner on a home server. The catch is that a CI job is just code from the repo, running with whatever access the runner has. On a home server, that includes the home network and everything on it.

So I wanted each job in a box that can reach the internet and nothing else, and that is gone when the job ends.

## Picking a sandbox

I ran the same job under every kind of isolation I could set up on the same machine, offline and with dependencies already cached.

<figure class="fig">
<p class="fig__k">Same job, same machine</p>
<div class="cmp"><span>No sandbox</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<div class="cmp"><span>systemd hardening</span><i style="--w:0.268"></i><b>10.6 s</b></div>
<div class="cmp"><span>firejail</span><i style="--w:0.261"></i><b>10.3 s</b></div>
<div class="cmp"><span>systemd-nspawn</span><i style="--w:0.263"></i><b>10.4 s</b></div>
<div class="cmp"><span>Docker</span><i style="--w:0.286"></i><b>11.3 s</b></div>
<div class="cmp"><span>Rootless Podman</span><i style="--w:0.271"></i><b>10.7 s</b></div>
<div class="cmp"><span>Incus container</span><i style="--w:0.481"></i><b>19.0 s</b></div>
<div class="cmp"><span>Incus VM (QEMU)</span><i style="--w:1"></i><b>39.5 s</b></div>
<div class="cmp cmp--after"><span>Firecracker</span><i style="--w:0.362"></i><b>14.3 s</b></div>
<figcaption>Job time under each kind of isolation, drawn to scale.</figcaption>
</figure>

Speed is only half of it. What matters is whether the job shares the host's kernel:

| Isolation | Start | Peak RAM | Own kernel |
|---|---:|---:|---|
| No sandbox | 0.1 s | 0.5 GB | no |
| systemd hardening | 0.1 s | 0.5 GB | no |
| firejail | 0.1 s | 0.5 GB | no |
| systemd-nspawn | 0.5 s | 0.9 GB | no |
| Docker | 0.3 s | 0.5 GB | no |
| Rootless Podman | 0.3 s | 0.4 GB | no |
| Incus container | 5.0 s | 0.6 GB | no |
| Incus VM (QEMU) | 9.8 s | 1.5 GB | yes |
| **Firecracker** | **0.8 s** | 1.1 GB | **yes** |

The containers are all close to bare speed, but they share the host's kernel, and most of them could reach other services on the network unless I added a firewall too. The full QEMU VM has its own kernel but was almost three times slower, mostly in boot and disk.

Firecracker is the only one with its own kernel that stays close to bare speed. It boots in about 0.8 seconds, and the rest of the 4 seconds comes from running on virtual CPUs.

## How it works

A small Python [supervisor](https://github.com/ColinCee/homelab/blob/main/scripts/ci_supervisor.py) on the PC polls GitHub every 2 seconds for queued jobs that ask for the runner's label. Polling that often is free, because GitHub doesn't count a conditional request whose answer hasn't changed.

For each job it:

1. Asks GitHub for a just-in-time runner registration that is good for exactly one job.
2. Boots a fresh microVM on a private copy of the disk image, and hands it the registration through Firecracker's metadata service.
3. Lets the GitHub runner inside pick up the job, then throws the VM away along with everything the job wrote.

The GitHub token never enters a VM. The most a VM ever sees is the registration for its own job.

VMs reach the internet through NAT, but the PC itself, the home network and the other VMs are all blocked, and nothing can open a connection into a VM. Firecracker itself runs under its jailer: its own user, chrooted, with a syscall filter and a memory cap.

Up to two VMs run at once, and one is kept booted and waiting so the next job doesn't wait for a boot. Two at a time is the sweet spot on four cores: 378 jobs an hour, which is roughly what 2,000 GitHub minutes buy in a month, every 5 hours.

A workflow opts in with one line:

```yaml
runs-on: [self-hosted, linux, x64, homelab-fc]
```

The rest of the code is in [`ci-runner/`](https://github.com/ColinCee/homelab/tree/main/ci-runner), and the design is in the [runbook](https://github.com/ColinCee/homelab/blob/main/docs/runbooks/ci-runner.md).

## From 52 seconds to 37

The first working version took 52 seconds from GitHub creating the run to the job finishing. Three changes got it to 37.

<figure class="fig">
<p class="fig__k">Run created to job done</p>
<div class="cmp"><span>First version</span><i style="--w:1"></i><b>52 s</b></div>
<div class="cmp"><span>Tools in the image</span><i style="--w:0.846"></i><b>44 s</b></div>
<div class="cmp cmp--after"><span>One VM kept warm</span><i style="--w:0.712"></i><b>37 s</b></div>
<figcaption>A real push to cortex at each stage, drawn to scale.</figcaption>
</figure>

**Building the tools into the VM image.** Node, uv and Python now ship in the image, so nothing is downloaded per job. `setup-node` went from 7 seconds to 1, and `uv sync` from 3 to 1. I also dropped the poll interval from 10 seconds to 2 at the same time.

**Keeping one VM booted.** This saves about 8 seconds, and almost none of it is the VM booting. It's the GitHub runner starting up inside it. The time from run created to job running went from 12 seconds to 3 or 4, and the waiting VM costs about 450 MB of RAM.

Of the 33 seconds the job itself now takes, 13 are the tests. The rest is setup: downloading the actions, checkout, restoring GitHub's package cache, then `uv sync` and `npm ci`.

To be fair to GitHub, its own `ubuntu-latest` runner picked the job up in about 3 seconds too, and got through the same steps up to the tests in about the same time. The win isn't raw speed. It's that it costs no minutes and runs somewhere I control.

## What didn't help

- **4 vCPUs instead of 2**, for a job running alone. It did nothing for this suite. Half the tests finish in under 2 seconds, and a few slow ones decide the time.
- **Firecracker snapshots.** Boot is already under a second, and restoring the same snapshot for every job is unsafe. Firecracker's own documentation says so.

## What surprised me

**A job that ran out of memory hung its VM for an hour.** systemd had stopped the task that was meant to end the VM. Now the VM reboots, which ends Firecracker, whenever its task ends, however it ends.

**GitHub only saves a cache when the job passes.** So the package caches did nothing at all until the suite was green on Linux.

**CI on a second platform found a real bug.** The VM runs Python 3.15 and the PC runs 3.13. One test faked "today" by replacing `time.time`, which `date.today()` stopped reading in 3.15. It would have broken on the PC at the next Python upgrade. Instead, CI caught it first.

And the rest of the server barely noticed. With two VMs flat out on CPU and memory, the worst response time from Home Assistant and Grafana went from 1 ms to 4 ms.
