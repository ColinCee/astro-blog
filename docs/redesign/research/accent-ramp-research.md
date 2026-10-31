# Accent ramp research (31 Oct 2026)

Is a 6-step violet ramp from dark up to the accent, shared by both themes, a sound design?

- **Other systems keep a pale end, and give every step a job.** Radix has 12 steps ([scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)), Geist 10 ([colours](https://vercel.com/geist/colors)), Tailwind v4 11 in OKLCH ([colours](https://tailwindcss.com/docs/colors)) and Carbon 10 ([colour](https://carbondesignsystem.com/elements/color/overview/)). Material 3 picks a few tones from 0–100. The pale steps are for hover and selected backgrounds, subtle borders and badges.
- **Dark up to the accent is a recognised shape for a dark theme.** It matches Radix dark violet steps 3–10. This site's light tints come from `color-mix` (`--accent-hover`, `--accent-line`, `--ring`), an accepted pattern: Tailwind's opacity modifiers, Radix's alpha scales, Material's state layers. For an accent that marks only results, links, bars and hovered controls, that is enough.
- **One palette with a different step per theme** is what Tailwind and Carbon do. Material 3, Radix and Primer re-tune the values per theme instead.
- **Chroma in dark:** this site's dark text and result shade (v6, C .19) is fuller than Radix's dark text step (C .125). Material advises desaturating on dark, because of the [Helmholtz–Kohlrausch effect](https://en.wikipedia.org/wiki/Helmholtz%E2%80%93Kohlrausch_effect). Colin rejected the paler, softer shades as washed out, so v6 stays.
- **Hue drift:** Radix violet turns redder as it lightens (288 → 299). This ramp turns bluer (298 → 295), which is why it reads less pink. In OKLCH this is a taste choice, not an [Abney](https://en.wikipedia.org/wiki/Abney_effect) correction.
- **Hover:** Radix fills the button's background on hover and never recolours the icon ([base-button.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.css)). A 22% accent mix landed on border lightness with little chroma and read grey-mauve. Taken up: a fill of v3 at 50% over the panel, a border in `--accent-solid` and a bright icon.
- **Not taken up:**
  - **Brighter one-liner marks:** the research suggested moving them from v4 to v5. v4 is 2.45:1 on the panel, under WCAG's 3:1 for graphics, but the marks are decorative (`aria-hidden`), and Colin asked for this deeper violet.
  - **A pale dark-mode text step** (L .78 C .12): it is the lavender Colin rejected as washed out.
- **Hue, later the same day:** the accent moved from violet 296 to purple 308. At the lightness the accent needs in dark, violet can carry less colour than purple, so it read muted lavender. Blue can carry even less, and reads as a default link colour.
