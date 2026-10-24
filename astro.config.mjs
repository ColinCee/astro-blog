// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import { execSync } from "node:child_process";

// The commit the site is built from, for the homepage status bar, footer and
// the site's own tile. Read once here and handed to pages as __BUILD__. In CI
// without git history it falls back to GITHUB_SHA and the build time; outside
// git it is empty and the page leaves the build line out.
function buildInfo() {
  try {
    const [hash, when, ...subject] = execSync(
      "git log -1 --format=%h%x09%cI%x09%s",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    )
      .trim()
      .split("\t");
    return { hash, when, subject: subject.join("\t") };
  } catch {
    const sha = process.env.GITHUB_SHA;
    return sha
      ? { hash: sha.slice(0, 7), when: new Date().toISOString(), subject: "" }
      : { hash: "", when: "", subject: "" };
  }
}

export default defineConfig({
  site: "https://colincheung.dev",
  vite: {
    define: { __BUILD__: JSON.stringify(buildInfo()) },
  },
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
    // After Expressive Code, so code blocks in MDX posts get it too.
    mdx(),
    sitemap(),
  ],
});
