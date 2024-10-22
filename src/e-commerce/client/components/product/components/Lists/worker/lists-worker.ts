import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { initListsStoreBackend, List } from "@store/ListsStore";
import { debug, logError } from "@utils/analytics/logger";
import { Session } from "@supabase/supabase-js";
import axios from "axios";

export enum ListsWorkerMessageType {
  FETCH_LISTS = "fetchLists",
  CHECK_PRODUCT = "checkProduct"
}

export interface IListWorkerMessageBus {
  [ListsWorkerMessageType.FETCH_LISTS]: (session: Session) => Promise<void>;
  [ListsWorkerMessageType.CHECK_PRODUCT]: { productId: string; lists: List[] };
}

export const initListsWorker = async () => {
  const store = await initListsStoreBackend();
  debug("ListsWorker:: Lists Store initialized: ", store.getState());
  const { setLists, setLoading, setLoadingFavorite, setIsCurrentAFavorite } = store.getState();
  const { onMessage } = definePegasusMessageBus<IListWorkerMessageBus>();

  onMessage(ListsWorkerMessageType.FETCH_LISTS, async (request) => {
    try {
      const session = request.data;
      if (!session) {
        throw new Error("No session found");
      }
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/lists", {
        headers: {
          Authorization: `Bearer ${JSON.stringify(session)}`
        }
      });
      const lists = response.data;
      setLists(lists);
    } catch (error) {
      logError(error, "ListsWorker:: Error fetching lists: ");
    } finally {
      setLoading(false);
    }
  });

  onMessage(ListsWorkerMessageType.CHECK_PRODUCT, async (request) => {
    try {
      const { productId, lists } = request.data;
      console.log(lists);
      if (!productId) {
        throw new Error("No product id found");
      }
      setLoadingFavorite(true);

      const isProductFavorite = lists.some(
        (list: List) => list.products && list.products.some((id) => id === productId)
      );

      setIsCurrentAFavorite(isProductFavorite);
      debug(`ListsWorker:: Product ${productId} is${isProductFavorite ? "" : " not"} a favorite`);
    } catch (error) {
      logError(error, "ListsWorker:: Error checking product: ");
    } finally {
      setLoadingFavorite(false);
    }
  });
};
