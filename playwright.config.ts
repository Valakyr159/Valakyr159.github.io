import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4300',
  },
  webServer: {
    command: 'npx http-server dist/portfolio-web/browser -p 4300 --proxy http://localhost:4300?',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
