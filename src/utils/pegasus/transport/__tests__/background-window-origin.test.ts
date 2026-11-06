import type { Runtime } from "webextension-polyfill";
import type { RequestMessage } from "../src/PortMessage";
import type { InternalMessage } from "../src/types-internal";
import type { RuntimeContext } from "../src/types";

type ConnectListener = (port: Runtime.Port) => void;
type PortListener = (message: RequestMessage) => void;

const connectListeners: ConnectListener[] = [];

jest.mock("webextension-polyfill", () => ({
  __esModule: true,
  default: {
    runtime: {
      onConnect: { addListener: (listener: ConnectListener) => connectListeners.push(listener) }
    }
  }
}));

jest.mock("serialize-error", () => ({
  serializeError: (error: unknown) => ({ message: String(error) })
}));

const STORE_WRITE = "pegasus-rpc-service.PegasusStoreCommunicationBridgeFor-globalAuthState";

const connectContentScript = (): PortListener => {
  const portListeners: PortListener[] = [];
  const port = {
    name: JSON.stringify({ endpointName: "", fingerprint: "uid::content-script" }),
    onDisconnect: { addListener: jest.fn() },
    onMessage: { addListener: (listener: PortListener) => portListeners.push(listener) },
    postMessage: jest.fn(),
    sender: { frameId: 0, tab: { id: 7 } }
  } as unknown as Runtime.Port;
  connectListeners.forEach((listener) => listener(port));

  return (message) => portListeners.forEach((listener) => listener(message));
};

const storeWriteFrom = (context: RuntimeContext): InternalMessage => ({
  data: { args: ['{"type":"__ZUSTAND_SYNC__","state":{"isPremium":true}}'], path: "dispatch" },
  destination: { context: "background", tabId: null },
  hops: [],
  id: STORE_WRITE,
  messageType: "message",
  origin: { context, tabId: null },
  timestamp: Date.now(),
  transactionId: `tx-${context}`
});

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe("background transport", () => {
  const handler = jest.fn();
  let deliver: PortListener;

  beforeAll(async () => {
    const { initPegasusTransport } = await import("../background");
    const { definePegasusMessageBus } = await import("../src/definePegasusMessageBus");
    initPegasusTransport();
    definePegasusMessageBus<Record<string, unknown>>().onMessage(STORE_WRITE, handler);
    deliver = connectContentScript();
  });

  beforeEach(() => handler.mockClear());

  it("does not route a packet a page window sent through a content script", async () => {
    deliver({ message: storeWriteFrom("window"), type: "deliver" });
    await flush();

    expect(handler).not.toHaveBeenCalled();
  });

  it("routes a packet the content script itself sent", async () => {
    deliver({ message: storeWriteFrom("content-script"), type: "deliver" });
    await flush();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].sender.context).toBe("content-script");
  });
});
