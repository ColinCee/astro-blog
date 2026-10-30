# Design ideas tried and rejected

One line per idea, so nobody proposes it again. Add to it in the same change that drops an idea. DESIGN.md holds what is in use; this holds what is not.

## Home page hero

| Idea | Why it was dropped |
|---|---|
| Career as a `git log --graph` (companies as branches, posts as tags) | Tried twice (before Oct 2026 and again Oct 2026): "terrible". Never again. |
| Split-flap departures board of status rows | Too noisy; not clear what to read. |
| Dot-matrix LED sign scrolling the one-liner | Unreadable. |
| ASCII-art banner (name in Chinese) inside the terminal | Unreadable, "the worst". |
| Terminal tilted in perspective like a product screenshot | Confusing: "makes me question what it's doing". No perspective tricks. |
| A working shell in the hero (type commands, tab completion) | "Doesn't make sense" as a hero. The terminal shows, it does not ask. |
| A grid of live tiles (clock, Anki card, radar, homelab dots) | Fine but "a standard website", nothing unique. |
| The one-liner as the headline, name as eyebrow | Too random a first impression. |
| A slogan headline ("I make systems boring on purpose") | He does not want a tagline that is not his. |
| A commit → build → test → deploy pipeline figure with a travelling dot | "Kinda sucks"; the before/after bars said it already. |
| Fanned cards copied from ooting.app, handwritten note and all | Best layout so far (name and tagline left, one object right), but a straight copy. Keep the layout, replace the object. |
| The one-liner reel showing the previous line above the current one | Noisy; only the next one shows (Oct 2026). |
| One-liners at weight 500–600 | "A bit thick"; lighter, cleaner type tried instead (Oct 2026). |

## Terminal

| Idea | Why it was dropped |
|---|---|
| The tmux status bar (window list, build time, commit, live clock) | Noise (Oct 2026). |
| Login line and `ls ~/contact` | Noise; the hero has the links (Oct 2026). `whoami` (with 張志權) and `weather` were cut too, then brought back: the terminal felt empty. |
| A writing pane in the terminal | The Writing list is just below (Oct 2026). |
| `cat now.md` (a line, or a work / learning / running / writing list) | He is open to roles, so the "now" goes stale; dropped (Oct 2026). |
| A location line under `whoami` | `whoami` returns the two names only (Oct 2026). |
| A commands-only terminal (one column, or laid across) | Plain (Oct 2026). |
| The CV in the terminal's right pane, as a rotating timeline or a list | Shipped is better; it links to the CV instead (Oct 2026). |
| Projects as a grid of cards, each with its figure | Picker chosen: one figure at a time (Oct 2026). |
| The writing list as a big white panel of rows with dates | "Too big and not that cool" (Oct 2026). |
| Writing as a compact two-column section, shipped kept in the terminal | Writing moved into the terminal instead (Oct 2026). |
| Post titles at weight 500 in the terminal | Too thick; 400 (Oct 2026). |
| The worked-at marquee as bold names on a grey band | "Needs some love" (Oct 2026). |
| Two time columns in `top` (since and age) plus blue on every age | One column, in ink (Oct 2026). |
| A before/after label on every shipped bar, or a legend | Grey above, blue below is obvious enough (Oct 2026). |

## Colour and chrome

| Idea | Why it was dropped |
|---|---|
| One accent on both values of a stat ("12 h → 11 min" all coloured) | Two coloured things per glance; only the new value gets the colour. |
| Flat colour fields (blue stage, lime result, caps type) | Disliked outright. |
| Three semantic hues (green better, amber cost, blue link) on one page | Attention pulled everywhere; one accent plus status dots instead. |
| Always-dark terminal on the light page | Questioned; the terminal follows the theme. |
| Green as the one accent | Reads as pass/fail; indigo-blue chosen. |
| Pill-shaped buttons and 16–20px corners | "Overly rounded"; 8px chosen. |
| Four-hue palette, stronger spacing scale, wider breakout figures | See DESIGN.md, where each is noted at the rule it informed. |
