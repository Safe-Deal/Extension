import { browserLocalStorage } from "../../utils/site/site-storage";
import { isWhitelisted, MARK_AS_SAFE, USER_DECLARED_AS_SAFE } from "../logic/anti-scam-persistance";

const DAY_MS = 24 * 60 * 60 * 1000;

const clearMarks = () => {
  browserLocalStorage.removeItem(MARK_AS_SAFE);
  browserLocalStorage.removeItem(USER_DECLARED_AS_SAFE);
};

describe("Antiscam scenarios", () => {
  beforeEach(clearMarks);

  it("should whitelist big sites", () => {
    expect(isWhitelisted("www.google.com")).toBeTruthy();
    expect(isWhitelisted("google.com")).toBeTruthy();
    expect(isWhitelisted("www.bing.com")).toBeTruthy();
    expect(isWhitelisted("www.amazon.com")).toBeTruthy();
    expect(isWhitelisted("www.ebay.com")).toBeTruthy();
  });

  it("does not treat a lookalike host as a trusted site", () => {
    expect(isWhitelisted("amazon.com.login-secure.ru")).toBe(false);
    expect(isWhitelisted("paypal.com-verify.net")).toBe(false);
    expect(isWhitelisted("contest.com")).toBe(false);
    expect(isWhitelisted("nott.me")).toBe(false);
    expect(isWhitelisted("google.com.evil.example")).toBe(false);
    expect(isWhitelisted("test.com")).toBe(false);
    expect(isWhitelisted("shop.test.com")).toBe(false);
  });

  it("trusts a subdomain of a listed site", () => {
    expect(isWhitelisted("smile.amazon.com")).toBe(true);
    expect(isWhitelisted("accounts.google.com")).toBe(true);
  });

  it("stops trusting a site Safe Deal marked safe 400 days ago", () => {
    browserLocalStorage.setItem(MARK_AS_SAFE, String(Date.now() - 400 * DAY_MS));
    expect(isWhitelisted("scam.example")).toBe(false);
  });

  it("keeps trusting a site Safe Deal marked safe 10 days ago", () => {
    browserLocalStorage.setItem(MARK_AS_SAFE, String(Date.now() - 10 * DAY_MS));
    expect(isWhitelisted("scam.example")).toBe(true);
  });
});
