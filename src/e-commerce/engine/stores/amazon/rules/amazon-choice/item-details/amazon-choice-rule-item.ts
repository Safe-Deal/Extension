import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../amazon-rules-names.const";
import { getRuleAmazonChoiceResultValue } from "../amazon-choice-rule-result";

export class AmazonChoiceRuleItem extends Rule {
  constructor() {
    super(rules_name.AMAZON_CHOICE_ITEM_DETAILS, WEIGHT.TEN);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleAmazonChoiceResultValue(product, null, this.weight, this.name);
    return res;
  }
}
