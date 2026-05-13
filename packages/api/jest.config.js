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
  clearMocks: true,

  // Coverage configuration. CI uploads the report; thresholds start
  // intentionally low because only 3 tests exist today (audit baseline).
  // Raise as more test coverage is added.
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
  // Floor — baseline is ~3% (only 3 tests exist today). Floor sits 1pp below
  // baseline so legitimate refactors don't false-fail, but anything dropping
  // coverage beyond rounding does. Raise as test count grows.
  coverageThreshold: {
    global: {
      lines: 2,
      functions: 3,
      branches: 1,
      statements: 2,
    },
  },
};
