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
| A grid of live tiles (clock, Anki card, radar, homelab dots) | Fine but "a standard website", nothing unique. Still out as separate tiles. The Anki card and the radar stayed on the home page as project figures (the picker, Oct 2026); since Nov 2026 they are figures inside the one home window. |
| The one-liner as the headline, name as eyebrow | Too random a first impression. |
| A slogan headline ("I make systems boring on purpose") | He does not want a tagline that is not his. |
| A commit → build → test → deploy pipeline figure with a travelling dot | "Kinda sucks"; the before/after bars said it already. |
| Fanned cards copied from ooting.app, handwritten note and all | Best layout so far (name and tagline left, one object right), but a straight copy. Keep the layout, replace the object. |
| The one-liner reel showing the previous line above the current one | Noisy; only the next one shows (Oct 2026). |
| One-liners at weight 500–600 | "A bit thick"; lighter, cleaner type tried instead (Oct 2026). |

## Terminal

| Idea | Why it was dropped |
|---|---|
| The tmux status bar (window list, build time, commit, live clock) | Noise (Oct 2026). Still out: the home window (Nov 2026) is panels like a tmux session, with a title bar and no status bar. The commit is in the colincheung.dev figure and the footer. |
| Login line and `ls ~/contact` | Noise; the hero has the links (Oct 2026). `whoami` (with 張志權) and `weather` were cut too, then brought back: the terminal felt empty. |
| A writing pane in the terminal | Dropped in Oct 2026 while a Writing list sat just below; brought back when that list went. The home window's writing panel is the list now, so this row no longer rules it out. |
| `cat now.md` (a line, or a work / learning / running / writing list) | He is open to roles, so the "now" goes stale; dropped (Oct 2026). |
| A location line under `whoami` | `whoami` returns the two names only (Oct 2026). Changed Nov 2026: `whoami` became the fastfetch panel, four key/value rows (both names, role, work since, posts) beside the favicon. Still no location line; Glasgow is the weather panel's title. |
| A commands-only terminal (one column, or laid across) | Plain (Oct 2026). |
| The CV in the terminal's right pane, as a rotating timeline or a list | Shipped is better; it links to the CV instead (Oct 2026). |
| Projects as a grid of cards, each with its figure | Picker chosen: one figure at a time (Oct 2026). Still so on a desktop. Changed Nov 2026 for phones: there the five figures are a stack of panels, scrolled through one after another. |
| The writing list as a big white panel of rows with dates | "Too big and not that cool" (Oct 2026). |
| Writing as a compact two-column section, shipped kept in the terminal | Writing moved into the terminal instead (Oct 2026). Nov 2026: it is the home window's writing panel, every post and not the newest five. |
| Post titles at weight 500 in the terminal | Too thick; 400 (Oct 2026). |
| The typed session: two panes, `whoami`, `top -u colin`, `weather` and `ls -t ~/writing` typing themselves out | "I tried to clean it up recently with a simplification, but now I feel that the terminal looks a bit lacking." Replaced by the home window, one terminal app of hairline panels (Nov 2026). |
| The worked-at marquee as bold names on a grey band | "Needs some love" (Oct 2026). |
| Worked at as a still line of names with a dot each | The thin marquee won (Oct 2026). |
| The thin marquee with nothing under the names | "A bit too bare" (Oct 2026). |
| Years or a tenure bar under each company | Highlighting job lengths makes him look like a job hopper (Oct 2026). The start year alone stays. |
| Each job's headline result, or its industry word, under the company | Icon and start year chosen (Oct 2026). |
| A hairline or a dot between the worked-at names | The slash chosen (Oct 2026). |
| Industry icons before the worked-at names | Dropped (Oct 2026). |
| The worked-at year under the name | Beside it, so each name is one line (Oct 2026). |
| Blue years, or no blue, in the worked-at strip | Blue slashes chosen (Oct 2026); they are violet now, with the accent. |
| A bright light mode (white panels on a pale page), or light first | "A flashbang"; dark is the default and light is soft (Oct 2026). |
| Dark only | A soft light toggle kept for daylight reading (Oct 2026). |
| Blue, indigo, sky, teal, magenta, tomato or orange as the accent | Violet chosen: it looked best in dark (Oct 2026). Teal and magenta sat too close to status colours; tomato made improved numbers read as errors. |

## Home page window (Nov 2026)

Chosen: the prototype named One window, stacked (`rest/onewin.html`), one terminal app of six hairline panels with the projects inside it (DESIGN.md, Home window). "I actually like the one window stacked original. That looks the best". The rest were built as working pages and shown beside it; they are outside the repo, in `terminal-experiments` on Colin's machine (`index.html` for the terminal, `rest-index.html` for the rest of the page).

A row with a quote is his decision, in his words. A row marked shown and not picked records only that: no reason was given, so none is written; ask before proposing the idea again and before calling it ruled out. What the choice means for the next change, and which of those rules are his and which are inferred, is in DESIGN.md, How the home page grows.

| Idea | Why it was dropped |
|---|---|
| fastfetch's row of colour blocks (the grey and purple scales as swatches) | "Can we remove the black to purple gradients in TUI fetch ?" No swatches in the window. |
| The favicon redrawn as a grid of squares (a pixel version) | "if it's supposed to be my favicon it doesn't really look like it". The real favicon's geometry is used. |
| The fastfetch favicon taller than the rows beside it | "The fast fetch icon used to be the same size as the rest of the content though. So it doesn't look like the icon's bigger than the 4 rows." Its side is the row count times one line. |
| Projects as a second window docked under the terminal | "what about the docked window just being part of the tmux or TUI the same one not two?" One window; the projects are its panels. |
| A scroll-driven pinned stage for the projects on a desktop | "scroll through is great for mobile but I don't know if we have that much content on desktop". A doubt, not a ban; on the strength of it scroll-through was kept for phones only, as the stack of project panels, and a desktop gets the picker. |
| The Projects section left under the window as it was, or with only its figure given the terminal's hairline frame | "I think it needs further variations, similar sort of creativity as the terminal". He asked for more variations of the rest of the page; he did not say a section may never follow the window. In the version he then picked, the picker and its figures are inside the window. |
| A calmer window with fewer labels and two hues (`rest/trim.html`) | Made after he asked "do you think it's a bit busy?". He preferred the original: "I actually like the one window stacked original." |
| A calmer window with open panels and one hue (`rest/open.html`) | Made for the same question; the original preferred, in the same words. |
| htop-style meters in the old two-pane session | Shown, not picked; no reason given. |
| An fzf picker with a large preview | Shown, not picked; no reason given. |
| The terminal as the hero's right-hand object, printing the one-liners via `fortune` | Shown, not picked; no reason given. |
| A material treatment for the terminal (lit edge, shadow, dot floor, glow) | Shown, not picked; no reason given. |
| A two-pane coloured fastfetch session with drawn figures | Shown, not picked; no reason given. |
| A view transition morphing a writing row into its post header | Shown, not picked; no reason given. |
| The window's six panes re-tiled four across | Shown, not picked; no reason given. |
| A full-width stage under the terminal with the projects as tabs | Shown, not picked; no reason given. |
| The lower page as a frameless gallery wall in thin type | Shown, not picked; no reason given. |
| Each project led by one large number | Shown, not picked; no reason given. |
| One ruled register listing companies, projects and contact as rows | Shown, not picked; no reason given. |

## Figures

| Idea | Why it was dropped |
|---|---|
| Radar planes as dots bouncing at random | Not believable; arrows on real approach and departure patterns instead (Oct 2026). |
| A cloud made of CSS-masked circles with an outline | "Doesn't look much like a cloud"; an SVG cloud filled by tone instead (Oct 2026). |
| A three-bump flat-filled cloud the size of its text box | "A bit flat", and the text did not fit (Oct 2026). |
| Two-tone and gradient clouds | The outline chosen (Oct 2026). |
| A repo count next to the Projects heading, and long project subtitles | Less text is better (Oct 2026). |
| The picker list as padded rows with only the open one on a panel | Indented from the heading; looked strange (Oct 2026). Changed Nov 2026: in the home window the picker's rows run edge to edge of their panel and the open one takes the selected band, as the writing list's does. |
| The picker list as cards, or with no subtitles | Plain with short subtitles chosen (Oct 2026). |
| Two time columns in `top` (since and age) plus blue on every age | One column, in ink (Oct 2026). Changed Nov 2026: `top` went with the typed session; skills are one block a year in the home window, with each skill's years at its row's end in ink. |
| A before/after label on every shipped bar, or a legend | Grey above, blue below is obvious enough (Oct 2026). |
| Two parts of a bar, or two series, in two greys (Splits' Game and Agent in n8 and n7; estimates drawn lighter) | "Basically the same" next to each other (Nov 2026). Both matter, so one is ink and one grey; a subject would take the accent instead. |

## Colour and chrome

| Idea | Why it was dropped |
|---|---|
| One accent on both values of a stat ("12 h → 11 min" all coloured) | Two coloured things per glance; only the new value gets the colour. |
| Flat colour fields (blue stage, lime result, caps type) | Disliked outright. |
| Three semantic hues (green better, amber cost, blue link) on one page | Attention pulled everywhere; one accent plus status dots instead. Still out. Nov 2026: the home window's small print takes four hues, but by the kind of thing it is (a key, a date, a quantity, a path), never a meaning, and only inside the window. |
| Always-dark terminal on the light page | Questioned; the terminal follows the theme. |
| Green as the one accent | Reads as pass/fail; indigo-blue chosen. |
| Pill-shaped buttons and 16–20px corners | "Overly rounded"; 8px chosen. |
| Four-hue palette, stronger spacing scale, wider breakout figures | See DESIGN.md, where each is noted at the rule it informed. The four-hue palette is still out for the site; the home window's four hues (Nov 2026) are the code theme's, on its small print only (DESIGN.md, the Window Hues Exception). |
| Striking through the old value of a stat ("~~428 s~~ → 23 s") | The arrow already says it changed; the strike read as an error. Old value grey instead. |
| Striking through anything, e.g. the rule a condition switches off (easyJet post) | "Really hard to read" (Nov 2026). Never strike text through: grey it and say what happened in a word ("switched off"). |
| Bold punchlines in the one-liners (Sora 400 in a 200 line) | Heavier Sora reads thick next to the thin voice; the punchline is violet at 300 instead, one violet thing per line. |
| Button hover that turns only the icon violet | The violet icon read dimmer than the white one at rest ("washed out"); a violet-tinted fill with a bright icon instead. |
| Violet (hue 296) as the accent | Lightened enough to read in dark, it turned into a muted lavender ("washed out"); at full strength it was "too vivid". Purple 308 keeps its colour in both themes (31 Oct 2026). |
| A 12-step accent ramp, then four loose accent shades | 8 of 12 steps unused; the four shades sat too close and the pale ones read pink or white. One 6-step spectrum from dark up to the accent (31 Oct 2026). |
| An all-grey code theme (keywords and types a step quieter, no hues) | Read as missing its colour scheme; five syntax hues at one lightness instead (31 Oct 2026). |
| A caption over the one-liner ("today's one-liner") and the next line faint under it | Both distracting; the time-left bar and the count say another is coming (31 Oct 2026). |
| Scale bars under each stat on the blog index | Too noisy beside the stats; the numbers say it on their own (31 Oct 2026). |
| The prompt mark (`>_`) as the favicon; a cc monogram, 張, a caret or c/ instead | The prompt read as code, not as the site, and its thin strokes blurred at 16px. Before → after won: the site's stat as a mark (31 Oct 2026; sheet in comps/logo-ideas.html). |
| A purple result on every row of the home terminal; two purple things in one project figure | The terminal outshouted the page; one purple per figure (the result keeps it) (31 Oct 2026). Nov 2026: in the home window no result and no project figure is purple. Its purple is the focus and the favicon's short bar, which share the first screen with the hero's highlight (DESIGN.md, the exception to the Accent Points Rule). |
| The headline (name, page title, blog rows) rising in without the fade, so LCP counts it at first paint | Less visually interesting; the fade is design, not load time. The speed tests measure with motion off instead (31 Oct 2026). |

## Posts

| Idea | Why it was dropped |
|---|---|
| A sticky section list in the left margin, a numbered dot per section filling as you read | "Kinda distracting"; removed from every post (Nov 2026). The reading bar along the top is enough. |
