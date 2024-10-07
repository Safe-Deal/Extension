/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
const newman = require("newman");
const fs = require("fs");
const path = require("path");
const colors = require("colors");

const AFF_DIR = "ads_providers";
const POSTMAN_COLLECTION = path.resolve(__dirname, "collection/SAFE-DEAL-Affiliates.postman_collection.json");
const collection = require(POSTMAN_COLLECTION);
const adsProvidersDir = path.resolve(__dirname, AFF_DIR);
const outputScript = path.resolve(__dirname, "aff-list-files.js");
const API_DATA_LABEL = "api-data";
const SKIP_LABEL = "not-used";

if (fs.existsSync(adsProvidersDir)) {
  fs.rmSync(adsProvidersDir, { recursive: true, force: true });
  console.log(colors.green(`Previous ${AFF_DIR} directory removed.\n`));
}
const folderCounters = {};
const folderDataWritten = {};
const updateCalls = [];

newman.run(
  {
    collection,
    reporters: "cli"
  },
  (err, summary) => {
    if (err) {
      console.error(colors.red(err.toString()));
      return;
    }

    summary.run.executions.forEach((execution) => {
      const folderName = execution.item.parent().name;

      if (!folderName || folderName.includes(SKIP_LABEL)) {
        console.log(colors.america(`Skipping ${execution.item.name} in folder ${folderName}`));
        return;
      }

      folderDataWritten[folderName] = folderDataWritten[folderName] || false;

      if (execution.item.name.includes(API_DATA_LABEL)) {
        console.log(colors.green(`Processing ${execution.item.name} in folder ${folderName}`));
        const fileCounter = (folderCounters[folderName] || 0) + 1;
        folderCounters[folderName] = fileCounter;
        folderDataWritten[folderName] = true;

        const providerDir = `${AFF_DIR}/${folderName}`;
        const dir = path.resolve(__dirname, providerDir);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const filename = `aff_${folderName}_${fileCounter}.json`;
        const fullPath = path.join(dir, filename);
        const localPath = path.join(providerDir, filename);
        const responseBody = execution.response.stream.toString();
        fs.writeFileSync(fullPath, responseBody);

        console.log(colors.blue(`Saved response to ${filename} in folder ${folderName}`));
        const configName = `${folderName}Config`;
        if (fileCounter === 1) {
          updateCalls.push(`\n// ${folderName} `);
        }
        updateCalls.push(`updateAffiliates("${localPath}", ${configName});`);
      }
    });

    if (Object.keys(folderDataWritten).length > 0) {
      console.log(colors.green("\nFolders processed:"));
      Object.keys(folderDataWritten).forEach((folder) => {
        console.log(
          colors.green(
            `- ${folder}: ${folderDataWritten[folder] ? "Data written" : "No api-data requests or data written"}`
          )
        );
        if (!folderDataWritten[folder]) {
          console.error(
            colors.red(`Error: Folder "${folder}" did not have any api-data requests or no data was written.`)
          );
        }
      });

      if (updateCalls.length > 0) {
        console.log(colors.green(`\nGenerating ${outputScript}`));
        const content = `const runConversionFiles = ({updateAffiliates,sourceknowledgeConfig,takeadsConfig,partnerboostConfig,impactConfig,admitadConfig}) => {
	${updateCalls.map((call) => `${call}`).join("\n")}
};
// end of affiliates
module.exports = { runConversionFiles };`;

        fs.writeFileSync(outputScript, content);
        console.log(colors.green(`${outputScript} generated.`));
      }
    } else {
      console.error(colors.red("No folders were processed."));
    }
  }
);
