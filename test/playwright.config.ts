import { defineConfig, devices } from "@playwright/test";

export const MAX_TIMEOUT_IN_MS = 2 * 60 * 1000;
export const RETRIES = 1;

export default defineConfig({
  retries: RETRIES,
  use: {
    video: "on",
    trace: "retain-on-failure",
    ignoreHTTPSErrors: true
  },
  outputDir: "./results",
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "./result-report", open: "never", saveScreenshots: true }]
  ],
  timeout: MAX_TIMEOUT_IN_MS,
  globalSetup: "./playwright.setup",
  projects: [
    {
      name: "Chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        video: "retain-on-failure",
        screenshot: "on"
      },
      testDir: "./e2e",
      testMatch: "**/*.e2e.*"
    }
  ],
  expect: {
    timeout: MAX_TIMEOUT_IN_MS
  }
});
