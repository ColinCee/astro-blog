# What makes polished tech sites look polished (live CSS tokens, fetched 2026-10-27)

## Per site

**Linear** (https://linear.app) - dark default, bg #08090a (light #fff). 5 bg tiers, 3 border tiers, 4 text tiers (#f7f8f8 / #d0d6e0 / #8a8f98 / #62666d), all cool-tinted. One hue, indigo #5e6ad2 on buttons, #7070ff links; 5 small status hues for icons only. `--border-hairline:1px` at 5-8% white (#ffffff0d/#ffffff14). Rings `0 0 0 1px #0003`. Radii 4-32 + pill. Inter Variable at weights 400/510/590/680, Berkeley Mono; titles to 72px, lh 1.0-1.1, -0.022em; body 15px/1.6, -0.011em. Radial glows and grain. Hero: product screenshots.

**Vercel** (https://vercel.com) - system theme; light #fafafa/#fff, dark #000/4%. 10-step pure-neutral grey plus `gray-alpha` tiers (#0000000d, #00000014; dark #ffffff0f, #ffffff17, #ffffff24). Black/white buttons; blue #0070f7 only for links/focus. Borders are shadows: `0 0 0 1px #00000014` (dark #ffffff25); elevation stacked at 4% alpha. Radius 6px (8px marketing). Geist Sans/Mono; h1 64px/64px semibold, tracking -3.84px (-0.06em). Hero: shader canvas behind text, no screenshots or logos. Its published design guide (https://vercel.com/design.md): "Design in monochrome", borders only when earned, "hard reject decorative gradients, glows, blobs… glass effects".

**Stripe** (https://stripe.com) - light only, bg #fff/#f8fafd. Navy-tinted greys: #e5edf5, #d4dee9, #7d8ba4, #64748d, #1a2c44, text #061b31. Brand indigo #533afd on buttons/links; the hero is one animated multi-hue gradient `<canvas>`. Shadows blue-tinted rgba(0,55,112,.1). Radii 2/4/6/16. Söhne at weight 300 for headings, lh 1.03, -0.01/-0.02em; hero size viewport-height-driven (34-44px floor). Customer logo strip.

**Raycast** (https://www.raycast.com) - dark only, bg #07080a; bg tiers #101111→#494b4d, fg #f4f4f6→#5e6366. Brand red #ff6363, but buttons are white #ffffffd0 with black text; blue/green/yellow at 15% alpha for status. Borders #ffffff1a / #ffffff0f; "glass" = `inset 0 1px #ffffff1a` plus heavy blur/backdrop-filter. Inter 600 hero 36→64px, lh 1.1, ss02/ss08; Geist Mono. Hero: keyboard graphic.

**Resend** (https://resend.com) - dark default (#000; light #fdfdfd). Radix grey scales (gray-1 #141517 → gray-12 #f0f0f0), neutral. Hero and nav monochrome: "Email for developers" in Domaine serif 64→96px, lh 1, -0.01em, filled with a white→50% white text gradient; an `accent` token and one #00A3FF blue exist but not in the hero. Inter body, Commit Mono. Borders `inset 0 0 0 1px #ffffff1a`; heavy gradients and backdrop-filter.

**Arc** (https://arc.net) - now a sunset notice. Light, body off-white #FFFCEC; brand blue #3139FB + red #FB3A4D; Exposure VAR hero 76px/600/-0.032em; 13 font families; shadows `0 8px 30px rgba(0,0,0,.12)`; hand-signature images.

**Notion** (https://www.notion.com) - light, bg #fff, surface #f6f5f4; warm greys (#f9f9f8, #dfdcd9, #78736f, #494744, #191918). Black primary buttons; blue #097fe8 links only. Borders #0000001a / #00000014. 4-layer micro shadows at 1-4% alpha. NotionInter, Lyon Text serif, iA Writer Mono; titles 54-96px, tracking ≈ -0.03em. Hero: pile of images plus screenshots; big logo wall.

**Figma** (https://www.figma.com) - light (#FFFFFF; dark #000000). In the token layer only two greys exist; every other tier is `color-mix` of fg with transparency (muted text 54%, card 4%, border 16%, hover border 40%). Black buttons; colour only through product imagery. figmaSans at default weight 320; display 72→104px, lh 1, tracking -0.078→-0.125rem. Screenshot carousel, 13-logo row.

**Framer** (https://www.framer.com) - dark, bg rgb(0,0,0); surfaces #111/#1e1e1e/#242424/#303030, text #999, pure neutral. Border #ffffff12 (7%). One hue, blue #0099ff for links and buttons. Inter/Inter Display 12-14px at weight 500 with cv01/cv09/cv11; h1 GT Walsheim Medium 42→54px, -0.04em. Radius 8px. Hero video and site screenshots.

**Cursor** (https://cursor.com) - system; light #f7f7f4 (warm), dark #14120b. fg #26251e; cards step warm #f2f1ed→#e1e0db. Text/border tiers are `color-mix` of fg (50/60/40%; borders 2.5% and 10%). Single accent orange #f54e00. CursorGothic sans, Berkeley Mono, EB Garamond serif for quotes. h1 only 26px, weight normal; the product demo is the hero. Radii 2/4/8, shadows near-none.

**Apple** (https://www.apple.com) - light; tiles alternate #fff / #f5f5f7 / #1d1d1f. Cool-tinted greys (245,245,247 / 29,29,31 / 134,134,139) plus alpha tiers (.88/.72/.56/.48/.16/.08). Blue #0071e3 buttons, #0066cc links. SF Pro; headline 48px/1.08/600 at -0.002em (near-zero tracking at display size, -0.022em body). Pill buttons; one box-shadow in the whole CSS. Product photography and video.

**Ooting** (https://ooting.app) - light default #fafaf9 (dark #0e0e0e). Untinted greys (#111, #5e5e5e, #c4c4c4, #f3f3f3, #ebebeb). Accent green #00c957, plus 4 "crew" pastels, 6 category pastels, 3 weather colours. Inter Tight 800 hero 44→88px, -0.04em, lh 0.96; Caveat handwriting; rotated "sticker" cards. Radii 22px cards / 12px controls. Seven different shadow recipes, up to `0 16px 40px rgba(0,0,0,.4)`. Hero: photo plus swipe card.

**Hues per page:** Linear 1 (+5 status icons), Vercel 0 (+blue links), Stripe 1 + multi-hue gradient hero, Raycast 1 + 3 status at 15% alpha, Resend 0-1, Arc 2, Notion 0 (+blue links), Figma 0 in chrome, Framer 1, Cursor 1, Apple 1, Ooting ~10.

## Common traits across the ten strongest

1. **Monochrome chrome.** Surfaces, text and borders are greys; 4 of 10 put no hue on the primary button (Vercel, Notion, Figma, Resend).
2. **One hue, one or two jobs:** primary button and/or links. Status colours are tiny, often at 15% alpha.
3. **Greys from one tint, often one formula:** Figma, Cursor, Vercel, Apple and Linear derive tiers as alpha/color-mix of the foreground, so every border and muted text shares one tint (cool: Linear, Raycast, Apple, Stripe; warm: Notion, Cursor).
4. **Hairline alpha borders:** 1px at 5-16% opacity (#ffffff0d-1a dark, #00000014-1a light); Vercel draws them as `0 0 0 1px` shadows.
5. **Near-black / near-white backgrounds,** rarely pure: #08090a, #07080a, #14120b; #fafafa, #f7f7f4, #f8fafd.
6. **Shadows tiny or layered, never one fat drop:** 2-10% alpha, multi-stop; dark sites use an `inset 0 1px rgba(255,255,255,.1)` top highlight instead.
7. **Small, consistent radius scale:** 4/6/8/12/16 + pill; 6-8px on controls.
8. **One sans at a tuned weight, tracking tied to size:** Inter 510/590, figmaSans 320, Söhne 300, Geist 600; display tracking -0.02 to -0.06em at 48-96px, body -0.01em, display line-height 1.0-1.1; a mono face for data.
9. **The product is the hero image** (screenshots or photography); illustration is rare.
10. **Sections 64-128px, containers 960-1280px, one signature effect per site** (Stripe's gradient, Raycast's glass, Resend's text gradient, Linear's grain).

## The three traits that separate "premium" from "template"

1. **Greys are designed, not defaulted.** 4-6 tiers of one tinted grey, or alpha mixes of one ink; templates use untinted Tailwind `gray-200/500` and a solid #e5e7eb border. Ooting's untinted greys on a warm #fafaf9 page show the mismatch.
2. **Colour is rationed.** One accent in at most two roles; templates spread 3+ hues across badges, cards and gradients (Ooting ~10 hues, 7 shadow recipes). Vercel writes the rule down: monochrome, colour only for state or data.
3. **Type is tuned, not bold.** Custom or variable weights (320, 510, 590), tracking that tightens with size, optical features (cv01, ss02), display line-height ≈1; templates use 700/800 at default tracking.
