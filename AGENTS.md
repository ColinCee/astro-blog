# Agent notes for this blog

- **Everything about a post lives in its frontmatter.** The home page, the blog index and the post page all read the same fields: `title` (one short title, used everywhere), `subtitle` (optional, one short line), `stat` (the one headline number), `statLabel`, `figures`. One field per fact: no long and short versions of the same thing. Never add a per-post table to a page; a new post must show up everywhere with no other file changed.
- **Tooling is the latest stable, modern and fast:** pnpm, Biome, the latest TypeScript and Astro, current Node LTS. When something can be replaced by a faster or newer standard tool, do it.
- **Posts about work stay high level.** This repo is public and work code is private: no repo, product, package, file or colleague names, and no work code or config. Counts, timings and the general idea are fine. That applies to plan and draft files here too.
- **Cloudflare's bot detection stays on.** Its injected script costs the Lighthouse best-practices score about 20 points; that score doesn't matter, so don't chase it.
- **Writing or reviewing a post:** follow `.claude/skills/writing-posts/SKILL.md` (story, his voice, numbers, figures, shipping). Figure components and tokens are in `DESIGN.md`.
