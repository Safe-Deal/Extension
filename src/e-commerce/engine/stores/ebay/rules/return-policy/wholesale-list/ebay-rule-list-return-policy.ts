import { WEIGHT } from "../../../../../../../constants/weight"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { Rule } from "../../../../../../../data/rules/rule"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import rules_name from "../../ebay-rules-names.const"
import { getRuleReturnPolicyResultValue } from "../return-policy-rule-result"

export class EbayRuleListReturnPolicy extends Rule {
	constructor() {
		super(rules_name.RETURN_POLICY_WHOLESALE_LIST, WEIGHT.NONE)
	}

	public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
		const res = await getRuleReturnPolicyResultValue(
			product,
			siteDomSelector.domSelector.wholesaleListPageItemHref,
			this.weight,
			this.name
		)
		return Promise.resolve(res)
	}
}
