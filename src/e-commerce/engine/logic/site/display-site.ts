import { t } from "../../../../constants/messages"
import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface"

export class DisplaySite {
	constructor(protected conclusionResponse: IConclusionResponse) {
		this.populateMessages()
	}

	public apply(): void {}

	public populateMessages(): void {
		for (const conclusion of this.conclusionResponse.conclusionProductEntity) {
			for (const rule of conclusion.rules) {
				if (rule.tooltipSummary) {
					if (rule.tooltipSummary.description) {
						rule.tooltipSummary.description = `${t(rule.tooltipSummary.i18n, rule.tooltipSummary.i18nData)}`
					}
					if (rule.tooltipSummary.ruleExplanation) {
						rule.tooltipSummary.ruleExplanation = `${t(rule.tooltipSummary.i18nExplanation)}`
					}
				}
			}
		}
	}

	public getWholesaleItemListSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.wholesalePageItemListSel
	}

	public getWholesaleProductListSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.wholesalePageProductListSel
	}

	public getWholesalePriceSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.wholesalePagePriceSel
	}

	public getProductItemSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.itemPageProductSel
	}

	public getItemProductInfoActionSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.itemPageProductInfoActionsSel
	}

	public getWholesalePageItemListSel(): string {
		const { conclusionProductEntity, site }: IConclusionResponse = this.conclusionResponse
		return site.siteDomSelector.displayDomSelector.wholesalePageItemListSel
	}
}
