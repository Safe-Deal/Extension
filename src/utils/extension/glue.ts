import { ReviewSummaryData } from "../../e-commerce/reviews/reviews-types";
import { IBackgroundListenerMessage } from "../../e-commerce/worker/worker";
import { addWorkerHandler, registerClientListener, sendMessage } from "./messaging";

const WORKER_MESSAGE_TYPE = Object.freeze({
  ANTI_SCAM: "anti_scam",
  SHUTAF: "shutaf",
  REVIEWS_SUMMARIZATION: "reviews_summarization",
  E_COMMERCE: "e_commerce",
  SUPPLIER: "supplier"
});

export type ContentListener = (message: any, sender: any) => void;
export type BackgroundListener = (message: any, postMessage: any) => void;

enum ComersRequestType {
  E_COMMERCE_PRODUCT = "e_commerce_product",
  E_COMMERCE = "e_commerce_wholesale"
}

export const ECOMMERCE_GLUE = {
  WHOLESALE: ComersRequestType.E_COMMERCE,
  PRODUCT: ComersRequestType.E_COMMERCE_PRODUCT,
  worker(onProduct) {
    addWorkerHandler(WORKER_MESSAGE_TYPE.E_COMMERCE, onProduct);
  },
  client(onClient: ContentListener) {
    registerClientListener(WORKER_MESSAGE_TYPE.E_COMMERCE, onClient);
  },
  send(product: IBackgroundListenerMessage, type: ComersRequestType) {
    sendMessage(WORKER_MESSAGE_TYPE.E_COMMERCE, { product, type });
  }
};

export const SUPPLIER_GLUE = {
  worker(onProduct: BackgroundListener) {
    addWorkerHandler(WORKER_MESSAGE_TYPE.SUPPLIER, onProduct);
  },
  client(onClient: ContentListener) {
    registerClientListener(WORKER_MESSAGE_TYPE.SUPPLIER, onClient);
  },
  send(product: any) {
    sendMessage(WORKER_MESSAGE_TYPE.SUPPLIER, product);
  }
};

export const SHUTAF_GLUE = {
  PING: "ping",
  worker(onShutaf) {
    addWorkerHandler(WORKER_MESSAGE_TYPE.SHUTAF, onShutaf);
  },
  client(onClient: ContentListener) {
    registerClientListener(WORKER_MESSAGE_TYPE.SHUTAF, onClient);
  },
  send(url: string) {
    sendMessage(WORKER_MESSAGE_TYPE.SHUTAF, url);
  },
  ping() {
    sendMessage(WORKER_MESSAGE_TYPE.SHUTAF, SHUTAF_GLUE.PING);
  }
};

export const ANTI_SCAM_GLUE = {
  worker(onAntiScam) {
    addWorkerHandler(WORKER_MESSAGE_TYPE.ANTI_SCAM, onAntiScam);
  },
  client(onClient: ContentListener) {
    registerClientListener(WORKER_MESSAGE_TYPE.ANTI_SCAM, onClient);
  },
  send(value: any) {
    sendMessage(WORKER_MESSAGE_TYPE.ANTI_SCAM, value);
  }
};

export const REVIEW_SUMMARY_GLUE = {
  REVIEW_ERROR: "REVIEW_SUMMARIZATION_ERROR",
  worker(onReviewsSummarize) {
    addWorkerHandler(WORKER_MESSAGE_TYPE.REVIEWS_SUMMARIZATION, onReviewsSummarize);
  },
  client(onClient: ContentListener) {
    registerClientListener(WORKER_MESSAGE_TYPE.REVIEWS_SUMMARIZATION, onClient);
  },
  send(reviewsSummarizeMsg: ReviewSummaryData) {
    sendMessage(WORKER_MESSAGE_TYPE.REVIEWS_SUMMARIZATION, reviewsSummarizeMsg);
  }
};
