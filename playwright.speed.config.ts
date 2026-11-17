import { defineConfig } from "@playwright/test";

// The speed budgets (tests/speed.spec.ts) run against the built site, one test
// at a time so timings don't share the machine. Run `pnpm build` first.
// --ignore-lock keeps the server in the foreground, as in playwright.config.ts.
const port = Number(process.env.PORT ?? 4381);

export default defineConfig({
  testDir: "tests",
  testMatch: "speed.spec.ts",
  workers: 1,
  fullyParallel: false,
  // A budget missed once and met on the retry is reported as flaky and still
  // fails: a spike is something to explain, not to absorb.
  retries: 1,
  failOnFlakyTests: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `pnpm astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
