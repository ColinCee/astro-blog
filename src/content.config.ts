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

// Side projects, one entry in the home window's picker each. The id is the
// project's name; `repo` is where it lives, linked under its figure.
const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: z.object({
    order,
    repo: z.string(),
    href: z.url(),
    // The short line under the name in the homepage list
    desc: z.string(),
    // The caption over the project's figure
    caption: z.string(),
    // A second line under the figure, where it has one
    note: z.string().optional(),
    // The posts that write the project up: what their slugs start with, or
    // "*" for every post. Only ties that are plainly true (see Colin first).
    posts: z.string().optional(),
    // The id of the project this one runs on.
    runsOn: z.string().optional(),
  }),
});

// The "worked at" strip, oldest first.
const companies = defineCollection({
  loader: file("src/data/companies.json"),
  schema: z.object({ order, name: z.string(), year: z.string() }),
});

// The home window's skills panel: each skill and the year I started using it.
const skills = defineCollection({
  loader: file("src/data/skills.json"),
  schema: z.object({ since: z.number().int() }),
});

export const collections = {
  blog,
  projects,
  companies,
  skills,
};
