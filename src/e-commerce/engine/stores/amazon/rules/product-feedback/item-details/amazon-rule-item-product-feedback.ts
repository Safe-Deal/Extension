import { WEIGHT } from "../../../../../../../constants/weight";
import { IProduct } from "../../../../../../../data/entities/product.interface";
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface";
import { Rule } from "../../../../../../../data/rules/rule";
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector";
import rules_name from "../../amazon-rules-names.const";
import { getRuleProductFeedbackResultValue } from "../product-feedback-rule-result";

export class AmazonRuleItemProductFeedbackRule extends Rule {
  constructor() {
    super(rules_name.PRODUCT_FEEDBACK_ITEM_DETAILS, WEIGHT.TEN);
  }

  public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
    const seeAllReviewLinkItemDetalilsElementSelector = ".a-link-emphasis.a-text-bold";
    const res = await getRuleProductFeedbackResultValue(
      product,
      seeAllReviewLinkItemDetalilsElementSelector,
      this.weight,
      this.name
    );

    return res;
  }
}