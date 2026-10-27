import * as logger from "../../utils/analytics/logger";
import { ApiScamPartners } from "../logic/anti-scam-logic";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import * as tabContentRater from "../scam-rater/tab-content-rater";
import { ScamSiteType } from "../types/anti-scam";
import { EngineScript, readEngine, readTab, TabScript, verdictScript } from "./verdict-script";

const TAB_CASES: TabScript[] = ["absent", "SAFE", "DANGEROUS", "NO_DATA", "throw"];
const ENGINE_CASES: EngineScript[] = ["SAFE", "DANGEROUS", "NO_DATA", "reject"];
const DOMAIN = "example.test";

type Case = {
  tab: TabScript;
  wot: EngineScript;
  norton: EngineScript;
  voidUrl: EngineScript;
};

const cases: Case[] = TAB_CASES.flatMap((tab) =>
  ENGINE_CASES.flatMap((wot) =>
    ENGINE_CASES.flatMap((norton) => ENGINE_CASES.map((voidUrl) => ({ tab, wot, norton, voidUrl })))
  )
);

const partners = new ApiScamPartners();

const story = (item: Case, got: ScamSiteType): string =>
  [
    `examineTab is ${item.tab}`,
    `ApiScamWOT returns ${item.wot}`,
    `ApiScamNorton returns ${item.norton}`,
    `ApiScamVoidUrl returns ${item.voidUrl}`,
    `ApiScamPartners.evaluate returns ${got}`
  ].join("; ");

const violationOf = (item: Case, got: ScamSiteType): string | null => {
  const votes = [item.wot, item.norton, item.voidUrl];
  const dangerVotes = votes.filter((vote) => vote === "DANGEROUS").length;
  const anySafe = votes.some((vote) => vote === "SAFE");
  const shouldBeDangerous = dangerVotes >= 2 && !anySafe;
  if (shouldBeDangerous && got !== ScamSiteType.DANGEROUS) {
    return `${story(item, got)}. At least two partner engines returned DANGEROUS and none returned SAFE, so the conclusion must be DANGEROUS.`;
  }
  if (got === ScamSiteType.DANGEROUS && !shouldBeDangerous) {
    return `${story(item, got)}. The conclusion is DANGEROUS without two partner engines returning DANGEROUS and no SAFE vote.`;
  }
  return null;
};

describe("ApiScamPartners partner consensus", () => {
  beforeAll(() => {
    jest.spyOn(logger, "debug").mockImplementation(() => undefined);
    jest.spyOn(ApiScamWOT.prototype, "get").mockImplementation((_domain, tabId) => readEngine("wot", tabId));
    jest.spyOn(ApiScamNorton.prototype, "get").mockImplementation((_domain, tabId) => readEngine("norton", tabId));
    jest.spyOn(ApiScamVoidUrl.prototype, "get").mockImplementation((_domain, tabId) => readEngine("voidUrl", tabId));
    jest.spyOn(tabContentRater, "examineTab").mockImplementation((tabId) => readTab(tabId));
  });

  it("returns DANGEROUS when at least two partner engines returned DANGEROUS and none returned SAFE", async () => {
    const violations = await cases.reduce(
      async (previous, item) => {
        const found = await previous;
        verdictScript.tab = item.tab;
        verdictScript.wot = item.wot;
        verdictScript.norton = item.norton;
        verdictScript.voidUrl = item.voidUrl;
        const tabId = item.tab === "absent" ? 0 : 1;
        const result = await partners.evaluate(DOMAIN, tabId);
        const violation = violationOf(item, result.type);
        if (violation) {
          found.push(violation);
        }
        return found;
      },
      Promise.resolve([] as string[])
    );

    expect(violations).toEqual([]);
  });
});
