import upcomingShutafFile from "../../../const/shutafim.json";

const MIN_AMOUNT = 30 * 1000;

describe("Shitafim", () => {
  it("should contain major amount of shutafim", async () => {
    let shutafim = 0;
    upcomingShutafFile.forEach((shutaf) => {
      expect(shutaf).toHaveProperty("name");
      expect(shutaf).toHaveProperty("domain");
      expect(shutaf).toHaveProperty("target");
      expect(shutaf).toHaveProperty("shutaf");
      expect(shutaf.shutaf).toMatch(/http|https|\[API\]/);
      expect(shutaf.domain).toContain(".");
      expect(shutaf.target.length).toBeGreaterThan(0);
      shutafim += 1;
    });
    expect(shutafim).toBeGreaterThan(MIN_AMOUNT);
    console.log("\x1b[32m%s\x1b[0m", "Total Shutafim Amount:", shutafim);
  });
});
