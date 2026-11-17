import { chromium, type FullConfig } from "@playwright/test";

// The dev server reloads a page the first time it serves it, as it prepares
// that page's modules, and a test running then loses its page mid-check. The
// pages only it serves are opened once here, before any test starts.
export const devOnly = ["/design/"];

export default async function warmUp(config: FullConfig) {
  const dev = config.projects.find((p) => p.name === "dev");
  if (!dev) return;
  const { baseURL } = dev.use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Only the site's own files.
  await page.route(
    (url) => !url.href.startsWith(String(baseURL)),
    (route) => route.abort(),
  );
  for (const path of devOnly) {
    await page.goto(`${baseURL}${path}`);
    // A warm-up that cannot finish must not stop the tests.
    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {});
  }
  await browser.close();
}
