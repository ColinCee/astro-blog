# Agent notes for this blog

- **Everything about a post lives in its frontmatter.** The home page, the blog index and the post page all read the same four fields: `title` (one short title, used everywhere), `stat` (the one headline result), `statLabel` (what the stat measures) and `pubDate`. One field per fact: no subtitle or extra figures restating the stat (dropped Oct 2026 as noise). Never add a per-post table to a page; a new post must show up everywhere with no other file changed.
- **Tooling is the latest stable, modern and fast:** pnpm, Biome, the latest TypeScript and Astro, current Node LTS. Scripts are TypeScript, which Node runs directly; no new `.js` or `.mjs`. When something can be replaced by a faster or newer standard tool, do it.
- **Posts about work stay high level.** This repo is public and work code is private: no repo, product, package, file or colleague names, and no work code or config. Counts, timings and the general idea are fine. That applies to plan and draft files here too.
- **One accent per glance.** Colour sprinkled everywhere makes a page hard to read; the rule is DESIGN.md's Accent Points Rule.
- **Cloudflare's bot detection stays on.** Its injected script costs the Lighthouse best-practices score about 20 points; that score doesn't matter, so don't chase it.
- **During the redesign, `src/pages/design.astro` (`/design/` on the dev server, not built) is the design system** (colours from `docs/redesign/comps/tokens.mts`, which writes `src/styles/scales.css`). Colin wants it kept current: change it in the same commit as any design decision, and read it before proposing one.
- **Writing or reviewing a post:** follow `.claude/skills/writing-posts/SKILL.md` (story, his voice, numbers, figures, shipping). Figure components and tokens are in `DESIGN.md`.
- **A PR that changes how a page looks or moves shows it**, so Colin can see it before merging: follow `.claude/skills/pr-visuals/SKILL.md`.
