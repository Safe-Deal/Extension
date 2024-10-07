import { SiteMetadata } from "../site-information";

describe("SiteMetadata", () => {
  describe("METHOD: getDomain", () => {
    it("get domain when data is exist", () => {
      const data = { url: { domain: "test" } };
      expect(SiteMetadata.getDomain(data)).toBe("test");
    });

    it("get domain when data is NOT exist", () => {
      const data = null;
      expect(SiteMetadata.getDomain(data)).toBe("localhost");
    });
  });

  describe("METHOD: getURL", () => {
    it("should get the URL", () => {
      expect(SiteMetadata.getURL()).toBe("http://localhost/");
    });
  });

  describe("METHOD: getPathName", () => {
    it("should get path name", () => {
      expect(SiteMetadata.getPathName()).toBe("/");
    });
  });

  describe("METHOD: getQueryParams", () => {
    it("should get query params", () => {
      expect(SiteMetadata.getQueryParams()).toBe("");
    });
  });

  describe("METHOD: getDomainURL", () => {
    it("should get domain url", () => {
      expect(SiteMetadata.getDomainURL()).toBe("http://localhost");
    });
  });
});
