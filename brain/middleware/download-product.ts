import { ProductStore } from "../../src/e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { SiteUtil } from "../../src/e-commerce/engine/logic/utils/site-utils";
import { AliExpressProductDownloader } from "../../src/e-commerce/engine/stores/ali-express/product/ali-express-product-downloader";
import AmazonProductDownloader from "../../src/e-commerce/engine/stores/amazon/product/amazon-product-downloader";
import eBayProductDownloader from "../../src/e-commerce/engine/stores/ebay/product/ebay-product-downloader";
import { ProcessProductData } from "../services/brain-worker";

export const downloadProduct = async (data: ProcessProductData) => {
  const store = SiteUtil.getStore(data.url.url);
  let downloader = null;
  switch (store) {
    case ProductStore.ALI_EXPRESS:
    case ProductStore.ALI_EXPRESS_RUSSIA:
      downloader = new AliExpressProductDownloader(data.product);
      break;
    case ProductStore.AMAZON:
      downloader = new AmazonProductDownloader(data.product);
      break;
    case ProductStore.EBAY:
      downloader = new eBayProductDownloader(data.product);
      break;
    default:
      downloader = null;
      break;
  }
  const product = await downloader?.download(data);
  return product;
};
