/**
 * @jest-environment-options {"url": "http://suspect-fixture.test/"}
 */
import { MARK_AS_SAFE } from "../logic/anti-scam-persistance";
import { ScamConclusion, ScamSiteType } from "../types/anti-scam";

const sendMessage = jest.fn();

jest.mock("@utils/pegasus/transport", () => ({
  definePegasusEventBus: () => ({ emitBroadcastEvent: jest.fn(), onBroadcastEvent: jest.fn() }),
  definePegasusMessageBus: () => ({ onMessage: jest.fn(), sendMessage })
}));

jest.mock("@utils/pegasus/transport/content-script", () => ({
  initPegasusTransport: jest.fn()
}));

const MODAL = "#safe-deal-anti-scam-root .anti-scam-modal";

const waitFor = async (condition: () => boolean, timeoutMs = 2000) => {
  const deadline = Date.now() + timeoutMs;
  while (!condition() && Date.now() < deadline) {
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }
};

const loadContentScript = async () => {
  jest.resetModules();
  await import("../content-script-anti-scam");
};

const runContentScript = async (reply: ScamConclusion | null) => {
  sendMessage.mockResolvedValue(reply);
  await loadContentScript();
  await waitFor(() => sendMessage.mock.calls.length > 0);
};

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

describe("anti-scam content script", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("asks the worker about the page's own domain", async () => {
    await runContentScript(null);

    expect(sendMessage).toHaveBeenCalledWith("analyzeDomain", "suspect-fixture.test");
  });

  it("shows exactly one danger modal when the worker replies DANGEROUS", async () => {
    await runContentScript({ tabId: 1, type: ScamSiteType.DANGEROUS });
    await waitFor(() => document.querySelectorAll(MODAL).length > 0);
    await settle();

    expect(document.querySelectorAll("#safe-deal-anti-scam-root")).toHaveLength(1);
    expect(document.querySelectorAll(MODAL)).toHaveLength(1);
    expect(document.querySelector("#anti-scam-modal-title")).not.toBeNull();
    expect(localStorage.getItem(MARK_AS_SAFE)).toBeNull();
  });

  it("records the site as safe and shows nothing when the worker replies SAFE", async () => {
    await runContentScript({ tabId: 1, type: ScamSiteType.SAFE });
    await waitFor(() => localStorage.getItem(MARK_AS_SAFE) !== null);

    expect(localStorage.getItem(MARK_AS_SAFE)).not.toBeNull();
    expect(document.querySelector("#safe-deal-anti-scam-root")).toBeNull();
  });

  it("neither warns nor whitelists on NO_DATA", async () => {
    await runContentScript({ tabId: 1, type: ScamSiteType.NO_DATA });
    await settle();

    expect(document.querySelector("#safe-deal-anti-scam-root")).toBeNull();
    expect(localStorage.getItem(MARK_AS_SAFE)).toBeNull();
  });

  it("neither warns nor whitelists when there is no reply", async () => {
    await runContentScript(null);
    await settle();

    expect(document.querySelector("#safe-deal-anti-scam-root")).toBeNull();
    expect(localStorage.getItem(MARK_AS_SAFE)).toBeNull();
  });

  it("does not ask the worker about a site already marked safe", async () => {
    localStorage.setItem(MARK_AS_SAFE, Date.now().toString());
    await loadContentScript();
    await settle();

    expect(sendMessage).not.toHaveBeenCalled();
  });
});
