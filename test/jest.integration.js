/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const isDebugMode = () => typeof process.env.DEBUG !== "undefined";

class IntegrationTestManager {
  constructor() {
    this.timingDirectory = path.join(__dirname, "timing");
  }

  getTestTimingFilePath(relativeTestPath) {
    const newRelativePath = relativeTestPath
      .replace(/^src[\\/]/, "")
      .replace(/__tests__[\\/]/, "")
      .replace(/__test__[\\/]/, "")
      .replace(/\.(tsx?|jsx?)$/, ".json");

    return path.join(this.timingDirectory, newRelativePath);
  }

  readTestTiming(relativeTestPath) {
    const testTimingFilePath = this.getTestTimingFilePath(relativeTestPath);
    if (fs.existsSync(testTimingFilePath)) {
      const fileContents = fs.readFileSync(testTimingFilePath, "utf8");
      return JSON.parse(fileContents);
    }
    return {};
  }

  writeTestTiming(relativeTestPath, testName, testTiming) {
    const testTimingFilePath = this.getTestTimingFilePath(relativeTestPath);
    const directory = path.dirname(testTimingFilePath);

    let timings = {};
    if (fs.existsSync(testTimingFilePath)) {
      timings = JSON.parse(fs.readFileSync(testTimingFilePath, "utf8"));
    }

    timings[testName] = testTiming;

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(testTimingFilePath, JSON.stringify(timings, null, 2));
  }

  updateTestStatus(testPath, testName, testResult) {
    const currentDate = new Date().toISOString().split("T")[0];
    const testTiming = {
      date: currentDate,
      status: testResult.passed ? "passed" : "failed"
    };
    this.writeTestTiming(testPath, testName, testTiming);
  }

  static getRelativeTestPath(testPath) {
    return path.relative(process.cwd(), testPath).replace(/\\/g, "/");
  }

  // eslint-disable-next-line class-methods-use-this
  shouldRunTest(testTiming) {
    if (isDebugMode()) {
      console.warn("integration test always run in debug mode");
      console.warn("process.debugPort", process.debugPort);
      return true;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    return !testTiming || testTiming.date !== currentDate || testTiming.status === "failed";
  }

  static isIntegrationTest(testPath, testName) {
    const indicator = "integration";
    const isName = testName && testName.toLocaleLowerCase().includes(indicator);
    const isPath = testPath && testPath.toLocaleLowerCase().includes(indicator);
    const isDir = path.dirname(testPath).toLocaleLowerCase().includes(indicator);

    return isName || isPath || isDir;
  }

  itWorks(testName, testFn) {
    const relativeTestPath = IntegrationTestManager.getRelativeTestPath(expect.getState().testPath);
    if (IntegrationTestManager.isIntegrationTest(relativeTestPath, testName)) {
      const testTimings = this.readTestTiming(relativeTestPath);
      const testTiming = testTimings[testName];

      if (!this.shouldRunTest(testTiming)) {
        test(`Integration - passed on: ${testTiming.date} : ${testName} - Skipped`, () => {
          expect(true).toBeTruthy();
        });
        return;
      }

      // eslint-disable-next-line jest/expect-expect, jest/valid-title
      test(testName, async () => {
        try {
          await testFn();
          this.updateTestStatus(relativeTestPath, testName, { passed: true });
        } catch (error) {
          this.updateTestStatus(relativeTestPath, testName, { passed: false });
          throw error;
        }
      });
    } else {
      // eslint-disable-next-line jest/expect-expect, jest/valid-title
      test(testName, testFn);
    }
  }
}

// eslint-disable-next-line jest/no-export
module.exports = new IntegrationTestManager();
