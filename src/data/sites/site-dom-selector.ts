import { IDisplaySiteDomSelectorSpec } from "../entities/display-site-dom-selector-spec.interface"
import { ISiteDomSelectorSpec } from "../entities/site-dom-selector-spec.interface"

export class SiteDomSelector {
	private _domSelector?: ISiteDomSelectorSpec

	private _displayDomSelector?: IDisplaySiteDomSelectorSpec

	constructor(domSelector: ISiteDomSelectorSpec, displayDomSelector: IDisplaySiteDomSelectorSpec) {
		this._domSelector = domSelector
		this._displayDomSelector = displayDomSelector
	}

	get domSelector(): ISiteDomSelectorSpec {
		return this._domSelector
	}

	get displayDomSelector(): IDisplaySiteDomSelectorSpec {
		return this._displayDomSelector
	}

	public getWholesalePageItemListSel(): string {
		return this._domSelector.wholesaleGalleryPageItemListSel
	}

	public getProductPageItemSel(): string {
		return this._domSelector.itemPageProductSel
	}

	public getWholesaleProductIdPage(): string {
		return this._domSelector.wholesalePageProductId
	}
}
