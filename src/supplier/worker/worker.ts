import { get } from "lodash";
import { debug, logError } from "@utils/analytics/logger";
import { initSupplierStoreBackend } from "@store/SupplierState";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { SiteMetadata } from "../../utils/site/site-information";
import { ParsedHtml } from "../../utils/dom/html";
import { prepareDTO, preprocessAlibabaData } from "../stores/alibaba/alibaba-store";
import { analyzeSupplierProductByAI } from "../supplier-ai-api-service";
import { convertedAlibabaProduct } from "../mocks/alibaba-product-mock";

export enum SupplierMessageType {
  ANALYZE_SUPPLIER = "analyzeSupplier"
}
export interface ISupplierRequestData {
  document: string;
  url: {
    domain: string;
    domainURL: string;
    pathName: string;
    queryParams: string;
    url: string;
  };
}
export interface ISupplierMessageBus {
  [SupplierMessageType.ANALYZE_SUPPLIER]: (request: ISupplierRequestData) => Promise<void>;
}

export const initSupplier = async () => {
  const store = await initSupplierStoreBackend();
  debug("SupplierStore:: Supplier Store ready:", store);
  const { onMessage } = definePegasusMessageBus<ISupplierMessageBus>();

  onMessage(SupplierMessageType.ANALYZE_SUPPLIER, async (request) => {
    const { setLoading, setAnalyzedItems } = store.getState();
    try {
      if (!request || !request.data) {
        // It is expected, no need to log error
        debug("Invalid request or missing data");
        setLoading(false);
        return;
      }
      const { url } = request.data;
      if (!url) {
        // It is expected, no need to log error
        debug("Missing required data: url");
        setLoading(false);
        return;
      }
      const dom: ParsedHtml = SiteMetadata.getDom(request.data);
      const SupplierStoreData = preprocessAlibabaData(dom);
      const supplierAiDTO = prepareDTO(SupplierStoreData);
      const storeFeedbackUrl = get(SupplierStoreData, "globalData.seller.feedbackUrl");

      const aiResult = await analyzeSupplierProductByAI(supplierAiDTO);
      const safeDealAiResult = convertedAlibabaProduct(aiResult, url, storeFeedbackUrl);

      setAnalyzedItems(safeDealAiResult);
    } catch (error) {
      logError(error, "::SupplierStore Error!");
    } finally {
      setLoading(false);
    }
  });
};
