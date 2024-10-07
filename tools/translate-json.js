/* eslint-disable no-console */
const fs = require("fs");
const { Translate } = require("@google-cloud/translate").v2;

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

const translate = new Translate({
  key: apiKey
});

const costPerMillionCharsUsd = 20;

const batchSize = 100;

const translateInBatches = async (textToTranslate, sourceLang, targetLang) => {
  const translations = [];
  for (let i = 0; i < textToTranslate.length; i += batchSize) {
    const batch = textToTranslate.slice(i, i + batchSize);
    console.log(`📤 Sending batch to the API ${sourceLang} -> ${targetLang} ...`);
    const [batchTranslations] = await translate.translate(batch, { from: sourceLang, to: targetLang });
    translations.push(...batchTranslations);
  }
  return translations;
};

const translateRecursive = async (obj, sourceLang, targetLang) => {
  const textToTranslate = [];
  const placeholders = [];

  const collectText = (obj, path = []) => {
    if (typeof obj === "string") {
      textToTranslate.push(obj);
      placeholders.push(path);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => collectText(item, path.concat(index)));
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => collectText(value, path.concat(key)));
    }
  };

  collectText(obj);

  const translations = await translateInBatches(textToTranslate, sourceLang, targetLang);

  const applyTranslations = (obj, path = []) => {
    if (typeof obj === "string") {
      const index = placeholders.findIndex((p) => JSON.stringify(p) === JSON.stringify(path));
      return translations[index];
    }
    if (Array.isArray(obj)) {
      return obj.map((item, index) => applyTranslations(item, path.concat(index)));
    }
    if (typeof obj === "object" && obj !== null) {
      const translatedObj = {};
      Object.entries(obj).forEach(([key, value]) => {
        translatedObj[key] = applyTranslations(value, path.concat(key));
      });
      return translatedObj;
    }
    return obj;
  };

  return applyTranslations(obj);
};

const translateObject = async (obj, sourceLang, targetLangs) => {
  const translations = {};

  for (const lang of targetLangs) {
    console.log(`🌐 Translating to ${lang} from ${sourceLang} ...`);
    translations[lang] = await translateRecursive(obj, sourceLang, lang);
    console.log(`📥 Received translation for ${lang} from ${sourceLang} ...`);
  }

  return translations;
};

const translateJson = async (inputLang, targetLangs) => {
  try {
    const inputPath = `${inputLang}.json`;
    const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
    const langsAmounts = targetLangs.split(",").length;
    const textLength = JSON.stringify(data).length;
    const estimatedCost = ((textLength / 1_000_000) * costPerMillionCharsUsd * langsAmounts).toFixed(2);

    console.log(`\n🔄 Starting translation process...`);
    console.log(`\n¤ Estimated cost: $${estimatedCost} for ${langsAmounts} languages`);

    const translations = await translateObject(data, inputLang, targetLangs.split(","));

    for (const [lang, translatedData] of Object.entries(translations)) {
      const outputPath = `${lang}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2));
      console.log(`✅ Written to ${outputPath}`);
    }

    console.log("\nTranslation completed successfully.");
  } catch (error) {
    console.error("❌ Error during translation:", error);
  }
};

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node translate-json <inputLang> <targetLangs>");
  process.exit(1);
}

const [inputLang, targetLangs] = args;
translateJson(inputLang, targetLangs);
