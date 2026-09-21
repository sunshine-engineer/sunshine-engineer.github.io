import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  globalSetup: './tests/setup.ts',
  globalTeardown: './tests/teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:4322/portfolio/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322/portfolio/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
});
