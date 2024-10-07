import { WEIGHT } from "../../constants/weight";
import { IDisplaySiteDomSelectorSpec } from "../entities/display-site-dom-selector-spec.interface";
import { IProduct } from "../entities/product.interface";
import { IRuleResult } from "../entities/rule-result.interface";
import { ISiteDomSelectorSpec } from "../entities/site-dom-selector-spec.interface";
import { ConclusionManager } from "./conclusion-manager";
import { Rule } from "../rules/rule";
import { SiteDomSelector } from "../sites/site-dom-selector";
import { RuleManager } from "../rules/rule-manager";
import { ProductConclusionEnum } from "../../e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";

class RuleMock extends Rule {
  constructor() {
    super("RuleMock", WEIGHT.TEN);
  }

  public evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    return Promise.resolve({
      name: "Rule Mock",
      value: 0.8,
      weight: this.weight,
      isValidRule: true
    });
  }
}

describe("conclusion manager", () => {
  it("conclusion result", async () => {
    const products: IProduct[] = [
      {
        id: "4000117654955",
        domain: "aliexpress.com",
        url: "https://www.aliexpress.com/item/4000117654955.html"
      }
    ];
    const rules: Rule[] = [new RuleMock(), new RuleMock()];
    const siteDomSelectorSpecMock: ISiteDomSelectorSpec = {};
    const displaySiteDomSelectorSpecMock: IDisplaySiteDomSelectorSpec = {};
    const siteDomSelector = new SiteDomSelector(siteDomSelectorSpecMock, displaySiteDomSelectorSpecMock);
    const ruleManager = new RuleManager(products, rules, siteDomSelector);
    const conclusionManager = new ConclusionManager(ruleManager);

    const conclusion = await conclusionManager.conclusion();
    expect(conclusion).toStrictEqual([
      {
        product: {
          domain: "aliexpress.com",
          id: "4000117654955",
          url: "https://www.aliexpress.com/item/4000117654955.html"
        },
        productConclusion: ProductConclusionEnum.NOT_RECOMMENDED,
        rules: [
          { isValidRule: true, name: "Rule Mock", value: 0.8, weight: 10 },
          { isValidRule: true, name: "Rule Mock", value: 0.8, weight: 10 }
        ]
      }
    ]);
  });
});
