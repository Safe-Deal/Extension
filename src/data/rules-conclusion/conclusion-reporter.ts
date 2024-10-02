import extractAliExpressMeta from "../../e-commerce/engine/extraction/ali-express/extract-aliexpress-meta";
import extractAmazonMeta from "../../e-commerce/engine/extraction/amazon/extract-amazon-meta";
import { extractEbayMeta } from "../../e-commerce/engine/extraction/eBay/extract-ebay-meta";
import { IMetaData, IProductReported } from "../../e-commerce/engine/extraction/meta-data.interface";
import { IConclusionProductEntity } from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { PRICING_ITEM_DETAILS } from "../../e-commerce/engine/logic/utils/const";
import { SiteUtil } from "../../e-commerce/engine/logic/utils/site-utils";
import { AliExpressProductDownloader } from "../../e-commerce/engine/stores/ali-express/product/ali-express-product-downloader";
import { AliExpressSiteUtils } from "../../e-commerce/engine/stores/ali-express/utils/ali-express-site-utils";
import { AmazonSiteUtils } from "../../e-commerce/engine/stores/amazon/utils/amazon-site-utils";
import { EbaySiteUtils } from "../../e-commerce/engine/stores/ebay/utils/ebay-site-utils";
import { debug, IS_NODE } from "../../utils/analytics/logger";
import { ApiDownloader } from "../../utils/downloaders/apiDownloader";
import { LOCALE } from "../../utils/extension/locale";
import { VERSION } from "../../utils/extension/utils";
import { IProduct } from "../entities/product.interface";

const infuse = (infusionData) => {
  if (infusionData && infusionData.id && infusionData.category) {
    const reporter = new ApiDownloader("/product", true);
    debug(`InfuseProduct :: Data to be sent: id-> ${infusionData?.id} cat-> "${infusionData?.category}" ...`);
    infusionData.locale = LOCALE;
    infusionData.ver = VERSION;
    reporter.post(infusionData);
    debug(
      `InfuseProduct :: Data to be sent: id-> ${infusionData?.id} cat-> "${infusionData?.category}" -> Reported successfully.`
    );
  } else {
    debug("InfuseProduct :: Nothing to report skipped sending.");
  }
};
const getDescriptionTitleImages = async (conclusion: IConclusionProductEntity): Promise<IMetaData> => {
  const pricing = conclusion?.rules?.find((rule) => rule.name == PRICING_ITEM_DETAILS);
  if (AliExpressSiteUtils.isAliExpressItemDetails(conclusion.product.url)) {
    const downloader = new AliExpressProductDownloader(conclusion.product);
    const result = await extractAliExpressMeta(downloader, conclusion.product, pricing?.dataset);
    return result;
  }

  if (AmazonSiteUtils.isAmazonItemDetails(conclusion.product.url)) {
    const result = extractAmazonMeta(pricing?.dataset, conclusion.product.url, conclusion.product);
    return result;
  }

  if (EbaySiteUtils.isEbayItemDetails(conclusion.product.url)) {
    const result = extractEbayMeta(pricing?.dataset, conclusion.product.url, conclusion.product);
    return result;
  }

  return null;
};

const formatAndAddData = async (conclusion: IConclusionProductEntity, product: IProduct) => {
  const { rules } = conclusion;
  const productData = (await getDescriptionTitleImages(conclusion)) as any;
  if (!productData) {
    return null;
  }
  const innerDetails = productData?.details?.product?.details?.product?.details?.product;
  const category = productData?.category ?? productData?.details?.product?.category;
  const description = productData?.description ? productData?.description : innerDetails?.description;
  const images = productData?.images ?? innerDetails?.images;
  const title = productData?.title ?? innerDetails?.title;
  const locale = IS_NODE ? product.locale : LOCALE;

  const result: IProductReported = {
    id: product.id,
    category,
    source: productData.source,
    domain: productData.domain,
    title,
    conclusion: conclusion.productConclusion,
    description,
    images,
    locale,
    product: {
      ...productData,
      id: undefined,
      source: undefined,
      domain: undefined,
      title: undefined,
      conclusion: undefined,
      description: undefined,
      images: undefined
    },
    rules: [],
    ver: VERSION
  };

  for (const rule of rules) {
    if (rule.isValidRule) {
      result.rules.push({
        type: rule.tooltipSummary.type,
        name: rule.name,
        i18n: rule.tooltipSummary.i18n,
        i18nData: rule.tooltipSummary.i18nData,
        i18nExplanation: rule.tooltipSummary.i18nExplanation,
        value: rule.value,
        weight: rule.weight,
        bonus: rule.bonus
      });
    }
  }
  return result;
};

export const infuseProduct = async (conclusion: IConclusionProductEntity, product: IProduct) => {
  if (SiteUtil.isItemDetails(conclusion.product.url)) {
    debug(`InfuseProduct :: Started for Product: ${conclusion.product.url}`);
    const infusionData = await formatAndAddData(conclusion, product);
    infuse(infusionData);
    return infusionData;
  }

  debug("InfuseProduct :: Not Reporting Wholesale Pages, Stopped.");
  return null;
};
