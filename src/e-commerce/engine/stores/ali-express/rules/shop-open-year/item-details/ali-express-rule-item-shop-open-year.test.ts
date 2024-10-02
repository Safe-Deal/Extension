import { IDisplaySiteDomSelectorSpec } from "../../../../../../../data/entities/display-site-dom-selector-spec.interface"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { RuleSummaryTooltipType } from "../../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { ISiteDomSelectorSpec } from "../../../../../../../data/entities/site-dom-selector-spec.interface"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import { AliExpressProductDownloader } from "../../../product/ali-express-product-downloader"
import rules_name from "../../ali-express-rules-names.const"
import { AliExpressRuleItemShopOpenYear } from "./ali-express-rule-item-shop-open-year"

describe("Ali Express Rule List Shop Open Year", () => {
	const aliExpressRuleShopOpenYear: AliExpressRuleItemShopOpenYear = new AliExpressRuleItemShopOpenYear()
	beforeAll(() => {
		jest.spyOn(AliExpressProductDownloader.prototype, "download").mockReturnValue(
			Promise.resolve({
				productPrice: null,
				productRatingAverage: null,
				productRatingsAmount: null,
				productPurchases: null,
				storeOpenTime: "1564710681000",
				storePositiveRate: null,
				storeIsTopRated: null,
				category: null,
				json: null
			})
		)
	})

	it("rule evaluation work correctly", async () => {
		const product: IProduct = {
			id: "4000117654955",
			domain: "aliexpress.com",
			url: "https://www.aliexpress.com/item/4000117654955.html"
		}
		const domSelector: ISiteDomSelectorSpec = {
			wholesaleGalleryPageItemHref: ".wholesale-href"
		}
		const expected: IRuleResult = {
			name: rules_name.SHOP_OPEN_YEAR_ITEM_DETAILS,
			value: 0,
			weight: 0,
			bonus: {
				isBonusRule: true,
				value: 12
			},
			isValidRule: true,
			tooltipSummary: {
				description: "tooltip_shop_open_year_safe",
				type: RuleSummaryTooltipType.SAFE,
				ruleExplanation: "explanations_store_age",
				i18nExplanation: "explanations_store_age",
				i18n: "tooltip_shop_open_year_safe",
				i18nData: {
					yearsInBusinessIndicator: {
						i18n: "years_label"
					},
					shopOpenedYearValue: 5
				}
			}
		}

		const displayDomSelector: IDisplaySiteDomSelectorSpec = {}
		const siteDomSelector: SiteDomSelector = new SiteDomSelector(domSelector, displayDomSelector)
		const res = await aliExpressRuleShopOpenYear.evaluate(product, siteDomSelector)
		expect(res).toEqual(expected)
	})
})
