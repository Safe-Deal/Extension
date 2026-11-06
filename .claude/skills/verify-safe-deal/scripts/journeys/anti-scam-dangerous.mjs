// A site every rater flags: the blocking modal appears, "stay" whitelists it after a browser
// confirmation, and "leave" closes the tab. Rater sites are fixtures, the verdict logic is real.
import { serveScamRaters, SUSPECT_SITE } from "../lib/fixtures.mjs";

const MODAL = "#safe-deal-anti-scam-root .anti-scam-modal";
const WHITELIST_KEY = "SD_USER_DECLARED_AS_SAFE";

export default async (h) => {
  const { page, expect } = h;
  serveScamRaters(h, { dangerous: true });

  await h.step("open the flagged site", () => page.goto(SUSPECT_SITE.url));
  await h.step("the danger modal blocks the page", async () => {
    await expect(page.locator(MODAL)).toBeVisible({ timeout: 45_000 });
    await expect(page.locator("#anti-scam-modal-title")).toContainText("dangerous");
  });
  await h.shot("01-danger-modal");
  await h.saveHtml("01-danger-modal", page.locator(MODAL));
  await h.step("all three raters were consulted", () => {
    const urls = h.serviceWorkerRequests().filter(({ disposition }) => disposition === "fixture").map(({ url }) => url);
    for (const rater of ["mywot.com", "urlvoid.com", "safeweb.norton.com"]) expect(urls.some((url) => url.includes(rater)), rater).toBe(true);
  });

  await h.step("'This site is trustworthy' asks for confirmation, then closes the modal", async () => {
    const confirmation = page.waitForEvent("dialog").then((dialog) => dialog.accept());
    await page.getByRole("button", { name: "This site is trustworthy" }).click();
    await confirmation;
    await expect(page.locator(MODAL)).toBeHidden();
  });
  await h.step("the whitelist survives a reload", async () => {
    await page.reload();
    await page.waitForLoadState("load");
    await h.sleep(3000);
    await expect(page.locator(MODAL)).toBeHidden();
    expect(await page.evaluate((key) => localStorage.getItem(key), WHITELIST_KEY)).not.toBeNull();
  });
  await h.shot("02-after-whitelist-reload");

  await h.step("clearing the whitelist brings the modal back", async () => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator(MODAL)).toBeVisible({ timeout: 45_000 });
  });
  await h.step("'Leave this website now' closes the tab", async () => {
    const closed = page.waitForEvent("close");
    await page.getByRole("button", { name: "Leave this website now" }).click();
    await closed;
    expect(page.isClosed()).toBe(true);
  });
};
