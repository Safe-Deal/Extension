import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../amazon-rules-names.const";
import { getRuleAmazonSoldShopResultValue as getRuleAmazonSoldShipResultValue } from "../amazon-sold-ship-rule-result";

export class AmazonSoldShipRuleItem extends Rule {
  constructor() {
    super(rules_name.AMAZON_SOLD_SHIP_ITEM_DETAILS, WEIGHT.FOUR);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleAmazonSoldShipResultValue(product, null, this.weight, this.name);
    return res;
  }
}
