import { IConclusionResponse } from "../../../../../data/rules-conclusion/conclusion-response.interface"
import { DisplaySite } from "../../../logic/site/display-site"

export class EbayProductDisplayPage extends DisplaySite {
	constructor(conclusionResponse: IConclusionResponse) {
		super(conclusionResponse)
	}
}
