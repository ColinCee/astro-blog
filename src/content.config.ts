import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    // One short title, used everywhere: post page, blog index, homepage.
    title: z.string(),
    // Optional headline number ("221MB", "£826.61"): the post's result, under
    // its title, on the blog index and on the homepage.
    stat: z.string().optional(),
    // Optional few words saying what the stat is ("95% smaller").
    statLabel: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  }),
});

// The homepage's data, one JSON file each in src/data/. Collections come
// back sorted by id, so each entry carries its place on the page as `order`.
const order = z.number().int();

// Side projects, one tile each. The id is the project's name and its
// ~/projects/ path; `repo` is where it really lives, shown on hover.
const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    order,
    repo: z.string(),
    href: z.url(),
    desc: z.string(),
    // Spans two columns.
    wide: z.boolean().optional(),
  }),
});

// The "worked at" strip, oldest first.
const companies = defineCollection({
  loader: file("src/data/companies.json"),
  schema: z.object({ order, name: z.string(), year: z.string() }),
});

// The terminal's shipped pane, newest first. `before` and `after` are the
// labels; `scale` holds the two numbers the bars are drawn from (after ÷
// before), in any one unit.
const shipped = defineCollection({
  loader: file("src/data/shipped.json"),
  schema: z.object({
    order,
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
  schema: z.object({ order, services: z.string() }),
});

export const collections = {
  blog,
  projects,
  companies,
  shipped,
  skills,
  homelabStacks,
};
