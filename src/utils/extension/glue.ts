import { IBackgroundListenerMessage } from "../../e-commerce/worker/worker";
import { addWorkerHandler, registerClientListener, sendMessage } from "./messaging";

const WORKER_MESSAGE_TYPE = Object.freeze({
  SHUTAF: "shutaf",
  E_COMMERCE: "e_commerce"
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
