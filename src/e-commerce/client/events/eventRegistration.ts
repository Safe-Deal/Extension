import { browserWindow } from "../../../utils/dom/html";
import { PROCESSING_UPDATE_INTERVAL } from "../components/constants";
import { sendNextRequest } from "../processing/queHandler";
import { ClientQue } from "../processing/que";

let processingIntervalHandle: number | null = null;

export const stopProcessingInterval = () => {
  if (processingIntervalHandle !== null) {
    browserWindow().clearInterval(processingIntervalHandle);
    processingIntervalHandle = null;
  }
};

export const registerEvents = () => {
  browserWindow().addEventListener("beforeunload", () => {
    stopProcessingInterval();
  });
};

export const startProcessingInterval = () => {
  if (processingIntervalHandle !== null) return; // already running
  processingIntervalHandle = browserWindow().setInterval(() => {
    if (ClientQue.isAllDone()) {
      stopProcessingInterval(); // auto-stop when queue is drained
    } else {
      sendNextRequest();
    }
  }, PROCESSING_UPDATE_INTERVAL);
};
