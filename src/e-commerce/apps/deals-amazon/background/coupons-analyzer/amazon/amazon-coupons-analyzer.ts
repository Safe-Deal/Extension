import { uniqBy } from "lodash"
import { castAsNumber } from "../../../../../../utils/text/strings"
import AmazonWholesalePageDownloader from "../../../../../engine/stores/amazon/product/amazon-wholesale--page-downloader"
import { PAGE_NUMBER_COUPON_ANALYZER_RANGE } from "../../../coupons.constant"
import { IAmazonCouponAnalyzerProps, IAmazonCouponProduct } from "../../../deals-coupons.interfaces"
import {
	discountPercent,
	getAsin,
	getCouponsPerPage,
	getCurrency,
	getDiscountPrice,
	getDiscountString,
	getFinalPrice,
	getImage,
	getPriceString,
	getReviewsCountAndRating,
	getTitle
} from "./amazon-coupons-utils"

const couponComponentElementSelector: string = "div[data-asin]"
const getProductElement = (couponComponentElement: HTMLElement) =>
  couponComponentElement.closest(couponComponentElementSelector) as HTMLElement

const getAmazonCoupons = ({ url, domainUrl, dom }: IAmazonCouponAnalyzerProps): IAmazonCouponProduct[] => {
	const allCouponComponentElementsInPage: HTMLElement[] = getCouponsPerPage(dom)

	return allCouponComponentElementsInPage.map((couponComponentElement: HTMLElement) => {
		const productElement: HTMLElement = getProductElement(couponComponentElement)

		const discountText: string = getDiscountString(productElement)
		const isPercentage: boolean = discountText.includes("%")
		const discount: number = castAsNumber(discountText)
		const { reviewCountNumber, ratingNumber } = getReviewsCountAndRating(productElement)
		const title: string = getTitle(productElement)
		const imageUrl: string = getImage(productElement)
		const asin: string = getAsin(productElement)
		const productUrl: string = `${domainUrl}/dp/${asin}`
		const currency: string = getCurrency(productElement)
		const priceString: string = getPriceString(productElement)
		const price = castAsNumber(priceString)
		const finalPrice: number = getFinalPrice(price, discount, isPercentage)
		const discountPrice: number = getDiscountPrice(price, discount, isPercentage)
		const discountPer: number = discountPercent(discountPrice, price)

		return {
			asin,
			discountPercent: discountPer,
			reviewsCount: reviewCountNumber,
			rating: ratingNumber,
			title,
			url,
			imageUrl,
			currency,
			price,
			priceString,
			finalPrice,
			discountPrice,
			productUrl
		}
	})
}

const amazonCouponsPagesAnalyzer = ({
	url,
	domainUrl,
	pagesDomList
}: {
  url: string;
  domainUrl: string;
  pagesDomList: Document[];
}) => {
	const allCoupons: any[] = []
	pagesDomList.forEach((dom: Document) => {
		const coupons: any[] = getAmazonCoupons({ url, domainUrl, dom })
		allCoupons.push(...coupons)
	})
	return allCoupons
}

// Get all Documents (DOM) from multiple pages (page1, page2, page 3...) that will be fetch
// Download ONLY one Page at the time
const buildPagesUrlToCouponAnalyzeWithoutCurrentPage = (url: string): string[] => {
	const currentUrl = new URL(url)
	// Get the value of the "page" parameter
	const pageParamVal: string = currentUrl.searchParams.get("page")
	let excludePageURLNumber = 0
	if (pageParamVal) {
		excludePageURLNumber = Number(pageParamVal)
	}

	const urls: string[] = []
	const startNumber = !excludePageURLNumber ? 2 : 1
	for (let i = startNumber; i <= PAGE_NUMBER_COUPON_ANALYZER_RANGE; i++) {
		if (i !== excludePageURLNumber) {
			urls.push(`${url}&page=${i}`)
		}
	}
	return urls
}

// save the DOM per each page in array
const getAllDocumentPages = async ({
	url,
	currentPageDom
}: {
  url: string;
  currentPageDom: Document;
}): Promise<Document[]> => {
	// strip current page number from url
	const pageUrls: string[] = buildPagesUrlToCouponAnalyzeWithoutCurrentPage(url)

	const htmlDomList: Document[] = []
	htmlDomList.push(currentPageDom)
	for (const pageUrl of pageUrls) {
		const wholesalePageDownloader = new AmazonWholesalePageDownloader(pageUrl)
		const html = await wholesalePageDownloader.download()
		htmlDomList.push(html)
	}
	return htmlDomList
}

const getAllAmazonCoupons = async ({
	url,
	domainUrl,
	currentPageDom
}: {
  url: string;
  domainUrl: string;
  currentPageDom: Document | any;
}): Promise<any[]> => {
	const pagesDomList = await getAllDocumentPages({ url, currentPageDom })
	const allAmzCoupons = amazonCouponsPagesAnalyzer({
		url,
		domainUrl,
		pagesDomList
	})
	return uniqBy(allAmzCoupons, "asin")
}

export { amazonCouponsPagesAnalyzer, getAllAmazonCoupons, getAmazonCoupons }
