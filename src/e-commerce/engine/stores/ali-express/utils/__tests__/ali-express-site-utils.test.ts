import {
	AliExpressSiteUtils,
	isAliExpressItemDetails,
	isAliExpressRussianSite,
	isAliExpressSite
} from "../ali-express-site-utils"

describe("Ali Express Site Utils", () => {
	it("should return true if it ali express wholesale url", () => {
		const url =
      "https://www.aliexpress.com/af/mi%25252dband%25252d6.html?d=y&origin=n&SearchText=mi-band-6&catId=0&initiative_id=SB_20210403060206"
		expect(AliExpressSiteUtils.isAliExpressWholesale(url)).toBeTruthy()
	})

	it("should return false if it NOT ali express wholesale url", () => {
		const url =
      "https://www.aliexpress.com/item/1005002350709717.html?spm=a2g0o.productlist.0.0.21ac254aRZDDzV&algo_pvid=null&algo_expid=null&btsid=2100bddb16174585266782303e0a28&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_"
		expect(AliExpressSiteUtils.isAliExpressWholesale(url)).toBeFalsy()
	})
})

describe("getWholesaleAliExpressProductIdFromHref", () => {
	it("should return the product ID from the link", () => {
		const link =
      "https://www.aliexpress.com/item/1005002350709717.html?spm=a2g0o.productlist.0.0.21ac254aRZDDzV&algo_pvid=null&algo_expid=null&btsid=2100bddb16174585266782303e0a28&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_"
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("1005002350709717")
	})

	it("should return an empty string if the link is not provided", () => {
		const link = ""
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("")
	})

	it("should return an empty string if the link does not match the expected format", () => {
		const link = "https://www.aliexpress.com/invalid-link"
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("")
	})

	it("should return product id from hashed urls", () => {
		const link = "https://es.aliexpress.com/item/1005005948549445.html#nav-review"
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("1005005948549445")
	})

	it("should return product id from hebrew site", () => {
		const link =
      "https://he.aliexpress.com/item/4000203522848.html?spm=a2g2w.detail.1000060.1.7b4549611MueNe&gps-id=aerPdpSubstituteRcmd&scm=1007.33958.210224.0&scm_id=1007.33958.210224.0&scm-url=1007.33958.210224.0&pvid=deabbdc0-fe1b-4b49-ab9c-20154dadc53a&_t=gps-id%3AaerPdpSubstituteRcmd%2Cscm-url%3A1007.33958.210224.0%2Cpvid%3Adeabbdc0-fe1b-4b49-ab9c-20154dadc53a%2Ctpp_buckets%3A21387%230%23233228%2339&gatewayAdapt=4itemAdapt"
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("4000203522848")
	})

	it("should return product id from russian site", () => {
		const link =
      "https://aliexpress.ru/item/32933550262.html?spm=a2g2w.home.10009201.2.5119501dvNQvT6&mixer_rcmd_bucket_id=aerabtestalgoRecommendAbV12_controlRu1&ru_algo_pv_id=24bec3-ed37dc-1ff91d-9725ba&scenario=aerAppJustForYouNewRuGoldenItemsTab&sku_id=10000001864265159&traffic_source=recommendation&type_rcmd=core"
		const productId = AliExpressSiteUtils.getWholesaleAliExpressProductIdFromHref(link)
		expect(productId).toBe("32933550262")
	})
})

describe("isAliExpressSite", () => {
	it("should return true if the URL contains any AliExpress site name", () => {
		const url = "https://www.aliexpress.com"
		expect(isAliExpressSite(url)).toBeTruthy()
	})

	it("should return false if the URL does not contain any AliExpress site name", () => {
		const url = "https://www.amazon.com"
		expect(isAliExpressSite(url)).toBeFalsy()
	})
})

describe("isAliExpressRussianSite", () => {
	it("should return true if the URL contains 'aliexpress.ru'", () => {
		const url = "https://aliexpress.ru"
		expect(isAliExpressRussianSite(url)).toBeTruthy()
	})
	it("should return false if the URL does not contain 'aliexpress.ru'", () => {
		const url = "https://www.aliexpress.com"
		expect(isAliExpressRussianSite(url)).toBeFalsy()
	})
})

describe("isAliExpressItemDetails", () => {
	it("should return true if the URL contains AliExpress item details path", () => {
		const url = "https://www.aliexpress.com/item/1005002350709717.html"
		expect(isAliExpressItemDetails(url)).toBeTruthy()
	})

	it("should return true if the URL contains AliExpress item details path with a hash", () => {
		let url =
      "https://www.aliexpress.com/item/4000570399744.html?spm=a2g0o.productlist.0.0.2d4a5887trURuD&algo_pvid=8b90e046-7a13-430c-8c30-3d4f45967b44&algo_expid=8b90e046-7a13-430c-8c30-3d4f45967b44-1&btsid=0b0a556c16048106041106310ede2a&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_"
		expect(isAliExpressItemDetails(url)).toBeTruthy()

		url =
      "https://www.aliexpress.com/item/4000570399744.html?spm=a2g0o.productlist.0.0.2d4a5887trURuD&algo_pvid=8b90e046-7a13-430c-8c30-3d4f45967b44&algo_expid=8b90e046-7a13-430c-8c30-3d4f45967b44-1&btsid=0b0a556c16048106041106310ede2a&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_#hash"
		expect(isAliExpressItemDetails(url)).toBeTruthy()
		url =
      "https://www.aliexpress.com/i/4000570399744.html?spm=a2g0o.productlist.0.0.2d4a5887trURuD&algo_pvid=8b90e046-7a13-430c-8c30-3d4f45967b44&algo_expid=8b90e046-7a13-430c-8c30-3d4f45967b44-1&btsid=0b0a556c16048106041106310ede2a&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_#hash"
		expect(isAliExpressItemDetails(url)).toBeTruthy()
		url =
      "https://www.aliexpress.br/i/4000570399744.html?spm=a2g0o.productlist.0.0.2d4a5887trURuD&algo_pvid=8b90e046-7a13-430c-8c30-3d4f45967b44&algo_expid=8b90e046-7a13-430c-8c30-3d4f45967b44-1&btsid=0b0a556c16048106041106310ede2a&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_#hash"
		expect(isAliExpressItemDetails(url)).toBeTruthy()
	})

	it("should return false if the URL does not contain AliExpress item details path", () => {
		const url = "https://www.aliexpress.com"
		expect(isAliExpressItemDetails(url)).toBeFalsy()
	})
})

describe("isAliExpressWholesale", () => {
	it("should return true if it is an AliExpress wholesale URL", () => {
		const url =
      "https://www.aliexpress.com/af/mi%25252dband%25252d6.html?d=y&origin=n&SearchText=mi-band-6&catId=0&initiative_id=SB_20210403060206"
		expect(AliExpressSiteUtils.isAliExpressWholesale(url)).toBeTruthy()
	})

	it("should return false if it is not an AliExpress wholesale URL", () => {
		const url =
      "https://www.aliexpress.com/item/1005002350709717.html?spm=a2g0o.productlist.0.0.21ac254aRZDDzV&algo_pvid=null&algo_expid=null&btsid=2100bddb16174585266782303e0a28&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_"
		expect(AliExpressSiteUtils.isAliExpressWholesale(url)).toBeFalsy()
	})
})
