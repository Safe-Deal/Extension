import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { ReactNode, useEffect, useState } from "react";
import { MODIFIED_PAGES_CSS_CLASS } from "../../constants/display";
import { browserWindow } from "../../utils/dom/html";
import { SafeDealTheme } from "../../utils/react/theme";
import { SiteMetadata } from "../../utils/site/site-information";
import { FloatingToolbar } from "../../e-commerce/client/components/toolbar/FloatingToolbar";
import { AnalyzedItem, DEFAULT_PROGRESS, Progress } from "../../e-commerce/client/processing/productHandler";
import { WHOLESALE_WAREHOUSE_GLUE } from "../../utils/extension/glue";
import { debug } from "../../utils/analytics/logger";
import { ProductMinimal } from "../../e-commerce/client/components/product/ProductMinimal";
import { ProductFull } from "../../e-commerce/client/components/product/ProductFull";

const WholesaleWarehouseClient = (): ReactNode => {
  const [state, setState] = useState<{ processedItems: AnalyzedItem[]; progress: Progress }>({
    processedItems: [],
    progress: DEFAULT_PROGRESS
  });
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const url = SiteMetadata.getURL();

  // --------------------
  // Send document and more information to worker
  // Enable progress bar
  // --------------------
  const sendAlibabaInfoToWorker = () => {
    debug("=> WholesaleWarehouseClient::useEffect");
    setIsWorking(true);
    WHOLESALE_WAREHOUSE_GLUE.send({
      document: SiteMetadata.getDomOuterHTML(browserWindow().document),
      url: {
        domain: SiteMetadata.getDomain(),
        domainURL: SiteMetadata.getDomainURL(),
        pathName: SiteMetadata.getPathName(),
        queryParams: SiteMetadata.getQueryParams(),
        url: SiteMetadata.getURL()
      }
    });
  };

  // --------------------------------
  // Register response from worker
  // --------------------------------
  const handleWorkerResponse = (response) => {
    console.log("handleWorkerResponse:: = ", response);
    // debug(`WholesaleWarehouse:: Got response from Worker Product No: ${response.productId} ....`);
    setIsWorking(false);
    if (response?.error) {
      debug(`=> Error: ${response.error}`, "WholesaleWarehouse::registerGetResponse");
      return;
    }
    setState({ processedItems: response, progress: DEFAULT_PROGRESS });
  };

  useEffect(() => {
    sendAlibabaInfoToWorker();
    WHOLESALE_WAREHOUSE_GLUE.client(handleWorkerResponse);
  }, []);

  const ItemPage = {
    Full: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductFull product={state.processedItems[0]?.data} isWholesaleWarehouse />
        {/* <ProductFullWholesaleWarehouse product={state.processedItems[0]?.data} /> */}
      </div>
    ),
    Minimal: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductMinimal product={state.processedItems[0]?.data} />
      </div>
    )
  };

  // const ListPage = {
  //   Full: null,
  //   Minimal: (
  //     <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
  //       <ProductsListMinimal productsList={state.processedItems} />
  //     </div>
  //   )
  // };

  // const isItemDetails = SiteUtil.isItemDetails(url);
  const { Full } = ItemPage;
  const { Minimal } = ItemPage;
  return (
    <ThemeProvider theme={SafeDealTheme}>
      <FloatingToolbar Full={Full} Minimal={Minimal} isLoading={isWorking} />;
    </ThemeProvider>
  );
};

export { WholesaleWarehouseClient };
