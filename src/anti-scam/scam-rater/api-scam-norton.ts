import { Remote } from "../../utils/downloaders/remote/remoteFetcher"
import { debug } from "../../utils/analytics/logger"
import { ScamRater, ScamConclusion, ScamSiteType } from "../types/anti-scam"

export class ApiScamNorton implements ScamRater {
	name: string = "ApiScamNorton"

	protected remote: Remote

	protected url: string

	public async get(domain: string, tabId: number): Promise<ScamConclusion> {
		try {
			this.url = `https://safeweb.norton.com/safeweb/sites/v1/details?url=${domain}&insert=0`
			const response = await Remote.getJson(this.url)
			const trustworthiness = null
			const childSafety = null

			const rating = response?.response

			const isSafe = rating.rating == "r" || rating.rating == "g" || rating.rating == "b" || rating.rating == "w"
			if (isSafe) {
				return {
					type: ScamSiteType.SAFE,
					trustworthiness: 100,
					childSafety,
					tabId
				}
			}

			return {
				type: ScamSiteType.NO_DATA,
				trustworthiness,
				childSafety,
				tabId
			}
		} catch (error) {
			debug(`ApiScamNorton:: Url:${this.url} Domain:${JSON.stringify(domain)} \nError ${JSON.stringify(error)}`)
			return { type: ScamSiteType.NO_DATA, tabId }
		}
	}
}
