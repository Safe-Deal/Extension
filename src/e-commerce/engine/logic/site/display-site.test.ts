import { DisplaySite } from "./display-site"

describe("Display Site", () => {
	let displaySite: DisplaySite

	beforeEach(() => {
		displaySite = new DisplaySite({
			conclusionProductEntity: [],
			// @ts-ignore
			site: {
				siteDomSelector: {
					displayDomSelector: {
						wholesalePageItemListSel: "test-sel-1",
						wholesalePageProductListSel: "test-sel-2",
						wholesalePagePriceSel: "test-sel-3"
					}
				}
			}
		})
	})

	describe("METHOD: getWholesaleItemListSel", () => {
		it("should return value", () => {
			expect(displaySite.getWholesaleItemListSel()).toEqual("test-sel-1")
		})
	})

	describe("METHOD: getWholesaleProductListSel", () => {
		it("should return value", () => {
			expect(displaySite.getWholesaleProductListSel()).toEqual("test-sel-2")
		})
	})

	describe("METHOD: getWholesalePriceSel", () => {
		it("should return value", () => {
			expect(displaySite.getWholesalePriceSel()).toEqual("test-sel-3")
		})
	})
})
