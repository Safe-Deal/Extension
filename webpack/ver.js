/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const semver = require("semver");
const { exec } = require("child_process");

const mainPackageFile = "../package.json";
const filesToUpdate = ["./manifest_v3/manifest.json", "./manifest_v2/manifest.json"];

const COLOR_RESET = "\x1b[0m";
const COLOR_GREEN = "\x1b[32m";
const COLOR_RED = "\x1b[31m";

function logError(message) {
  console.error(`${COLOR_RED}${message}${COLOR_RESET}`);
}

function logSuccess(message) {
  console.log(`${COLOR_GREEN}${message}${COLOR_RESET}`);
}

function getLatestCommitType(callback) {
  exec("git log -1 --pretty=%B", (error, stdout) => {
    if (error) {
      callback(error, null);
      return;
    }

    const commitMessage = stdout.trim();
    let commitType;

    if (/^feat(\(.*\))?:/.test(commitMessage)) {
      commitType = "minor";
    } else if (/^fix(\(.*\))?:/.test(commitMessage)) {
      commitType = "patch";
    } else if (/^BREAKING CHANGE:/.test(commitMessage)) {
      commitType = "major";
    } else {
      commitType = "patch";
    }

    callback(null, commitType);
  });
}

function updateVersion(filePath, newVersion, callback) {
  fs.readFile(filePath, "utf8", (errUpdate, data) => {
    if (errUpdate) {
      callback(`Error reading ${filePath}: ${errUpdate}`);
      return;
    }

    const jsonData = JSON.parse(data);
    jsonData.version = newVersion;

    const updatedJsonData = JSON.stringify(jsonData, null, 2);
    fs.writeFile(filePath, updatedJsonData, "utf8", (err) => {
      if (err) {
        callback(`Error writing ${filePath}: ${err}`);
        return;
      }

      callback(null);
    });
  });
}

getLatestCommitType((error, commitType) => {
  if (error) {
    logError(`Error reading git commit message: ${error}`);
    return;
  }

  const mainFilePath = path.resolve(__dirname, mainPackageFile);
  fs.readFile(mainFilePath, "utf8", (errorF, data) => {
    if (errorF) {
      logError(`Error reading ${mainFilePath}: ${errorF}`);
      return;
    }

    const mainJsonData = JSON.parse(data);
    const newVersion = semver.inc(mainJsonData.version, commitType);

    updateVersion(mainFilePath, newVersion, (errUpdateVer) => {
      if (errUpdateVer) {
        logError(errUpdateVer);
        return;
      }

      logSuccess(`Successfully updated ${mainPackageFile} to version ${newVersion}`);

      filesToUpdate.forEach((file) => {
        const filePath = path.resolve(__dirname, file);
        updateVersion(filePath, newVersion, (err) => {
          if (err) {
            logError(err);
            return;
          }
          logSuccess(`Successfully updated ${file} to version ${newVersion}`);
        });
      });
    });
  });
});
