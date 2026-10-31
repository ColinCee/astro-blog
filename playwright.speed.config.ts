import { defineConfig } from "@playwright/test";

// The speed budgets (tests/speed.spec.ts) run against the built site, one test
// at a time so timings don't share the machine. Run `pnpm build` first.
const port = Number(process.env.PORT ?? 4381);

export default defineConfig({
  testDir: "tests",
  testMatch: "speed.spec.ts",
  workers: 1,
  fullyParallel: false,
  // Timing on a shared CI machine can spike once; bytes never need this.
  retries: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `pnpm astro preview --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
