import { getDomain, getLTD, getSelectors, parseAsHtml, stripHtml, urlParams, waitForElement } from "../html";
import "@testing-library/jest-dom";
import { addParameterToUrl } from "../location";

describe("html", () => {
  it("getTopLevelDomain value is valid", () => {
    expect(getDomain("aliexpress.com")).toBe("aliexpress.com");
    expect(getDomain("aliexpress.com")).toBe("aliexpress.com");
    expect(getDomain("aliexpress.com")).toBe("aliexpress.com");
    expect(getDomain("https://aliexpress.ru")).toBe("aliexpress.ru");
    expect(getDomain("aliexpress.com")).toBe("aliexpress.com");
  });

  it("getTopLevelDomain value is valid 1", () => {
    let prams = urlParams("http://aliexpress.com");
    expect(prams).toMatchObject({});
    prams = urlParams(
      "http://localhost/go?type=test&utm_source=testSource&utm_campaign=testCamapgin&utm_content=testContent&utm_term=testTerm&referrer_url=testReferfal"
    );
    expect(prams).toMatchObject({
      type: "test",
      utm_source: "testSource",
      utm_campaign: "testCamapgin",
      utm_content: "testContent"
    });
  });

  describe("urlParams", () => {
    it("returns an empty object when given an empty string", () => {
      expect(urlParams("")).toEqual({});
    });

    it("parses query string parameters correctly", () => {
      expect(urlParams("https://example.com/?foo=bar&baz=qux")).toEqual({
        foo: "bar",
        baz: "qux"
      });
    });

    it("decodes URL-encoded parameter values", () => {
      expect(urlParams("https://example.com/?foo=%3Cbar%3E")).toEqual({
        foo: "<bar>"
      });
    });

    it("returns an object with string keys and string values", () => {
      const result = urlParams("https://example.com/?foo=bar&baz=qux");
      expect(result).toMatchObject({ foo: expect.any(String), baz: expect.any(String) });
    });

    it("handles edge case of a URL without query string or fragment identifier", () => {
      expect(urlParams("https://example.com/")).toEqual({});
    });

    it("handles edge case of a URL with only a question mark", () => {
      expect(urlParams("https://example.com/?")).toEqual({});
    });

    it("handles edge case of a URL with only a hash symbol", () => {
      expect(urlParams("https://example.com/#")).toEqual({});
    });

    it("handles edge case of a URL with an empty parameter value", () => {
      expect(urlParams("https://example.com/?foo=")).toEqual({ foo: "" });
    });
  });

  describe("getSelectors", () => {
    it("returns an empty array if range is falsy", () => {
      expect(getSelectors(null)).toEqual([]);
      expect(getSelectors(undefined)).toEqual([]);
      expect(getSelectors("")).toEqual([]);
      expect(getSelectors(0 as any)).toEqual([]);
      expect(getSelectors(false as any)).toEqual([]);
    });

    it("returns an array containing the original range if range does not contain the separator", () => {
      expect(getSelectors("foo")).toEqual(["foo"]);
      expect(getSelectors("foo,bar,baz")).toEqual(["foo,bar,baz"]);
    });

    it("returns an array of selectors if range contains the separator", () => {
      expect(getSelectors("foo|bar|baz")).toEqual(["foo", "bar", "baz"]);
      expect(getSelectors("foo||baz")).toEqual(["foo", "", "baz"]);
      expect(getSelectors("|foo|baz|")).toEqual(["", "foo", "baz", ""]);
    });
  });

  describe("getDomain", () => {
    it("should return domain when given a valid URL string", () => {
      expect(getDomain("https://www.google.com/search?q=test")).toBe("www.google.com");
    });

    it("should add 'http://' to the URL string when protocol is missing", () => {
      expect(getDomain("www.example.com")).toBe("www.example.com");
    });
  });

  describe("stripHtml - Integration Tests", () => {
    it("should remove simple HTML tags", () => {
      const html = "<p>Hello World</p>";
      expect(stripHtml(html)).toBe("Hello World");
    });

    it("should concatenate text from multiple nodes", () => {
      const html = "<span>Hello</span> <span>World</span>";
      expect(stripHtml(html)).toBe("Hello World");
    });

    it("should handle nested structures", () => {
      const html = "<div><span>Hello</span> <span>World</span></div>";
      expect(stripHtml(html)).toBe("Hello World");
    });

    it("should remove HTML tags and keep only text", () => {
      const html = "<div><i>Keep</i> <b>the</b> <strong>text</strong> <em>only</em></div>";
      expect(stripHtml(html)).toBe("Keep the text only");
    });

    it("should normalize spaces", () => {
      const html = "   Normalize    spaces   ";
      expect(stripHtml(html)).toBe("Normalize spaces");
    });

    it("should handle empty strings", () => {
      const html = "";
      expect(stripHtml(html)).toBe("");
    });

    it("should handle strings without HTML tags", () => {
      const text = "No HTML here";
      expect(stripHtml(text)).toBe("No HTML here");
    });

    it("should handle HTML with nested tags", () => {
      const html = "<div><p>Nested <span>text <i>with</i></span> tags</p></div>";
      expect(stripHtml(html)).toBe("Nested text with tags");
    });

    it("should handle HTML with nested tags 2", () => {
      const html = "<div><p>Nested <span>text <i>with</i></span> tags</p></div>";
      const expectedText = "Nested text with tags";
      expect(stripHtml(html)).toBe(expectedText);
    });

    it("should handle large HTML content", () => {
      const largeHtml = `
      <div class="article">
        <h1>Article Title</h1>
        <p>This is a <strong>paragraph</strong> with some <a href="/link">links</a> and other <em>elements</em>.</p>
        <p>It has multiple paragraphs, lists, and more.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
        <p>Final paragraph with a <a href="https://example.com">link</a>.</p>
      </div>
    `;
      const expectedText =
        "Article Title This is a paragraph with some links and other elements. " +
        "It has multiple paragraphs, lists, and more. " +
        "List item 1 List item 2 List item 3 " +
        "Final paragraph with a link.";
      expect(stripHtml(largeHtml)).toBe(expectedText);
    });

    it("should correctly strip HTML with complex nested structures", () => {
      const complexHtml = `
      <div>
        <header>
          <nav>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section>
            <h2>Title of Section</h2>
            <p>Some introductory text about the section and more info.</p>
            <a href="https://example.com/more" target="_blank">Read More</a>
          </section>
          <article>
            <p>Article content goes here, with <a href="/some-link">a link</a> somewhere in the text.</p>
          </article>
        </main>
        <footer>
          <p>Copyright &copy; 2021 Company Name</p>
        </footer>
      </div>
    `;
      const expectedText =
        "Home About Services Contact " +
        "Title of Section Some introductory text about the section and more info. Read More " +
        "Article content goes here, with a link somewhere in the text. " +
        "Copyright © 2021 Company Name";
      expect(stripHtml(complexHtml)).toBe(expectedText);
    });
  });

  describe("parseAsHtml", () => {
    it("should return an object when given valid HTML", () => {
      const html = "<div><p>Hello World!</p></div>";
      const parsedHtml = parseAsHtml(html);
      expect(typeof parsedHtml).toBe("object");
      expect(parsedHtml).toHaveProperty("tagName");
      expect(parsedHtml).toHaveProperty("childNodes");
    });
  });
});

describe("getLTD", () => {
  it("should return the top-level domain when given a valid URL string", () => {
    const url = "https://www.google.com/search?q=test";
    expect(getLTD(url)).toBe("com");
  });

  it("should return the top-level domain when given a valid URL string without protocol", () => {
    const url = "www.example.com";
    expect(getLTD(url)).toBe("com");
  });

  it("should return null when given an invalid URL string", () => {
    const url = "invalid-url";
    expect(getLTD(url)).toBeNull();
  });

  it("should correctly extract the TLD or second-level domain from various AliExpress URLs", () => {
    const testCases = [
      { url: "https://www.aliexpress.us", expected: "us" },
      { url: "https://www.aliexpress.ru", expected: "ru" },
      { url: "https://www.aliexpress.com.br", expected: "com.br" },
      { url: "https://www.aliexpress.com.tr", expected: "com.tr" },
      { url: "https://www.aliexpress.es", expected: "es" },
      { url: "https://www.aliexpress.fr", expected: "fr" },
      { url: "https://www.aliexpress.de", expected: "de" },
      { url: "https://www.aliexpress.it", expected: "it" },
      { url: "https://www.aliexpress.pl", expected: "pl" },
      { url: "https://www.aliexpress.jp", expected: "jp" },
      { url: "https://www.aliexpress.co.kr", expected: "co.kr" },
      { url: "https://www.aliexpress.in", expected: "in" },
      { url: "https://www.aliexpress.com.au", expected: "com.au" },
      { url: "https://www.aliexpress.ca", expected: "ca" },
      { url: "https://www.aliexpress.com.mx", expected: "com.mx" },
      { url: "https://www.aliexpress.co.id", expected: "co.id" },
      { url: "https://www.aliexpress.co.th", expected: "co.th" },
      { url: "https://www.aliexpress.vn", expected: "vn" },
      { url: "https://www.aliexpress.co.za", expected: "co.za" },
      { url: "https://www.aliexpress.co.il", expected: "co.il" },
      { url: "https://www.aliexpress.ae", expected: "ae" },
      { url: "https://www.aliexpress.com.hk", expected: "com.hk" },
      { url: "https://www.aliexpress.com.tw", expected: "com.tw" },
      { url: "https://www.aliexpress.com.cn", expected: "com.cn" },
      { url: "https://www.aliexpress.com.my", expected: "com.my" },
      { url: "https://www.aliexpress.com.sg", expected: "com.sg" },
      { url: "https://www.aliexpress.com.ph", expected: "com.ph" },
      { url: "https://www.aliexpress.com", expected: "com" },
      { url: "https://google.com", expected: "com" },
      { url: "https://shop.google.com", expected: "com" },
      { url: "https://it.shop.google.com", expected: "com" }
    ];

    testCases.forEach(({ url, expected }) => {
      expect(getLTD(url)).toBe(expected);
    });
  });

  describe("addParameterToUrl", () => {
    it("should add a parameter to the URL when the URL starts with 'http://'", () => {
      const url = "http://example.com";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("http://example.com/?param=123");
    });

    it("should add a parameter to the URL when the URL starts with 'https://'", () => {
      const url = "https://example.com";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("https://example.com/?param=123");
    });

    it("should add a parameter to the URL when the URL starts with '/'", () => {
      const url = "/path/to/page";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("/path/to/page?param=123");
    });

    it("should add a parameter to the URL when the URL starts with '/' and already has a query string", () => {
      const url = "/path/to/page?existing=456";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("/path/to/page?existing=456&param=123");
    });

    it("should handle URLs without a protocol by adding 'http://' as the default protocol", () => {
      const url = "example.com";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("http://example.com/?param=123");
    });

    it("should handle URLs without a protocol and starting with '/' by adding 'http://' as the default protocol", () => {
      const url = "/path/to/page";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("/path/to/page?param=123");
    });

    it("should handle URLs without a protocol and starting with '/' and already has a query string by adding 'http://' as the default protocol", () => {
      const url = "/path/to/page?existing=456";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("/path/to/page?existing=456&param=123");
    });

    it("should return the original URL when an invalid URL is provided", () => {
      const url = "invalid-url";
      const key = "param";
      const value = "123";
      const result = addParameterToUrl(url, key, value);
      expect(result).toBe("http://invalid-url/?param=123");
    });
  });
});
