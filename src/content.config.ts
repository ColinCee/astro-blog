import { glob } from "astro/loaders";
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

export const collections = { blog };
