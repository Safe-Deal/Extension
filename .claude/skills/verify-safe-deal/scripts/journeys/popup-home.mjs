// The real toolbar popup on an ordinary site: identity, version, share links, the "why free" dropdown,
// and no affiliate banner. Links are checked by address and not followed.
import { PLAIN_SITE, servePlainSite } from "../lib/fixtures.mjs";
import { packageVersion } from "../lib/paths.mjs";

const SHARE_NETWORKS = ["twitter", "linkedin", "facebook", "whatsapp", "telegram", "reddit", "email"];

export default async (h) => {
  const { page, expect } = h;
  servePlainSite(h);

  await h.step("open an ordinary site", () => page.goto(PLAIN_SITE.url));
  const popup = await h.step("open the real toolbar popup", () => h.openPopup());
  await h.step("the popup shows the brand and the current version", async () => {
    await expect(popup.locator(".safe-deal-popup__header__brand")).toHaveText("Safe Deal", { timeout: 15_000 });
    await expect(popup.locator(".safe-deal-popup__footer__version")).toContainText(`v${packageVersion()}`);
  });
  await h.step("every share link points at the network with the share URL", async () => {
    for (const network of SHARE_NETWORKS) {
      const href = await popup.locator(`.safe-deal-popup__home__share__icons__link:has(img[alt="${network}"])`).getAttribute("href");
      expect(decodeURIComponent(href), network).toContain("https://www.joinsafedeal.com/go?type=extension-share-button");
    }
  });
  await h.step("the 'why free' dropdown opens and closes", async () => {
    const toggle = popup.getByRole("button", { name: "Why is free to use?" });
    const content = popup.locator(".safe-deal-popup__home__dropdown__content");
    await expect(content).toHaveCount(0);
    await toggle.click();
    await expect(content).toContainText("Using our service is free for you");
    await h.shot("01-popup-dropdown-open", popup);
    await toggle.click();
    await expect(content).toHaveCount(0);
  });
  await h.step("an ordinary site gets no affiliate banner or badge", async () => {
    await h.sleep(2000);
    await expect(popup.locator(".affiliation-banner")).toHaveCount(0);
    expect(await h.badgeText()).toBe("");
  });
};
