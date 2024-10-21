const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("../tsconfig.json");

const TIMEOUT_IN_SECONDS = 120;

module.exports = {
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  automock: false,
  testEnvironment: "jest-environment-jsdom",
  testTimeout: TIMEOUT_IN_SECONDS * 1000,
  roots: ["<rootDir>/../src"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.env.js"],
  testPathIgnorePatterns: [".*\\.mock\\..*"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx|mjs)$": "ts-jest"
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/../" })
  },
  transformIgnorePatterns: ["node_modules/(?!(@mui|swiper)/)"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/../tsconfig.json"
    }
  }
};
