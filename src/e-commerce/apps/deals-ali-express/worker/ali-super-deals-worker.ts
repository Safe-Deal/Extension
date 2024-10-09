import { logError, debug } from "@utils/analytics/logger";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { initAliexpressDealsStoreBackend } from "@store/AliexpressDealsState";
import { parseAsHtml } from "@utils/dom/html";
import { AliSuperDealsMessageRequest, ISuperDealProduct } from "../common/interfaces";
import { getAliExpressSuperDeals } from "./ali-super-deals-analyzer";

export enum AliSuperDealsMessageType {
  FETCH_ALI_SUPER_DEALS = "fetchAliSuperDeals"
}
export interface IAliSuperDealsBus {
  [AliSuperDealsMessageType.FETCH_ALI_SUPER_DEALS]: (request: AliSuperDealsMessageRequest) => Promise<void>;
}

export const initAliExpressSuperDealsWorker = async (): Promise<void> => {
  const store = await initAliexpressDealsStoreBackend();
  debug("AliexpressDealsStore:: AliexpressDealsStore ready:", store);
  const { onMessage } = definePegasusMessageBus<IAliSuperDealsBus>();

  onMessage(AliSuperDealsMessageType.FETCH_ALI_SUPER_DEALS, async (request) => {
    store.getState().setLoading(true);
    try {
      const { pageDocument } = request.data;
      const currentPageDom: Document | any = parseAsHtml(pageDocument);
      const deals: ISuperDealProduct[] = getAliExpressSuperDeals({
        dom: currentPageDom
      });
      store.getState().setSuperDeals(deals);
    } catch (error) {
      logError(error);
      store.getState().setSuperDeals([]);
    } finally {
      store.getState().setLoading(false);
    }
  });
};
