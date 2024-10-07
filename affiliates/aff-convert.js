/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("colors");

const baseFilePath = path.resolve(__dirname, "_base/shutafim.json");
const targetFilePath = path.resolve(__dirname, "../const/shutafim.json");
const { runConversion, INVALID_DOMAINS } = require("./aff-list");
const { getDomainFromURL, addParams, isValidUrl, getValidAffiliateLink } = require("./aff-convertUtils");

const existingAffiliates = fs.existsSync(baseFilePath) ? JSON.parse(fs.readFileSync(baseFilePath)) : [];
console.log(`Loaded ${existingAffiliates.length} existing affiliates from base file.`.green);

const globalInvalid = [];
const globalSummary = [];
let globalAddedCount = 0;
let globalInvalidCount = 0;
let globalDuplicatesCount = 0;
let globalNotOkCount = 0;

function getNestedProperty(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

const updateAffiliates = (filePath, config) => {
  console.log(`Processing ${path.basename(filePath)} ...`.blue);

  const rawTargetFile = fs.readFileSync(path.resolve(__dirname, filePath));
  const rawDataJson = JSON.parse(rawTargetFile);
  const affiliates = getNestedProperty(rawDataJson, config.affiliatesArrayKey);
  let addedCount = 0;
  let invalidCount = 0;
  let duplicatesCount = 0;

  affiliates.forEach((affiliate) => {
    const name =
      affiliate[config.nameKey]?.split(" ")[0] || (config.altNameKey && affiliate[config.altNameKey]?.split(" ")[0]);
    const domain = getDomainFromURL(affiliate[config.domainKey], name, path.basename(filePath));
    const shutafLink = getValidAffiliateLink(affiliate, config.affiliationLinkKey, config.altAffiliationLinkKey);
    const shutaf = addParams(shutafLink, config.addParams, config.deleteParams);

    const isExist = existingAffiliates.some((ea) => {
      if (ea.domain.endsWith(".")) {
        return domain.includes(ea.domain);
      }

      return domain === ea.domain;
    });

    const isBlacklisted = INVALID_DOMAINS.some((invalid) => {
      if (invalid.endsWith(".")) {
        return domain.includes(invalid);
      }

      return domain === invalid;
    });

    const isProperUrl = isValidUrl(shutafLink);
    const isValid = isProperUrl && !isBlacklisted && domain && domain.length > 0 && shutafLink && shutafLink.length > 0;

    if (isValid && !isExist) {
      existingAffiliates.push({ name, domain, target: "/", shutaf });
      addedCount += 1;
      globalAddedCount += 1;
    } else {
      globalNotOkCount += 1;
      globalInvalid.push({
        isProperUrl,
        isBlacklisted,
        isExist,
        isValid,
        shutafLink,
        affName: config.affName,
        name,
        domain,
        sourceFile: path.basename(filePath)
      });

      if (isExist) {
        duplicatesCount += 1;
        globalDuplicatesCount += 1;
      }

      if (!isValid) {
        invalidCount += 1;
        globalInvalidCount += 1;
      }
    }
  });

  globalSummary.push({
    file: path.basename(filePath),
    processed: affiliates.length,
    added: addedCount,
    invalid: invalidCount,
    duplicates: duplicatesCount
  });
};

const displaySummary = () => {
  console.log("\n📊 Summary Report 📊\n".brightGreen.underline);

  globalSummary.forEach(({ file, processed, added, invalid, duplicates }) => {
    console.log(
      `${file.bold}: Processed: ${processed.toString().brightCyan}, Added: ${added.toString().brightGreen}, Invalid: ${invalid.toString().brightRed}, Duplicates: ${duplicates.toString().brightYellow}`
    );
  });

  console.log("");

  const total = globalSummary.reduce(
    (acc, curr) => ({
      processed: acc.processed + curr.processed,
      added: acc.added + curr.added,
      invalid: acc.invalid + curr.invalid,
      duplicates: acc.duplicates + curr.duplicates
    }),
    { processed: 0, added: 0, invalid: 0, duplicates: 0 }
  );

  console.log(
    `🔹 Total: Processed: ${total.processed.toString().brightCyan}, Added: ${total.added.toString().brightGreen}, Invalid: ${total.invalid.toString().brightRed}, Duplicates: ${total.duplicates.toString().brightYellow}`
      .magenta
  );

  const successRate = ((total.added / total.processed) * 100).toFixed(2);
  const duplicateRate = ((total.duplicates / total.processed) * 100).toFixed(2);
  const invalidRate = ((total.invalid / total.processed) * 100).toFixed(2);

  console.log(`🔹 Success Rate: ${successRate}%`.green);
  console.log(`🔹 Duplicate Rate: ${duplicateRate}%`.yellow);
  console.log(`🔹 Invalid Rate: ${invalidRate}%`.red);
  console.log("\n========================================\n".grey);

  console.log("Global Summary this run:\n".brightGreen);
  if (globalNotOkCount > 0) {
    console.log(`Invalid: ${globalNotOkCount} | `.red);
  }
  if (globalAddedCount > 0) {
    console.log(`Added: ${globalAddedCount} | `.green);
  }
  if (globalInvalidCount > 0) {
    console.log(`Invalid: ${globalInvalidCount} | `.red);
  }
  if (globalDuplicatesCount > 0) {
    console.log(`Duplicates: ${globalDuplicatesCount} | `.yellow);
  }
  console.log("\n========================================\n".grey);
};

const displayDuplicateDetails = () => {
  if (!globalInvalid.length) {
    console.log("\nNo duplicate details to display.".green);
    return;
  }

  console.log("\nDuplicates:".yellow);

  const duplicatesByFile = globalInvalid.reduce((acc, dup) => {
    if (!dup.isExist) {
      return acc;
    }
    const fileKey = `${dup.sourceFile} - ${dup.affName}`;
    acc[fileKey] = (acc[fileKey] || []).concat(dup);
    return acc;
  }, {});

  const invalidByFile = globalInvalid.reduce((acc, dup) => {
    if (dup.isValid) {
      return acc;
    }
    const fileKey = `${dup.sourceFile} - ${dup.affName}`;
    acc[fileKey] = (acc[fileKey] || []).concat(dup);
    return acc;
  }, {});

  Object.entries(duplicatesByFile).forEach(([fileKey, duplicates]) => {
    console.log(`\nDuplicate Affiliates: ${fileKey}`.yellow);
    duplicates.forEach((dup) => {
      console.log(`  Name: ${dup.name} | Domain: ${dup.domain}`.yellow);
    });
  });

  Object.entries(invalidByFile).forEach(([fileKey, invalids]) => {
    console.log(`\nErrored Affiliates: ${fileKey}`.red);
    invalids.forEach((dup) => {
      let reason = "Unknown";
      if (dup.isBlacklisted) {
        reason = "Blacklisted";
      } else if (!dup.domain || dup.domain.length === 0) {
        reason = "Invalid domain";
      } else if (!dup.shutafLink || dup.shutafLink.length === 0 || !dup.isProperUrl) {
        reason = "Invalid Shutaf link";
      }
      console.log(` - Name: ${dup.name} | Reason: ${reason} | Domain: ${dup.domain} | Shutaf: ${dup.shutafLink} `.red);
    });
  });
};

runConversion(updateAffiliates);
displayDuplicateDetails();
displaySummary();
fs.writeFileSync(targetFilePath, JSON.stringify(existingAffiliates));
console.log(`\nUpdated ${existingAffiliates.length} affiliates to ${path.basename(targetFilePath)}`.green);
