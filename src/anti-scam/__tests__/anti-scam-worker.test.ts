import type { PegasusMessage } from "@utils/pegasus/transport";
import { ScamConclusion, ScamSiteType } from "../types/anti-scam";

type AnalyzeHandler = (request: PegasusMessage<string>) => Promise<unknown>;

const handlers = new Map<string, AnalyzeHandler>();
const evaluate = jest.fn();
const removeTab = jest.fn();

jest.mock("@utils/pegasus/transport", () => ({
  definePegasusEventBus: () => ({
    emitBroadcastEvent: jest.fn().mockResolvedValue(undefined),
    onBroadcastEvent: jest.fn()
  }),
  definePegasusMessageBus: () => ({
    onMessage: (id: string, handler: AnalyzeHandler) => handlers.set(id, handler),
    sendMessage: jest.fn()
  })
}));

jest.mock("../logic/anti-scam-logic", () => ({
  ApiScamPartners: jest.fn().mockImplementation(() => ({ evaluate }))
}));

jest.mock("../../utils/extension/ext", () => ({
  ext: { tabs: { remove: (tabId: number) => removeTab(tabId) } }
}));

const TAB_ID = 42;

const analyze = (data: string) => {
  const handler = handlers.get("analyzeDomain");
  if (!handler) {
    throw new Error("analyzeDomain handler was not registered");
  }
  return handler({
    data,
    id: "analyzeDomain",
    sender: { context: "content-script", frameId: 0, tabId: TAB_ID },
    timestamp: Date.now()
  });
};

describe("anti-scam worker ANALYZE_DOMAIN", () => {
  beforeAll(async () => {
    const { initAntiScamWorker } = await import("../anti-scam-worker");
    initAntiScamWorker();
  });

  beforeEach(() => {
    evaluate.mockReset();
    removeTab.mockReset();
  });

  it("replies with the conclusion only after the evaluation finished", async () => {
    const conclusion: ScamConclusion = { tabId: TAB_ID, type: ScamSiteType.DANGEROUS };
    let finishEvaluation: (value: ScamConclusion) => void = () => undefined;
    evaluate.mockReturnValue(
      new Promise<ScamConclusion>((resolve) => {
        finishEvaluation = resolve;
      })
    );

    let settled = false;
    const reply = analyze("suspect-fixture.test").then((value) => {
      settled = true;
      return value;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    finishEvaluation(conclusion);

    await expect(reply).resolves.toEqual(conclusion);
    expect(evaluate).toHaveBeenCalledWith("suspect-fixture.test", TAB_ID);
  });

  it("replies with the conclusion for a safe site", async () => {
    const conclusion: ScamConclusion = { tabId: TAB_ID, type: ScamSiteType.SAFE };
    evaluate.mockResolvedValue(conclusion);

    await expect(analyze("shop.example")).resolves.toEqual(conclusion);
  });

  it("replies null and closes the sender tab on CLOSE_TAB", async () => {
    await expect(analyze("close-tab")).resolves.toBeNull();

    expect(removeTab).toHaveBeenCalledWith(TAB_ID);
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("replies null for an empty domain", async () => {
    await expect(analyze("")).resolves.toBeNull();

    expect(evaluate).not.toHaveBeenCalled();
  });
});
