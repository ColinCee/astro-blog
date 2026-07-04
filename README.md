# colincheung.dev

Colin Cheung's terminal-native personal site and engineering blog, built with Astro and deployed to Cloudflare Workers.

## Project structure

Astro pages live in `src/pages/`; shared layouts and components live in `src/layouts/` and `src/components/`; blog posts are Markdown files in `src/content/blog/`; static assets live in `public/`.

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run deploy`          | Deploy your production site to Cloudflare        |
