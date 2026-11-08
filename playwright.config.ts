import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    headless: true,
    trace: "retain-on-failure",
    viewport: {
      width: 1440,
      height: 1200,
    },
  },
});
