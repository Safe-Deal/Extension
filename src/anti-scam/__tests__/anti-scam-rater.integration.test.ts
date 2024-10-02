import { ScamSiteType } from "../types/anti-scam"
import { ApiScamPartners } from "../logic/anti-scam-logic"

const googSitesList = ["www.safebookstore.com", "semena74.com", "joinsafedeal.com", "ufa.robek.ru"]
describe("ApiScamPartners Integration Tests", () => {
	let apiScamPartners: ApiScamPartners
	beforeAll(() => {
		apiScamPartners = new ApiScamPartners()
	})

	googSitesList.forEach((domain) => {
		it(`should correctly evaluate a safe domain ${domain}`, async () => {
			const result = await apiScamPartners.evaluate(domain, null)
			expect(result).toBeDefined()
			expect(result.type).toBe(ScamSiteType.SAFE)
		})
	})
})
