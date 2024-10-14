import { API_URL } from "../../constants/api-params";
import { browserWindow } from "../dom/html";
import { STATUS_NOT_200 } from "../downloaders/fetch";
import { BROWSER_VERSION, VERSION } from "../extension/utils";
import { isBackgroundPage } from "../general/general";
import { definePegasusMessageBus } from "@utils/pegasus/transport";

export enum ErrorMessageType {
  SEND_ERROR = "sendError"
}
export interface IErrorMessageBus {
  [ErrorMessageType.SEND_ERROR]: (errorMessage: any) => Promise<void>;
}

const isNode = (): boolean =>
  typeof process !== "undefined" && process.versions != null && process.versions.node != null;

export const IS_NODE = isNode();

const getDebugFlag = (): boolean => {
  if (IS_NODE) {
    const { IS_DEBUG_ON } = process?.env || {};
    if (typeof IS_DEBUG_ON !== "undefined") {
      return Boolean(IS_DEBUG_ON);
    }
    return false;
  }

  if (typeof jest !== "undefined") {
    return false;
  }
  // @ts-ignore
  if (typeof IS_DEBUGGER_ON !== "undefined") {
    // @ts-ignore
    return Boolean(IS_DEBUGGER_ON);
  }

  return false;
};

export const INSTALL_TYPE = "TYPE";
const ERROR_URL = () => `${API_URL}/error`;

export const IS_DEBUG = getDebugFlag();
export const NODE_LOCALE = "en";

if (typeof jest === "undefined") {
  if (IS_DEBUG) {
    // eslint-disable-next-line no-console
    console.info(`SafeDeal :: Extension Engine Reloading.... -> Clearing Console.`);
    // eslint-disable-next-line no-console
    console.clear();
    // eslint-disable-next-line no-console
    console.info(`SafeDeal :: Extension Engine Loaded -> Debugger -> ON`);
  }
}

const extractErrorMessage = (err: any) => {
  if (err instanceof Error) {
    return `${err.message} -> ${err.stack}`;
  }
  return err;
};

export const debug = (msg: any, data: string | object = "", type = console.log) => {
  if (IS_DEBUG) {
    const message = msg instanceof Error ? extractErrorMessage(msg) : msg;
    if (typeof data === "string") {
      type(`SafeDeal :: ${data ? `${data} ::` : ""}`, message);
    } else if (typeof data === "object") {
      type(`SafeDeal ::`, message, data);
    } else {
      type(`SafeDeal ::`, message);
    }
  }
};

debug.isDebug = IS_DEBUG;

export const sendLog = (errorMsg: object) =>
  fetch(ERROR_URL(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "post",
    body: JSON.stringify(errorMsg)
  });

export const logError = (exception: Error, ruleName: string = "N/A - General Exception"): void => {
  const err = extractErrorMessage(exception);

  if (IS_NODE) {
    if (global.reportErrorToServer) {
      global.reportErrorToServer(err);
    } else {
      debug(err, ruleName, console.error);
    }
    return;
  }

  const isBackground = isBackgroundPage();
  const msg: any = { Rule: `${ruleName} - v:${VERSION} on ${BROWSER_VERSION}`, Error: err, isWorker: isBackground };

  if (!isBackground) {
    const url = browserWindow().location?.href;
    msg.url = url;
  }

  if (exception?.message?.includes(STATUS_NOT_200)) {
    return;
  }

  if (IS_DEBUG) {
    debug(err, ruleName, console.error);
    // eslint-disable-next-line no-debugger
    debugger;
  } else {
    debug(msg, ruleName, console.error);
    if (isBackground) {
      sendLog(msg);
    } else {
      sendErrorMessage(msg);
    }
  }
};

export const handleError = logError;

export const initLog = () => {
  const { onMessage } = definePegasusMessageBus<IErrorMessageBus>();

  onMessage(ErrorMessageType.SEND_ERROR, async (errorMsg) => {
    await sendLog(errorMsg);
  });
};

export const sendErrorMessage = (errorMsg: any) => {
  const { sendMessage } = definePegasusMessageBus<IErrorMessageBus>();
  sendMessage(ErrorMessageType.SEND_ERROR, errorMsg);
};
