export const FIXTURE_ASIN = "B0FIXTURE1";
export const FIXTURE_SELLER_ID = "AFIXTURESELLER";
export const FIXTURE_DOMAIN = "www.amazon.com";

export const PRODUCT_PAGE_URL = `https://${FIXTURE_DOMAIN}/dp/${FIXTURE_ASIN}/`;
export const PRODUCT_DOWNLOAD_URL = `https://${FIXTURE_DOMAIN}/exec/obidos/ASIN/${FIXTURE_ASIN}`;
export const REVIEWS_URL_PATTERN = `https://${FIXTURE_DOMAIN}/product-reviews/${FIXTURE_ASIN}/**`;
export const SELLER_URL_PATTERN = `https://${FIXTURE_DOMAIN}/sp?**seller=${FIXTURE_SELLER_ID}**`;

const html = (body: string, title: string): string =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;

export const shopperPageHtml = (): string =>
  html(
    `<div id="dp"><div id="centerCol"><div id="title_feature_div"><span id="productTitle">Fixture product</span></div>` +
      `<div id="averageCustomerReviews_feature_div"></div><div id="rightCol"><div id="buybox"></div></div></div></div>`,
    "Amazon.com: Fixture product"
  );

export const productDocumentHtml = (): string =>
  html(
    `<a id="sellerProfileTriggerId" href="/sp?ie=UTF8&seller=${FIXTURE_SELLER_ID}">Fixture Seller</a>` +
      `<div id="detailBulletsWrapper_feature_div">Best Sellers Rank: #12 in Home &amp; Kitchen</div>` +
      `<div class="ac-badge-wrapper"><span class="ac-badge-text-primary">Amazon's</span><span class="ac-badge-text-secondary">Choice</span></div>` +
      `<div id="fulfillerInfoFeature_feature_div"><div class="offer-display-feature-text"><span>Amazon</span></div></div>` +
      `<div id="merchantInfoFeature_feature_div"><div class="offer-display-feature-text"><span>Amazon</span></div></div>`,
    "Fixture product document"
  );

export const goodReviewsHtml = (): string =>
  html(
    `<div id="cm_cr-product_info"><div class="a-fixed-left-grid-col aok-align-center a-col-right"><div>4.7 out of 5</div></div></div>` +
      `<div id="filter-info-section"><div><span>25,000 global ratings | 4,000 global reviews</span></div></div>`,
    "Customer reviews"
  );

export const goodSellerHtml = (): string =>
  html(`<div id="seller-info-feedback-summary"><b>99</b>% positive in the last 12 months</div>`, "Seller profile");

export const signInWallHtml = (): string =>
  html(`<form name="signIn"><h1>Sign in</h1><input name="email"></form>`, "Amazon Sign-In");
