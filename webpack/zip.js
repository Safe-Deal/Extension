/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Zip = require("dir-compressor");
const fsExtra = require("fs-extra");

const DEPLOYMENT_DIR = "./dist_upload/";

const zipFileName = process.argv[2] || "extension.zip";

(async () => {
  if (!fs.existsSync(DEPLOYMENT_DIR)) {
    await fsExtra.mkdirp(DEPLOYMENT_DIR);
    console.log(`\x1b[32mbuild:zip => ${path.relative(process.cwd(), DEPLOYMENT_DIR)} created\x1b[0m`);
  }

  const zipFilePath = `${DEPLOYMENT_DIR}${zipFileName}`;
  const extension = new Zip("./dist", zipFilePath, [".DS_Store"]);
  await extension.createZip();
  console.log(`\x1b[32mCreated: ${path.relative(process.cwd(), zipFilePath)}\x1b[0m`);

  const sourceZipFilePath = `${DEPLOYMENT_DIR}source.zip`;
  const source = new Zip(".", sourceZipFilePath, [
    ".DS_Store",
    ".git",
    "dist_upload",
    "node_modules",
    "deploy",
    "tools",
    "assets",
    "coverage",
    "dist",
    "test"
  ]);
  await source.createZip();
  console.log(`\x1b[32mCreated: ${path.relative(process.cwd(), sourceZipFilePath)}\x1b[0m`);
})();
