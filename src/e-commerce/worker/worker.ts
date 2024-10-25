import PQueue from "p-queue";
import { definePegasusMessageBus, definePegasusEventBus } from "@utils/pegasus/transport";
import { initEcommerceStoreBackend } from "@store/EcommerceStore";
import { IProduct } from "../../data/entities/product.interface";
import { ISiteResponse } from "../../data/entities/site-response.interface";
import { ConclusionManager } from "../../data/rules-conclusion/conclusion-manager";
import { IConclusionResponse } from "../../data/rules-conclusion/conclusion-response.interface";
import { RuleManager } from "../../data/rules/rule-manager";
import { Site } from "../../data/sites/site";
import { SiteFactory } from "../../data/sites/site-factory";
import { debug, logError } from "../../utils/analytics/logger";
import { MemoryCache } from "../../utils/cashing/memoryCache";
import { SiteMetadata } from "../../utils/site/site-information";
import { IConclusionProductEntity } from "../engine/logic/conclusion/conclusion-product-entity.interface";
import { convertSiteToSiteResponse } from "../engine/logic/utils/convertors";
import { SiteUtil } from "../engine/logic/utils/site-utils";

export enum ECommerceProductType {
  PRODUCT = "e_commerce_product",
  WHOLESALE = "e_commerce_wholesale"
}

export enum EcommerceMessageTypes {
  PROCESS_PRODUCT = "processProduct",
  EMIT_CONCLUSION_RESPONSE_EVENT = "ecommerce:conclusionResponse"
}

export interface IEcommerceMessageBus {
  [EcommerceMessageTypes.PROCESS_PRODUCT]: (request: IBackgroundListenerMessage) => Promise<void>;
}

export interface IEcommerceEventBus {
  [EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT]: IConclusionResponse;
}

const MAX_PARALLEL_PROCESSING = 8;

const queue = new PQueue({ concurrency: MAX_PARALLEL_PROCESSING });
const cash = new MemoryCache();

export interface IBackgroundListenerMessage {
  document: string;
  url: {
    domain: string;
    domainURL: string;
    pathName: string;
    queryParams: string;
    url: string;
  };
  product: IProduct;
  type: ECommerceProductType;
}

const reportError = ({ error, productId, setConclusionResponse, emitBroadcastEvent, siteResponse, cashingKey }) => {
  const conclusionResponse: IConclusionResponse = {
    conclusionProductEntity: [],
    error: error?.toString(),
    site: siteResponse,
    productId
  };
  cash.delete(cashingKey);
  setConclusionResponse(conclusionResponse);
  emitBroadcastEvent(EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT, conclusionResponse);
  logError(error);
};

const processProduct = async (
  data: IBackgroundListenerMessage,
  setConclusionResponse: (data: IConclusionResponse) => void,
  emitBroadcastEvent
) => {
  let siteResponse: ISiteResponse = null;
  let productId: string = null;
  let cashingKey: string = null;
  try {
    productId = data?.product?.id;
    debug(`Processing Product #${data?.product?.id}`, "Worker::analyze");
    const isItem = SiteUtil.isItemDetails(data.url.url);
    cashingKey = `${data.url.domain}_${productId}_${isItem ? "item" : "list"}`;
    if (cash.has(cashingKey)) {
      const result = cash.get(cashingKey);
      setConclusionResponse(result);
      emitBroadcastEvent(EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT, result);
      debug(`Product #${productId} is already in processed returning from cash`, "Worker::analyze");
      return;
    }

    const dom = SiteMetadata.getDom(data);
    const site: Site = new SiteFactory().create({
      url: data?.url?.url,
      pathName: data?.url?.pathName,
      dom
    });
    siteResponse = convertSiteToSiteResponse(site);

    debug(`Found: ${data?.url?.domainURL} with ${site?.rules?.length} rules for: ${site?.pathName}`, "Worker::analyze");

    const { rules } = site;
    const { siteDomSelector } = site;

    const { product } = data;
    debug(`Product: ${productId || data?.url?.pathName} `);

    if (!rules) {
      debug(`Rules Not Found !!! on: ${site.url}`);
    }

    debug(`Running Rules: ${productId} ....`, "Worker::analyze");
    product.domain = data.url.domain;
    product.document = data.document;
    const ruleManager = new RuleManager([product], rules, siteDomSelector);
    const conclusionManager = new ConclusionManager(ruleManager);
    const conclusionProductEntities: IConclusionProductEntity[] = await conclusionManager.conclusion();
    const conclusionResponse: IConclusionResponse = {
      conclusionProductEntity: conclusionProductEntities,
      site: siteResponse,
      productId: product.id
    };
    cash.set(cashingKey, conclusionResponse);
    setConclusionResponse(conclusionResponse);
    emitBroadcastEvent(EcommerceMessageTypes.EMIT_CONCLUSION_RESPONSE_EVENT, conclusionResponse);
    debug(`Processing of: ${product?.id} .... Done - Response sent.`, "Worker::analyze");
  } catch (error) {
    reportError({ error, productId, setConclusionResponse, emitBroadcastEvent, siteResponse, cashingKey });
  }
};

export const initCommerce = async () => {
  const store = await initEcommerceStoreBackend();
  debug("EcommerceStore:: E-commerce Store ready!", store.getState());
  const { setConclusionResponse, setCurrentProduct } = store.getState();
  const { onMessage } = definePegasusMessageBus<IEcommerceMessageBus>();
  const { emitBroadcastEvent } = definePegasusEventBus<IEcommerceEventBus>();

  onMessage(EcommerceMessageTypes.PROCESS_PRODUCT, async (request) => {
    try {
      if (!request || !request.data) {
        throw new Error("EcommerceWorker:: Invalid request or data!");
      }
      const { product, type } = request.data;
      setCurrentProduct(product);
      if (type === ECommerceProductType.PRODUCT) {
        queue.pause();
        await processProduct(request.data, setConclusionResponse, emitBroadcastEvent);
        queue.start();
      } else {
        queue.add(() => {
          processProduct(request.data, setConclusionResponse, emitBroadcastEvent).catch((error) => {
            reportError({
              error,
              productId: product?.id,
              setConclusionResponse,
              emitBroadcastEvent,
              siteResponse: null,
              cashingKey: null
            });
          });
        });
      }
    } catch (error) {
      logError(error, "EcommerceWorker:: Error!");
    }
  });
};
