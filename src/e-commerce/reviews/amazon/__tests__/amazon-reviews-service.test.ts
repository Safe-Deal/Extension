import { parse } from "node-html-parser";
import { AmazonReviewsService } from "../amazon-reviews-service";
import { ProductStore } from "../../../engine/logic/conclusion/conclusion-product-entity.interface";

const mockDownload = jest.fn();
const mockInvalidate = jest.fn();
const mockSummarize = jest.fn();

jest.mock("../../../engine/stores/amazon/product/amazon-feedback-downloader", () => ({
  __esModule: true,
  REVIEWS_TYPE: { REGULAR: 0, POSITIVE: "positive", NEGATIVE: "negative" },
  default: jest.fn().mockImplementation(() => ({
    download: mockDownload,
    invalidateCache: mockInvalidate
  }))
}));

jest.mock("../../reviews-service", () => ({
  summarizeReviewsByAI: (...args: unknown[]) => mockSummarize(...args)
}));

const PRODUCT_PAGE = `
  <span id="acrCustomerReviewText" class="a-size-base">(8,448)</span>
  <span class="a-icon-alt">4.6 out of 5 stars</span>
`;

const REVIEWS_PAGE = `
  <span data-hook="review-title">Great fit</span>
  <span data-hook="review-body">Comfortable cotton briefs</span>
`;

const SIGN_IN_PAGE = `<form name="signIn" action="/ap/signin"><h1>Sign in</h1></form>`;

const request = (document: string, regenerate = false) => ({
  productId: "B00DM3YL3O",
  store: ProductStore.AMAZON,
  siteUrl: "https://www.amazon.com/dp/B00DM3YL3O",
  document,
  regenerate
});

describe("AmazonReviewsService.analyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSummarize.mockResolvedValue({ reviewsSummary: [{ section: "pros", reviews: ["Comfortable"] }], error: null });
  });

  it("keeps the product page rating and count when Amazon serves a sign-in page instead of reviews", async () => {
    mockDownload.mockResolvedValue(parse(SIGN_IN_PAGE));

    const result = await AmazonReviewsService.analyze(request(PRODUCT_PAGE));

    expect(result.rating).toBe("4.6");
    expect(result.totalReviews).toBe("8,448");
    expect(result.unavailable).toBe(true);
    expect(result.reviewsSummary).toEqual([]);
    expect(mockSummarize).not.toHaveBeenCalled();
  });

  it("flags reviews as unavailable when every download failed", async () => {
    mockDownload.mockResolvedValue(null);

    const result = await AmazonReviewsService.analyze(request(PRODUCT_PAGE));

    expect(result.unavailable).toBe(true);
    expect(result.rating).toBe("4.6");
    expect(result.totalReviews).toBe("8,448");
  });

  it("does not flag a product Amazon reports as having no ratings", async () => {
    mockDownload.mockResolvedValue(parse(SIGN_IN_PAGE));

    const result = await AmazonReviewsService.analyze(request("<div>No customer reviews</div>"));

    expect(result.unavailable).toBeFalsy();
    expect(result.reviewsSummary).toEqual([]);
  });

  it("summarizes reviews and reports the product page statistics when review text is available", async () => {
    mockDownload.mockResolvedValue(parse(REVIEWS_PAGE));

    const result = await AmazonReviewsService.analyze(request(PRODUCT_PAGE));

    expect(result.unavailable).toBeFalsy();
    expect(result.rating).toBe("4.6");
    expect(result.totalReviews).toBe("8,448");
    expect(result.reviewsSummary).toHaveLength(1);
    expect(mockSummarize).toHaveBeenCalledTimes(1);
  });

  it("drops cached downloads on regenerate so a retry refetches", async () => {
    mockDownload.mockResolvedValue(parse(REVIEWS_PAGE));

    await AmazonReviewsService.analyze(request(PRODUCT_PAGE, true));
    expect(mockInvalidate).toHaveBeenCalledTimes(3);

    mockInvalidate.mockClear();
    await AmazonReviewsService.analyze(request(PRODUCT_PAGE, false));
    expect(mockInvalidate).not.toHaveBeenCalled();
  });
});
