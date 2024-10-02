import { ApiScamNorton } from "../scam-rater/api-scam-norton"
import { ApiScamVoidUrl } from "../scam-rater/api-scam-void-url"
import { ScamSiteType } from "../types/anti-scam"

describe("API apiScamPartners test", () => {
	it("ApiScamVoidUrl should mark sites accordingly", async () => {
		const api = new ApiScamVoidUrl()
		const safe = await api.get("amazon.com", 1)
		expect(safe.type).toBe(ScamSiteType.SAFE)
		expect(safe.trustworthiness).toBe(100)

		const dangerous2 = await api.get("coolerones.com", 1)
		expect(dangerous2.type).toBe(ScamSiteType.DANGEROUS)
		expect(dangerous2.trustworthiness).toBe(57)
	})

	it("ApiScamVoidUrl should mark sites accordingly", async () => {
		const api = new ApiScamVoidUrl()
		const safe = await api.get("joinsafedeal.com", 1)
		expect(safe.type).toBe(ScamSiteType.SAFE)
		expect(safe.trustworthiness).toBe(100)
	})

	it("ApiScamScamAdviser should mark sites accordingly", async () => {
		const api = new ApiScamNorton()

		const safe = await api.get("amazon.com", 1)
		expect(safe.type).toBe(ScamSiteType.SAFE)

		expect(safe.trustworthiness).toBe(100)

		const suspicious = await api.get("tratartledag.com", 1)
		expect(suspicious.type).toBe(ScamSiteType.SAFE)
		expect(suspicious.trustworthiness).toBe(100)

		const dangerous = await api.get("hihanin.com", 1)
		expect(dangerous.type).toBe(ScamSiteType.SAFE)
		expect(dangerous.trustworthiness).toBe(100)
	})
})
