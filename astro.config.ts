import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import { codeThemes } from "./src/styles/code-theme";

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

// Each post's last change (updatedDate, else pubDate) by its URL, so the
// sitemap can say when a page last changed.
const blog = "./src/content/blog";
const lastmod = Object.fromEntries(
  readdirSync(blog)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f): [string, Date | undefined] => {
      const front = readFileSync(`${blog}/${f}`, "utf8").split("---")[1] ?? "";
      // A frontmatter line such as `pubDate: "Oct 20 2026"`.
      const date = (key: string) =>
        front
          .split("\n")
          .find((line) => line.startsWith(`${key}:`))
          ?.slice(key.length + 1)
          .trim()
          .replace(/^"|"$/g, "");
      const when = date("updatedDate") ?? date("pubDate");
      const slug = f.replace(/\.mdx?$/, "");
      return [
        `https://colincheung.dev/blog/${slug}/`,
        when ? new Date(when) : undefined,
      ];
    })
    .filter(
      (entry): entry is [string, Date] =>
        entry[1] !== undefined && !Number.isNaN(entry[1].valueOf()),
    ),
);

export default defineConfig({
  site: "https://colincheung.dev",
  compressHTML: true,
  // CSS in the page itself: a separate file is one more round trip before
  // anything paints (200-300 ms on a slow phone), for a few KB a page.
  build: { inlineStylesheets: "always" },
  // Fonts served from the site itself, not Google: no second connection, and
  // fallbacks sized to match, so nothing moves when the font arrives.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-geist",
      // Sized to match whichever system font a visitor has: Segoe UI,
      // the Apple system font, Roboto on Android, else Arial.
      fallbacks: ["system-ui"],
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    {
      provider: fontProviders.google(),
      name: "Sora",
      cssVariable: "--font-sora",
      fallbacks: ["system-ui"],
      weights: ["200 600"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    {
      provider: fontProviders.google(),
      name: "DM Mono",
      cssVariable: "--font-dm-mono",
      weights: [300, 400, 500],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      // Its fallback is "DM Mono fallback" in tokens.css: Astro sizes one only
      // to Courier New, which Android and Linux lack.
      fallbacks: [],
    },
  ],
  vite: {
    define: { __BUILD__: JSON.stringify(buildInfo()) },
  },
  integrations: [
    expressiveCode({
      // The site's own code theme (its greys, no accent), dark and
      // light, switched with the site's theme (data-theme on <html>, dark unless
      // the visitor chose light), not the system setting.
      themes: codeThemes,
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ":root" : ':root[data-theme="light"]',
      // Sit code blocks on the site's raised surface instead of pure white/black.
      styleOverrides: {
        // The site's mono and corners, so a code block matches the figures
        codeFontFamily: "var(--mono)",
        uiFontFamily: "var(--mono)",
        borderRadius: "var(--r)",
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
          // One file tab per block; it needs no coloured marker.
          editorActiveTabIndicatorTopColor: "transparent",
          editorActiveTabIndicatorBottomColor: "transparent",
        },
      },
    }),
    // After Expressive Code, so code blocks in MDX posts get it too.
    mdx(),
    sitemap({
      // The 404 page and the dev-only design page are not pages to index.
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/design/"),
      serialize: (item) => {
        const when = lastmod[item.url];
        return when ? { ...item, lastmod: when.toISOString() } : item;
      },
    }),
  ],
});
