import { ISiteSpec } from "../../../../data/entities/site-spec.interface"
import { Rule } from "../../../../data/rules/rule"
import { Site } from "../../../../data/sites/site"
import { EbayRulesEnum, RULES_PER_PAGE } from "./ebay-site-rules"
import { EbaySiteSelector } from "./ebay-site-selector"
import { EbaySiteUtils } from "./utils/ebay-site-utils"

export class EbaySite extends Site {
	constructor(private siteSpec: ISiteSpec) {
		super(siteSpec, new EbaySiteSelector())
		const rulesPerPage: Rule[] = this.getRulesPerPage(this.siteSpec)
		this.setRules(rulesPerPage)
	}

	private getRulesPerPage(siteSpec: ISiteSpec): Rule[] {
		let key: EbayRulesEnum
		const { url } = siteSpec

		if (EbaySiteUtils.isEbayWholesaleProducts(url)) {
			if (EbaySiteUtils.isEbayWholesaleList(url, siteSpec)) {
				key = EbayRulesEnum.WHOLESALE_LIST
			} else {
				key = EbayRulesEnum.WHOLESALE_GALLERY
			}
		} else if (EbaySiteUtils.isEbayItemDetails(url)) {
			key = EbayRulesEnum.ITEM
		}
		return RULES_PER_PAGE[key]
	}
}
