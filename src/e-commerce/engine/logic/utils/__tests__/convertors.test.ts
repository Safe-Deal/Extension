import { Site } from "../../../../../data/sites/site"
import { SiteDomSelector } from "../../../../../data/sites/site-dom-selector"
import { convertSiteToSiteResponse } from "../convertors"

describe("convertors", () => {
	it("convertSiteToSiteResponse", () => {
		const siteMock = new Site(
			{
				url: "http://www.aliexpress",
				domain: "aliexpress",
				domainURL: "aliexpress.com",
				pathName: "",
				queryParams: ""
			},
			new SiteDomSelector({ wholesaleGalleryPageItemListSel: "" }, {})
		)

		const siteExpected = {
			url: "http://www.aliexpress",
			domain: "aliexpress",
			domainURL: "aliexpress.com",
			pathName: "",
			queryParams: "",
			siteDomSelector: {
				domSelector: {
					wholesaleGalleryPageItemListSel: ""
				},
				displayDomSelector: {}
			}
		}

		expect(convertSiteToSiteResponse(siteMock)).toEqual(siteExpected)
	})
})
