import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'nexo-*.spec.ts',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: process.env.NEXO_URL ?? 'http://localhost:8081',
    locale: 'pt-BR',
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
});
