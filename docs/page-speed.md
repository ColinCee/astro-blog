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
  that); font files are already compressed. Uncompressed is the
  steadier number to hold a budget on.
- **Requests:** how many.
- **LCP** (largest contentful paint: when the biggest thing on the first
  screen has painted), the median of the three loads.
- **Layout shift** (CLS: how far things on screen jump while the page loads,
  in its worst burst; under 0.1 counts as good), from the first load.

The homepage's weather call gets a fixed answer, so every run loads the same
page. A request that fails or answers with an error fails the test, since it
would make the page look lighter. LCP is read once the first screen's
animations have finished (at most 3 s), so a long entrance still counts.

The local preview speaks HTTP/1.1 and the throttle adds its delay per request,
so an extra file costs more here than on Cloudflare: the numbers are a
yardstick for change, not what a visitor sees. Cloudflare's bot script is only
on production, so it never enters them.

## The budgets

Set from the numbers after the fonts moved onto the site (Oct 2026), with
headroom:

- **Bytes:** 10% or 3 KB over today, whichever is more, rounded up to a KB, so
  a small file can take a small edit and a big one can't grow by much.
- **Requests:** two more than today.
- **Layout shift:** 0.1 on every page, the line for "good".
- **LCP:** 30% over today, rounded up to 50 ms. A failing test runs once more
  before it counts, since timing on a shared CI machine can spike.

| Page | Total | Fonts | LCP |
|---|---|---|---|
| Home | 113 → 124 KB | 86 → 95 KB | 628 → 850 ms |
| Blog index | 88 → 96 KB | 80 → 88 KB | 712 → 950 ms |
| Post | 111 → 121 KB | 80 → 88 KB | 692 → 950 ms |
| CV | 93 → 101 KB | 80 → 88 KB | 544 → 750 ms |

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

## What made it faster

Fonts were most of every page and came from Google, over a second
connection. Moving them onto the site (Astro's font API) cut them from 101
to 86 KB on home, gave each a fallback sized to match so text doesn't rewrap
when it lands (the CV jumped 0.19), and let Sora, the font of every title,
be preloaded. LCP dropped about 250-350 ms on home and posts; the CV's rose
about 130 ms, since the preload shares its slow connection.

Links also fetch their page when the pointer rests on them or they get
focus (Astro's prefetch), so a click opens a page that is already here.
