import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built site (dist/) served by PHP, so the enquiry endpoint,
// legacy redirects and static pages are exercised together. Build first: `npm run build`.
// PHP comes from PHP_BIN, the portable build in .tools/ (see docs/testing.md), or the PATH.
const localPhp = resolve('.tools/php8.3/php.exe');
const php = process.env.PHP_BIN ?? (existsSync(localPhp) ? localPhp : 'php');
const phpIni = existsSync(resolve('.tools/php8.3/php.ini')) && !process.env.PHP_BIN ? ['-c', resolve('.tools/php8.3/php.ini')] : [];
const external = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
  },
  webServer: external
    ? undefined
    : [
        {
          command: 'node tests/support/smtp-sink.mjs',
          url: 'http://127.0.0.1:8025/',
          reuseExistingServer: true,
          env: { SMTP_PORT: '2525', HTTP_PORT: '8025' },
        },
        {
          command: [php, ...phpIni, '-S', '127.0.0.1:8080', '-t', 'dist', 'tests/support/router.php']
            .map((a) => (a.includes(' ') ? `"${a}"` : a))
            .join(' '),
          url: 'http://127.0.0.1:8080/',
          reuseExistingServer: true,
          stdout: 'ignore',
          stderr: 'pipe',
          env: {
            ALFEC_CONFIG: resolve('tests/fixtures/alfec-config.test.php'),
            TEST_SMTP_HOST: '127.0.0.1',
            TEST_SMTP_PORT: '2525',
            TEST_STORAGE_DIR: join(tmpdir(), `alfec-contact-test-${Date.now()}`),
          },
        },
      ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }, grep: /@mobile/ },
  ],
});
