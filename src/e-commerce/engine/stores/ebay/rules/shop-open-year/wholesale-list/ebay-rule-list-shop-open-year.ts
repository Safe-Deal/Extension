import { WEIGHT } from "../../../../../../../constants/weight"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { Rule } from "../../../../../../../data/rules/rule"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import rules_name from "../../ebay-rules-names.const"
import { getRuleShopOpenYearResultValue } from "../shop-open-year-rule-result"

export class EbayRuleListShopOpenYear extends Rule {
	constructor() {
		super(rules_name.SHOP_OPEN_YEAR_WHOLESALE_LIST, WEIGHT.NONE)
	}

	public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
		const res = await getRuleShopOpenYearResultValue(
			product,
			siteDomSelector.domSelector.wholesaleListPageItemHref,
			this.weight,
			this.name
		)
		return Promise.resolve(res)
	}
}
