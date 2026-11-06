import { ApiScamPartners, concludeFromVotes } from "../logic/anti-scam-logic";
import { ApiScamNorton } from "../scam-rater/api-scam-norton";
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url";
import { ApiScamWOT } from "../scam-rater/api-scam-wot";
import { examineTab } from "../scam-rater/tab-content-rater";
import { ScamSiteType } from "../types/anti-scam";

jest.mock("../scam-rater/tab-content-rater", () => ({
  examineTab: jest.fn()
}));

const TAB_ID = 42;
const { SAFE, DANGEROUS, NO_DATA } = ScamSiteType;

type EngineOutcome = ScamSiteType | "reject";

const ENGINE_OUTCOMES: Array<EngineOutcome> = [SAFE, DANGEROUS, NO_DATA, "reject"];
const ENGINE_CLASSES = [ApiScamWOT, ApiScamNorton, ApiScamVoidUrl];

const stubEngines = (outcomes: Array<EngineOutcome>) => {
  ENGINE_CLASSES.forEach((engineClass, index) => {
    const outcome = outcomes[index];
    const spy = jest.spyOn(engineClass.prototype, "get");
    if (outcome === "reject") {
      spy.mockRejectedValue(new Error(`${engineClass.name} unreachable`));
    } else {
      spy.mockResolvedValue({ type: outcome, tabId: TAB_ID });
    }
  });
};

const expectedVerdict = (outcomes: Array<EngineOutcome>): ScamSiteType => {
  const dangerous = outcomes.filter((outcome) => outcome === DANGEROUS).length;
  const safe = outcomes.filter((outcome) => outcome === SAFE).length;
  if (dangerous + safe === 0) return NO_DATA;
  if (dangerous >= 2 && dangerous > safe) return DANGEROUS;
  if (safe > dangerous) return SAFE;
  return NO_DATA;
};

const allEngineCombinations: Array<Array<EngineOutcome>> = ENGINE_OUTCOMES.flatMap((wot) =>
  ENGINE_OUTCOMES.flatMap((norton) => ENGINE_OUTCOMES.map((voidUrl) => [wot, norton, voidUrl]))
);

describe("concludeFromVotes", () => {
  test.each([
    [{ dangerous: 0, safe: 0 }, NO_DATA],
    [{ dangerous: 1, safe: 0 }, NO_DATA],
    [{ dangerous: 2, safe: 0 }, DANGEROUS],
    [{ dangerous: 3, safe: 0 }, DANGEROUS],
    [{ dangerous: 2, safe: 1 }, DANGEROUS],
    [{ dangerous: 1, safe: 1 }, NO_DATA],
    [{ dangerous: 1, safe: 2 }, SAFE],
    [{ dangerous: 0, safe: 1 }, SAFE],
    [{ dangerous: 0, safe: 3 }, SAFE]
  ])("%o -> %s", (tally, expected) => {
    expect(concludeFromVotes(tally)).toBe(expected);
  });
});

describe("ApiScamPartners.evaluate", () => {
  beforeEach(() => {
    jest.mocked(examineTab).mockResolvedValue({ type: SAFE, tabId: TAB_ID });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.mocked(examineTab).mockReset();
  });

  test("allEngineCombinations covers every WOT x Norton x VoidURL outcome", () => {
    expect(allEngineCombinations).toHaveLength(64);
  });

  test.each(allEngineCombinations)("WOT %s, Norton %s, VoidURL %s", async (...outcomes) => {
    stubEngines(outcomes);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion).toEqual({ type: expectedVerdict(outcomes), tabId: TAB_ID });
  });

  test("a SAFE tab heuristic cannot veto two dangerous engines", async () => {
    stubEngines([DANGEROUS, NO_DATA, DANGEROUS]);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion.type).toBe(DANGEROUS);
  });

  test("all engines unreachable is NO_DATA, not SAFE", async () => {
    stubEngines(["reject", "reject", "reject"]);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion.type).toBe(NO_DATA);
  });

  test("two DANGEROUS and one SAFE is DANGEROUS", async () => {
    stubEngines([DANGEROUS, SAFE, DANGEROUS]);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion.type).toBe(DANGEROUS);
  });

  test("one DANGEROUS and two NO_DATA is NO_DATA", async () => {
    stubEngines([DANGEROUS, NO_DATA, NO_DATA]);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion.type).toBe(NO_DATA);
  });

  test("one DANGEROUS and one SAFE is NO_DATA", async () => {
    stubEngines([DANGEROUS, SAFE, "reject"]);
    const conclusion = await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(conclusion.type).toBe(NO_DATA);
  });

  test("the open tab is not examined", async () => {
    stubEngines([SAFE, SAFE, SAFE]);
    await new ApiScamPartners().evaluate("example.com", TAB_ID);
    expect(examineTab).not.toHaveBeenCalled();
  });
});
