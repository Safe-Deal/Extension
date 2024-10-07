import { browserWindow } from "../../../utils/dom/html";
import { PROCESSING_UPDATE_INTERVAL } from "../components/constants";
import { sendNextRequest } from "../processing/queHandler";
import { ClientQue } from "../processing/que";

let processingIntervalHandle = null;

export const stopProcessingInterval = () => {
  browserWindow().clearInterval(processingIntervalHandle);
};

export const registerEvents = () => {
  browserWindow().addEventListener("beforeunload", () => {
    stopProcessingInterval();
  });
};

export const startProcessingInterval = () => {
  processingIntervalHandle = browserWindow().setInterval(() => {
    if (!ClientQue.isAllDone()) {
      sendNextRequest();
    }
  }, PROCESSING_UPDATE_INTERVAL);
};
