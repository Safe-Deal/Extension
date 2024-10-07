import {
  castAsNumber,
  displayNumber,
  formatString,
  isNumeric,
  numberFromString,
  removeNonEnglishChars,
  replaceAll
} from "../strings";

describe("String Functions", () => {
  describe("isNumeric", () => {
    test.each([
      ["123", true],
      ["-123", true],
      ["123.45", true],
      ["abc", false],
      ["123abc", false],
      ["123,45", true],
      ["1,234.56", true],
      ["1.234,56", true],
      ["1.234", true],
      ["1.234,56", true],
      ["1.234.56", false],
      [1234, true]
    ])("isNumeric(%s) should return %s", (input, expected) => {
      expect(isNumeric(input)).toBe(expected);
    });
  });

  describe("replaceAll", () => {
    test("replaces all instances of a string", () => {
      expect(replaceAll("abc abc abc", "abc", "xyz")).toBe("xyz xyz xyz");
    });
    test("replaces all instances of multiple matches", () => {
      expect(replaceAll("abc def abc def", ["abc", "def"], "xyz")).toBe("xyz xyz xyz xyz");
    });
  });

  describe("numberFromString", () => {
    test.each([
      ["123", 123],
      ["123.45", 123.45],
      ["123,45", 123.45],
      ["1,234.56", 1234.56],
      ["1.234,56", 1234.56],
      ["abc123", 123]
    ])("numberFromString(%s) should return %s", (input, expected) => {
      expect(numberFromString(input)).toBeCloseTo(expected);
    });
  });

  describe("formatString", () => {
    const template = "Hello, {name}! Your balance is {balance}.";
    const data = { name: "John", balance: "1000" };
    test("replaces placeholders with values", () => {
      expect(formatString(template, data)).toBe("Hello, John! Your balance is 1000.");
    });
  });

  describe("castAsNumber", () => {
    test.each([
      ["123", false, 123],
      ["123.45", false, 123.45],
      ["123,45", true, 123.45],
      ["abc123", false, 123],
      ["abckt123", false, 123],
      ["591 bought", false, 591],
      ["aloo 791 bought", false, 791],
      ["5K subscribers", false, 5000],
      ["hula 5K subscribers", false, 5000],
      ["hula5k subscribers", false, 5000],
      ["1.5M views", false, 1500000],
      ["63,12% seller's rating", true, 63.12],
      ["R$540.60", false, 540.6],
      [123, false, 123]
    ])("castAsNumber(%s, %s) should return %s", (input, replaceComma, expected) => {
      expect(castAsNumber(input, replaceComma)).toBeCloseTo(expected);
    });
  });

  describe("displayNumber", () => {
    test.each([
      [123, 0, "123"],
      [1234, 0, "1k"],
      [1234567, 0, "1M"],
      [1234567, 2, "1.23M"],
      [1234567, 4, "1.2346M"],
      [1234567890, 0, "1,235M"],
      [1234567890, 2, "1,234.57M"],
      [-1234, 0, "-1k"],
      [-1234, 2, "-1.23k"]
    ])("displayNumber(%s, %s) should return %s", (input, decimalPoints, expected) => {
      expect(displayNumber(input, decimalPoints)).toBe(expected);
    });
  });

  it("should parse a number from a string with spaces", () => {
    const input = "1 000.50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a number from a string with commas", () => {
    const input = "1,000.50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a number from a string with multiple dots", () => {
    const input = "1.000.50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a number from a string with multiple commas", () => {
    const input = "1,000.50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a number from a string with both dots and commas", () => {
    const input = "1.000,50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a negative number from a string", () => {
    const input = "-1,000.50";
    const result = numberFromString(input);
    expect(result).toBe(-1000.5);
  });

  it("should parse a number from a string with special characters", () => {
    const input = "$1,000.50";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  it("should parse a number from a string with leading and trailing spaces", () => {
    const input = "   1,000.50   ";
    const result = numberFromString(input);
    expect(result).toBe(1000.5);
  });

  describe("formatString with i18n data", () => {
    const template =
      "There are {ProductReviewAmount} reviews with an average rating of {ProductRatingValue}. Total orders: {ProductOrdersAmount}.";
    const i18nData = {
      ProductReviewAmount: "6k",
      ProductRatingValue: "4.8",
      ProductOrdersAmount: "10k"
    };

    test("replaces i18n placeholders with values", () => {
      expect(formatString(template, i18nData)).toBe(
        "There are 6k reviews with an average rating of 4.8. Total orders: 10k."
      );
    });
  });
});

describe("removeNonEnglishChars", () => {
  test("removes non-English characters from a string", () => {
    const input = "Hello, 世界!";
    const result = removeNonEnglishChars(input);
    expect(result).toBe("Hello !");
  });

  test("removes non-English characters from a string with numbers", () => {
    const input = "Hello, 世界! 123";
    const result = removeNonEnglishChars(input);
    expect(result).toBe("Hello ! 123");
  });

  test("removes non-English characters from an empty string", () => {
    const input = "";
    const result = removeNonEnglishChars(input);
    expect(result).toBe("");
  });

  test("removes non-English characters from a string with special characters", () => {
    const input = "Hello, @世界!";
    const result = removeNonEnglishChars(input);
    expect(result).toBe("Hello @!");
  });
});
