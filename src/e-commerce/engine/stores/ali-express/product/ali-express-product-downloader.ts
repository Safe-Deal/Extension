import { SiteUtil } from "../../../logic/utils/site-utils";
import { getDomainCurrency } from "../../../../../utils/multilang/languages";
import { IProduct } from "../../../../../data/entities/product.interface";
import { debug } from "../../../../../utils/analytics/logger";
import {
  getAllAvailableSelectors,
  getAvailableSelector,
  parseAsHtml,
  querySelector,
  querySelectorAll,
  querySelectorAsArray,
  querySelectorAsNumber,
  querySelectorTextContent
} from "../../../../../utils/dom/html";
import { HeadersType } from "../../../../../utils/downloaders/remote/remoteFetcher";
import { castAsNumber, replaceAll } from "../../../../../utils/text/strings";
import { BaseProductDownloader } from "../../../logic/product/baseProductDownloader";
import { EMPTY_PRODUCT } from "./constants";

const MIN_DELAY_SECONDS = 0;
const MAX_DELAY_SECONDS = 3;
const getUrl = (id, domain) => `https://${domain}/item/${id}.html`;
interface AliExpressProductDetails {
  productPrice?: number;
  productRatingAverage?: number;
  productRatingsAmount?: number;
  productPurchases?: number;
  storeOpenTime?: string;
  storePositiveRate?: number;
  storeIsTopRated?: boolean;
  storeFollowing?: number;
  category: string;
  description?: string;
  images?: string[];
  title?: string;
}

export class AliExpressProductDownloader extends BaseProductDownloader {
  private product: IProduct;

  constructor(product: IProduct) {
    super({
      productUrl: getUrl(product.id, product.domain),
      isFetchHtml: false,
      minDelay: MIN_DELAY_SECONDS,
      maxDelay: MAX_DELAY_SECONDS,
      useBrowserHeaders: HeadersType.CRAWLER
    });
    this.product = product;
  }

  public isFetchOk(): boolean {
    return this.document != null && this.document !== undefined && this.document !== "" && super.isFetchOk();
  }

  public override async download(): Promise<AliExpressProductDetails> {
    const result = await super.download();
    return result as AliExpressProductDetails;
  }

  public parse(): {} {
    const regex = /(?<=data:\s+).*?(?=\s+csrfToken)/gs;
    const html = String(this.remoteResponse);

    const htmlDocument = parseAsHtml(html);
    const result = regex.exec(html);
    if (result && result.length > 0) {
      const jsonStr = result[0].substring(0, result[0].length - 1);
      try {
        this.document = JSON.parse(jsonStr);
        const categories = getCategories(htmlDocument);
        this.document.categories = categories;
        const category = categories[categories.length - 1] || categories[categories.length - 2];
        this.document.category = replaceAll(category, ['"', "'", "'"], "");
        this.document = convertToResult(this.document, category);
      } catch (err) {
        debug(err);
        this.document = null;
      }
    }

    if (!this.document) {
      const startingHtml = '{"widgets":[';
      const endingHtml = "}</script>";
      const startAt = html.indexOf(startingHtml);
      const endAt = html.indexOf(endingHtml, startAt) + 1;

      if (startAt > 0 && endAt > 0) {
        const jsonStr = html.substring(startAt, endAt);
        try {
          const productData = JSON.parse(jsonStr);
          this.document = convertToOldStructure(productData);
          this.document = convertToResult(this.document);
        } catch (err) {
          debug(err);
          this.document = null;
        }
      }
    }

    if (!this.document) {
      const scriptRegex = /window\.runParams\s*=\s*({[\s\S]*?});/m;
      const match = html.match(scriptRegex);
      let jsonStr = "";
      if (match && match[1]) {
        try {
          jsonStr = match[1].replace("};", "}").replace("data:", '"data":');
          const productData = JSON.parse(jsonStr);
          this.document = productData?.data?.GLOBAL_DATA
            ? convertToOldStructureNewUsa(productData.data)
            : convertToOldStructureUsa(productData.data);
          this.document = convertToResult(this.document);
        } catch (err) {
          debug({ error: err, html: jsonStr }, "AliExpressProductDownloader");
          this.document = null;
        }
      }
    }

    if (isProductEmpty(this.document)) {
      const productNotFound = html.includes("Page Not Found") || html.includes(".page-not-found");
      if (productNotFound) {
        this.document = EMPTY_PRODUCT;
      } else {
        const isRussian = SiteUtil.isAliExpressRussianSite(this.product.domain);
        if (isRussian) {
          this.document = getProductDetailsFromRussianSite(htmlDocument, this.product.domain);
        } else {
          const docHtml = this.product.document || html;
          this.document = getProductDetailsFromDom(docHtml, this.product.domain);
        }
      }
    }

    return this.document;
  }
}
function convertToOldStructureNewUsa(json: any) {
  const result = {
    titleModule: {
      subject: json?.GLOBAL_DATA?.globalData?.subject,
      feedbackRating: {
        averageStar: json?.PC_RATING?.rating || 0,
        totalValidNum: json?.PC_RATING?.totalValidNum || 0,
        tradeCount: castAsNumber(json?.PC_RATING?.otherText) || 0
      }
    },
    priceComponent: json?.PRICE,
    imageModule: {
      imagePathList: json?.HEADER_IMAGE_PC?.imagePathList
    },
    storeModule: {
      storeName: json?.SHOP_CARD_PC?.storeHeaderResult?.storeName,
      followingNumber: json?.SHOP_CARD_PC?.sellerInfo?.storeNum,
      topRatedSeller: json?.SHOP_CARD_PC?.sellerInfo?.topRatedSeller,
      positiveRate: json?.SHOP_CARD_PC?.sellerPositiveRate,
      storeURL: json?.SHOP_CARD_PC?.sellerInfo?.storeURL
    },
    commonModule: {
      description: json?.GLOBAL_DATA?.globalData?.subject,
      keywords: json?.GLOBAL_DATA?.globalData?.subject
    },
    category: json?.GLOBAL_DATA?.globalData?.category2,
    actionModule: {
      categoryId: json?.GLOBAL_DATA?.globalData?.category2,
      companyId: json?.SHOP_CARD_PC?.sellerInfo?.companyId,
      rootCategoryId: json?.GLOBAL_DATA?.globalData?.category1,
      itemWishedCount: json?.WISHLIST?.wishItemCount
    },
    json
  };

  return result;
}

const convertToResult = (json, category = null): AliExpressProductDetails => {
  const formatTradeCount =
    json?.titleModule?.feedbackRating?.tradeCount !== undefined
      ? json?.titleModule?.feedbackRating?.tradeCount
      : json?.titleModule?.formatTradeCount;

  const productPrice =
    json?.priceComponent?.targetSkuPriceInfo?.salePriceString ||
    json?.priceComponent?.discountPrice?.actMultiCurrencyMinPrice ||
    json?.priceComponent?.discountPrice?.minActMultiCurrencyPrice ||
    json?.priceComponent?.origPrice?.minPrice ||
    json?.origPrice?.minMultiCurrencyPrice;

  const productRatingAverage =
    json?.titleModule?.feedbackRating?.averageStar !== undefined
      ? json?.titleModule?.feedbackRating?.averageStar
      : json?.titleModule?.feedbackRating?.averageStar;

  const productRatingsAmount =
    json?.titleModule?.feedbackRating?.totalValidNum !== undefined
      ? json?.titleModule?.feedbackRating?.totalValidNum
      : json?.recommendModule?.platformCount;

  const storeOpenTime = json?.titleModule?.storeModule?.openTime;
  const storePositiveRate = json?.storeModule?.positiveRate;
  const storeIsTopRated = json?.storeModule?.topRatedSeller;

  const finalCategory =
    category || json?.storeModule?.storeName || json?._originalStructure?.sellerComponent?.storeName;

  const result: AliExpressProductDetails = {
    productPrice: castAsNumber(productPrice),
    productRatingAverage: castAsNumber(productRatingAverage),
    productRatingsAmount: castAsNumber(productRatingsAmount),
    productPurchases: castAsNumber(formatTradeCount),
    storeOpenTime,
    storePositiveRate: castAsNumber(storePositiveRate),
    storeIsTopRated,
    category: finalCategory
  };
  return result;
};

const getProductDetailsFromRussianSite = (html, domain): AliExpressProductDetails | null => {
  let successfulQueries = 0;

  const priceElement = getAvailableSelector(
    ["[class*=HazeProductPrice_SnowPrice__main]", "[class*=snow-price_SnowPrice__mainM]"].join("|"),
    html
  );
  const price = priceElement?.textContent;
  const expectedPrice = getDomainCurrency(domain);
  let currPrice = null;
  const symbolFound = price?.includes(expectedPrice?.symbol) || price.includes(expectedPrice?.name);
  if (price && symbolFound) {
    successfulQueries += 1;
    currPrice = castAsNumber(price, true);
  }

  const extraInfoElement = html.querySelector("[class*=red-ali-kit_Heading__XL]");
  if (extraInfoElement) {
    successfulQueries += 1;
  }
  const extraInfo =
    extraInfoElement?.innerText ||
    html.querySelector("[class*=SnowReviewsProductRating_SnowReviewsProductRatin] [class*=snow-ali-kit_Typography]")
      ?.innerText;
  const averageStar = castAsNumber(extraInfo, true);
  const totalFeedbacksElement =
    html.querySelector("[class*=RedReviewsProductRating_MainSection__allReviewsLink]")?.innerText ||
    html.querySelectorAll(
      "[class*=SnowReviewsProductRating_SnowReviewsProductRatin] [class*=snow-ali-kit_Typography]"
    )[1]?.innerText;

  if (totalFeedbacksElement) {
    successfulQueries += 1;
  }

  const totalFeedbacks = totalFeedbacksElement || 0;
  const totalValidNum = castAsNumber(totalFeedbacks) || 0;

  const amountsElement = html.querySelector("[class*=HazeProductDescription_HazeProductDescription__buyCounter]");
  if (amountsElement) {
    successfulQueries += 1;
  }
  const amounts = amountsElement?.innerText;
  const formatTradeCount = castAsNumber(amounts);

  const store = getAllAvailableSelectors(
    [
      "[class*=RedStoreInfo_Header__statList] [class*=RedStoreInfo_StatItem__statItem]",
      "[class*=SnowStoreInfo_SnowStoreInfo__textBlock]"
    ].join("|"),
    html
  );
  if (store && store.length >= 2) {
    successfulQueries += 1;
  }
  const categoryEls = getAllAvailableSelectors(
    [
      "[class*=SeoRedBreadcrumbs_BreadcrumbsElement__wrap] [class*=SeoRedBreadcrumbs_BreadcrumbsElement__text]",
      "[class*=SnowBreadcrumbs_SnowBreadcrumbs__hideScroll] li:last-of-type",
      "[class*=HazeStoreInfoMini_HazeStoreInfoMini__storeContent] a"
    ].join("|"),
    html
  );

  const category = categoryEls?.[categoryEls.length - 1]?.textContent;
  const positiveRate = castAsNumber(store[0]?.textContent, true);
  const amountOfSubscribers = castAsNumber(store[1]?.textContent);
  const isTopRated = amountOfSubscribers > 35000 && positiveRate > 95;

  const title = querySelectorTextContent(["[data-header-mark] h1"], html);
  const desc = querySelector(['meta[name="description"]'], html)?.getAttribute("content") || "";

  const specification = querySelectorTextContent(
    ["[class*=HazeProductCharacteristics_HazeProductCharacteristics__groupsContainer]"],
    html,
    " : "
  );
  const description = `${desc} ${specification}`;
  const getBigImage = (element: HTMLElement): string => {
    const imageUrl = element.getAttribute("srcSet");
    if (!imageUrl) {
      return null;
    }

    return imageUrl.replace(/_\d+x\d+/, "_1200x1200");
  };

  const images = querySelectorAsArray(
    ['[class*=SnowProductGallery_SnowProductGallery__previews] picture [type="image/webp"]'],
    html,
    getBigImage
  );

  const result: AliExpressProductDetails = {
    storeFollowing: amountOfSubscribers,
    description,
    images,
    title,
    productPrice: currPrice,
    productRatingAverage: averageStar,
    productRatingsAmount: totalValidNum,
    productPurchases: formatTradeCount,
    storeOpenTime: null,
    storePositiveRate: positiveRate,
    storeIsTopRated: isTopRated,
    category
  };
  debug(result, "AliExpressRussiaProductDownloader");
  return result;
};

const getProductDetailsFromDom = (htmlString, domain): AliExpressProductDetails | null => {
  const html = parseAsHtml(htmlString);

  const productPriceElement = querySelector([".product-price-current"], html);
  let productPrice = null;
  if (productPriceElement) {
    const productPriceText = productPriceElement?.textContent;
    const expectedPrice = getDomainCurrency(domain);
    const symbolFound =
      productPriceText?.includes(expectedPrice?.symbol) || productPriceText?.includes(expectedPrice?.name);
    if (productPriceText && symbolFound) {
      productPrice = castAsNumber(productPriceText, true);
    }
  }

  const productRatingAverage = querySelectorAsNumber(["[data-pl=product-reviewer] strong"], html) || 0;
  const productRatingsAmount = querySelectorAsNumber(["[data-pl=product-reviewer] a"], html) || 0;
  const productPurchases = querySelectorAsNumber(["[data-pl=product-reviewer] > span:last-of-type"], html, false) || 0;
  let storePositiveRate = querySelectorAsNumber(['[class*="store-info--desc"] strong'], html);
  let followers = querySelectorAsNumber(['[class*="store-info--desc"] strong:last-of-type'], html);

  if (!storePositiveRate || !followers) {
    const storeInfo = querySelectorAll(["[class*=store-header] strong"], html);
    const storeInfoRate = storeInfo[0]?.textContent;
    const storeInfoFlowers = storeInfo[1]?.textContent;
    storePositiveRate = castAsNumber(storeInfoRate);
    followers = castAsNumber(storeInfoFlowers);
  }
  const storeFollowing = followers;
  const storeIsTopRated = followers > 35000 && storePositiveRate > 95;

  const title = querySelectorTextContent(["[data-pl=product-title]"], html);
  const specification = querySelectorTextContent(["[class*=specification--list] li"], html);
  const desc = querySelectorTextContent(["[class*=description--wrap] [class*=description--product-description]"], html);
  const description = `${desc} ${specification}`;
  const getBigImage = (element: HTMLElement): string => {
    const imageUrl = element.getAttribute("src");
    if (!imageUrl) {
      return null;
    }

    return imageUrl.replace(/_\d+x\d+/, "_1200x1200");
  };

  const images = querySelectorAsArray(['[class*="slider--slider"] img'], html, getBigImage);

  const category = querySelectorTextContent([".pdp-wrap .comet-v2-tag"], html);
  const storeOpenTime = null;

  const result: AliExpressProductDetails = {
    description,
    images,
    title,
    productPrice,
    productRatingAverage,
    productRatingsAmount,
    productPurchases,
    storeOpenTime,
    storePositiveRate,
    storeIsTopRated,
    storeFollowing,
    category
  };
  debug(result, "AliExpressProductDownloader");
  return result;
};

const isProductEmpty = (obj: AliExpressProductDetails): boolean => {
  if (!obj) {
    return true;
  }

  const {
    productPrice,
    productRatingAverage,
    productRatingsAmount,
    productPurchases,
    storeOpenTime,
    storePositiveRate,
    storeIsTopRated,
    category
  } = obj;
  return (
    !productPrice &&
    !productRatingAverage &&
    !productRatingsAmount &&
    !productPurchases &&
    !storeOpenTime &&
    !storePositiveRate &&
    !storeIsTopRated &&
    !category
  );
};

const AliExpressProductFindSection = (searchId, currentNode) => {
  let i;
  let currentChild;
  let result;

  if (currentNode?.widgetId?.includes(searchId)) {
    return currentNode;
  }
  if (Array.isArray(currentNode)) {
    for (i = 0; i < currentNode?.length; i += 1) {
      currentChild = currentNode[i];
      // Search in the current child
      result = AliExpressProductFindSection(searchId, currentChild);
      // Return the result if the node has been found
      if (result !== false) {
        return result;
      }
    }
  } else {
    // Use a for loop instead of forEach to avoid nested functions
    // Otherwise "return" will not work properly
    for (i = 0; i < currentNode?.children?.length; i += 1) {
      currentChild = currentNode?.children[i];

      // Search in the current child
      result = AliExpressProductFindSection(searchId, currentChild);

      // Return the result if the node has been found
      if (result !== false) {
        return result;
      }
    }

    for (i = 0; i < currentNode?.widgets?.length; i += 1) {
      currentChild = currentNode?.widgets[i];

      // Search in the current child
      result = AliExpressProductFindSection(searchId, currentChild);

      // Return the result if the node has been found
      if (result !== false) {
        return result;
      }
    }
  }

  // The node has not been found and we have no more options
  return false;
};

function convertToOldStructure(json) {
  const product = AliExpressProductFindSection("bx/ProductContextWidget", json.widgets);
  const shop = AliExpressProductFindSection("bx/HeaderPDP", json.widgets);
  const currency = AliExpressProductFindSection("bx/TopHead", json.widgets);

  const result: any = {};
  if (product) {
    const { props } = product;
    const store = shop?.props?.shop;
    const final = {
      currency,
      _newStructure: json,
      titleModule: {
        feedbackRating: {
          averageStar: props.rating?.middle,
          totalValidNum: props.reviews,
          tradeCount: props.tradeInfo?.tradeCount
        },
        tradeCount: props.tradeInfo?.tradeCount,
        storeModule: {
          openTime: store.dateOpening,
          positiveRate: store?.positiveReviews?.percentages
        }
      },
      storeModule: {
        openTime: store.dateOpening,
        positiveRate: store?.positiveReviews?.percentages,
        topRatedSeller: store?.reliableStore
      },
      ...result
    };
    return final;
  }

  return null;
}

function convertToOldStructureUsa(json) {
  const result: any = {};
  const final = {
    _originalStructure: json,
    priceComponent: json?.priceComponent,
    titleModule: {
      subject: json?.productInfoComponent?.subject || json?.metaDataComponent.title,
      feedbackRating: {
        averageStar: json?.feedbackComponent?.evarageStar,
        totalValidNum: json?.feedbackComponent?.totalValidNum,
        tradeCount: json?.tradeComponent?.formatTradeCount
      },
      tradeCount: json?.tradeComponent?.formatTradeCount,
      formatTradeCount: json?.tradeComponent?.formatTradeCount,
      storeModule: {
        openTime: json?.sellerComponent?.openTime,
        positiveRate: json?.storeFeedbackComponent?.sellerPositiveRate,
        topRatedSeller: json?.sellerComponent?.topRatedSeller
      }
    },
    storeModule: {
      openTime: json?.sellerComponent?.openTime,
      positiveRate: json?.storeFeedbackComponent?.sellerPositiveRate,
      topRatedSeller: json?.sellerComponent?.topRatedSeller,
      storeURL: json?.sellerComponent?.storeURL,
      storeName: json?.sellerComponent?.storeName,
      followingNumber: json?.storeFeedbackComponent?.sellerPositiveNum,
      openedYear: json?.sellerComponent?.formatOpenTime
    },
    commonModule: {
      description: json?.metaDataComponent.description,
      keywords: json?.metaDataComponent.keywords
    },
    category: json?.categoryComponent?.categoryName,
    imageModule: { imagePathList: json?.imageComponent?.imagePathList },
    crossLinkModule: {
      crossLinkGroupList: json?.shopCategoryComponent?.productGroupsResult?.groups
    },
    actionModule: {
      categoryId: json?.productInfoComponent?.categoryId,
      comingSoon: json?.promotionComponent?.comingSoon,
      companyId: json?.sellerComponent?.companyId,
      rootCategoryId: json?.categoryComponent?.topCategoryId,
      itemWishedCount: json?.wishListComponent?.itemWishedCount,
      storeNum: json?.sellerComponent?.storeNum,
      preSale: json?.promotionComponent?.preSale
    },
    priceModule: {
      bigSellProduct: json?.promotionComponent?.superDeals,
      discountPromotion: json?.promotionComponent?.discountPromotion,
      discount: json?.promotionComponent?.discount
    },
    quantityModule: {
      totalAvailQuantity: json?.inventoryComponent?.totalAvailQuantity
    },
    recommendModule: {
      platformCount: json?.feedbackComponent?.totalValidNum
    },
    shippingModule: {
      hbaFreeShipping: json?.promotionComponent?.hbaFreeShipping
    },

    ...result
  };
  return final;
}

function getCategories(document: any) {
  const categories = [];
  const categoryNodes = document.querySelectorAll(".breadcrumb a[rel]");
  for (let i = 0; i < categoryNodes.length; i++) {
    const category = categoryNodes[i].textContent;
    if (category && category != "Home" && category != "All Categories") {
      categories.push(categoryNodes[i].textContent);
    }
  }

  if (categories.length < 1) {
    categories.push("OnHomepage");
  }

  return categories;
}
