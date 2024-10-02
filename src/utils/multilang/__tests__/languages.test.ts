import { getDomainCurrency, isContainedIn, isDomainSmallLanguage, isSmallLanguage } from "../languages";

describe("isContainedIn", () => {
  const multi = ["apple", "banana", "orange"];

  it("should return true when text is contained in multi", () => {
    const text = "apple is my favorite fruit";
    expect(isContainedIn(text, multi)).toBe(true);
  });

  it("should return true when text is partially contained in multi", () => {
    const text = "i like bananas and oranges";
    expect(isContainedIn(text, multi)).toBe(true);
  });

  it("should return false when text is not contained in multi", () => {
    const text = "i prefer grapes";
    expect(isContainedIn(text, multi)).toBe(false);
  });

  it("should return false when text is null", () => {
    expect(isContainedIn(null, multi)).toBe(false);
  });

  it("should return false when text is undefined", () => {
    expect(isContainedIn(undefined, multi)).toBe(false);
  });

  it("should return false when multi is undefined", () => {
    expect(isContainedIn("apple", undefined)).toBe(false);
  });

  it("should return false when both text and multi are null", () => {
    expect(isContainedIn(null, null)).toBe(false);
  });

  it("should return false when both text and multi are undefined", () => {
    expect(isContainedIn(undefined, undefined)).toBe(false);
  });
});

describe("isSmallLanguage", () => {
  it("should return true for small languages", () => {
    const smallLangs = [
      "am",
      "bg",
      "ca",
      "cs",
      "da",
      "el",
      "et",
      "fi",
      "fil",
      "gu",
      "he",
      "hr",
      "hu",
      "kn",
      "lt",
      "lv",
      "ml",
      "mr",
      "ms",
      "no",
      "ro",
      "sk",
      "sl",
      "sr",
      "sw",
      "ta",
      "te",
      "uk",
      "vi"
    ];

    smallLangs.forEach((lang) => {
      expect(isSmallLanguage(lang)).toBe(true);
    });
  });

  it("should return false for non-small languages", () => {
    const largeLangs = [
      "ar",
      "bn",
      "de",
      "en",
      "en_AU",
      "en_GB",
      "en_US",
      "es",
      "es_419",
      "fa",
      "fr",
      "hi",
      "id",
      "it",
      "ja",
      "ko",
      "nl",
      "pl",
      "pt_BR",
      "pt_PT",
      "ru",
      "sv",
      "th",
      "tr",
      "zh_CN",
      "zh_TW"
    ];

    largeLangs.forEach((lang) => {
      expect(isSmallLanguage(lang)).toBe(false);
    });
  });
});

describe("isDomainSmallLanguage", () => {
  const testCases = [
    ["www.aliexpress.com", "en", false],
    ["es.aliexpress.com", "es", false],
    ["he.aliexpress.com", "he", true],
    ["www.amazon.com", "en", false],
    ["www.amazon.de", "de", false],
    ["www.ebay.com", "en", false],
    ["www.ebay.cn", "cn", false]
  ];

  testCases.forEach(([domain, localeCode, expected]) => {
    it(`should return ${expected} for domain ${domain} with locale ${localeCode}`, () => {
      expect(isDomainSmallLanguage(domain)).toBe(expected);
    });
  });

  it("should return false for domains not in DOMAIN_LANG_MAPPING", () => {
    expect(isDomainSmallLanguage("www.unknown.com")).toBe(false);
  });
});

describe("getDomainCurrency", () => {
  it("should return correct currency for fr.aliexpress.com", () => {
    const currencyInfo = getDomainCurrency("https://fr.aliexpress.com");
    expect(currencyInfo).toEqual({ symbol: "€", name: "EUR" });
  });

  it("should return correct currency for www.amazon.com", () => {
    const currencyInfo = getDomainCurrency("https://www.amazon.com");
    expect(currencyInfo).toEqual({ symbol: "$", name: "USD" });
  });

  it("should return correct currency for www.ebay.de", () => {
    let currencyInfo = getDomainCurrency("https://www.ebay.de");
    expect(currencyInfo).toEqual({ symbol: "€", name: "EUR" });
    currencyInfo = getDomainCurrency("www.ebay.de");
    expect(currencyInfo).toEqual({ symbol: "€", name: "EUR" });
    currencyInfo = getDomainCurrency("ebay.de");
    expect(currencyInfo).toEqual({ symbol: "€", name: "EUR" });
  });

  it("should return null for unknown domain", () => {
    const currencyInfo = getDomainCurrency("https://unknownsite.com");
    expect(currencyInfo).toBeNull();
  });

  it("should return correct currency for subdomain variation", () => {
    const currencyInfo = getDomainCurrency("https://es.aliexpress.com");
    expect(currencyInfo).toEqual({ symbol: "€", name: "EUR" });
  });
});
