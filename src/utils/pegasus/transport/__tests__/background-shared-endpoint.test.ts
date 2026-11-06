import type { Runtime } from "webextension-polyfill";
import type { RequestMessage, StatusMessage } from "../src/PortMessage";
import type { InternalMessage } from "../src/types-internal";

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

const ECHO = "test.echo";
const EVENT = "test.event";

interface FakeContentScript {
  deliver: PortListener;
  received: () => StatusMessage[];
  disconnect: () => void;
}

const connectContentScript = (fingerprint: string): FakeContentScript => {
  const portListeners: PortListener[] = [];
  const disconnectListeners: Array<() => void> = [];
  const postMessage = jest.fn();
  const port = {
    name: JSON.stringify({ endpointName: "", fingerprint }),
    onDisconnect: { addListener: (listener: () => void) => disconnectListeners.push(listener) },
    onMessage: { addListener: (listener: PortListener) => portListeners.push(listener) },
    postMessage,
    sender: { frameId: 0, tab: { id: 7 } }
  } as unknown as Runtime.Port;
  connectListeners.forEach((listener) => listener(port));

  return {
    deliver: (message) => portListeners.forEach((listener) => listener(message)),
    disconnect: () => disconnectListeners.forEach((listener) => listener()),
    received: () => postMessage.mock.calls.map(([message]) => message as StatusMessage)
  };
};

const echoRequest = (transactionId: string): InternalMessage => ({
  data: transactionId,
  destination: { context: "background", tabId: null },
  hops: [],
  id: ECHO,
  messageType: "message",
  origin: { context: "content-script", tabId: null },
  timestamp: Date.now(),
  transactionId
});

const incomingReplies = (script: FakeContentScript) =>
  script
    .received()
    .flatMap((status) =>
      status.status === "incoming" && status.message.messageType === "reply" ? [status.message as InternalMessage] : []
    )
    .map((reply) => reply.data);

const incomingEvents = (script: FakeContentScript) =>
  script
    .received()
    .flatMap((status) =>
      status.status === "incoming" && status.message.messageType === "broadcastEvent" ? [status.message.id] : []
    );

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe("background transport with two content scripts in one frame", () => {
  let first: FakeContentScript;
  let second: FakeContentScript;
  let emitBroadcastEvent: (eventID: string, data: string) => Promise<void>;

  beforeAll(async () => {
    const { initPegasusTransport } = await import("../background");
    const { definePegasusMessageBus } = await import("../src/definePegasusMessageBus");
    const { definePegasusEventBus } = await import("../src/definePegasusEventBus");
    initPegasusTransport();
    definePegasusMessageBus<Record<string, (data: string) => string>>().onMessage(ECHO, ({ data }) => data);
    ({ emitBroadcastEvent } = definePegasusEventBus<Record<string, string>>());
    first = connectContentScript("uid::first");
    second = connectContentScript("uid::second");
  });

  it("replies to the script that sent the request, connected first", async () => {
    first.deliver({ message: echoRequest("tx-first"), type: "deliver" });
    await flush();

    expect(incomingReplies(first)).toEqual(["tx-first"]);
    expect(incomingReplies(second)).toEqual([]);
  });

  it("replies to the script that sent the request, connected last", async () => {
    second.deliver({ message: echoRequest("tx-second"), type: "deliver" });
    await flush();

    expect(incomingReplies(second)).toEqual(["tx-second"]);
    expect(incomingReplies(first)).toEqual(["tx-first"]);
  });

  it("delivers a broadcast event to both scripts", async () => {
    await emitBroadcastEvent(EVENT, "payload");

    expect(incomingEvents(first)).toEqual([EVENT]);
    expect(incomingEvents(second)).toEqual([EVENT]);
  });

  it("keeps replying to the remaining script after the other disconnects", async () => {
    second.disconnect();
    first.deliver({ message: echoRequest("tx-after-disconnect"), type: "deliver" });
    await flush();

    expect(incomingReplies(first)).toEqual(["tx-first", "tx-after-disconnect"]);
  });
});
