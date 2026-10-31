# Status colours, accent hue and control corners (live tokens, fetched 2026-10-30)

Hexes as shipped; their OKLCH (L, hue) computed. Contrast vs white.

## 1. Status colours

- **Geist** (https://vercel.com/geist/colors): red/amber/green/blue share one step map (700-800 solids, 900-1000 text). Text-900: red oklch(55% .23 25), amber (53% .15 55), green (52% .15 148), blue (53% .24 257).
- **Primer** (`@primer/primitives`; https://primer.style/product/getting-started/foundations/color-usage/): text danger #d1242f L56 h25, success #1a7f37 L52 h148, attention #9a6700 L55 h75, accent #0969da L54 h257, muted grey #59636e L50. Accent also means "neutral information"; the primary button *is* success green #1f883d.
- **Radix** (https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette): error red/ruby/tomato/crimson; success green/teal/jade/grass/mint; warning yellow/amber/orange; info blue/indigo/sky/cyan. Same 12 step roles per scale; steps 11/12 guarantee APCA Lc 60/90. Step 11: red #ce2c31 L56, green #218358 L54, amber #ab6400 L57, slate #60646c L50.
- **Atlassian** (https://atlassian.design/foundations/color): text danger #AE2E24, warning #9E4C00, success #4C6B1F, info #1558BC (L48-51). Brand #1868DB = information-bold. "Don't use an accent when the color has semantic meaning." 4.5:1 text, 3:1 essential non-text.
- **Polaris** (`@shopify/polaris-tokens`): brand fill black #303030; blue #005bd3 is "emphasis" only.
- **Carbon** (https://carbondesignsystem.com/patterns/status-indicator-pattern/): error #da1e28, success #24a148, warning #f1c21b, serious #ff832b, info #0043ce (h263). "Relying solely on color to convey status is insufficient"; indicators 3:1 against background.
- **Linear** (linear.app CSS): red #eb5757, green #27a644, yellow #f0bf00, separate from brand indigo #5e6ad2.
- **shadcn** (globals.css): only `--destructive` oklch(.577 .245 27); primary is black.

**Answers:** red/amber/green is universal (hues 21-29 / 52-90 / 129-179); info is blue h257-263, often the brand blue itself. Lightness is set per role, not per hue: status text L48-57, level with muted grey (L50); fills L62-65, but amber/yellow fills L82-85 measure 1.6-1.8:1 and lean on icons, labels or dark text. Danger stays apart through hue distance and by keeping colour off controls (Polaris, Vercel: black primaries).

## 2. Accent hue

- Blue-indigo h245-280: Vercel #0070f3 (links only), Linear #7170ff, Stripe #533afd (h277), Resend #00a3ff, Josh Comeau, Maxime Heckel.
- Raycast #ff6363 sits on the danger hue (h23), so its buttons are white. Supabase green #3ecf8e (h159): full `brand-*` and `destructive-*` scales, one `success` mention; the brand replaced success. Brittany Chiang teal #5eead4 on slate; tailwindcss.com sky + pink.
- Radix pairs Slate (blue-tinted grey) with iris, indigo, blue, sky, cyan.

## 3. Control corners

- Buttons: Primer 6px, Geist 6px, Atlassian 6px (compact and lozenges 4px), Polaris 8px (badges 8px), shadcn 8px, Radix Themes 4px, Carbon 0.
- Pills: Linear marketing buttons (4px when square); switches in shadcn, Carbon and Radix; badges in shadcn; Carbon tags (16px).

## Recommendations

1. Keep blue h262: 112° or more from every status hue, and the hue Slate-type greys pair with. Indigo h278 is safe but is where Linear and Stripe sit.
2. From the accent candidates in `tokens.mts`, drop teal h195 (Radix success, 45° from green) and magenta h340 (45° from red). Avoid h20-180.
3. Let the accent double as "info", as Primer and Atlassian do; add no blue status colour.
4. Keep status hues green 150 / amber 70 / red 25 (Primer 148/75/25, Geist 148/55/25), with status text at L≈.50 like muted grey.
5. The draft amber dot `warn9` #f09c17 is 2.2:1 on the light page. Use L≈.64 C.16 (#c07b06, 3.4:1), and put a word beside every dot.
6. Ship no red until an error state exists. A result that got worse stays ink; ink buttons already keep danger from competing.
7. Corners: 8px buttons and inputs, pill switches, pill status badges to match the dots; one chip shape site-wide.
