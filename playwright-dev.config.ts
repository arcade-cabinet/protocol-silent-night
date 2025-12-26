import { defineConfig, devices } from '@playwright/test';

const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: hasMcpSupport ? 60000 : 30000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3001', // Use existing dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: !hasMcpSupport,
    video: hasMcpSupport ? 'on-first-retry' : 'off',
    actionTimeout: 10000,
  },
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: hasMcpSupport
          ? {
              args: ['--enable-webgl', '--ignore-gpu-blocklist'],
            }
          : {
              args: [
                '--use-gl=swiftshader',
                '--enable-webgl',
                '--ignore-gpu-blocklist',
                '--disable-gpu-sandbox',
              ],
            },
      },
    },
  ],
});
