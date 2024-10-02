import { ISiteSpec } from "../../../../data/entities/site-spec.interface"
import { Rule } from "../../../../data/rules/rule"
import { Site } from "../../../../data/sites/site"
import { WalmartSiteUtils } from "./utils/walmart-site-utils"
import { WalmartRulesEnum, RULES_PER_PAGE } from "./walmart-site-rules"
import { WalmartSiteSelector } from "./walmart-site-selector"

export class WalmartSite extends Site {
	constructor(private siteSpec: ISiteSpec) {
		super(siteSpec, new WalmartSiteSelector())
		const rulesPerPage: Rule[] = this.getRulesPerPage(this.siteSpec)
		this.setRules(rulesPerPage)
	}

	private getRulesPerPage(siteSpec: ISiteSpec): Rule[] {
		let key: WalmartRulesEnum
		const { pathName, dom } = siteSpec
		if (WalmartSiteUtils.isWalmartWholesaleSite(pathName)) {
			const isList = !!dom.querySelector("[data-automation-id=\"switcher-list-view\"] .active")
			if (isList) {
				key = WalmartRulesEnum.WHOLESALE_LIST
			} else {
				key = WalmartRulesEnum.WHOLESALE_GALLERY
			}
		} else if (WalmartSiteUtils.isWalmartItemDetails(pathName)) {
			key = WalmartRulesEnum.ITEM
		}
		return RULES_PER_PAGE[key]
	}
}
