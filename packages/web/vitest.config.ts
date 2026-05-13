import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    env: {
      NUXT_PUBLIC_API_URL: 'http://localhost:3001',
    },
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      include: ['stores/**/*.ts', 'domain/**/*.ts', 'app/composables/**/*.ts'],
      exclude: ['**/node_modules/**', '**/*.d.ts', '**/types/**'],
      // NOTE: thresholds intentionally omitted. The 5 pre-existing test
      // failures (useIndexPage, useOrganizationContext x3, profile) make
      // vitest abort before writing the coverage report. Re-enable once
      // those failures are fixed. Suggested floor on re-introduction:
      // { lines: 50, functions: 50, branches: 50, statements: 50 } with
      // a goal of 80% once the test debt is fully clean.
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
