import type { InternalPacket } from "../src/types-internal";
import type { RuntimeContext } from "../src/types";

import { isPageWindowPacket } from "../src/utils/internalPacketTypeGuards";

const packetFrom = (context: RuntimeContext): InternalPacket => ({
  hops: [],
  id: "any",
  messageType: "message",
  origin: { context, tabId: null },
  timestamp: 0,
  transactionId: "tx"
});

describe("isPageWindowPacket", () => {
  it("flags a packet that originated in a page window", () => {
    expect(isPageWindowPacket(packetFrom("window"))).toBe(true);
  });

  const extensionContexts: RuntimeContext[] = ["content-script", "popup", "background", "options", "devtools"];
  extensionContexts.forEach((context) => {
    it(`accepts a packet from the ${context} extension context`, () => {
      expect(isPageWindowPacket(packetFrom(context))).toBe(false);
    });
  });
});
