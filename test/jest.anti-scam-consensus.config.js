const base = require("./jest.config");

module.exports = {
  ...base,
  collectCoverage: false,
  testPathIgnorePatterns: ["/node_modules/", ".*\\.mock\\..*"],
  testMatch: ["<rootDir>/../src/anti-scam/verification/api-scam-partners-consensus.test.ts"]
};
