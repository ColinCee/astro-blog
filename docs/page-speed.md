# Page speed budgets

Every PR fails when a page gets heavier or slower than its budget. Run them
with `pnpm speed` (builds, then measures); `pnpm check` and CI run them too,
in about 40 seconds.

## What is measured

`tests/speed.spec.ts` loads the built site, served by `astro preview`, in
Playwright's Chromium at phone size on a throttled connection (1.6 Mbps,
150 ms a request), three times per page type, each with an empty cache: home,
blog index, a post (jest-to-vitest) and CV. For each page:

- **Bytes by type:** HTML, styles, scripts, fonts, images, and the total, as
  they come over the wire. The local preview doesn't compress, so our own
  files count at full size (Cloudflare sends them brotli'd, about a third of
  that); Google Fonts' files are already compressed. Uncompressed is the
  steadier number to hold a budget on.
- **Requests:** how many.
- **LCP** (largest contentful paint: when the biggest thing on the first
  screen has painted), the median of the three loads.

The homepage's weather call gets a fixed answer, so every run loads the same
page. Google Fonts is fetched for real, since that is what a visitor downloads.

The local preview speaks HTTP/1.1 and the throttle adds its delay per request,
so an extra file costs more here than on Cloudflare: the numbers are a
yardstick for change, not what a visitor sees. Cloudflare's bot script is only
on production, so it never enters them.

## The budgets

Set from the numbers when they were added (Oct 2026), with headroom:

- **Bytes:** 10% or 3 KB over today, whichever is more, rounded up to a KB, so
  a small file can take a small edit and a big one can't grow by much.
- **Requests:** two more than today.
- **LCP:** 30% over today, rounded up to 50 ms; the test retries once, since
  timing on a shared CI machine can spike where bytes never do.

| Page | Total | Fonts | LCP |
|---|---|---|---|
| Home | 127 → 141 KB | 101 → 112 KB | 940 → 1300 ms |
| Blog index | 99 → 110 KB | 92 → 101 KB | 912 → 1250 ms |
| Post | 122 → 134 KB | 92 → 101 KB | 1080 → 1400 ms |
| CV | 104 → 114 KB | 92 → 101 KB | 440 → 600 ms |

Fonts are most of every page. Raise a budget only with the reason in the PR
that raises it.

## Why Playwright

| Option | For | Against |
|---|---|---|
| Lighthouse CI | Ready-made, budgets per resource type | A large new dependency and a minute or more a run; its default simulated LCP rebuilds load time from the network graph, so it misses delays a page makes itself, like an entrance animation |
| size-limit | Tiny, good for one bundle | Measures files, not pages: no fonts, HTML, requests or timing |
| **Playwright** | Already installed and run in CI; real Chromium timing on a throttled network; counts every request, fonts included | One spec file to keep |

Throttling is a fixed delay and bandwidth, so on pages this small LCP is set
mostly by round trips, not CPU speed: three loads agree within a few percent.

## Why the home page's LCP doubled

It went from about 490 to 950 ms with the redesign while the page got lighter
(214 → 128 KB), so it is not loading. The largest thing on the first screen is
the name, and it now fades in over 0.5 s (`rise` on `.hero__name`). With
reduced motion, same bytes, LCP is 460 ms. The blog index and posts have the
same kind of entrance (about 430 and 560 ms without it). Keeping the fades is
a design call, so the budgets hold today's numbers with the fades in.
