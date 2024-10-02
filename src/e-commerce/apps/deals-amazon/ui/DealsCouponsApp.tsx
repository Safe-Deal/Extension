import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "../../../../utils/analytics/ErrorBoundary";
import { browserWindow } from "../../../../utils/dom/html";
import { AMAZON_COUPONS_GLUE } from "../../../../utils/extension/glue";
import { SafeDealTheme } from "../../../../utils/react/theme";
import { SiteMetadata } from "../../../../utils/site/site-information";
import { SdDealsCouponsStickyBadgeRoot } from "./components/SdDealsCouponsRoot";

export function SdDealsCouponsApp(): JSX.Element {
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [allCoupons, setAllCoupons] = useState([]);

  useEffect(() => {
    setLoadingCoupons(true);

    const requestBody = {
      data: {
        document: SiteMetadata.getDomOuterHTML(browserWindow().document),
        url: SiteMetadata.getURL(),
        domainUrl: SiteMetadata.getDomainURL()
      }
    };

    AMAZON_COUPONS_GLUE.client((response) => {
      const { deals } = response;
      setAllCoupons(deals);
      setLoadingCoupons(false);
    });
    AMAZON_COUPONS_GLUE.send(requestBody);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={SafeDealTheme}>
        <SdDealsCouponsStickyBadgeRoot theme={SafeDealTheme} deals={allCoupons} loadingDeals={loadingCoupons} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
