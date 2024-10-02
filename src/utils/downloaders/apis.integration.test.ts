import { ApiScamPartners } from "../../anti-scam/logic/anti-scam-logic"
import { ScamSiteType } from "../../anti-scam/types/anti-scam"
import { ApiDownloader } from "./apiDownloader"

describe("API downloader test", () => {
	it("should download pricing", async () => {
		const downloader = new ApiDownloader("/price")
		const data = {
			products: ["3256804196942110"],
			type: "AliExpress"
		}
		const response = await downloader.post(data)
		delete response.product
		expect(response).toEqual(
			expect.objectContaining({
				averagePrice: expect.anything(),
				currency: expect.anything(),
				maxPrice: expect.anything(),
				minPrice: expect.anything(),
				price: expect.any(Array),
				productID: expect.anything()
			})
		)
	})
})

describe("API apiScamPartners test", () => {
	// https://www.urlvoid.com/scan/amazon.com
	// https://www.mywot.com/scorecard/joinsafedal.com
	// https://safeweb.norton.com/report/show?url=joinsafedal.com

	it("should mark sites accordingly", async () => {
		const logic = new ApiScamPartners()
		const safe = await logic.evaluate("amazon.com", null)
		expect(safe.type).toBe(ScamSiteType.SAFE)
		expect(safe.trustworthiness).toBeGreaterThan(85)

		const nodata = await logic.evaluate("joinsafedeal.com", null)
		expect(nodata.type).toBe(ScamSiteType.SAFE)
		expect(nodata.trustworthiness).toBe(100)

		const suspicious = await logic.evaluate("test.com", null)
		expect(suspicious.type).toBe(ScamSiteType.SAFE)
		expect(suspicious.trustworthiness).toBeGreaterThan(30)
	})
})
