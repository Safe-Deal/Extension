import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../walmart-rules-names.const";
import { getRuleWalmartSoldShipResultValue } from "../walmart-sold-ship-rule-result";

export class WalmartSoldShipRuleWholesaleList extends Rule {
  constructor() {
    super(rules_name.WALMART_SOLD_SHIP_WHOLESALE_LIST, WEIGHT.NINE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleWalmartSoldShipResultValue(
      product,
      siteDomSelector.domSelector.wholesaleGalleryPageItemHref,
      this.weight,
      this.name
    );
    return Promise.resolve(res);
  }
}
