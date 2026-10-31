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

Every load runs with motion off (reduced motion). The entrances fade the main
content in over 0.5 s on purpose, and LCP counts a fading element only once
the fade ends, so with motion on LCP would measure the design, not the
loading. A visitor with motion on sees the main content start to fade in at
the LCP measured here and finish 0.5 s later, still well inside the 2.5 s
Google counts as good.
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
| Home | 112 → 123 KB | 86 → 95 KB | 412 → 550 ms |
| Blog index | 87 → 96 KB | 80 → 88 KB | 332 → 450 ms |
| Post | 109 → 121 KB | 80 → 88 KB | 388 → 500 ms |
| CV | 91 → 101 KB | 80 → 88 KB | 360 → 500 ms |

Fonts are most of every page. Raise a budget only with the reason in the PR
that raises it.

The CSS is in the page itself (`inlineStylesheets` in `astro.config.ts`): a
separate file was one more round trip before anything painted, 200-300 ms on a
slow phone, for a few KB a page.

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
same kind of entrance. The fades stay (taking the fade off the headline was
tried and read as less interesting), so the budgets measure with motion off.

## What made it faster

Fonts were most of every page and came from Google, over a second
connection. Moving them onto the site (Astro's font API) cut them from 101
to 80 KB, gave each a fallback sized to match the visitor's system font
(Segoe UI, Apple's, Roboto on Android, else Arial) so text doesn't rewrap when
it lands (the CV jumped 0.19), and let the fonts that would still move things
be preloaded: Sora, every title's font, and DM Mono 400, whose fallback can
only be sized to Courier New, which Android lacks. LCP dropped about
250-350 ms on home and posts; the CV's rose about 100 ms, since the preloads
share its slow connection. CI installs Roboto, so the test sees the fallback an
Android phone would.

A click opens the next page at once in Chrome and Edge: speculation rules in
`Head.astro` prerender a page while the pointer rests on its link, so on a
slow phone the blog index shows about 140 ms after the click (motion off). That
is measured in automated Chrome, which won't prerender and reuses the fetched
page instead; a visitor's Chrome prerenders the whole page, so it is sooner. A plain prefetch (Astro's) saved nothing: the HTML is sent
"check again before use", so the click downloaded it a second time. The last
test in `tests/speed.spec.ts` holds the click under 250 ms.
