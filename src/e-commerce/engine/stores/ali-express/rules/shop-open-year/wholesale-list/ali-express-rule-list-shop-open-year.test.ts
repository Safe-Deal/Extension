import { IDisplaySiteDomSelectorSpec } from "../../../../../../../data/entities/display-site-dom-selector-spec.interface"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { RuleSummaryTooltipType } from "../../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { ISiteDomSelectorSpec } from "../../../../../../../data/entities/site-dom-selector-spec.interface"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import { AliExpressProductDownloader } from "../../../product/ali-express-product-downloader"
import rules_name from "../../ali-express-rules-names.const"
import { AliExpressRuleListShopOpenYear } from "./ali-express-rule-list-shop-open-year"

describe("Ali Express Rule List Shop Open Year", () => {
	const aliExpressRuleShopOpenYear: AliExpressRuleListShopOpenYear = new AliExpressRuleListShopOpenYear()

	beforeAll(() => {
		jest.spyOn(AliExpressProductDownloader.prototype, "download").mockReturnValue(
			Promise.resolve({
				productPrice: null,
				productRatingAverage: null,
				productRatingsAmount: null,
				productPurchases: null,
				storeOpenTime: "3",
				storePositiveRate: null,
				storeIsTopRated: null,
				category: null,
				json: null
			})
		)
	})

	it("rule evaluation work correctly", async () => {
		const product: IProduct = {
			id: "4000537648350",
			domain: "aliexpress.com",
			url: "https://www.aliexpress.com/item/4000537648350.html"
		}
		const domSelector: ISiteDomSelectorSpec = {
			wholesaleGalleryPageItemHref: ".wholesale-href"
		}
		const expected: IRuleResult = {
			bonus: {
				isBonusRule: true,
				value: 15
			},
			name: rules_name.SHOP_OPEN_YEAR_WHOLESALE_LIST,
			value: 0,
			weight: 0,
			isValidRule: true,
			tooltipSummary: {
				description: "tooltip_shop_open_year_safe 51+ years_label",
				type: RuleSummaryTooltipType.SAFE,
				i18n: "tooltip_shop_open_year_safe",
				ruleExplanation: "tooltip_shop_open_year_safe",
				i18nExplanation: "tooltip_shop_open_year_safe"
			}
		}
		const displayDomSelector: IDisplaySiteDomSelectorSpec = {}
		const siteDomSelector: SiteDomSelector = new SiteDomSelector(domSelector, displayDomSelector)
		const res = await aliExpressRuleShopOpenYear.evaluate(product, siteDomSelector)
		expect(res.bonus).toEqual(expected.bonus)
		expect(res.name).toEqual(expected.name)
		expect(res.isValidRule).toEqual(expected.isValidRule)
		expect(res.tooltipSummary.description).toContain("tooltip_shop_open_year_safe")
		expect(res.tooltipSummary.type).toContain(expected.tooltipSummary.type)
	})
})
