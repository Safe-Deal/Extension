import { ISiteSpec } from "../../../../data/entities/site-spec.interface"
import { Rule } from "../../../../data/rules/rule"
import { Site } from "../../../../data/sites/site"
import { AliExpressRulesEnum, RULES_PER_PAGE } from "./ali-express-site-rules"
import { AliExpressSiteSelector } from "./ali-express-site-selector"
import { AliExpressSiteUtils } from "./utils/ali-express-site-utils"

export class AliExpressSite extends Site {
	constructor(private siteSpec: ISiteSpec) {
		super(siteSpec, new AliExpressSiteSelector())
		const rulesPerPage: Rule[] = this.getRulesPerPage(this.siteSpec)
		this.setRules(rulesPerPage)
	}

	private getRulesPerPage(siteSpec: ISiteSpec): Rule[] {
		let key: AliExpressRulesEnum
		const { dom, url } = siteSpec
		if (AliExpressSiteUtils.isAliExpressWholesale(url)) {
			const displayModeAttribute = this.getDisplayModeAttribute(dom)
			if (this.isListMode(displayModeAttribute)) {
				key = AliExpressRulesEnum.WHOLESALE_LIST
			} else {
				key = AliExpressRulesEnum.WHOLESALE_GALLERY
			}
		} else if (AliExpressSiteUtils.isAliExpressItemDetails(url)) {
			key = AliExpressRulesEnum.ITEM
		}
		return RULES_PER_PAGE[key]
	}

	private getDisplayModeAttribute(dom: Document): string {
		return dom?.querySelector(".display-mode .active use")?.getAttribute("xlink:href")
	}

	private isListMode(displayModeAttribute: string) {
		return displayModeAttribute?.includes("list")
	}
}
