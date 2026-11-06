// A store in the affiliate list: the extension schedules its link in a pinned background tab, lights
// the action badge, and the popup offers the support banner. The guard blocks each outgoing click and
// records it, so a pass produces no real affiliate traffic.
import { AFFILIATE_STORE, serveAffiliateStore } from "../lib/fixtures.mjs";

export default async (h) => {
  const { page, expect } = h;
  serveAffiliateStore(h);

  await h.step("open the store", () => page.goto(AFFILIATE_STORE.url));
  await h.step("the action badge lights up", () => expect.poll(() => h.badgeText(), { timeout: 20_000 }).toBe("1"));
  await h.shot("01-store-page");
  await h.step("the background tab tries the affiliate link, and the guard blocks it", async () => {
    await expect.poll(() => h.guardEvents("affiliate-click").length, { timeout: 45_000 }).toBeGreaterThan(0);
    const [{ target }] = h.guardEvents("affiliate-click");
    h.observe("scheduledAffiliateTarget", target);
    expect(new URL(target).hostname).toBe(AFFILIATE_STORE.linkHost);
    expect(target).toContain(AFFILIATE_STORE.domain);
  });
  const popup = await h.step("open the real toolbar popup", () => h.openPopup());
  const banner = popup.locator(".affiliation-banner");
  await h.step("the popup offers the affiliate banner", () =>
    expect(banner).toHaveText("Verified safe site. Support us via our affiliate link.", { timeout: 15_000 })
  );
  await h.shot("02-popup-with-banner", popup);
  await h.step("clicking the banner opens the affiliate link, and the guard blocks it", async () => {
    const blockedClicks = () => h.guardEvents("affiliate-host").length + h.guardEvents("proxy-denied").length;
    const before = blockedClicks();
    // The new tab takes focus, so Chrome closes the popup during the click. That is the real behavior.
    await banner.click().catch((error) => expect(popup.isClosed(), String(error)).toBe(true));
    await expect.poll(blockedClicks, { timeout: 15_000 }).toBeGreaterThan(before);
  });
};
