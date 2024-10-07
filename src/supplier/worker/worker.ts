import { get } from "lodash";
import { MemoryCache } from "../../utils/cashing/memoryCache";
import { SUPPLIER_GLUE } from "../../utils/extension/glue";
import { SiteMetadata } from "../../utils/site/site-information";
import { ParsedHtml } from "../../utils/dom/html";
import { prepareDTO, preprocessAlibabaData } from "../stores/alibaba/alibaba-store";
import { analyzeSupplierProductByAI } from "../supplier-ai-api-service";
import { convertedAlibabaProduct } from "../mocks/alibaba-product-mock";
import { initPegasusTransport } from "@utils/pegasus/transport/background";
import { initAuthStoreBackend } from "@store/AuthState";

const cache = new MemoryCache();

export const initSupplier = () => {
  SUPPLIER_GLUE.worker(async (data: any, postMessage: any): Promise<void> => {
    const dom: ParsedHtml = SiteMetadata.getDom(data);
    const urlObj = data?.url;
    const SupplierStoreData = preprocessAlibabaData(dom);
    const supplierAiDTO = prepareDTO(SupplierStoreData);
    const storeFeedbackUrl = get(SupplierStoreData, "globalData.seller.feedbackUrl");

    // ----------------------------
    // Analyzes the product by AI/Mock
    // ----------------------------
    const aiResult = await analyzeSupplierProductByAI(supplierAiDTO);
    const safeDealAiResult = convertedAlibabaProduct(aiResult, urlObj, storeFeedbackUrl);

    // This if For Mock ONLY on Development Checking!
    // const safeDealAiResult = await new Promise((resolve) => {
    //   // resolve(alibabaProductMock);
    //   // resolve(convertedAlibabaProductMock);
    // });

    postMessage(safeDealAiResult);
  });
};
