import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { ReactNode, useEffect } from "react";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { useSupplierStore, supplierStoreReady } from "@store/SupplierState";
import { MODIFIED_PAGES_CSS_CLASS } from "../../constants/display";
import { browserWindow } from "../../utils/dom/html";
import { SafeDealTheme } from "../../utils/react/theme";
import { SiteMetadata } from "../../utils/site/site-information";
import { FloatingToolbar } from "../../e-commerce/client/components/toolbar/FloatingToolbar";
import { ProductMinimal } from "../../e-commerce/client/components/product/ProductMinimal";
import { ProductFull } from "../../e-commerce/client/components/product/ProductFull";
import { ISupplierMessageBus, SupplierMessageType } from "../worker/worker";

const SupplierClient = (): ReactNode => {
  const { analyzedItems, loading } = useSupplierStore();
  const { sendMessage } = definePegasusMessageBus<ISupplierMessageBus>();

  useEffect(() => {
    supplierStoreReady().then(() => {
      sendMessage(SupplierMessageType.ANALYZE_SUPPLIER, {
        document: SiteMetadata.getDomOuterHTML(browserWindow().document),
        url: {
          domain: SiteMetadata.getDomain(),
          domainURL: SiteMetadata.getDomainURL(),
          pathName: SiteMetadata.getPathName(),
          queryParams: SiteMetadata.getQueryParams(),
          url: SiteMetadata.getURL()
        }
      });
    });
  }, []);

  const ItemPage = {
    Full: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductFull product={analyzedItems?.[0]?.data} isSupplier />
      </div>
    ),
    Minimal: (
      <div id="safe-deal-react-toolbar" className={MODIFIED_PAGES_CSS_CLASS}>
        <ProductMinimal product={analyzedItems?.[0]?.data} />
      </div>
    )
  };

  const { Full } = ItemPage;
  const { Minimal } = ItemPage;
  return (
    <ThemeProvider theme={SafeDealTheme}>
      <FloatingToolbar Full={Full} Minimal={Minimal} isLoading={loading} />;
    </ThemeProvider>
  );
};

export { SupplierClient };
