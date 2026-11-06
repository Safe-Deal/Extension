// Deterministic documents for the external sites the extension reads. Served only at that boundary:
// the extension bundle, content scripts, service worker and rule engine all run for real.
const page = (body, title) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;

export const AMAZON = { asin: "B0FIXTURE1", seller: "AFIXTURESELLER", origin: "https://www.amazon.com" };
export const AMAZON_ITEM_URL = `${AMAZON.origin}/dp/${AMAZON.asin}/`;

const amazonShopperPage = page(
  `<div id="dp"><div id="centerCol"><div id="title_feature_div"><span id="productTitle">Fixture product</span></div>` +
    `<div id="averageCustomerReviews_feature_div"></div><div id="rightCol"><div id="buybox"></div></div></div></div>`,
  "Amazon.com: Fixture product"
);
const amazonProductDocument = page(
  `<a id="sellerProfileTriggerId" href="/sp?ie=UTF8&seller=${AMAZON.seller}">Fixture Seller</a>` +
    `<div id="detailBulletsWrapper_feature_div">Best Sellers Rank: #12 in Home &amp; Kitchen</div>` +
    `<div class="ac-badge-wrapper"><span class="ac-badge-text-primary">Amazon's</span><span class="ac-badge-text-secondary">Choice</span></div>` +
    `<div id="fulfillerInfoFeature_feature_div"><div class="offer-display-feature-text"><span>Amazon</span></div></div>` +
    `<div id="merchantInfoFeature_feature_div"><div class="offer-display-feature-text"><span>Amazon</span></div></div>`,
  "Fixture product document"
);
const amazonGoodReviews = page(
  `<div id="cm_cr-product_info"><div class="a-fixed-left-grid-col aok-align-center a-col-right"><div>4.7 out of 5</div></div></div>` +
    `<div id="filter-info-section"><div><span>25,000 global ratings | 4,000 global reviews</span></div></div>`,
  "Customer reviews"
);
const amazonGoodSeller = page(
  `<div id="seller-info-feedback-summary"><b>99</b>% positive in the last 12 months</div>`,
  "Seller profile"
);
const amazonSignInWall = page(`<form name="signIn"><h1>Sign in</h1><input name="email"></form>`, "Amazon Sign-In");

export const serveAmazonItem = (h, { signInWall = false } = {}) => {
  h.offline();
  h.serve(AMAZON_ITEM_URL, { html: amazonShopperPage });
  h.serve(`${AMAZON.origin}/exec/obidos/ASIN/${AMAZON.asin}`, { html: amazonProductDocument });
  h.serve(new RegExp(`^${AMAZON.origin}/product-reviews/${AMAZON.asin}/`), { html: signInWall ? amazonSignInWall : amazonGoodReviews });
  h.serve(new RegExp(`^${AMAZON.origin}/sp\\?.*seller=${AMAZON.seller}`), { html: signInWall ? amazonSignInWall : amazonGoodSeller });
};

// The tab rater counts as dangerous for plain http with a short title and no favicon.
export const SUSPECT_SITE = { domain: "suspect-fixture.test", url: "http://suspect-fixture.test/" };
const SUSPECT_PAGE = page("<h1>Suspect store</h1>", "Shop");

export const serveScamRaters = (h, { dangerous }) => {
  h.offline();
  h.serve(SUSPECT_SITE.url, { html: SUSPECT_PAGE });
  h.serve(new RegExp(`^https://www\\.mywot\\.com/scorecard/${SUSPECT_SITE.domain}`), {
    html: page(`<div data-automation="total-safety-score">${dangerous ? 5 : 90}/100</div><div data-automation="child-safety-score">50/100</div>`, "WOT")
  });
  h.serve(new RegExp(`^https://www\\.urlvoid\\.com/scan/${SUSPECT_SITE.domain}`), {
    html: page(`<span class="${dangerous ? "label-danger" : "label-success"}">${dangerous ? "10" : "0"}/34</span><div class="panel ${dangerous ? "panel-danger" : "panel-success"}"></div>`, "URLVoid")
  });
  h.serve(/^https:\/\/safeweb\.norton\.com\/safeweb\/sites\/v1\/details/, { json: { rating: "u" } });
};

// A store in src/shutaf/shutafim.json with a directly built link (target "/"), served locally so the
// real store is never contacted.
export const AFFILIATE_STORE = { domain: "idee-shop.com", url: "https://idee-shop.com/", linkHost: "ad.admitad.com" };

export const serveAffiliateStore = (h) => {
  h.offline();
  h.serve(AFFILIATE_STORE.url, { html: page("<h1>Fixture store</h1>", "Idee Shop fixture store") });
};

export const PLAIN_SITE = { url: "https://plain-site-fixture.test/" };

export const servePlainSite = (h) => {
  h.offline();
  h.serve(PLAIN_SITE.url, { html: page("<h1>Plain site</h1>", "Plain site fixture page") });
};
