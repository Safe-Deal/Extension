import { BrowserContext, Route } from "@playwright/test";
import { expect, test } from "../../playwright";
import { markAsInitDone, SAFE_DEAL_BOX } from "../utils/constants";
import {
  FIXTURE_DOMAIN,
  goodReviewsHtml,
  goodSellerHtml,
  PRODUCT_DOWNLOAD_URL,
  PRODUCT_PAGE_URL,
  productDocumentHtml,
  REVIEWS_URL_PATTERN,
  SELLER_URL_PATTERN,
  shopperPageHtml,
  signInWallHtml
} from "./amazon-fixtures";

process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = "1";

const INDETERMINATE_ICON = "img[title='Conclusion indeterminate']";

const fulfillHtml = (body: string) => (route: Route) =>
  route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body });

type PageSet = {
  reviews: string;
  seller: string;
};

const serveAmazon = async (context: BrowserContext, pages: PageSet) => {
  await context.route(/^https?:\/\/(?!(www\.amazon\.com)\/)[^/]+\//, (route) => route.abort());
  await context.route(new RegExp(`^https://${FIXTURE_DOMAIN.replace(/\./g, "\\.")}/`), (route) => route.abort());
  await context.route(PRODUCT_PAGE_URL, fulfillHtml(shopperPageHtml()));
  await context.route(PRODUCT_DOWNLOAD_URL, fulfillHtml(productDocumentHtml()));
  await context.route(REVIEWS_URL_PATTERN, fulfillHtml(pages.reviews));
  await context.route(SELLER_URL_PATTERN, fulfillHtml(pages.seller));
};

test.describe("Amazon item page verdict in the built extension", () => {
  test.setTimeout(30_000);

  test("shows Recommended when reviews and seller are verified", async ({ page, context, extensionId }) => {
    expect(extensionId).toMatch(/^[a-p]{32}$/);
    await serveAmazon(context, { reviews: goodReviewsHtml(), seller: goodSellerHtml() });

    await page.goto(PRODUCT_PAGE_URL);
    await markAsInitDone(page);

    const box = page.locator(SAFE_DEAL_BOX);
    await expect(box).toBeVisible();
    await box.click();
    await expect(box.locator("text=Recommended")).toBeVisible();
    await expect(box.locator(INDETERMINATE_ICON)).toHaveCount(0);
  });

  test("shows no verdict when Amazon hides reviews and seller behind sign-in", async ({
    page,
    context,
    extensionId
  }) => {
    expect(extensionId).toMatch(/^[a-p]{32}$/);
    await serveAmazon(context, { reviews: signInWallHtml(), seller: signInWallHtml() });

    await page.goto(PRODUCT_PAGE_URL);
    await markAsInitDone(page);

    const box = page.locator(SAFE_DEAL_BOX);
    await expect(box.locator(INDETERMINATE_ICON)).toBeVisible();
    await box.click();
    await expect(box.locator("text=Recommended")).toHaveCount(0);
  });
});
