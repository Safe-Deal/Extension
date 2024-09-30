import { expect, test } from "../../playwright";

const MAX_DELAY_IN_AFFILIATION_MS = 9 * 60 * 1000;

test("Check final URL for specific parameters", async ({ context, page }) => {
  test.setTimeout(MAX_DELAY_IN_AFFILIATION_MS);

  let affiliateOpenedResolver;
  const affiliateOpenedPromise = new Promise((resolve) => {
    affiliateOpenedResolver = resolve;
  });
  let affiliationOpened = false;

  context.on("page", async (newPage) => {
    newPage.on("framenavigated", async () => {
      const url = new URL(newPage.url());
      if (url.hostname.includes("aliexpress")) {
        await newPage.waitForLoadState("domcontentloaded");
        const aff_fcid = url.searchParams.get("aff_fcid");
        const aff_fsk = url.searchParams.get("aff_fsk");
        const aff_platform = url.searchParams.get("aff_platform");
        const referer = await newPage.evaluate(() => document.referrer);

        expect(referer, "Referer is missing").toEqual("https://const.joinsafedeal.com/");
        expect(aff_fcid, "aff_fcid parameter is missing").not.toBeNull();
        expect(aff_fsk, "aff_fsk parameter is missing").not.toBeNull();
        expect(aff_platform, "aff_platform parameter is missing").not.toBeNull();

        if (aff_fcid && aff_fsk && aff_platform) {
          affiliationOpened = true;
          affiliateOpenedResolver();
        }
      }
    });
  });

  await page.goto("https://www.aliexpress.us/item/3256805786056045.html", { waitUntil: "domcontentloaded" });
  await affiliateOpenedPromise;
  expect(affiliationOpened, "Affiliation link was not opened").toBeTruthy();
});

test("Check 2 time final URL for specific parameters", async ({ context, page }) => {
  test.setTimeout(MAX_DELAY_IN_AFFILIATION_MS);

  let affiliateOpenedResolver;
  const affiliateOpenedPromise = new Promise((resolve) => {
    affiliateOpenedResolver = resolve;
  });
  let affiliationOpened = false;

  context.on("page", async (newPage) => {
    newPage.on("framenavigated", async () => {
      const url = new URL(newPage.url());
      if (url.hostname.includes("aliexpress")) {
        await newPage.waitForLoadState("domcontentloaded");
        const aff_fcid = url.searchParams.get("aff_fcid");
        const aff_fsk = url.searchParams.get("aff_fsk");
        const aff_platform = url.searchParams.get("aff_platform");
        const referer = await newPage.evaluate(() => document.referrer);

        expect(referer, "Referer is missing").toEqual("https://const.joinsafedeal.com/");
        expect(aff_fcid, "aff_fcid parameter is missing").not.toBeNull();
        expect(aff_fsk, "aff_fsk parameter is missing").not.toBeNull();
        expect(aff_platform, "aff_platform parameter is missing").not.toBeNull();

        if (aff_fcid && aff_fsk && aff_platform) {
          affiliationOpened = true;
          affiliateOpenedResolver();
        }
      }
    });
  });

  await page.goto("https://www.aliexpress.us/item/3256805786056045.html", { waitUntil: "domcontentloaded" });
  await affiliateOpenedPromise;
  expect(affiliationOpened, "Affiliation link was not opened").toBeTruthy();
});
