import { t } from "../../constants/messages";

export const isNumeric = (str) => {
  if (typeof str === "number") {
    return true;
  }

  if (typeof str !== "string") {
    return false;
  }
  const normalized = str.replace(/,/g, "");
  const num = parseFloat(normalized);

  return !isNaN(num) && normalized === num.toString();
};

export const replaceAll = (str, matches, replacement) => {
  let result = str;
  if (Array.isArray(matches)) {
    for (const match of matches) {
      result = String(result).split(match).join(replacement);
    }
    return result;
  }
  return String(str).split(matches).join(replacement);
};

export const numberFromString = (input: string) => {
  let str = replaceAll(input, " ", "");

  const parseAndReplace = (value) => {
    const noChars = value.replace(/[^0-9\.-]+/g, "");
    return parseFloat(noChars);
  };

  if (str.includes(".") || str.includes(",")) {
    const countOfDotes = str.split(".").length - 1;
    const countOfApostrophe = str.split(".").length - 1;
    if (countOfDotes > 1) {
      str = str.replace(".", "");
    }
    if (countOfApostrophe > 1) {
      str = str.replace(",", "");
    }

    if (str.includes(".") && str.includes(",")) {
      const indexOfDot = str.indexOf(".");
      const indexOfApostrophe = str.indexOf(",");

      if (indexOfDot > indexOfApostrophe) {
        const res = str.replace(",", "");
        return parseAndReplace(res);
      }
      const res = str.replace(".", "").replace(",", ".");
      return parseAndReplace(res);
    }
    if (str.includes(",")) {
      const res = str.replace(",", ".");
      return parseAndReplace(res);
    }
    return parseAndReplace(str);
  }
  return parseAndReplace(str);
};

export const formatString = (srt: string, data: object): string => {
  const stringWithPlaceholders = srt?.toString();
  const replacements = { ...data };
  Object.keys(replacements).forEach((key) => {
    if (replacements[key]?.i18n && typeof replacements[key].i18n === "string") {
      replacements[key] = t(replacements[key].i18n);
    }
    if (
      replacements[key] == null ||
      replacements[key] === undefined ||
      replacements[key] === "null" ||
      replacements[key] === "undefined"
    ) {
      replacements[key] = "";
    }

    if (typeof replacements[key] === "number") {
      replacements[key] = replacements[key].toString().includes(".") ? replacements[key].toFixed(2) : replacements[key];
    }

    if (Number.isNaN(replacements[key]) || replacements[key] == "NaN") {
      replacements[key] = 0;
    }
  });

  const result = stringWithPlaceholders.replace(
    /{(\w+)}/g,
    (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
      replacements.hasOwnProperty(placeholderWithoutDelimiters)
        ? replacements[placeholderWithoutDelimiters]
        : placeholderWithDelimiters
  );
  return result;
};

export const extractYearAsTimestamp = (str: string): number | null => {
  const regex = /\b(\d{4})\b/;
  const match = str.match(regex);
  if (match) {
    const year = parseInt(match[1], 10);
    const date = new Date(year, 0, 1);
    return date.getTime();
  }
  return null;
};

export const castAsNumber = (str: any, replaceComma = false): number => {
  if (typeof str === "number") {
    return str;
  }

  let value = String(str);
  if (replaceComma) {
    value = value.replace(/,/g, ".");
  }

  const num = value.replace(/[^\d.-]/g, "");
  const result = parseFloat(num);
  if (Number.isNaN(result)) {
    return null;
  }

  const units = {
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12
  };

  const regex = new RegExp(`(${num})([kKmMbBtT])`);
  const suffixMatch = value.match(regex);
  if (suffixMatch) {
    const unit = suffixMatch[2].toLowerCase();
    return result * units[unit];
  }

  return result;
};

export const displayNumber = (numberToDisplay, decimalPoints = 0) => {
  let number = castAsNumber(numberToDisplay);
  if (number === null || Number.isNaN(number)) {
    return "0";
  }
  const DIVIDER = 1000;
  const isNegative = number < 0;
  number = Math.abs(number);

  let label = "";
  let divisor = 1;

  if (number >= DIVIDER * 1000) {
    label = "M";
    divisor = DIVIDER * 1000;
  } else if (number >= DIVIDER) {
    label = "k";
    divisor = DIVIDER;
  }

  let value = number / divisor;
  value = Number(value.toFixed(decimalPoints)); // Ensure we round to the specified decimal points

  const formattedNumber = value.toLocaleString("en-US", {
    minimumFractionDigits: decimalPoints,
    maximumFractionDigits: decimalPoints
  });

  const sign = isNegative ? "-" : "";
  return `${sign}${formattedNumber}${label}`;
};

export const cleanNonVisibleChars = (text) =>
  typeof text === "string" ? text.replace(/[\n\t\r\s]+/g, " ").trim() : "";

export const removeNonEnglishChars = (str) => {
  let cleanedStr = str.replace(/[^a-zA-Z0-9\s@!#$%&'*+/=?^_`{|}~\-]/g, "");
  cleanedStr = cleanedStr.replace(/\s+/g, " ").trim();
  return cleanedStr;
};

export const countWords = (name) => {
  const separators = /[ ,.-]/;
  const words = name.split(separators);
  return words.length;
};
