const { runConversionFiles } = require("./aff-list-files.js");

const admitadConfig = {
  affName: "Admiad",
  affiliatesArrayKey: "results",
  nameKey: "name",
  altNameKey: "name_aliases",
  domainKey: "site_url",
  affiliationLinkKey: "gotolink",
  addParams: "ulp="
};

const impactConfig = {
  affName: "Impact",
  affiliatesArrayKey: "Campaigns",
  nameKey: "AdvertiserName",
  altNameKey: "",
  domainKey: "CampaignUrl",
  affiliationLinkKey: "TrackingLink",
  addParams: null
};

const partnerboostConfig = {
  affName: "Partnerboost",
  altNameKey: "mcid",
  affiliatesArrayKey: "data.list",
  nameKey: "merchant_name",
  domainKey: "site_url",
  affiliationLinkKey: "tracking_url_short",
  altAffiliationLinkKey: "tracking_url",
  addParams: null
};

const indoleadsConfig = {
  affName: "Indoleads",
  affiliatesArrayKey: "data",
  nameKey: "website_url",
  altNameKey: "title",
  domainKey: "website_url",
  affiliationLinkKey: "tracking_link",
  addParams: null
};

const sourceknowledgeConfig = {
  affName: "Sourceknowledge",
  affiliatesArrayKey: "items",
  nameKey: "businessName",
  altNameKey: null,
  domainKey: "domain",
  affiliationLinkKey: "link",
  addParams: "oadest=",
  deleteParams: ["fallback"]
};

const takeadsConfig = {
  affName: "Takeads",
  affiliatesArrayKey: "data",
  nameKey: "name",
  altNameKey: "name",
  domainKey: "defaultDomain",
  affiliationLinkKey: "trackingLink",
  addParams: ["s=extension", "url="]
};

const runConversion = (updateAffiliates) => {
  runConversionFiles({
    updateAffiliates,
    sourceknowledgeConfig,
    takeadsConfig,
    indoleadsConfig,
    partnerboostConfig,
    impactConfig,
    admitadConfig
  });
};

const INVALID_DOMAINS = [
  "google.",
  "gmail.",
  "apple.",
  "baidu.",
  "yandex.",
  "facebook.",
  "instagram.",
  "twitter.",
  "youtube.",
  "linkedin.",
  "pinterest.",
  "tiktok.",
  "snapchat.",
  "whatsapp.",
  "telegram.",
  "viber.",
  "skype.",
  "discord.",
  "yahoo.com",
  "bing.com",
  "duckduckgo.com",
  "t.me",
  "wa.me",
  "m.me",
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "dlvr.it",
  "ift.tt",
  "is.gd",
  "t.co",
  "tiny.cc",
  "stockmarketeye.com",
  "need approve"
];

module.exports = { runConversion, INVALID_DOMAINS };
