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
      reporter: ['text', 'html', 'lcov'],
      include: ['stores/**/*.ts', 'domain/**/*.ts', 'app/composables/**/*.ts'],
      exclude: ['**/node_modules/**', '**/*.d.ts', '**/types/**'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
