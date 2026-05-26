/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  // jose v6+ is pure ESM. Include it in ts-jest's transpile pass so the
  // boot smoke test (which imports the full DI graph) can resolve it.
  // pnpm hoists packages under .pnpm/<pkg>@<ver>/node_modules/<pkg>, so the
  // pattern must match that path structure.
  transformIgnorePatterns: ['/node_modules/(?!(.pnpm/)?jose)'],
  clearMocks: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary', 'html', 'lcov'],
  // Floor sits a few points below post-hardening baseline (50 tests, ~29% lines
  // / ~35% functions / ~23% branches) so refactors don't false-fail. Raise as
  // controllers and the remaining services get covered.
  coverageThreshold: {
    global: {
      lines: 25,
      functions: 30,
      branches: 20,
      statements: 25,
    },
  },
};
