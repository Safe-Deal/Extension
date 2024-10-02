import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../ebay-rules-names.const";
import { getRuleProductFeedbackResultValue } from "../product-feedback-rule-result";

export class EbayRuleWholesaleGalleryProductFeedback extends Rule {
  constructor() {
    super(rules_name.RATING_WHOLESALE_GALLERY, WEIGHT.TEN);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const res = await getRuleProductFeedbackResultValue(
      product,
      siteDomSelector.domSelector.wholesaleGalleryPageItemHref,
      this.weight,
      this.name
    );
    return Promise.resolve(res);
  }
}
