import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { useEffect, useState } from "react";
import { MODIFIED_PAGES_CSS_CLASS } from "../../constants/display";
import { SiteFactory } from "../../data/sites/site-factory";
import { debug } from "../../utils/analytics/logger";
import { browserWindow } from "../../utils/dom/html";
import { SafeDealTheme } from "../../utils/react/theme";
import { SiteMetadata } from "../../utils/site/site-information";
import { SiteUtil } from "../engine/logic/utils/site-utils";
import { ProductFull } from "./components/product/ProductFull";
import { ProductMinimal } from "./components/product/ProductMinimal";
import { FloatingToolbar } from "./components/toolbar/FloatingToolbar";
import { ProductsListMinimal } from "./components/wholesale/ProductsListMinimal";
import { registerEvents, startProcessingInterval, stopProcessingInterval } from "./events/eventRegistration";
import { registerLazyLoaders } from "./events/lazyLoadingHandlers";
import { useTimedState } from "./hooks/useTimedState";
import { AnalyzedItem, DEFAULT_PROGRESS, processProducts, Progress } from "./processing/productHandler";
import { registerGetResponse } from "./processing/queHandler";
import { useContentModifiedObserver } from "./hooks/useContentModifiedObserver";
import { isRtl } from "../../constants/messages";

export function ECommerceClient(): JSX.Element {
  const [state, setState] = useState<{
    processedItems: AnalyzedItem[];
    progress: Progress;
  }>({
    processedItems: [],
    progress: DEFAULT_PROGRESS
  });
  const [isWorking, setIsWorking] = useTimedState<boolean>(true, false);
  const [productData, setProductData] = useState<AnalyzedItem | null>(null);

  const url = SiteMetadata.getURL();
  const isItemDetail = SiteUtil.isItemDetails(url);
  const itemDetailProductId = SiteUtil.getProductID(url);
  const siteURL: string = url;
  const dom = browserWindow().document;
  const site = new SiteFactory().create({
    url: SiteMetadata.getDomainURL(),
    domain: SiteMetadata.getDomain(),
    pathName: SiteMetadata.getPathName(),
    dom
  });

  const updateStatus = (newProgress) => {
    if (newProgress.totalLeft > 0) {
      setIsWorking(true);
    }
    setState((prevState) => ({
      ...prevState,
      progress: newProgress
    }));
  };

  useEffect(() => {
    if (!site) {
      debug(`No Supported site for url: ${siteURL}`);
      return null;
    }

    registerEvents();
    registerLazyLoaders(site, siteURL, updateStatus);
    registerGetResponse(
      (newProgress) => {
        setState((prevState) => ({
          ...prevState,
          progress: {
            ...prevState.progress,
            receivedFromAnalysis: prevState.progress.receivedFromAnalysis + newProgress.receivedFromAnalysis,
            totalAnalyzed: prevState.progress.totalAnalyzed + newProgress.totalAnalyzed,
            totalLeft: prevState.progress.totalLeft - newProgress.receivedFromAnalysis
          }
        }));
      },
      (processedItems) => {
        setState((prevState) => ({
          ...prevState,
          processedItems: [...prevState.processedItems, ...processedItems]
        }));
      }
    );

    startProcessingInterval();
    processProducts(site, siteURL, updateStatus);

    return () => {
      stopProcessingInterval();
    };
  }, []);

  useContentModifiedObserver(() => {
    processProducts(site, siteURL, updateStatus);
  });

  useEffect(() => {
    if (state.progress.justStarted) {
      return;
    }
    if (state.progress.totalLeft <= 0) {
      setIsWorking(false);
    } else {
      setIsWorking(true);
    }
  }, [state]);

  useEffect(() => {
    if (isItemDetail && state?.processedItems?.length > 0 && !isWorking) {
      let product = null;
      product = state.processedItems.find((item) => item.id === itemDetailProductId);
      if (product) {
        setProductData(product.data);
      }
    }
  }, [isWorking]);

  const ItemPage = {
    Full: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductFull product={productData} />
      </div>
    ),
    Minimal: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductMinimal product={productData} />
      </div>
    )
  };
  const isRtlLang = isRtl();

  const ListPage = {
    Full: null,
    Minimal: (
      <div
        id="safe-deal-react-toolbar"
        className={MODIFIED_PAGES_CSS_CLASS}
        style={{ direction: isRtlLang ? "rtl" : "ltr" }}
      >
        <ProductsListMinimal />
      </div>
    )
  };

  const Full = isItemDetail ? ItemPage.Full : ListPage.Full;
  const Minimal = isItemDetail ? ItemPage.Minimal : ListPage.Minimal;

  return (
    <ThemeProvider theme={SafeDealTheme}>
      <FloatingToolbar Full={Full} Minimal={Minimal} isLoading={isWorking} />;
    </ThemeProvider>
  );
}
