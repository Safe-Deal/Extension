import upcomingShutafFile from "../../../const/shutafim.json";
import { ShutafRemotesService } from "../logic/ShutafRemotesService";

const validateAff = (aff) => {
  expect(aff).toBeDefined();
  expect(aff.length).toBeGreaterThan(0);
  for (const shutaf of aff) {
    expect(shutaf.name).toBeDefined();
    expect(typeof shutaf.name === "string").toBeTruthy();
    expect(shutaf.name.length).toBeGreaterThan(0);

    expect(shutaf.domain).toBeDefined();
    expect(typeof shutaf.domain === "string").toBeTruthy();
    expect(shutaf.domain.length).toBeGreaterThan(0);

    expect(shutaf.target).toBeDefined();
    expect(typeof shutaf.target === "string").toBeTruthy();
    expect(shutaf.target.length).toBeGreaterThan(0);

    expect(shutaf.shutaf).toBeDefined();
    expect(typeof shutaf.shutaf === "string").toBeTruthy();
    expect(shutaf.shutaf.length).toBeGreaterThan(0);
  }
};

describe("The Shutafim engine is working properly", () => {
  it("should be able to create a new instance of Shutafim and get data", async () => {
    const aff = await ShutafRemotesService.fetchData();
    validateAff(aff);
  });

  it("Shutafim new file SHod be in Proper format get data", () => {
    validateAff(upcomingShutafFile);
  });
});
