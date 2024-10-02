import { isWhitelisted } from "../logic/anti-scam-persistance";

describe("Antiscam scenarios", () => {
  it("should whitelist big sites", () => {
    expect(isWhitelisted("www.google.com")).toBeTruthy();
    expect(isWhitelisted("google.com")).toBeTruthy();
    expect(isWhitelisted("www.bing.com")).toBeTruthy();
    expect(isWhitelisted("www.amazon.com")).toBeTruthy();
    expect(isWhitelisted("www.ebay.com")).toBeTruthy();
  });
});
