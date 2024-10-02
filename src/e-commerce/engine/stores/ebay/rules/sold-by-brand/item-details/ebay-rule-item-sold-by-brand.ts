import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../ebay-rules-names.const";
import { getRuleSoldByBrandResultValue } from "../sold-by-brand-rule-result";

export class EbayRuleItemSoldByBrand extends Rule {
  constructor() {
    super(rules_name.SOLD_BY_BRAND_ITEM_DETAILS, WEIGHT.NONE);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const isItemDetails = true;
    const res = await getRuleSoldByBrandResultValue(
      product,
      siteDomSelector.domSelector.itemPageProductSoldByBrand,
      this.weight,
      this.name,
      isItemDetails
    );
    return Promise.resolve(res);
  }
}
