import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import { PRICING_ITEM_DETAILS } from "../../../../../logic/utils/const";
import { getRuleProductPricingResultValue } from "../pricing-rule-result";

export class AliExpressRuleItemPricingRule extends Rule {
  constructor() {
    super(PRICING_ITEM_DETAILS, WEIGHT.NONE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const result: IRuleResult = await getRuleProductPricingResultValue(
      product,
      siteDomSelector.domSelector.itemPageProductHref,
      this.weight,
      this.name
    );
    return Promise.resolve(result);
  }
}
