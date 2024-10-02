import { debug, logError } from "../analytics/logger";
import { ext } from "./ext";
import { decodeMsg, encodeMsg } from "./utils";

const PORT_NAME = "safe-deal-port";
const WORKER_PORTS = {};
let backgroundPortInitialized = false;

const EVENTS_HANDLERS = {};
const LISTENERS_REGISTRY = {};

const ensureBackgroundPortInitialized = () => {
  if (!backgroundPortInitialized) {
    ext.runtime.onConnect.addListener((connectedPort) => {
      if (connectedPort.name === PORT_NAME) {
        const tabId = connectedPort.sender?.tab?.id ?? connectedPort?.sender?.id;
        WORKER_PORTS[tabId] = connectedPort;

        connectedPort.onMessage.addListener((msg, senderPort) => {
          const decodedMessage = decodeMsg(msg);
          const { type, params } = decodedMessage || {};
          const { sender } = senderPort || {};
          if (EVENTS_HANDLERS[type]) {
            try {
              EVENTS_HANDLERS[type](
                params,
                (response) => {
                  WORKER_PORTS[tabId]?.postMessage(encodeMsg({ type, response }));
                },
                sender
              );
            } catch (error) {
              logError(error);
              WORKER_PORTS[tabId]?.postMessage(encodeMsg({ type, error: error.message }));
            }
          }
        });

        connectedPort.onDisconnect.addListener(() => {
          debug(`-- Glue Messaging :: Background port ${tabId} disconnected and cleaned up.`);
          delete WORKER_PORTS[tabId];
        });
      }
    });
    backgroundPortInitialized = true;
    debug("-- Glue Messaging :: Background port initialized.");
  }
};

let contentPort = null;
const ensureContentPortInitialized = () => {
  if (!contentPort) {
    contentPort = ext.runtime.connect({ name: PORT_NAME });

    const messageListener = (msg) => {
      const decodedMessage = decodeMsg(msg);
      const { type, response } = decodedMessage;
      if (LISTENERS_REGISTRY[type]) {
        LISTENERS_REGISTRY[type].forEach((listener) => listener(response));
      }
    };

    contentPort.onMessage.addListener(messageListener);
    contentPort.onDisconnect.addListener(() => {
      contentPort.onMessage.removeListener(messageListener);
      contentPort = null;
      debug("-- Glue Messaging :: Content script port disconnected and cleaned up.");
    });
  }
};

export const sendMessage = (type, params) => {
  try {
    ensureContentPortInitialized();
    if (contentPort) {
      contentPort.postMessage(encodeMsg({ type, params }));
    } else {
      debug("-- Glue Messaging :: Port is not initialized or disconnected.");
    }
  } catch (error) {
    debug(error, "-- Glue Messaging :: Error while sending message.");
  }
};

export const addWorkerHandler = (type, handler) => {
  try {
    ensureBackgroundPortInitialized();
    EVENTS_HANDLERS[type] = handler;
  } catch (error) {
    debug(error, "-- Glue Messaging :: Error while adding worker handler.");
  }
};

export const registerClientListener = (type, listener) => {
  try {
    ensureContentPortInitialized();
    if (!LISTENERS_REGISTRY[type]) {
      LISTENERS_REGISTRY[type] = [];
    }
    LISTENERS_REGISTRY[type].push(listener);
  } catch (error) {
    debug(error, "-- Glue Messaging :: Error while registering client listener.");
  }
};
