import { MemoryCache } from "../../utils/cashing/memoryCache";
import { WHOLESALE_WAREHOUSE_GLUE } from "../../utils/extension/glue";
import { SiteMetadata } from "../../utils/site/site-information";
import { ParsedHtml } from "../../utils/dom/html";
import { prepareDTO, preprocessAlibabaData } from "../stores/alibaba/alibaba-store";
import { analyzeWholesaleWarehouseProductByAI } from "../wholesale-warehouse-ai-api-service";

export const initWholesaleWarehouse = () => {
  WHOLESALE_WAREHOUSE_GLUE.worker(async (data: any, postMessage: any): Promise<void> => {
    const dom: ParsedHtml = SiteMetadata.getDom(data);
    const urlObj = data?.url;
    const wholesaleWhStoreData = preprocessAlibabaData(dom);
    const wholesaleAiDTO = prepareDTO(wholesaleWhStoreData);
    const aiResult = await analyzeWholesaleWarehouseProductByAI(wholesaleAiDTO);
    const safeDealAiResult = convertedAlibabaProduct(aiResult, urlObj);

    postMessage(safeDealAiResult);
  });
};
function convertedAlibabaProduct(aiResult: any, urlObj: any) {
  throw new Error("Function not implemented.");
}
