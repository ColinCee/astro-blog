// The arrow in a stat like "32 → 9 min", for the pages (StatArrow.astro) and
// the share cards (scripts/og/render.ts). Drawn, not typed: the site's fonts
// are Latin subsets with no →, so a typed one comes from the visitor's system
// font, at that font's height. 0.5em tall with its middle at 0.36em: the
// middle of Sora and DM Mono digits.
export const statArrow = `<svg class="stat-arrow" viewBox="0 0 16 10" role="img" aria-label="to" style="width:0.8em;height:0.5em;margin:0 0.3em;vertical-align:0.11em;overflow:visible;fill:none;stroke:currentColor;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round"><path d="M1 5h13.5M10.5 1l4 4-4 4"/></svg>`;
