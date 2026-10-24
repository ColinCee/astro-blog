<div align="center">

# colincheung.dev

**A terminal-native personal site and engineering blog.**

**▶ Live: [colincheung.dev](https://colincheung.dev)** · [Blog](https://colincheung.dev/blog) · [CV](https://colincheung.dev/cv)

[![Deploy](https://github.com/ColinCee/astro-blog/actions/workflows/deploy.yml/badge.svg?branch=main&event=push)](https://github.com/ColinCee/astro-blog/actions/workflows/deploy.yml?query=branch%3Amain)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Fcolincheung.dev&label=live&up_message=online&down_message=offline)](https://colincheung.dev)

![Screenshot](docs/screenshot.png)

</div>

## What it does

- Terminal-inspired homepage with a dark terminal window
- Technical blog written as Markdown content collections, with Expressive Code blocks
- Printable CV page that prints clean to ink-on-white
- Light and dark themes that follow the system setting
- Sitemap generated at build time

## Stack

| Area | Tooling |
| --- | --- |
| Framework | Astro |
| Content | Markdown content collections |
| Code blocks | Astro Expressive Code |
| Styling | Custom CSS tokens in `src/styles/tokens.css`; scoped styles beside each component |
| Hosting | Cloudflare Workers |
| Deploys | GitHub Actions + Wrangler |

## Run locally

```sh
npm install
npm run dev
```

## How it works

Astro builds the pages in `src/pages/` and the posts in `src/content/blog/`, styled with a small custom design system, into a fully static site. Wrangler uploads `dist/` to Cloudflare as an assets-only Worker (`wrangler.json`); there is no server code. [DESIGN.md](DESIGN.md) owns the visual system and [PRODUCT.md](PRODUCT.md) the audience and purpose.

## Project structure

```text
src/pages/             Routes: index.astro composes the homepage; blog/, cv.astro, cortex/
src/layouts/           Base (the shell: head, nav, footer) and Post (a post, inside Base)
src/components/site/   Head, Nav, Footer: the parts every page shares
src/components/home/   The homepage's sections: Hero, Terminal and its panes, WorkedAt, Projects, Writing, Reach
src/content/blog/      The posts, one Markdown file each
src/data/              The homepage's data as JSON: projects, companies, shipped, skills, homelab stacks
src/content.config.ts  The collections and their schemas: blog, plus one per data file
src/styles/            tokens.css (colours, type, widths) and prose.css (post text)
src/scripts/           Browser scripts shared between components, and the post figures' widgets
public/                Static files copied into the build as they are
```

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the production site |
| `npm run check` | Type-check (`astro check`), check formatting, build, Wrangler dry run, then the tests |
| `npm run format` | Format the code with Prettier (posts and docs are left alone) |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm test` | Run the Playwright layout and typography tests; they start their own dev server on `PORT` (default 4380) |

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which installs dependencies, type-checks, checks formatting, builds the site, validates the Wrangler config, runs the tests, and deploys with Cloudflare secrets. Pull requests run the same steps without the deploy.

Required repository secrets:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```
