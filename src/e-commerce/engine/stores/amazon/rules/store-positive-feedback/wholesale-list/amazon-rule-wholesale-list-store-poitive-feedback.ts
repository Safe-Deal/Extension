import { WEIGHT } from "../../../../../../../constants/weight"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { Rule } from "../../../../../../../data/rules/rule"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import rules_name from "../../amazon-rules-names.const"
import { getRuleStorePositiveFeedbackResultValue } from "../store-positive-feedback-rule-result"

export class AmazonRuleWholesaleListStorePositiveFeedback extends Rule {
	constructor() {
		super(rules_name.STORE_POSITIVE_FEEDBACK_WHOLESALE_LIST, WEIGHT.NINE)
	}

	public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
		const res = await getRuleStorePositiveFeedbackResultValue(
			product,
			siteDomSelector.domSelector.wholesaleListPageItemHref,
			this.weight,
			this.name
		)
		return Promise.resolve(res)
	}
}
