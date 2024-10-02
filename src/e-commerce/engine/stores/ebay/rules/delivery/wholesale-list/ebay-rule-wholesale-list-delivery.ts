import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../ebay-rules-names.const";
import { getRuleDeliveryResultValue } from "../delivery-rule-result";

export class EbayRuleWholesaleListDelivery extends Rule {
  constructor() {
    super(rules_name.DELIVERY__WHOLESALE_LIST, WEIGHT.ONE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleDeliveryResultValue(
      product,
      siteDomSelector.domSelector.wholesaleListPageItemHref,
      this.weight,
      this.name
    );
    return Promise.resolve(res);
  }
}
