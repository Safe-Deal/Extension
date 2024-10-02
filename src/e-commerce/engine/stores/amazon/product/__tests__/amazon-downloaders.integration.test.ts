import { HUMAN_DELAY_E2E, IS_CI } from "../../../../../../../test/e2e/utils/constants"
import { IProduct } from "../../../../../../data/entities/product.interface"
import { getAvailableSelector } from "../../../../../../utils/dom/html"
import { PERCENT_EL_SELECTOR } from "../../rules/store-positive-feedback/store-positive-feedback-rule-result"
import AmazonFeedbackDownloader from "../amazon-feedback-downloader"
import AmazonProductDownloader from "../amazon-product-downloader"
import AmazonStoreDownloader from "../amazon-store-downloader"

const product = { id: "B08KJN3333", domain: "amazon.com" } as IProduct

describe("Remote Fetch Amazon US Integration test", () => {
	afterEach(async () => {
		await HUMAN_DELAY_E2E()
	})
	beforeEach(async () => {
		await HUMAN_DELAY_E2E()
	})

	it("should correctly fetch amazon", async () => {
		if (IS_CI) {
			return
		}
		const downloader = new AmazonProductDownloader(product)
		const result = await downloader.download()
		expect(result).toBeDefined()
		const text = result.childNodes[0].textContent
		expect(text).toBeDefined()
		expect(text.length > 1).toBeTruthy()
	})

	it.skip("should correctly fetch amazon stores Reviews", async () => {
		// https://www.amazon.com/sp?seller=AZ6BTX98B3TBC
		const downloader = new AmazonStoreDownloader("AZ6BTX98B3TBC", "www.amazon.com")
		const html = await downloader.download()
		const lifetime = getAvailableSelector(PERCENT_EL_SELECTOR, html)
		const lifetimePercent = lifetime?.childNodes[0]?.textContent
		expect(lifetimePercent?.length > 0).toBeTruthy()
		const percentTop = html.querySelector("#seller-info-feedback-summary > span > a > b")
		expect(percentTop.textContent.includes("positive")).toBeTruthy()
	})

	it.skip("should correctly fetch amazon products Reviews", async () => {
		if (IS_CI) {
			return
		}

		// https://www.amazon.com/product-reviews/B00H61ZBZU/
		const downloader = new AmazonFeedbackDownloader("B00H61ZBZU", "www.amazon.com")
		const html = await downloader.download()
		expect(html).toBeDefined()
		const feedbacks = html.querySelector(".averageStarRatingNumerical > span")
		const feedbacksText = feedbacks.textContent
		expect(feedbacksText.includes("global ratings") || feedbacksText.includes("total reviews")).toBeTruthy()
	})
})
