import { IProduct } from "../../../../../data/entities/product.interface";
import * as logger from "../../../../../utils/analytics/logger";
import { ConclusionProduct } from "../conclusion-product";
import { ProductConclusionEnum } from "../conclusion-product-entity.interface";
import { aliExpressItemDomain, amazonItemDomain, RuleState, StoreDomain } from "./rule-domains";

const MAX_EXAMPLES = 8;

const VERDICT_RANK: Record<ProductConclusionEnum, number> = {
  [ProductConclusionEnum.INSUFFICIENT_DATA]: -1,
  [ProductConclusionEnum.NOT_RECOMMENDED]: 0,
  [ProductConclusionEnum.DOUBTFUL]: 1,
  [ProductConclusionEnum.RECOMMENDED]: 2
};

const PRODUCT: IProduct = { id: "B000000000", domain: "example.test", url: "https://example.test/item/1" };

type Scenario = {
  choice: number[];
  states: RuleState[];
};

const optionsOf = (domain: StoreDomain, ruleIndex: number): RuleState[] => [
  domain.rules[ruleIndex].invalid,
  ...domain.rules[ruleIndex].valid
];

const enumerate = (domain: StoreDomain): Scenario[] =>
  domain.rules.reduce<Scenario[]>(
    (scenarios, _rule, ruleIndex) =>
      scenarios.flatMap((scenario) =>
        optionsOf(domain, ruleIndex).map((state, optionIndex) => ({
          choice: [...scenario.choice, optionIndex],
          states: [...scenario.states, state]
        }))
      ),
    [{ choice: [], states: [] }]
  );

const verdictOf = (states: RuleState[]): ProductConclusionEnum =>
  new ConclusionProduct({ product: PRODUCT, rules: states.map((state) => ({ ...state.rule })) }).conclusion()
    .productConclusion;

const labelsOf = (states: RuleState[]): string => states.map((state) => state.label).join(" | ");

const hasValidRegularRule = (domain: StoreDomain, scenario: Scenario): boolean =>
  domain.rules.some((rule, ruleIndex) => rule.isRegular && scenario.choice[ruleIndex] > 0);

const summarize = (violations: string[]) => ({
  count: violations.length,
  examples: violations.slice(0, MAX_EXAMPLES)
});

const withoutRegularEvidence = (domain: StoreDomain, scenarios: Scenario[]): string[] =>
  scenarios
    .filter((scenario) => !hasValidRegularRule(domain, scenario))
    .map((scenario) => ({ scenario, verdict: verdictOf(scenario.states) }))
    .filter(({ verdict }) => verdict !== ProductConclusionEnum.INSUFFICIENT_DATA)
    .map(({ scenario, verdict }) => `${verdict} <- ${labelsOf(scenario.states)}`);

const monotonicityBreaks = (domain: StoreDomain, scenarios: Scenario[]): string[] =>
  scenarios.flatMap((scenario) =>
    domain.rules.flatMap((_rule, ruleIndex) => {
      const optionIndex = scenario.choice[ruleIndex];
      const options = optionsOf(domain, ruleIndex);
      if (optionIndex < 1 || optionIndex + 1 >= options.length) {
        return [];
      }
      const lower = verdictOf(scenario.states);
      const raisedStates = scenario.states.map((state, index) =>
        index === ruleIndex ? options[optionIndex + 1] : state
      );
      const raised = verdictOf(raisedStates);
      if (lower === ProductConclusionEnum.INSUFFICIENT_DATA || raised === ProductConclusionEnum.INSUFFICIENT_DATA) {
        return [];
      }
      if (VERDICT_RANK[raised] >= VERDICT_RANK[lower]) {
        return [];
      }
      return [
        `${lower} -> ${raised} when "${options[optionIndex].label}" rises to "${options[optionIndex + 1].label}" with ${labelsOf(scenario.states)}`
      ];
    })
  );

describe.each([
  ["Amazon item page", amazonItemDomain],
  ["AliExpress item page", aliExpressItemDomain]
])("Safe-to-buy verdict on the %s", (_name, buildDomain) => {
  const domain = buildDomain();
  const scenarios = enumerate(domain);

  beforeAll(() => {
    jest.spyOn(logger, "debug").mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("enumerates a non-trivial rule-state space", () => {
    expect(scenarios.length).toBeGreaterThan(1000);
  });

  it("gives INSUFFICIENT_DATA when no product-review or seller-feedback rule produced valid data", () => {
    expect(summarize(withoutRegularEvidence(domain, scenarios))).toEqual({ count: 0, examples: [] });
  });

  it("never lowers the verdict when a valid rule's value or bonus rises", () => {
    expect(summarize(monotonicityBreaks(domain, scenarios))).toEqual({ count: 0, examples: [] });
  });
});
