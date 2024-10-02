import { IShutaf } from "../../data/entities/shutaf.interface"
import { MemoryCache } from "../../utils/cashing/memoryCache"
import { getFetchJson } from "../../utils/downloaders/fetch"

const LIST_EXPIRATION_HOURS = 18

const REMOTE_URL: string = "https://const.joinsafedeal.com/shutafim.json"
const list = new MemoryCache(LIST_EXPIRATION_HOURS * 60, 1)

export class ShutafRemotesService {
	public static async fetchData(): Promise<[IShutaf]> {
		const cached = list.get(REMOTE_URL)
		if (cached) {
			return cached
		}

		const response = await getFetchJson(REMOTE_URL)
		list.set(REMOTE_URL, response)
		return response
	}

	public static setShutafList(lists) {
		list.set(REMOTE_URL, lists)
	}
}
