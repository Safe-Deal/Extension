import { IDisplaySiteDomSelectorSpec } from "../../../../../../../data/entities/display-site-dom-selector-spec.interface"
import { IProduct } from "../../../../../../../data/entities/product.interface"
import { IRuleResult } from "../../../../../../../data/entities/rule-result.interface"
import { RuleSummaryTooltipType } from "../../../../../../../data/entities/rule-summary-tooltip-type-enum"
import { ISiteDomSelectorSpec } from "../../../../../../../data/entities/site-dom-selector-spec.interface"
import { SiteDomSelector } from "../../../../../../../data/sites/site-dom-selector"
import { AliExpressProductDownloader } from "../../../product/ali-express-product-downloader"
import rules_name from "../../ali-express-rules-names.const"
import { AliExpressRuleListTopSeller } from "./ali-express-rule-list-top-seller"

describe("Ali Express Rule List Top Seller", () => {
	const aliExpressRuleTopSeller: AliExpressRuleListTopSeller = new AliExpressRuleListTopSeller()
	beforeAll(() => {
		jest.spyOn(AliExpressProductDownloader.prototype, "download").mockReturnValue(
			Promise.resolve({
				title: "title",
				description: "description",
				category: "category",
				images: ["image1", "image2"],
				storeFollowing: 100,
				productPrice: null,
				productRatingAverage: null,
				productRatingsAmount: null,
				productPurchases: null,
				storeOpenTime: "3",
				storePositiveRate: null,
				storeIsTopRated: true,
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
			bonus: {
				isBonusRule: true,
				value: 10
			},
			name: rules_name.TOP_SELLER_WHOLESALE_LIST,
			value: 0,
			weight: 0,
			isValidRule: true,
			tooltipSummary: {
				description: "tooltip_top_seller_safe",
				type: RuleSummaryTooltipType.SAFE,
				ruleExplanation: "explanations_top_seller_ali_express",
				i18nExplanation: "explanations_top_seller_ali_express",
				i18n: "tooltip_top_seller_safe"
			}
		}
		const displayDomSelector: IDisplaySiteDomSelectorSpec = {}
		const siteDomSelector: SiteDomSelector = new SiteDomSelector(domSelector, displayDomSelector)
		const res = await aliExpressRuleTopSeller.evaluate(product, siteDomSelector)
		expect(res).toEqual(expected)
	})
})
