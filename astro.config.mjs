// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://colincheung.dev",
  integrations: [
    expressiveCode({
      // Light and dark variants; Expressive Code switches on the system setting.
      themes: ["github-light", "github-dark"],
      // Sit code blocks on the site's raised surface instead of pure white/black.
      styleOverrides: {
        codeBackground: "var(--pane)",
        borderColor: "var(--line)",
        frames: {
          shadowColor: "transparent",
          editorBackground: "var(--pane)",
          terminalBackground: "var(--pane)",
          editorTabBarBackground: "var(--panel)",
          editorActiveTabBackground: "var(--pane)",
          editorTabBarBorderBottomColor: "var(--line)",
          terminalTitlebarBackground: "var(--panel)",
          terminalTitlebarBorderBottomColor: "var(--line)",
        },
      },
    }),
    sitemap(),
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
