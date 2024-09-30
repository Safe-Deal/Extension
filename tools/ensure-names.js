/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { exit } = require("process");

const localesDir = path.join(__dirname, "../src", "browser-extension", "public", "_locales");
let error = false;

const shortenSentence = (sentence, maxLength) => {
  const ellipsis = "...";
  if (sentence.length <= maxLength) return sentence;
  const adjustedLength = maxLength - ellipsis.length;
  let shortened = sentence.slice(0, adjustedLength).trim();
  if (sentence[adjustedLength] !== " " && shortened.includes(" ")) {
    shortened = shortened.slice(0, shortened.lastIndexOf(" "));
  }
  return `${shortened}${ellipsis}`;
};

fs.readdirSync(localesDir).forEach((locale) => {
  const filePath = path.join(localesDir, locale, "messages.json");
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (data.appName && data.appName.message.length > 45) {
      console.log(`Name Too Long ${data.appName.message.length} (${locale}): ${data.appName.message}`);
      let message = data.appName && data.appName.message;
      const brandsToRemove = ["eBay", "Amazon", "AliExpress", "еБаи", "Амазон", "АлиЕкпресс"];

      brandsToRemove.forEach((brand) => {
        if (message.length > 45 && message.includes(brand)) {
          const regex = new RegExp(`,? ?${brand}`);
          message = message.replace(regex, "");
          message = message.replace(/„“/g, "").trim();
          message = message.replace(/, ,/g, ",").replace(/,,/g, ",").trim(); // For commas
          message = message.replace(/\.\./g, ".").trim(); // For periods
          message = message.replace(/[,.] ?$/, "").trim();
        }
      });

      const shortenString = (str, maxLen = 45) => {
        while (str.length > maxLen) {
          const lastComma = str.lastIndexOf(",");
          if (lastComma === -1) break;
          str = str.slice(0, lastComma);
        }
        return str;
      };

      if (message.length > 45) {
        message = shortenString(message);
      }

      if (message.length > 45) {
        console.log("\x1b[31m", `Still too long!!! (${locale}): ${message}`, "\x1b[0m");
        error = true;
      } else {
        data.appName.message = message;
        console.log("\x1b[32m", `Truncated (${locale}): ${message}`, "\x1b[0m");
      }
    }

    if (data.appNameShort && data.appNameShort.message.length > 12) {
      console.log(`Short Name Too Long ${data.appNameShort.message.length} (${locale}): ${data.appNameShort.message}`);
      data.appNameShort.message = shortenSentence(data.appNameShort.message, 12);
      console.log(` ->  ${data.appNameShort.message}\n`);
    }

    if (data.appDescription && data.appDescription.message.length > 132) {
      console.log(
        `Description Too Long ${data.appDescription.message.length} (${locale}): ${data.appDescription.message}`
      );
      data.appDescription.message = shortenSentence(data.appDescription.message, 132);
      console.log(` ->  ${data.appDescription.message}\n`);
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }
});

if (error) {
  exit(1);
} else {
  console.log("\x1b[32m", "All names are correct", "\x1b[0m");
}
