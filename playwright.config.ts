import { defineConfig } from "@playwright/test";

// The tests start their own dev server, on PORT or 4380, so they never test a
// server another checkout left running on Astro's default 4321.
const port = Number(process.env.PORT ?? 4380);

export default defineConfig({
  testDir: "tests",
  // The speed budgets need the built site: playwright.speed.config.ts.
  testIgnore: "speed.spec.ts",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `pnpm astro dev --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
