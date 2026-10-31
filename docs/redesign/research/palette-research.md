# Palette and technique on craft-cited personal sites (fetched 2026-10-27)

Read from each home page's fetched stylesheets. "Not determined" = not in the source.

## Per site

**https://rauno.me** — Radix-style 12-step scales (gray, blue, amber) shipped for both light and dark; no `prefers-color-scheme` query or toggle markup found; defaults light (`--colors-bg:#FFF`, gray1 `hsl(0 0% 99%)`, text gray12 `hsl(0 0% 9%)`); dark set is `#000` / gray1 `hsl(0 0% 8.5%)` / gray12 93%, applied per route (`notes-dark`). Named demo colours (`--red`, `--blue`, neon) in display-p3. Fonts: custom sans named `X` (obscured), JetBrains Mono. Width: not determined. Touches: `cursor-none` / `cursor-grabbing` / `cursor-moving` classes.

**https://paco.me** — System dark via `prefers-color-scheme` plus next-themes. Light `--bg:#fff`, `--fg:#000`, body text `#3a3a3a`; dark `--bg:#1a1a1a`, `--fg:#f2f2f2`, text `#e5e5e5`, 12-step neutral `--gray1..12` (#1a1a1a → #ededed). No accent hue in tokens; hovers are grey tints (`--hover-background:var(--mono4)`). Fonts: Inter, Newsreader, Söhne. Width: `--content-width:640px` in a `192px | 640px | 192px` grid, page 1072px. Touches: `noise-1` SVG data-URI grain, `cursor:crosshair`/`copy`.

**https://emilkowal.ski** — `.dark` class via ThemeProvider, plus `prefers-color-scheme` queries. Warm 12-step grey: light `#fdfdfc`…`#21201c` (body uses gray-200 `#f9f9f8`, text gray-1100 `#63635e` / gray-1200 `#21201c`); dark `#111110`…`#eeeeec`; matching 12-step alpha scale. One brand token `--brand:#fad657` (yellow). Fonts: custom Sans / Mono / Serif, names obscured. Width: 768px. Touches: layered `--ds-shadow-*` tokens; code comments and punctuation mapped to the grey scale.

**https://brianlovin.com** — System only (`prefers-color-scheme`). Tailwind neutral: light bg `#fff` / main `#fafafa`, text `#171717`; dark bg `#000`, text as alpha white `#ffffffe6 / b3 / 80 / 52` (four tiers). One accent `#fc532a` (orange) as `--text-color-brand` and `::selection`. Fonts: Inter, Source Serif 4, JetBrains Mono. Width: sidebar layout, not determined.

**https://joshwcomeau.com** — Toggle ("Activate dark mode"), `data-color-mode` attribute. Light bg `hsl(0 0% 100%)`, text `hsl(222 22% 5%)`, greys 50–1000 tinted hue 225; dark bg `hsl(210 15% 6%)`, text `hsl(210 10% 90%)`, greys hue 210. Two accents: `--color-primary hsl(240 95% 62%)` (indigo) and `--color-secondary hsl(333 100% 45%)` (pink), plus `--color-decorative`. Fonts: Wotfard, Cartograph CF. Width: `--max-width:68.75rem` (1100px). Touches: sound toggle, 350ms colour transition on theme change.

**https://jhey.dev** — `light-dark()` with `color-scheme:light dark` and `light only` / `dark only` overrides (toggle). bg `light-dark(#fff,#000)`; text derived with `color-mix(in lch, canvasText, canvas 30%)`, muted 40%, faint 46%, rules 90% (no fixed grey hexes). One accent `--color-accent: light-dark(red-600 oklch(57.7% .245 27), red-400)`, applied via `text-accent` class (10 uses). Fonts: system sans/mono/serif stacks. Width: `min(62ch,100%)`. Touches: `BearMark` mascot component.

**https://leerob.com** — `.dark` class via ThemeProvider. Light `--bg:#fff`, text `#282828`, secondary `#504945`, nav `#676767`, surface `#f3f3f2`, divider `#e2e2df`; dark `--bg:#1b1a19`, text `#e8e5df`, surface `#242321` (warm). Accent only as `--code-inline:#ad2111` (red; `#e06c5f` dark) and `--focus-color:#6657c8`. Fonts: Iowan Old Style (reading), system sans, Caveat. Width: not determined. Touches: `feTurbulence` noise filters, `Grain:before`.

**https://delba.dev** — Light only in fetched source (`data-theme="dark"` applies only to the code-block renderer). bg `stone-50`, text stone-400/500. No accent token found. Fonts: Geist Sans/Mono, Fraunces, five Geist Pixel faces. Width: 64rem, prose 65ch.

**https://maximeheckel.com** — Two token sets with `color-scheme` light and dark; toggle control not found in fetched markup. All colours oklch with `--base-hue` 262–266 (blue-tinted greys): light bg gray-100 `oklch(99.24% .008)`, text gray-1200 `oklch(19.83%)`; dark bg `oklch(14.68%)`, text `oklch(94.23%)`; 13 steps (000–1200). Accent blue `oklch(64.6% .172 266)`, used at 7% alpha as `--emphasis`, as button background, and `--hyperlink:#2480ed`. Fonts: Inter, iA Writer Quattro. Width: 770px, prose 600px. Touches: blurred cards, WebGPU demos.

**https://hakim.se** — Light only. bg `#fff`, text `#222`. One accent `#0068b7` (blue). Font: Libre Caslon Condensed, 24px. Width: 72%, max 1224px. Touches: the experiments themselves (hover-driven 3D links).

**https://benji.org** — Light only. bg `#fdfdfc`, text `#111`. Two accents: `--primary #3e9fff` (blue) and `--secondary #f09637` (orange), both in display-p3. Fonts: Inter, Newsreader, custom script faces, SF Mono. Width: 36.375rem (582px), prose 70ch. Touches: named motion tokens `snappy 220ms` / `swift 800ms` / `smooth 300ms`.

**https://nev.flynn.ie** — Unreachable today (connection refused). Awwwards' 2021 listing records black, pink and white.

**Lists:** 2025–26 "best developer portfolio" searches returned only vendor roundups (Elementor, Hostinger, Unilink) that cite none of these sites. Directories that do: https://minimal.gallery, https://www.siteinspire.com, https://godly.website.

## Synthesis

- **Greys carry the design.** Eight of eleven ship a 10–13 step neutral scale (Radix-style on rauno, emil, paco, maxime; Josh's own; Tailwind neutral/stone on brian, lee, delba). Text is two to four tiers of that scale, not black.
- **The tint lives in text and in dark mode, not the light background.** Light backgrounds split evenly: pure `#fff` (paco, josh, lee, hakim, brian) versus off-white (emil `#f9f9f8`, benji `#fdfdfc`, delba stone-50, maxime 99.24%). Text is never `#000` except paco: `#111`–`#282828`, Emil's `#21201c`. Dark backgrounds are where hue appears: Lee `#1b1a19`, Emil `#111110`, Josh hue 210, Maxime blue-hued oklch, versus flat `#000` (brian, jhey) and neutral `#1a1a1a` (paco).
- **One accent, defined once, spent on tiny surfaces.** Where an accent exists it is a single hue (brian orange, jhey red, emil yellow, hakim blue, maxime blue) and the tokens that use it are selection, inline code, a focus ring, a 7% tint, or one `text-accent` class. Paco and Delba have none. Two-accent sites (josh, benji): second accent's placement not determined from source.
- **Dark mode is derived, not redrawn:** alpha-white text tiers (brian), `light-dark()` + `color-mix` from `canvasText` (jhey), same scale index both modes (emil, maxime).
- **Theme handling:** persisted toggle (emil, lee, josh, jhey), system only (paco, brian), light only (delba, hakim, benji).
- **Signature is motion and texture, not colour:** grain (paco, lee), easing tokens (benji), cursor states (rauno, paco), sound (josh). Fonts: Inter/Geist/Söhne plus one serif (Newsreader, Fraunces, Source Serif, Iowan) recurs.
- **Prose columns cluster at 580–770px** (paco 640, benji 582, emil 768, maxime 770, jhey 62ch, delba 65ch); only Josh and hakim go wide.
