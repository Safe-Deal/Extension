import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { getRuleProSellerResultValue } from "../pro-seller-rule-result";
import rules_name from "../../walmart-rules-names.const";

export class ProSellerRuleItem extends Rule {
  constructor() {
    super(rules_name.PRO_SELLER_ITEM_DETAILS, WEIGHT.TEN);
  }

  public async evaluate(product: IProduct): Promise<IRuleResult> {
    const res = await getRuleProSellerResultValue(product, null, this.weight, this.name);
    return res;
  }
}
