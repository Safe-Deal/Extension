const TIMEOUT_IN_SECONDS = 120;

module.exports = {
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  automock: false,
  testEnvironment: "jest-environment-jsdom",
  testTimeout: TIMEOUT_IN_SECONDS * 1000,
  roots: [
    "<rootDir>/src"
    // Remove or update this line if the 'brain' directory doesn't exist
    // "<rootDir>/brain"
  ],
  setupFiles: ["./jest.setup.js"],
  setupFilesAfterEnv: ["./jest.setup.env.js"],
  testPathIgnorePatterns: [".*\\.mock\\..*"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx|mjs)$": "ts-jest"
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy"
  },
  transformIgnorePatterns: ["node_modules/(?!(@mui|swiper)/)"]
};
