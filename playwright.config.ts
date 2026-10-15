import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";
const demoPassword =
  process.env.PARTSDESK_E2E_PASSWORD || randomBytes(32).toString("hex");
process.env.PARTSDESK_E2E_PASSWORD = demoPassword;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    actionTimeout: 15000,
    httpCredentials: {
      username: "demo",
      password: demoPassword,
      send: "always",
    },
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run web",
    url: "http://127.0.0.1:3101/api/health",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      PORT: "3101",
      DATABASE_URL: "file:./e2e.db",
      UPLOAD_DIR: "./data/e2e-uploads",
      SEARCH_PROVIDER: "demo",
      NEXT_TELEMETRY_DISABLED: "1",
      CHECKPOINT_DISABLE: "1",
      DEMO_AUTH_REQUIRED: "1",
      DEMO_USERNAME: "demo",
      DEMO_PASSWORD: demoPassword,
      DEMO_EPHEMERAL: "1",
      APP_ORIGIN: "https://patient-space-1234-3000.app.github.dev",
    },
  },
});
