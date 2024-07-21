module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '../src/test/integration',
    testRegex: '.*\\.int-spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/node_modules/**',
      '!**/dist/**',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
  };
  