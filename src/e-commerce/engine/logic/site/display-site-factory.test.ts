import { AliExpressProductDisplayPage } from "../../stores/ali-express/display/ali-express-product-page"
import { AliExpressWholesaleDisplayPage } from "../../stores/ali-express/display/ali-express-wholesale-page"
import { AmazonProductDisplayPage } from "../../stores/amazon/display/amazon-product-page"
import { AmazonWholesaleDisplayPage } from "../../stores/amazon/display/amazon-wholesale-page"
import { EbayProductDisplayPage } from "../../stores/ebay/display/ebay-product-page"
import { EbayWholesaleDisplayPage } from "../../stores/ebay/display/ebay-wholesale-page"
import { DisplaySiteFactory } from "./display-site-factory"

describe("DisplaySiteFactory", () => {
	it("create an ali express wholesale site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "aliexpress",
				domain: "",
				domainURL: "",
				pathName: "/af/toys-.html",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof AliExpressWholesaleDisplayPage).toBeTruthy()
	})

	it("create an ali express item site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "aliexpress",
				domain: "",
				domainURL: "",
				pathName: "/item/32844255466.html",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof AliExpressProductDisplayPage).toBeTruthy()
	})

	it("create an ebay wholesale site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "ebay",
				domain: "",
				domainURL: "",
				pathName: "/sch/i.html",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof EbayWholesaleDisplayPage).toBeTruthy()
	})

	it("create an ebay item site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "ebay",
				domain: "",
				domainURL: "",
				pathName: "/itm/Boston-Proper-Top-L-S-Boho-look-Tie-Dye-SZ-Small-Blue-Brown-NICE-B964/143761787929",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof EbayProductDisplayPage).toBeTruthy()
	})

	it("create an amazon item site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ/",
				domain: "",
				domainURL: "",
				pathName: "/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ/",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof AmazonProductDisplayPage).toBeTruthy()
	})

	it("create an amazon wholesale site", () => {
		const obj = new DisplaySiteFactory().create({
			conclusionProductEntity: [],
			site: {
				url: "https://www.amazon.com/s?k=best+handheld+",
				domain: "",
				domainURL: "",
				pathName: "/s",
				queryParams: "",
				siteDomSelector: {}
			},
			productId: ""
		})
		expect(obj instanceof AmazonWholesaleDisplayPage).toBeTruthy()
	})
})
