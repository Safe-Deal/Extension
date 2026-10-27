import { IProduct } from "../../../../../data/entities/product.interface";
import * as logger from "../../../../../utils/analytics/logger";
import { ConclusionProduct } from "../conclusion-product";
import { ProductConclusionEnum } from "../conclusion-product-entity.interface";
import { aliExpressItemDomain, amazonItemDomain, RuleState, StoreDomain } from "./rule-domains";

const PRODUCT: IProduct = { id: "B000000000", domain: "example.test", url: "https://example.test/item/1" };

const { RECOMMENDED, DOUBTFUL, NOT_RECOMMENDED, INSUFFICIENT_DATA } = ProductConclusionEnum;

type Evidence = Record<string, number>;

type FixedCase = {
  name: string;
  evidence: Evidence;
  expected: ProductConclusionEnum;
};

const stateFor = (domain: StoreDomain, evidence: Evidence): RuleState[] =>
  domain.rules.map((rule) => {
    if (!(rule.label in evidence)) {
      return rule.invalid;
    }
    const found = rule.valid.find((state) => state.rank === evidence[rule.label]);
    if (!found) {
      throw new Error(`${domain.store}: ${rule.label} has no real state ${evidence[rule.label]}`);
    }
    return found;
  });

const verdictFor = (domain: StoreDomain, evidence: Evidence): ProductConclusionEnum =>
  new ConclusionProduct({
    product: PRODUCT,
    rules: stateFor(domain, evidence).map((state) => ({ ...state.rule }))
  }).conclusion().productConclusion;

const REVIEWS = "Product reviews";
const SELLER = "Seller feedback";
const CHOICE = "Amazon's Choice";
const RANK = "Best seller rank";
const SOLD_SHIPPED = "Sold or shipped by Amazon";
const TOP_SELLER = "Top seller";
const SHOP_YEARS = "Shop open years";

// Amazon item page: reviews weight 10, seller weight 9, both regular, divider 200 when both are valid.
// Ratio = (10 x reviews + 9 x seller + bonuses) / 200. Recommended from 0.65, doubtful from 0.4.
const AMAZON_CASES: FixedCase[] = [
  { name: "perfect reviews and seller: 190/200", evidence: { [REVIEWS]: 10, [SELLER]: 10 }, expected: RECOMMENDED },
  { name: "reviews 6 seller 6: 114/200", evidence: { [REVIEWS]: 6, [SELLER]: 6 }, expected: DOUBTFUL },
  { name: "reviews 4 seller 2: 58/200", evidence: { [REVIEWS]: 4, [SELLER]: 2 }, expected: NOT_RECOMMENDED },
  {
    name: "reviews 4 seller 2 and Choice 80: 138/200",
    evidence: { [REVIEWS]: 4, [SELLER]: 2, [CHOICE]: 80 },
    expected: RECOMMENDED
  },
  {
    name: "exactly 0.65: reviews 4 seller 10 is 130/200",
    evidence: { [REVIEWS]: 4, [SELLER]: 10 },
    expected: RECOMMENDED
  },
  {
    name: "just under 0.65: reviews 7 seller 6 is 124/200",
    evidence: { [REVIEWS]: 7, [SELLER]: 6 },
    expected: DOUBTFUL
  },
  {
    name: "weights count: reviews 3 seller 10 is 120/200, not 130/200",
    evidence: { [REVIEWS]: 3, [SELLER]: 10 },
    expected: DOUBTFUL
  },
  {
    name: "exactly 0.4: reviews 6 seller 2 and rank 2 is 80/200",
    evidence: { [REVIEWS]: 6, [SELLER]: 2, [RANK]: 2 },
    expected: DOUBTFUL
  },
  {
    name: "just under 0.4: reviews 6 seller 2 and rank 1 is 79/200",
    evidence: { [REVIEWS]: 6, [SELLER]: 2, [RANK]: 1 },
    expected: NOT_RECOMMENDED
  },
  {
    name: "critical seller feedback sinks perfect reviews: -80/200",
    evidence: { [REVIEWS]: 10, [SELLER]: -20 },
    expected: NOT_RECOMMENDED
  },
  {
    name: "only reviews valid, divider 100: 100 + Choice 80 + rank 10",
    evidence: { [REVIEWS]: 10, [CHOICE]: 80, [RANK]: 10 },
    expected: RECOMMENDED
  },
  {
    name: "only reviews valid, divider 100: reviews 6 + rank 6 + sold 7 is 73/100",
    evidence: { [REVIEWS]: 6, [RANK]: 6, [SOLD_SHIPPED]: 7 },
    expected: RECOMMENDED
  },
  {
    name: "only reviews valid, divider 100: reviews 2 + rank 1 is 21/100",
    evidence: { [REVIEWS]: 2, [RANK]: 1 },
    expected: NOT_RECOMMENDED
  },
  {
    name: "Choice, rank and sold by Amazon but no reviews or seller",
    evidence: { [CHOICE]: 80, [RANK]: 10, [SOLD_SHIPPED]: 10 },
    expected: INSUFFICIENT_DATA
  },
  { name: "reviews alone", evidence: { [REVIEWS]: 10 }, expected: INSUFFICIENT_DATA },
  { name: "nothing valid", evidence: {}, expected: INSUFFICIENT_DATA }
];

// AliExpress item page: reviews weight 10, seller weight 10, divider 200 when both are valid.
// Top seller, shop open years and pricing are weight 0 bonus rules.
const ALI_EXPRESS_CASES: FixedCase[] = [
  { name: "perfect reviews and seller: 200/200", evidence: { [REVIEWS]: 10, [SELLER]: 10 }, expected: RECOMMENDED },
  {
    name: "exactly 0.65: reviews 7 seller 6 is 130/200",
    evidence: { [REVIEWS]: 7, [SELLER]: 6 },
    expected: RECOMMENDED
  },
  { name: "reviews 4 seller 8 is 120/200", evidence: { [REVIEWS]: 4, [SELLER]: 8 }, expected: DOUBTFUL },
  { name: "reviews 1 seller 2 is 30/200", evidence: { [REVIEWS]: 1, [SELLER]: 2 }, expected: NOT_RECOMMENDED },
  {
    name: "young shop pulls reviews 7 seller 6 down: 110/200",
    evidence: { [REVIEWS]: 7, [SELLER]: 6, [SHOP_YEARS]: -20 },
    expected: DOUBTFUL
  },
  {
    name: "old shop and top seller lift reviews 4 seller 6: 125/200",
    evidence: { [REVIEWS]: 4, [SELLER]: 6, [SHOP_YEARS]: 15, [TOP_SELLER]: 10 },
    expected: DOUBTFUL
  },
  {
    name: "old shop lifts reviews 4 seller 8 over 0.65: 135/200",
    evidence: { [REVIEWS]: 4, [SELLER]: 8, [SHOP_YEARS]: 15 },
    expected: RECOMMENDED
  },
  {
    name: "top seller and shop years without reviews or seller",
    evidence: { [TOP_SELLER]: 10, [SHOP_YEARS]: 15 },
    expected: INSUFFICIENT_DATA
  },
  { name: "reviews alone", evidence: { [REVIEWS]: 10 }, expected: INSUFFICIENT_DATA }
];

type Suite = {
  title: string;
  buildDomain: () => StoreDomain;
  cases: FixedCase[];
};

const SUITES: Suite[] = [
  { title: "Amazon item page", buildDomain: amazonItemDomain, cases: AMAZON_CASES },
  { title: "AliExpress item page", buildDomain: aliExpressItemDomain, cases: ALI_EXPRESS_CASES }
];

SUITES.forEach(({ title, buildDomain, cases }) => {
  describe(`Safe-to-buy verdict for chosen evidence on the ${title}`, () => {
    const domain = buildDomain();

    beforeAll(() => {
      jest.spyOn(logger, "debug").mockImplementation(() => undefined);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    cases.forEach(({ name, evidence, expected }) => {
      it(`${name}`, () => {
        expect(verdictFor(domain, evidence)).toBe(expected);
      });
    });
  });
});
