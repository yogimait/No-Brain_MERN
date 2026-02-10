/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['**/__tests__/**/*.test.js'],
    moduleFileExtensions: ['js', 'json'],
    verbose: true,
    collectCoverage: false,
    testTimeout: 10000,
    // Force Jest to use ESM
    extensionsToTreatAsEsm: [],
};

export default config;
