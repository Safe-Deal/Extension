import { DONE_PRODUCT_CSS_CLASS } from "../../../../constants/display";
import { IProduct } from "../../../../data/entities/product.interface";
import { Site } from "../../../../data/sites/site";
import { debug } from "../../../../utils/analytics/logger";
import { isVisible } from "../../../../utils/general/general";
import { browserWindow, getAllAvailableSelectors, getAvailableSelector } from "../../../../utils/dom/html";
import { AliExpressSiteUtils } from "../../stores/ali-express/utils/ali-express-site-utils";
import { getAsinFromUrl } from "../../stores/amazon/rules/shared/amazon-utils";
import { AmazonSiteUtils } from "../../stores/amazon/utils/amazon-site-utils";
import { EbaySiteUtils } from "../../stores/ebay/utils/ebay-site-utils";
import { isNumeric } from "../../../../utils/text/strings";

const isProcessingRequired = (isInViewPortAndVisible) => (pr: any) =>
  isInViewPortAndVisible
    ? isVisible(pr) && !pr?.querySelector(".lazyload-placeholder") && !pr?.querySelector(`.${DONE_PRODUCT_CSS_CLASS}`)
    : !pr?.querySelector(".lazyload-placeholder") && !pr?.querySelector(`.${DONE_PRODUCT_CSS_CLASS}`);
const IGNORE_PRODUCT = "ignore-product";

export class ProductLocator {
  constructor(private site: Site) {
    this.site = site;
  }

  public parseDomToGetProducts(isOnlyVisibleOnes: boolean = false): IProduct[] {
    const siteSelectors = this.site.siteDomSelector;
    const { dom } = this.site;
    const url = browserWindow().location.href;
    const wholesalePageItemListSelector = siteSelectors.getWholesalePageItemListSel();
    const productPageItemSelector = siteSelectors.getProductPageItemSel();
    const productIdSelector = siteSelectors.getWholesaleProductIdPage();

    if (AliExpressSiteUtils.isAliExpressItemDetails(url) && isProcessingRequired(dom)) {
      const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(url);
      return [
        {
          id: productId,
          domain: this.site.domain,
          url
        }
      ];
    }

    let items = getAllAvailableSelectors(wholesalePageItemListSelector, dom, true);
    if (!items.length) {
      items = getAllAvailableSelectors(productPageItemSelector, dom);
    }
    const productsElement: any[] = Array.from(items);

    let productsElementEntities = productsElement.filter(isProcessingRequired(isOnlyVisibleOnes));
    if (AmazonSiteUtils.isAmazonItemDetails(`${this.site.url}${this.site.pathName}`)) {
      productsElementEntities = productsElement;
    }

    const products: IProduct[] = productsElementEntities
      .map((pr: any): IProduct => {
        const productIdEl = getAvailableSelector(productIdSelector, pr, false) || pr?.getAttribute("data-product-id");
        let productId = null;
        if (productIdEl?.classList?.contains(DONE_PRODUCT_CSS_CLASS)) {
          return null;
        }

        if (EbaySiteUtils.isEbaySite(url)) {
          if (EbaySiteUtils.isEbayWholesale(url)) {
            productId =
              pr?.getAttribute("data-product-id") ||
              productIdEl?.getAttribute("data-product-id") ||
              EbaySiteUtils.getWholesaleEbayProductIdFromHref(productIdEl?.getAttribute("href")) ||
              productIdEl?.getAttribute("content");
          }
          if (EbaySiteUtils.isEbayItemDetails(url)) {
            productId = EbaySiteUtils.getWholesaleEbayProductIdFromHref(url);
          }
        }

        if (AliExpressSiteUtils.isAliExpressSite(url)) {
          const hef = pr?.getAttribute("href");
          if (!AliExpressSiteUtils.isAliExpressStore(hef)) {
            if (AliExpressSiteUtils.isAliExpressWholesale(url)) {
              productId =
                pr?.getAttribute("data-product-id") ||
                pr.getAttribute(productIdSelector) ||
                AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(hef);
            }

            if (productId == null && AliExpressSiteUtils.isAliExpressItemDetails(url)) {
              productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(url);
            }

            if (!isNumeric(productId)) {
              productId = IGNORE_PRODUCT;
            }
          } else {
            productId = IGNORE_PRODUCT;
          }
        }

        if (AmazonSiteUtils.isAmazonSite(url)) {
          if (AmazonSiteUtils.isAmazonWholesale(url)) {
            const hef = pr?.getAttribute("href");
            productId =
              pr.getAttribute(productIdSelector) || AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(hef);
          }
          if (AmazonSiteUtils.isAmazonItemDetails(url)) {
            productId = getAsinFromUrl(url);
          }
        }

        return {
          id: productId,
          domain: this.site.domain,
          url
        };
      })
      .filter((product: IProduct) => product && product.id != IGNORE_PRODUCT);
    debug(`parseDomToGetProducts found ${products.length} products`);
    return products;
  }
}
