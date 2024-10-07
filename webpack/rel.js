/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const packageFilePath = path.resolve(__dirname, "../package.json");

fs.readFile(packageFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(`\x1b[31mError reading ${packageFilePath}: ${err}\x1b[0m`);
    return;
  }

  const packageJson = JSON.parse(data);
  const { version } = packageJson;

  // Stage all changes
  exec("git add .", (addErr) => {
    if (addErr) {
      console.error(`\x1b[31mError staging changes: ${addErr}\x1b[0m`);
      return;
    }

    // Commit all staged changes with a message indicating version release
    exec(`git commit -m "build: version release v${version}"`, (commitErr) => {
      if (commitErr) {
        console.error(`\x1b[31mError committing changes: ${commitErr}\x1b[0m`);
        return;
      }

      // Create tag
      exec(`git tag -a v${version} -m "Version ${version}"`, (tagErr, stdout) => {
        if (tagErr) {
          console.error(`\x1b[31mError creating tag: ${tagErr}\x1b[0m`);
          return;
        }

        console.log(`\x1b[32mTag v${version} created. ${stdout}\x1b[0m`);
        exec("git push --tags --no-verify", (pushErr, pushStdout) => {
          if (pushErr) {
            console.error(`\x1b[31mError pushing tags: ${pushErr}\x1b[0m`);
            return;
          }
          console.log(`\x1b[32mTags pushed successfully. ${pushStdout}\x1b[0m`);
        });

        exec("git push --no-verify", (pushErr, pushStdout) => {
          if (pushErr) {
            console.error(`\x1b[31mError pushing: ${pushErr}\x1b[0m`);
            return;
          }
          console.log(`\x1b[32mPushed successfully. ${pushStdout}\x1b[0m`);
          console.log(`\x1b[32m\n\n Release done successfully. @:-) \n\n ${pushStdout}\x1b[0m`);
        });
      });
    });
  });
});
