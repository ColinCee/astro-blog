import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    // Optional trimmed title for the homepage terminal's `writing` pane, where
    // a full headline does not fit. Falls back to `title`.
    shortTitle: z.string().optional(),
    description: z.string(),
    // Optional headline number ("221MB", "£826.61"). Shown large in the
    // homepage writing section; posts without one show no figure.
    stat: z.string().optional(),
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
