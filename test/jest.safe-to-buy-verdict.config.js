const base = require("./jest.config");

module.exports = {
  ...base,
  collectCoverage: false,
  testPathIgnorePatterns: ["/node_modules/", ".*\\.mock\\..*"],
  testMatch: ["<rootDir>/../src/e-commerce/engine/logic/conclusion/verification/*.test.ts"]
};
