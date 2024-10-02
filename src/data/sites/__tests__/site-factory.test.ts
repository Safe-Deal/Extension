import { Site } from "../site"
import { SiteFactory } from "../site-factory"

describe("site factory", () => {
	const domMock = {
		querySelector: (selector) => ({
			getAttribute: (attr) => "gallery"
		})
	}

	it("create ali express site with wholesale page", () => {
		const testURL = "https://www.aliexpress.com/af/cool-stuff.html?SAFE_DEAL_WELCOME_TOUR"

		const aliexpressSite: Site = new SiteFactory().create({
			domain: "www.aliexpress.com",
			domainURL: "https://www.aliexpress.com",
			pathName: "/af/cool-stuff.html",
			queryParams: "?SAFE_DEAL_WELCOME_TOUR",
			url: "https://www.aliexpress.com/af/cool-stuff.html?SAFE_DEAL_WELCOME_TOUR",
			dom: domMock
		})
		expect(aliexpressSite.siteDomSelector.domSelector).toBeDefined()
		expect(aliexpressSite.siteDomSelector.displayDomSelector).toBeDefined()
		expect(aliexpressSite.url).toBe(testURL)
		expect(aliexpressSite.domain).toBe("www.aliexpress.com")
		expect(aliexpressSite.domainURL).toBe("https://www.aliexpress.com")
		expect(aliexpressSite.queryParams).toBe("?SAFE_DEAL_WELCOME_TOUR")
		expect(aliexpressSite.pathName).toBe("/af/cool-stuff.html")
		expect(aliexpressSite.rules.length).toBe(4)
	})

	it("create ali express site with wholesale page", () => {
		const testURL =
      "https://www.aliexpress.com/wholesale?SearchText=anker-official-store&osf=discovery&d=y&origin=n&spm=2114.best.100000001.4.23a1ukIIukIIhj"

		const aliexpressSite: Site = new SiteFactory().create({
			url: testURL,
			domain: "aliexpress",
			domainURL: "aliexpress.com",
			queryParams:
        "d=y&origin=n&SearchText=+Pocket+Key+Organize+Smart+Key+Ring&catId=0&initiative_id=SB_20200811103150",
			pathName: "/af/-Pocket-Key-Organize-Smart-Key-Ring.html",
			dom: domMock
		})
		expect(aliexpressSite.siteDomSelector.domSelector).toBeDefined()
		expect(aliexpressSite.siteDomSelector.displayDomSelector).toBeDefined()
		expect(aliexpressSite.url).toBe(testURL)
		expect(aliexpressSite.domain).toBe("aliexpress")
		expect(aliexpressSite.domainURL).toBe("aliexpress.com")
		expect(aliexpressSite.queryParams).toBe(
			"d=y&origin=n&SearchText=+Pocket+Key+Organize+Smart+Key+Ring&catId=0&initiative_id=SB_20200811103150"
		)
		expect(aliexpressSite.pathName).toBe("/af/-Pocket-Key-Organize-Smart-Key-Ring.html")
		expect(aliexpressSite.rules.length).toBe(4)
	})

	it("create ali express site with wholesale page", () => {
		const testURL =
      "https://www.aliexpress.ru/wholesale?SearchText=anker-official-store&osf=discovery&d=y&origin=n&spm=2114.best.100000001.4.23a1ukIIukIIhj"
		const aliexpressSite: Site = new SiteFactory().create({
			url: testURL,
			domain: "aliexpress.com",
			domainURL: "aliexpress.com",
			queryParams:
        "d=y&origin=n&SearchText=+Pocket+Key+Organize+Smart+Key+Ring&catId=0&initiative_id=SB_20200811103150",
			pathName: "/af/-Pocket-Key-Organize-Smart-Key-Ring.html",
			dom: domMock
		})
		expect(aliexpressSite.siteDomSelector.domSelector).toBeDefined()
		expect(aliexpressSite.siteDomSelector.displayDomSelector).toBeDefined()
		expect(aliexpressSite.url).toBe(testURL)
		expect(aliexpressSite.domain).toBe("aliexpress.com")
		expect(aliexpressSite.domainURL).toBe("aliexpress.com")
		expect(aliexpressSite.queryParams).toBe(
			"d=y&origin=n&SearchText=+Pocket+Key+Organize+Smart+Key+Ring&catId=0&initiative_id=SB_20200811103150"
		)
		expect(aliexpressSite.pathName).toBe("/af/-Pocket-Key-Organize-Smart-Key-Ring.html")
		expect(aliexpressSite.rules.length).toBe(4)
	})

	it("create ali express site with product page", () => {
		const testURL =
      "https://www.aliexpress.com/item/4000570399744.html?spm=a2g0o.productlist.0.0.2d4a5887trURuD&algo_pvid=8b90e046-7a13-430c-8c30-3d4f45967b44&algo_expid=8b90e046-7a13-430c-8c30-3d4f45967b44-1&btsid=0b0a556c16048106041106310ede2a&ws_ab_test=searchweb0_0,searchweb201602_,searchweb201603_"
		const aliexpressSite: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/item/32844255466.html"
		})
		expect(aliexpressSite.url).toBe(testURL)
		expect(aliexpressSite.pathName).toBe("/item/32844255466.html")
		expect(aliexpressSite.rules.length).toBe(5)
	})

	it("create ebay site with wholesale page", () => {
		const testURL = "https://www.ebay.com/sch/i.html?_from=R40&_nkw=lamp+&_sacat=0&LH_TitleDesc=0&_ipg=192"
		const ebaySite: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/sch/i.html",
			domainURL: "www.ebay.com",
			queryParams: "_from=R40&_nkw=lamp+&_sacat=0&LH_TitleDesc=0&_ipg=192",
			dom: domMock
		})
		expect(ebaySite.url).toBe(testURL)
		expect(ebaySite.pathName).toBe("/sch/i.html")
		expect(ebaySite.rules.length).toBe(7)
	})

	it("create ebay site with item page", () => {
		const testURL =
      "https://www.ebay.com/itm/Boston-Proper-Top-L-S-Boho-look-Tie-Dye-SZ-Small-Blue-Brown-NICE-B964/143761787929?_trkparms=aid%3D1110009%26algo%3DSPLICE.COMPLISTINGS%26ao%3D1%26asc%3D20200423103423%26meid%3Dda735082ff914f9aaa00f572865708db%26pid%3D100011%26rk%3D2%26rkt%3D12%26sd%3D274421256482%26itm%3D143761787929%26pmt%3D1%26noa%3D0%26pg%3D2047675%26algv%3Ddefault%26brand%3DBoston+Proper&_trksid=p2047675.c100011.m1850"
		const ebaySite: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/itm/Boston-Proper-Top-L-S-Boho-look-Tie-Dye-SZ-Small-Blue-Brown-NICE-B964/143761787929"
		})
		expect(ebaySite.url).toBe(testURL)
		expect(ebaySite.pathName).toBe(
			"/itm/Boston-Proper-Top-L-S-Boho-look-Tie-Dye-SZ-Small-Blue-Brown-NICE-B964/143761787929"
		)
		expect(ebaySite.rules.length).toBe(7)
	})

	it("create ebay site with item page elevated item detail", () => {
		const testURL = "https://www.ebay.com/i/352691041343?chn=ps&mkevt=1&mkcid=28&var=622035211971"
		const ebaySite: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/i/352691041343"
		})
		expect(ebaySite.url).toBe(testURL)
		expect(ebaySite.pathName).toBe("/i/352691041343")
		expect(ebaySite.rules.length).toBe(7)
	})

	it("create amazon site with wholesale page", () => {
		const testURL =
      "https://www.amazon.com/s?k=best+handheld+vacuum+cordless&crid=2E0ZZ5H5IV5CB&sprefix=best+hand%2Caps%2C253&ref=nb_sb_ss_i_3_9"
		const amazon: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/s"
		})
		expect(amazon.url).toBe(testURL)
		expect(amazon.pathName).toBe("/s")
		expect(amazon.rules.length).toBe(5)
	})

	it("create amazon site with item page AmazonBasics-Lightning", () => {
		const testURL =
      "https://www.amazon.com/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ/ref=sr_1_2?dchild=1&keywords=amazonbasics&pf_rd_p=fef24073-2963-4c6b-91ab-bf7eab1c4cac&pf_rd_r=EWRDVE8EFMTTFWKNRXAG&qid=1601946519&sr=8-2"
		const amazon: Site = new SiteFactory().create({
			url: testURL,
			pathName: "/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ/",
			domainURL: "www.amazon.com",
			queryParams: "_from=R40&_nkw=lamp+&_sacat=0&LH_TitleDesc=0&_ipg=192",
			dom: domMock
		})
		expect(amazon.url).toBe(testURL)
		expect(amazon.pathName).toBe("/AmazonBasics-Lightning-USB-Cable-Certified/dp/B07DC9SBLQ/")
		expect(amazon.rules.length).toBe(6)
	})

	it("create amazon site with item page no more val 1 product", () => {
		const testURL = "https://www.amazon.com/gp/product/B078WB74R9/"
		const amazon: Site = new SiteFactory().create({
			domain: "www.amazon.com",
			domainURL: "https://www.amazon.com",
			pathName: "/gp/product/B078WB74R9/",
			queryParams: "",
			url: "https://www.amazon.com/gp/product/B078WB74R9/",
			dom: domMock
		})
		expect(amazon.url).toBe(testURL)
		expect(amazon.pathName).toBe("/gp/product/B078WB74R9/")
		expect(amazon.rules.length).toBe(6)
	})

	it("create amazon site with item page no more val 2 product", () => {
		const testURL = "https://www.amazon.com/gp/product/B078WB74R9"
		const amazon: Site = new SiteFactory().create({
			domain: "www.amazon.com",
			domainURL: "https://www.amazon.com",
			pathName: "/gp/product/B078WB74R9",
			queryParams: "",
			url: "https://www.amazon.com/gp/product/B078WB74R9",
			dom: domMock
		})
		expect(amazon.url).toBe(testURL)
		expect(amazon.pathName).toBe("/gp/product/B078WB74R9")
		expect(amazon.rules.length).toBe(6)
	})
})
