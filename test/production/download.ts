/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

import axios from "axios";
import unzipCrx from "unzip-crx-3";
import fs from "fs";
import * as path from "path";

const crxUrl =
  // eslint-disable-next-line max-len
  "https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&x=id%3Ddiimbnkonenihjhekcinppckeadneiij%26installsource%3Dondemand%26uc";
const outputFolder = path.join(__dirname, "safe-deal");
let isDownloaded = false;

export async function downloadExtension() {
  if (isDownloaded) {
    return;
  }

  try {
    const response = await axios({
      method: "get",
      url: crxUrl,
      responseType: "arraybuffer"
    });

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const crxPath = path.join(outputFolder, "safe-deal.crx");
    fs.writeFileSync(crxPath, response.data);

    await unzipCrx(crxPath, outputFolder);

    if (fs.existsSync(crxPath)) {
      fs.rmSync(crxPath);
    }

    console.log("\x1b[32m%s\x1b[0m", "Extension downloaded and extracted successfully.");
    isDownloaded = true;
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Failed to download or extract the extension:", error);
    isDownloaded = false;
  }
}
