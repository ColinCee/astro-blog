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
  they come over the wire. The local preview gzips what it sends a browser
  (`content-encoding: gzip` on the page and its scripts, read from a Chromium
  response in Nov 2026; a plain `curl` gets them whole), so our own files
  count at their compressed size: the home page's HTML is about 129 KB on disk
  and about 23 KB here. Cloudflare sends them brotli'd, a little smaller again. Font
  files are already compressed.
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

## The home page after the window (Nov 2026)

The home window put the writing list, the project picker and all five
figures into one terminal app, and into the page's HTML: scripts there move
text, attributes, classes and copies of nodes already in the page, so the
page is whole without them. Measured on the phone load:

| | Before | With the window | After the trim | As shipped | Budget |
|---|---|---|---|---|---|
| HTML (CSS inline) | 16.8 KB | 23.3 KB | 22.4 KB | 22.8 KB | 20 → **26 KB** |
| Scripts | 8.9 KB | 8.1 KB | 8.1 KB | 8.4 KB | 12 KB |
| Fonts | 85.6 KB | 85.6 KB | 85.6 KB | 85.6 KB | 95 KB |
| Total | 111.7 KB | 117.3 KB | 116.4 KB | 117.1 KB | 123 KB |
| Requests | 15 | 13 | 13 | 13 | 17 |
| LCP | 408 ms | 440 ms | 424 ms | 424 ms | 550 ms |
| Layout shift | 0.071 | 0.037 | 0.037 | 0.037 | 0.1 |

Everything but the HTML was inside its budget as it stood. The HTML was
3.3 KB over its 20 KB: what scripts used to build (the picker, the figures)
is now markup and CSS in the page, and the projects moved into the window
from a section that drew most of itself by script.

The trim: looking for weight to take back out found none in the window (every
selector in the page's CSS matches something on it or is a state a script
sets, and the lower half's script already loads on demand, below), but it
found 0.9 KB that every page was sending for nothing: the notes in
`Head.astro` and `Hero.astro` were HTML comments and comments inside an inline
script, which go to the visitor as written. They are Astro comments now, and
the speculation rules are printed as one line. That took the home page to
22.4 KB and 0.6 to 0.7 KB off the blog index (7.7 → 7.1), the post
(22.4 → 21.7) and the CV (11.5 → 10.9). The rule it leaves for any page: a
note beside markup or an inline script is an Astro comment (`{/* */}`), never
an HTML comment or a `//` line inside the script.

As shipped is the page after the fixes that followed its review, which put
0.3 KB back into the HTML and 0.3 KB into the scripts: layout fixes in the
window's CSS, an end to each wait and the refetches (both below). About
0.05 KB of the HTML is not the window's: the theme script in `Head.astro`
grew by that much on every page when the color-scheme meta began to follow
the theme, which took the post from 21.7 to 21.8 KB.

The home page's HTML budget went from 20 to 26 KB by the rule above
(22.4 plus 3 KB, rounded up; the 22.8 it ships at gives the same 26),
because the page still could not fit and the weight is the design Colin
chose: the projects inside the window, in the HTML. No other number changed.
The total stays at 123 KB, so the page as a whole may not grow past where it
was allowed before; scripts are 3.6 KB under their 12 KB.

What keeps the first load light:

- The lower half's script (`window/projects.ts`, 3.5 KB gzipped, with the
  Anki deck in it) is fetched when the picker or a figure comes within half a
  screen, or takes the keyboard. On a desktop that is at once. On a phone it
  waits for the reader to scroll (about 320 px on a 390 by 844 screen with
  nine posts, and further with each post added), so the phone's first load
  does not ask for it, nor for `/homelab.json`, which that script fetches.
- The radar (`window/radar.ts`, 3.5 KB gzipped) is fetched from there the
  first time the flight-tracker panel is within half a screen: when it is
  opened in the picker, or scrolled near on a phone.
- The window uses DM Mono 400 and 500 only, the two weights the page already
  loads.

Loading a script on demand goes through Vite's preload helper, a 0.9 KB file
of its own on the first load (posts already load it the same way).

Loading late must never leave the page broken, so each wait has an end
(`Window.astro`'s inline script and `window/main.ts`; the full contract is
DESIGN.md, Home window, Start-up):

- The window's own script not started after 4 s: the panels dimmed for the
  opening round and the figures waiting blank are shown as they are. The
  layout does not move, and the script still starts when it lands.
- That script failed to load, threw while starting, or is still missing
  after 20 s: the projects become the stack of five drawn figures, which is
  also the page without JavaScript.
- The lower half not there 8 s after it was asked for, or failed: the same
  stack, for good; a file that lands later is not started.

The live numbers are fetched again while the tab is showing and never while
it is hidden: `/homelab.json` every 5 minutes and when a hidden tab is shown
again, the weather every 30 minutes and on return to a tab whose reading is
30 minutes old or more. The refetches fall outside the measured load.

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
