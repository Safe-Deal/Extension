import {
  IEcommerceMessageBus,
  IBackgroundListenerMessage,
  EcommerceMessageTypes,
  ECommerceProductType,
  IEcommerceEventBus
} from "@e-commerce/worker/worker";
import { definePegasusMessageBus, definePegasusEventBus } from "@utils/pegasus/transport";
import { IProduct } from "../../../data/entities/product.interface";
import { DisplaySite } from "../../engine/logic/site/display-site";
import { PreDisplaySiteFactory, DisplaySiteFactory } from "../../engine/logic/site/display-site-factory";
import { debug } from "../../../utils/analytics/logger";
import { browserWindow } from "../../../utils/dom/html";
import { SiteMetadata } from "../../../utils/site/site-information";
import { AnalyzedItem, Progress } from "./productHandler";
import { ClientQue } from "./que";
import { comparePaths } from "../../../utils/dom/location";
import { SiteUtil } from "../../engine/logic/utils/site-utils";
import { ProductStore } from "../../engine/logic/conclusion/conclusion-product-entity.interface";

const store = SiteUtil.getStore();
const STORE_DELAY_TIMES_MAP = {
  [ProductStore.AMAZON]: 0,
  [ProductStore.EBAY]: 0,
  [ProductStore.ALI_EXPRESS]: 1100,
  [ProductStore.ALI_EXPRESS_RUSSIA]: 1100
};

const renderDelay = STORE_DELAY_TIMES_MAP[store] || 0;

export const sendNextRequest = () => {
  const { sendMessage } = definePegasusMessageBus<IEcommerceMessageBus>();
  const currentProduct: IProduct = ClientQue.getNextProductFromQue();
  if (!currentProduct) return;

  const isItemDetails = SiteUtil.isItemDetails();
  const type = isItemDetails ? ECommerceProductType.PRODUCT : ECommerceProductType.WHOLESALE;
  const isAliExpress = store === ProductStore.ALI_EXPRESS || store === ProductStore.ALI_EXPRESS_RUSSIA;

  const payload: IBackgroundListenerMessage = {
    url: {
      domain: SiteMetadata.getDomain(),
      domainURL: SiteMetadata.getDomainURL(),
      pathName: SiteMetadata.getPathName(),
      queryParams: SiteMetadata.getQueryParams(),
      url: SiteMetadata.getURL()
    },
    product: currentProduct,
    type,
    ...(isAliExpress && { document: SiteMetadata.getDomOuterHTML(browserWindow().document) }),
    ...(store === ProductStore.EBAY && {
      routingHint: (browserWindow().document.querySelector(".expand-btn__cell .icon--filter-list-small")
        ? "list"
        : "gallery") as "list" | "gallery"
    })
  };

  debug(`=> sendNextRequest productQue: ${currentProduct.id}`);
  if (renderDelay > 0) {
    setTimeout(() => sendMessage(EcommerceMessageTypes.PROCESS_PRODUCT, payload), renderDelay);
  } else {
    sendMessage(EcommerceMessageTypes.PROCESS_PRODUCT, payload);
  }
};

export const registerGetResponse = (
  updateProgress: (progress: Progress) => void,
  updateItems: (progress: AnalyzedItem[]) => void
) => {
  const { onBroadcastEvent } = definePegasusEventBus<IEcommerceEventBus>();

  onBroadcastEvent(EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT, (response) => {
    const data = response.data;
    if (!data) {
      debug(`=> Error: Data: ${data}`, "Client::registerGetResponse");
    }

    const { error, productId, conclusionProductEntity, site } = data;
    const url = SiteMetadata.getURL();
    debug(`=> Got response from Worker Product No: ${productId} ....`);
    if (error) {
      debug(`=> Error: ${error}`, "Client::registerGetResponse");
      return;
    }
    const isSameRequest = comparePaths(site.url, url);
    if (isSameRequest) {
      const left = ClientQue.getProcessingAmount();
      updateProgress({
        justStarted: false,
        totalFound: 0,
        sentToAnalysis: 0,
        receivedFromAnalysis: 1,
        totalAnalyzed: 1,
        totalLeft: left
      });
      const analyzedItem: AnalyzedItem = { id: productId, data: conclusionProductEntity[0] };
      updateItems([analyzedItem]);

      const displaySitePage: DisplaySite = new DisplaySiteFactory().create(data);
      if (displaySitePage) {
        setTimeout(() => {
          PreDisplaySiteFactory.destroy();
          displaySitePage.apply();
          ClientQue.progressingDone(productId);
        }, 0);
      }
    } else {
      ClientQue.progressingDone(productId); // keep _inProgressCount accurate on SPA navigation
      debug(`=> Site URL Mismatch. Expected: ${url} Got: ${site.url}`, "Client::registerGetResponse");
    }
  });
};
