import { MemoryCache } from "../../utils/cashing/memoryCache";
import { WHOLESALE_WAREHOUSE_GLUE } from "../../utils/extension/glue";
import { SiteMetadata } from "../../utils/site/site-information";
import { ParsedHtml } from "../../utils/dom/html";
import { prepareDTO, preprocessAlibabaData } from "../stores/alibaba/alibaba-store";
import { analyzeWholesaleWarehouseProductByAI } from "../wholesale-warehouse-ai-api-service";
import { convertedAlibabaProduct } from "../mocks/alibaba-product-mock";

const cache = new MemoryCache();

export const initWholesaleWarehouse = () => {
  WHOLESALE_WAREHOUSE_GLUE.worker(async (data: any, postMessage: any): Promise<void> => {
    const dom: ParsedHtml = SiteMetadata.getDom(data);
    const urlObj = data?.url;
    const wholesaleWhStoreData = preprocessAlibabaData(dom);
    const wholesaleAiDTO = prepareDTO(wholesaleWhStoreData);

    // ----------------------------
    // Analyzes the product by AI/Mock
    // ----------------------------
    const aiResult = await analyzeWholesaleWarehouseProductByAI(wholesaleAiDTO);
    console.log("AI Result: ", aiResult);
    const safeDealAiResult = convertedAlibabaProduct(aiResult, urlObj);

    // This if For Mock ONLY on Development Checking!
    // const safeDealAiResult = await new Promise((resolve) => {
    //   // resolve(alibabaProductMock);
    //   // resolve(convertedAlibabaProductMock);
    // });

    console.log("Wholesale AI Result: ", safeDealAiResult);
    postMessage(safeDealAiResult);
  });
};
