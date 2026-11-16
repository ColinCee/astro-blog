import { readdirSync } from "node:fs";
import { chromium, type FullConfig } from "@playwright/test";

// The dev server reloads a page the first time it serves it, as it prepares
// that page's modules, and a test running then loses its page mid-check. Every
// page is opened once here, before any test starts.
export default async function warmUp(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const posts = readdirSync("src/content/blog")
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => `/blog/${f.replace(/\.mdx?$/, "")}/`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const path of ["/", "/blog/", "/cv/", "/design/", ...posts])
    await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
  await browser.close();
}
