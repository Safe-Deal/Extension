import { IShutaf } from "../../data/entities/shutaf.interface";
import { MemoryCache } from "../../utils/cashing/memoryCache";
import { getFetchJson } from "../../utils/downloaders/fetch";
import { ext } from "../../utils/extension/ext";

const SHUTAFIM_RESOURCE = "shutaf/shutafim.json";
const LIST_EXPIRATION_HOURS = 18;
const list = new MemoryCache(LIST_EXPIRATION_HOURS * 60, 1);

export class ShutafRemotesService {
  public static async fetchData(): Promise<[IShutaf]> {
    const cached = list.get(SHUTAFIM_RESOURCE);
    if (cached) {
      return cached;
    }

    const response = await getFetchJson(ext.runtime.getURL(SHUTAFIM_RESOURCE));
    list.set(SHUTAFIM_RESOURCE, response);
    return response;
  }

  public static setShutafList(lists) {
    list.set(SHUTAFIM_RESOURCE, lists);
  }
}
