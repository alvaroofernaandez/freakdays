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
  // NOTE: thresholds intentionally omitted. jest@29.7's threshold checker
  // crashes on Node 22 (reading 'sync' of undefined inside CoverageReporter).
  // Coverage is still collected, reported, and uploaded as a CI artifact.
  // Reinstate thresholds once jest is upgraded (likely jest 30+ or a
  // patched 29.x).
};
