import { get } from "lodash";
import { ParsedHtml } from "../../../utils/dom/html";

/**
 * Downloads product data from Alibaba store page by extracting the JSON object from the script tag
 * take it from window.detailData
 */
const preprocessAlibabaData = (dom: ParsedHtml): any => {
  // Search for script tags
  const scripts = (dom as any).getElementsByTagName("script");
  let detailData = null;

  // Loop through script tags to find one that includes "window.detailData"
  for (const script of scripts) {
    if (script.textContent.includes("window.detailData")) {
      // Extract the JSON string
      const matches = script.textContent.match(/window\.detailData\s*=\s*({[^]*?})(?=\s*window\.)/);

      if (matches && matches[1]) {
        // Parse the JSON string
        detailData = matches[1];
        break;
      }
    }
  }
  if (detailData) {
    return JSON.parse(detailData);
  }
  return detailData;
};

const prepareDTO = (wholesaleWhStoreData: any) => {
  const productId = get(wholesaleWhStoreData, "globalData.buyer.fastFeedBackView.feedBackObjectId");
  const companyId = get(wholesaleWhStoreData, "globalData.seller.companyId");
  const productUrl = get(wholesaleWhStoreData, "globalData.seo.globalSeoUrl.english");
  const buyerInfo = {
    buyerRightInfoInfo: get(wholesaleWhStoreData, "globalData.buyer.buyerRightInfo.name")
  };

  const certificateInfo = [
    {
      certName: get(wholesaleWhStoreData, "globalData.certification[0].certName"),
      certNo: get(wholesaleWhStoreData, "globalData.certification[0].certNo"),
      certValidPeriod: get(wholesaleWhStoreData, "globalData.certification[0].certValidPeriod"),
      description: get(wholesaleWhStoreData, "globalData.certification[0].description"),
      disclaimer: get(wholesaleWhStoreData, "globalData.certification[0].disclaimer"),
      introduction: get(wholesaleWhStoreData, "globalData.certification[0].introduction")
    }
  ];

  const extendInfo = {
    protectionType: get(wholesaleWhStoreData, "globalData.extend.protectionType")
  };

  const inventoryInfo = get(wholesaleWhStoreData, "globalData.inventory.skuInventory");

  const productInfo = {
    mediaItems: get(wholesaleWhStoreData, "globalData.product.mediaItems"),
    moq: get(wholesaleWhStoreData, "globalData.product.moq"),
    morePaymentTerms: get(wholesaleWhStoreData, "globalData.product.morePaymentTerms"),
    price: get(wholesaleWhStoreData, "globalData.product.price"),
    productBasicProperties: get(wholesaleWhStoreData, "globalData.product.productBasicProperties"),
    productIsCertified: get(wholesaleWhStoreData, "globalData.product.productIsCertified"),
    productIsExhibition: get(wholesaleWhStoreData, "globalData.product.productIsExhibition"),
    productIsHang: get(wholesaleWhStoreData, "globalData.product.productIsHang"),
    productIsMarketGoods: get(wholesaleWhStoreData, "globalData.product.productIsMarketGoods"),
    productIsPersonal: get(wholesaleWhStoreData, "globalData.product.productIsPersonal"),
    sample: get(wholesaleWhStoreData, "globalData.product.sample"),
    sampleInfo: get(wholesaleWhStoreData, "globalData.product.sampleInfo"),
    sourcingTradeAvailable: get(wholesaleWhStoreData, "globalData.product.sourcingTradeAvailable"),
    supplyChainService: get(wholesaleWhStoreData, "globalData.product.supplyChainService")
  };

  const riskInfo = get(wholesaleWhStoreData, "globalData.risk");

  const sellerInfo = {
    accountIsGoldPlusSupplier: get(wholesaleWhStoreData, "globalData.seller.accountIsGoldPlusSupplier"),
    accountIsLeaderSupplier: get(wholesaleWhStoreData, "globalData.seller.accountIsLeaderSupplier"),
    accountIsPaidMember: get(wholesaleWhStoreData, "globalData.seller.accountIsPaidMember"),
    authCards: get(wholesaleWhStoreData, "globalData.seller.authCards"),
    baoAccountAmount: get(wholesaleWhStoreData, "globalData.seller.baoAccountAmount"),
    baoAccountIsDisplayAssurance: get(wholesaleWhStoreData, "globalData.seller.baoAccountIsDisplayAssurance"),
    baoAccountIsService: get(wholesaleWhStoreData, "globalData.seller.baoAccountIsService"),
    companyBusinessType: get(wholesaleWhStoreData, "globalData.seller.companyBusinessType"),
    companyHasPassAssessment: get(wholesaleWhStoreData, "globalData.seller.companyHasPassAssessment"),
    companyJoinYears: get(wholesaleWhStoreData, "globalData.seller.companyJoinYears"),
    companyRegisterCountry: get(wholesaleWhStoreData, "globalData.seller.companyRegisterCountry"),
    contactName: get(wholesaleWhStoreData, "globalData.seller.contactName"),
    employeesCount: get(wholesaleWhStoreData, "globalData.seller.employeesCount"),
    isCompanyBusinessTypeAuth: get(wholesaleWhStoreData, "globalData.seller.isCompanyBusinessTypeAuth"),
    isDispatchGuaranteed: get(wholesaleWhStoreData, "globalData.seller.isDispatchGuaranteed"),
    isShowComplaintsInfo: get(wholesaleWhStoreData, "globalData.seller.isShowComplaintsInfo"),
    explain: get(wholesaleWhStoreData, "globalData.seller.leadSupplier.explain"),
    text: get(wholesaleWhStoreData, "globalData.seller.leadSupplier.text"),
    responseTimeText: get(wholesaleWhStoreData, "globalData.seller.responseTimeText"),
    sellerSelfOperated: get(wholesaleWhStoreData, "globalData.seller.sellerSelfOperated"),
    supplierRatingReviews: get(wholesaleWhStoreData, "globalData.seller.supplierRatingReviews"),
    tradeHalfYear: get(wholesaleWhStoreData, "globalData.seller.tradeHalfYear"),
    tradeHistoryUrl: get(wholesaleWhStoreData, "globalData.seller.tradeHistoryUrl"),
    verifiedManufactruerseExplain: get(wholesaleWhStoreData, "globalData.seller.verifiedManufactruers.explain"),
    verifiedManufactruersText: get(wholesaleWhStoreData, "globalData.seller.verifiedManufactruers.text")
  };

  const tradeInfo = get(wholesaleWhStoreData, "globalData.trade");

  const wholesaleAiDTO = {
    productId,
    companyId,
    wholesaleDetails: {
      productUrl,
      buyerInfo,
      certificateInfo,
      extendInfo,
      inventoryInfo,
      productInfo,
      riskInfo,
      sellerInfo,
      tradeInfo
    }
  };

  return wholesaleAiDTO;
};

export { preprocessAlibabaData, prepareDTO };
