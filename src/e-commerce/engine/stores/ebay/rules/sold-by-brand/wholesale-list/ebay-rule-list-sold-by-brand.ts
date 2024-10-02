import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../ebay-rules-names.const";
import { getRuleSoldByBrandResultValue } from "../sold-by-brand-rule-result";

export class EbayRuleListSoldByBrand extends Rule {
  constructor() {
    super(rules_name.SOLD_BY_BRAND_WHOLESALE_LIST, WEIGHT.NONE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleSoldByBrandResultValue(
      product,
      siteDomSelector.domSelector.wholesaleListPageItemSoldByBrand,
      this.weight,
      this.name
    );
    return Promise.resolve(res);
  }
}
