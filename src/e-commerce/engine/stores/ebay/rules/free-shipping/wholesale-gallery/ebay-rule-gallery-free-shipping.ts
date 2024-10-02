import { WEIGHT } from "../../../../../../../constants/weight"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { Rule } from "../../../../../../../data/rules/rule"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import rules_name from "../../ebay-rules-names.const"
import { getRuleFreeShippingResultValue } from "../free-shipping-rule-result"

export class EbayRuleGalleryFreeShipping extends Rule {
	constructor() {
		super(rules_name.FREE_SHIPPING_WHOLESALE_GALLERY, WEIGHT.NONE)
	}

	public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
		const res = await getRuleFreeShippingResultValue(
			product,
			siteDomSelector.domSelector.wholesaleGalleryPageItemHref,
			this.weight,
			this.name
		)
		return Promise.resolve(res)
	}
}
