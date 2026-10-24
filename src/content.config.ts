import { file, glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    // One short title, used everywhere: post page, blog index, homepage.
    title: z.string(),
    // Optional one-line subtitle: the post's standfirst, its line on the
    // blog index and homepage, and the page's meta description.
    subtitle: z.string().optional(),
    // Optional headline number ("221MB", "£826.61"). Shown large in the
    // homepage writing section; posts without one show no figure.
    stat: z.string().optional(),
    // Optional few words beside the stat on the blog index ("95% smaller").
    statLabel: z.string().optional(),
    // Optional headline figures shown as a ledger under the post title. The
    // last one is treated as the result and takes the accent.
    figures: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});

// The homepage's data, one JSON file each in src/data/, listed in the order
// the page shows them.

// Side projects, one tile each. The id is the project's name and its
// ~/projects/ path; `repo` is where it really lives, shown on hover.
const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    repo: z.string(),
    href: z.string().url(),
    desc: z.string(),
    // Spans two columns.
    wide: z.boolean().optional(),
  }),
});

// The "worked at" strip, oldest first.
const companies = defineCollection({
  loader: file("src/data/companies.json"),
  schema: z.object({ name: z.string(), year: z.string() }),
});

// The terminal's shipped pane, newest first. `before` and `after` are the
// labels; `scale` holds the two numbers the bars are drawn from (after ÷
// before), in any one unit.
const shipped = defineCollection({
  loader: file("src/data/shipped.json"),
  schema: z.object({
    what: z.string(),
    where: z.string(),
    when: z.string(),
    href: z.string(),
    before: z.string(),
    after: z.string(),
    scale: z.object({ before: z.number().positive(), after: z.number() }),
  }),
});

// The whoami pane's `top`: each skill and the year I started using it.
const skills = defineCollection({
  loader: file("src/data/skills.json"),
  schema: z.object({ since: z.number().int() }),
});

// The home-lab tile: the Compose stacks, as in the homelab repo.
const homelabStacks = defineCollection({
  loader: file("src/data/homelab-stacks.json"),
  schema: z.object({ services: z.string() }),
});

export const collections = {
  blog,
  projects,
  companies,
  shipped,
  skills,
  homelabStacks,
};
