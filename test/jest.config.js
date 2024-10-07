const TIMEOUT_IN_SECONDS = 120;

module.exports = {
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  automock: false,
  testEnvironment: "jest-environment-jsdom",
  testTimeout: TIMEOUT_IN_SECONDS * 1000,
  roots: ["./../src", "../brain"],
  setupFiles: ["./jest.setup.js"],
  setupFilesAfterEnv: ["./jest.setup.env.js"],
  testPathIgnorePatterns: [".*\\.mock\\..*"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx|mjs)$": "ts-jest"
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
    "^@utils/(.*)$": "<rootDir>..//src/utils/$1",
    "^@constants/(.*)$": "<rootDir>..//src/constants/$1",
    "^@anti-scam/(.*)$": "<rootDir>/../src/anti-scam/$1",
    "^@browser-extension/(.*)$": "<rootDir>/../src/browser-extension/$1",
    "^@data/(.*)$": "<rootDir>/../src/data/$1",
    "^@e-commerce/(.*)$": "<rootDir>/../src/e-commerce/$1",
    "^@shutaf/(.*)$": "<rootDir>/../src/shutaf/$1"
  },
  transformIgnorePatterns: ["node_modules/(?!(@mui|swiper)/)"]
};
