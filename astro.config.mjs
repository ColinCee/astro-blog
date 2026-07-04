// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://colincheung.dev",
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
    }),
    sitemap(),
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
