import { ShutafRemotesService } from "../ShutafRemotesService";

describe("Shutaf Fetcher", () => {
  it("should fetch the shutaf link with all integration required fields, including valid 'target' values", async () => {
    const links = await ShutafRemotesService.fetchData();
    expect(links).toBeDefined();
    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      expect(typeof link).toBe("object");

      expect(link.name).toBeDefined();
      expect(typeof link.name).toBe("string");

      expect(link.domain).toBeDefined();
      expect(typeof link.domain).toBe("string");
      const domainPattern =
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^[a-z0-9]+[.]/;
      expect(link.domain).toMatch(domainPattern);

      expect(link.target).toBeDefined();
      expect(typeof link.target).toBe("string");
      const isValidTarget =
        link.target === "[PRODUCT]" || link.target.startsWith("/") || link.target.startsWith("regexp:");
      expect(isValidTarget).toBeTruthy();

      expect(link.shutaf).toBeDefined();
      expect(typeof link.shutaf).toBe("string");
      const isValidShutaf =
        (link.shutaf.startsWith("http") && link.shutaf.match(/^https?:\/\/.+/)) || link.shutaf === "[API]";
      expect(isValidShutaf).toBeTruthy();
    });
  });
});
