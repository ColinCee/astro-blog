import { defineConfig } from "@playwright/test";

// The tests run against the built site, as it ships: `astro preview` of
// dist/, so run `pnpm build` first (`pnpm test` does). The dev server, which
// compiles each page on its first visit, serves only what the build leaves
// out: the design page. Each server is started here, on PORT or 4380 and two
// above it, so the tests never use one another checkout left running.
// --ignore-lock keeps a server in the foreground: when Astro sees an AI agent
// it otherwise starts it in the background and exits, which Playwright
// reports as "exited early".
const port = Number(process.env.PORT ?? 4380);
// Two on, not one: the speed budgets serve the build on 4381.
const devPort = port + 2;
const server = (command: string, at: number) => ({
  command: `pnpm astro ${command} --port ${at} --ignore-lock`,
  url: `http://localhost:${at}`,
  reuseExistingServer: false,
  timeout: 120_000,
  // The server's own log beside a failure: a restart would show here.
  stdout: "pipe" as const,
});

export default defineConfig({
  testDir: "tests",
  // The speed budgets: playwright.speed.config.ts.
  testIgnore: "speed.spec.ts",
  globalSetup: "./tests/warm-up.ts",
  fullyParallel: true,
  // A failed test runs once more, so a flaky one is named as flaky, with a
  // trace of its second run; the run still fails, since a flaky test is a bug.
  retries: 1,
  failOnFlakyTests: true,
  reporter: "list",
  use: { trace: "on-first-retry" },
  projects: [
    {
      name: "built",
      grepInvert: /@dev/,
      use: { baseURL: `http://localhost:${port}` },
    },
    // Tests tagged @dev: pages only the dev server has.
    {
      name: "dev",
      grep: /@dev/,
      use: { baseURL: `http://localhost:${devPort}` },
    },
  ],
  webServer: [server("preview", port), server("dev", devPort)],
});
