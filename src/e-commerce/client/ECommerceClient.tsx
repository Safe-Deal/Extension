import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { useEffect, useState } from "react";
import { useThemeStore, initThemeStoreBackend, themeStoreReady, registerSystemThemeListener } from "@store/ThemeState";
import { MODIFIED_PAGES_CSS_CLASS } from "../../constants/display";
import { SiteFactory } from "../../data/sites/site-factory";
import { debug } from "../../utils/analytics/logger";
import { browserWindow } from "../../utils/dom/html";
import { getSafeDealTheme } from "../../utils/react/theme";
import { SiteMetadata } from "../../utils/site/site-information";
import { SiteUtil } from "../engine/logic/utils/site-utils";
import { ProductFull } from "./components/product/ProductFull";
import { ProductMinimal } from "./components/product/ProductMinimal";
import { FloatingToolbar } from "./components/toolbar/FloatingToolbar";
import { registerEvents, startProcessingInterval, stopProcessingInterval } from "./events/eventRegistration";
import { registerLazyLoaders } from "./events/lazyLoadingHandlers";
import { useTimedState } from "./hooks/useTimedState";
import { AnalyzedItem, DEFAULT_PROGRESS, processProducts, Progress } from "./processing/productHandler";
import { registerGetResponse } from "./processing/queHandler";
import { useContentModifiedObserver } from "./hooks/useContentModifiedObserver";
import { isRtl } from "../../constants/messages";
import { ProductsListMinimal } from "./components/product/wholesale/ProductsListMinimal";

export function ECommerceClient(): JSX.Element {
  // Detect fixture-provided product for screenshots
  let fixtureProduct: AnalyzedItem["data"] | null = null;
  try {
    const rawEl = typeof window !== "undefined" ? document.getElementById("sd-fixture-product")?.textContent : null;
    const rawLocal = typeof window !== "undefined" ? window.localStorage?.getItem("sd_fixture_product") : null;
    const raw = rawEl || rawLocal;
    fixtureProduct = raw ? (JSON.parse(raw) as AnalyzedItem["data"]) : null;
  } catch {
    fixtureProduct = null;
  }

  const [state, setState] = useState<{ processedItems: AnalyzedItem[]; progress: Progress }>({
    processedItems: [],
    progress: DEFAULT_PROGRESS
  });
  const [isWorking, setIsWorking] = useTimedState<boolean>(true, false);
  const [productData, setProductData] = useState<AnalyzedItem | null>(fixtureProduct as any);
  const effectiveTheme = useThemeStore((s) => s.effective);

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
    // Ensure theme store backend is initialized in this context
    (async () => {
      await initThemeStoreBackend();
      await themeStoreReady();
      registerSystemThemeListener();
    })();
  }, []);

  useEffect(() => {
    if (fixtureProduct) {
      // In fixture mode, skip analysis and render immediately
      setIsWorking(false);
      return;
    }
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
    if (fixtureProduct) return;
    if (state.progress.justStarted) {
      return;
    }
    if (state.progress.totalLeft <= 0) {
      setIsWorking(false);
    } else {
      setIsWorking(true);
    }
  }, [state]);

  // Fixture support for screenshots: when sd_fixture_product is present, show it immediately
  useEffect(() => {
    try {
      const rawLocal = window.localStorage?.getItem("sd_fixture_product");
      const rawEl = document.getElementById("sd-fixture-product")?.textContent;
      const raw = rawEl || rawLocal;
      if (raw) {
        const parsed = JSON.parse(raw);
        setProductData(parsed);
        setIsWorking(false);
      }
    } catch {
      // ignore
    }
  }, []);

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
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS} data-theme={effectiveTheme}>
        <ProductFull product={productData} />
      </div>
    ),
    Minimal: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS} data-theme={effectiveTheme}>
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
    <ThemeProvider theme={getSafeDealTheme(effectiveTheme)}>
      <FloatingToolbar Full={Full} Minimal={Minimal} isLoading={isWorking} />;
    </ThemeProvider>
  );
}
