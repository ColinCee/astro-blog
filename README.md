<div align="center">

# colincheung.dev

A terminal-flavoured personal site and engineering blog.<br>
Static, fast, and every post leads with the number it's about.

[**Site**](https://colincheung.dev) · [**Writing**](https://colincheung.dev/blog) · [**CV**](https://colincheung.dev/cv)

[![Deploy](https://github.com/ColinCee/astro-blog/actions/workflows/deploy.yml/badge.svg?branch=main&event=push)](https://github.com/ColinCee/astro-blog/actions/workflows/deploy.yml?query=branch%3Amain)
![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme-dark.png">
  <img alt="The homepage: the name, a rotating one-liner, and one terminal window with fastfetch, skills, Glasgow weather, the latest posts and the projects" src="docs/readme-light.png" width="860">
</picture>

</div>

## Inside

- **Homepage:** one terminal window of panels: who I am, every post with its result, the weather in Glasgow, and five projects as figures, with live numbers from the home lab.
- **Writing:** MDX posts with figures that draw themselves in, and code blocks themed to match.
- **CV:** one page that prints clean on white.
- **Dark first**, with a light theme a click away.
- **Held to a speed budget:** every pull request fails if a page gets heavier or slower ([how](docs/page-speed.md)).

## Run it

```sh
pnpm install
pnpm exec playwright install chromium   # once, for the tests
pnpm dev                                # http://localhost:4321
pnpm check                              # everything CI runs
```

Node and pnpm versions are pinned in `package.json`.

<details>
<summary><b>All commands</b></summary>

| Command | Does |
| --- | --- |
| `pnpm build` | Build the static site into `dist/` |
| `pnpm test` | The Playwright tests (layout, type, motion, home lab) on a dev server |
| `pnpm speed` | Build, then the per-page speed budgets |
| `pnpm preview` | Build, then serve it through the Worker locally |
| `pnpm format` | Lint-fix and format with Biome, and wrap post prose at 100 columns |
| `pnpm og` | Render each post's social card |
| `pnpm run deploy` | Build and deploy to Cloudflare |

</details>

## How it fits together

```text
src/pages/        routes: home, blog/, cv
src/content/blog/ the posts, one MDX file each
src/components/   site/ (head, nav, footer) · home/ · figures/ · cv/
src/styles/       tokens.css, the design system's colours, type and motion
worker/           index.ts, one route, /homelab.json, for the home lab's live numbers and stacks;
                  edge-cities.ts, Cloudflare's data centres, which the build fetches
og/               the link-preview images and icons (`pnpm og`)
pr-media/         screenshots, videos and charts for pull requests
checks/           repo checks: no JavaScript files, catch-all folder names, post prose
                  wrapped at 100 columns (`pnpm format` rewraps it)
```

Astro builds everything to static files; a Cloudflare Worker serves them. Pushes to `main` deploy through GitHub Actions after the same checks pull requests run, with the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

The build reads two things from outside: Cloudflare's list of data centres (`worker/edge-cities.ts`, for the edge's city count and the Worker's city names) and the home server's list of stacks from the live `/homelab.json` (`src/components/home/window/data.ts`). Either one missing, it uses the dated snapshot committed beside it (`worker/edge-cities.snapshot.json`, `src/data/homelab-stacks.snapshot.json`) and prints a warning; it never rewrites a tracked file.

**Deploy order with the homelab repo.** The Worker refuses a body with a key it does not know. When the body the home server PUTs to `/homelab.json` changes shape, deploy this site first, with a Worker that takes both the old and the new body, and the home server second. (Nov 2026: `stacks` was added this way.)

[DESIGN.md](DESIGN.md) holds the visual system and [PRODUCT.md](PRODUCT.md) who it's for.
