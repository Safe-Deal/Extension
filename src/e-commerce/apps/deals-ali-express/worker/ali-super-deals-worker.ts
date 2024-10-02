import { parseAsHtml } from "../../../../utils/dom/html";
import { ALI_SUPER_DEALS_GLUE } from "../../../../utils/extension/glue";
import { AliSuperDealsMessageRequest, ISuperDealProduct } from "../common/interfaces";
import { getAliExpressSuperDeals } from "./ali-super-deals-analyzer";

export const initAliExpressSuperDealsWorker = (): void => {
  // listen to ali super deals request from content script
  ALI_SUPER_DEALS_GLUE.worker(async (message: AliSuperDealsMessageRequest, sendResponse) => {
    const { pageDocument } = message;
    const currentPageDom: Document | any = parseAsHtml(pageDocument);
    const aliSuperDeals: ISuperDealProduct[] = getAliExpressSuperDeals({
      dom: currentPageDom
    });

    // send back the ali super deals to the content script
    sendResponse({ result: { deals: aliSuperDeals } });
  });
};
