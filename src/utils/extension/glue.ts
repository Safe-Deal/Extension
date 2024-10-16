import { IBackgroundListenerMessage } from "../../e-commerce/worker/worker";
import { addWorkerHandler, registerClientListener, sendMessage } from "./messaging";

const WORKER_MESSAGE_TYPE = Object.freeze({
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
