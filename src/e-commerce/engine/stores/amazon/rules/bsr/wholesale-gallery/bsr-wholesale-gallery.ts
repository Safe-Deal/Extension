import { WEIGHT } from "../../../../../../../constants/weight"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { Rule } from "../../../../../../../data/rules/rule"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import rules_name from "../../amazon-rules-names.const"
import { getRuleBsrResultValue } from "../bsr-rule-result"

export class BsrWholesaleGallery extends Rule {
	constructor() {
		super(rules_name.AMAZON_BSR_WHOLESALE_GALLERY, WEIGHT.FOUR)
	}

	public async evaluate(product: IProduct, siteDomSelector: SiteDomSelector): Promise<IRuleResult> {
		const res = await getRuleBsrResultValue(
			product,
			siteDomSelector.domSelector.wholesaleGalleryPageItemHref,
			this.weight,
			this.name
		)
		return res
	}
}
