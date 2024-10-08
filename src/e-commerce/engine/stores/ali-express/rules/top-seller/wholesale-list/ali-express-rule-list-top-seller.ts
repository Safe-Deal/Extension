import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../ali-express-rules-names.const";
import { getRuleTopSellerResultValue } from "../top-seller-rule-result";

export class AliExpressRuleListTopSeller extends Rule {
  constructor() {
    super(rules_name.TOP_SELLER_WHOLESALE_LIST, WEIGHT.NONE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleTopSellerResultValue(
      product,
      siteDomSelector.domSelector.wholesaleListPageItemHref,
      this.weight,
      this.name
    );
    return Promise.resolve(res);
  }
}
