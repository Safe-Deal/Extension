// A site the raters trust: no modal, the site is remembered as safe, and the next visit skips analysis.
import { serveScamRaters, SUSPECT_SITE } from "../lib/fixtures.mjs";

const raterRequests = (h) => h.serviceWorkerRequests().filter(({ url }) => /mywot\.com|urlvoid\.com|safeweb\.norton\.com/.test(url));

export default async (h) => {
  const { page, expect } = h;
  serveScamRaters(h, { dangerous: false });

  await h.step("open the site", () => page.goto(SUSPECT_SITE.url));
  await h.step("the extension records it as safe", () =>
    page.waitForFunction(() => localStorage.getItem("SG_MARKED_AS_SAFE") !== null, null, { timeout: 45_000 })
  );
  await h.step("no modal is shown", () => expect(page.locator("#safe-deal-anti-scam-root")).toHaveCount(0));
  await h.shot("01-no-modal");
  const consulted = raterRequests(h).length;
  h.observe("raterRequestsFirstVisit", consulted);
  await h.step("a second visit makes no new rater requests", async () => {
    expect(consulted).toBeGreaterThan(0);
    await page.reload();
    await page.waitForLoadState("load");
    await h.sleep(5000);
    expect(raterRequests(h).length).toBe(consulted);
  });
};
