// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from 'astro-expressive-code';
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [expressiveCode({
    // Try changing the theme(s) here:
    themes: ['github-dark'], // Example: Try this if you were using another
    // ... other options
  }),mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
