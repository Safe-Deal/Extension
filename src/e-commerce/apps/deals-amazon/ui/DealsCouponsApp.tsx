import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React, { useEffect } from "react";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { useAmazonCouponsStore, amazonCouponsStoreReady } from "@store/AmazonCouponsState";
import { ErrorBoundary } from "../../../../utils/analytics/ErrorBoundary";
import { browserWindow } from "../../../../utils/dom/html";
import { SafeDealTheme } from "../../../../utils/react/theme";
import { SiteMetadata } from "../../../../utils/site/site-information";
import { SdDealsCouponsStickyBadgeRoot } from "./components/SdDealsCouponsRoot";
import { IAmazonCouponsDealsBus, AmazonCouponsMessageType } from "../background/deals-coupons-worker";

export function SdDealsCouponsApp(): JSX.Element {
  const { coupons, loading, setCoupons, setLoading } = useAmazonCouponsStore();

  const { sendMessage } = definePegasusMessageBus<IAmazonCouponsDealsBus>();

  useEffect(() => {
    amazonCouponsStoreReady();
    const data = {
      document: SiteMetadata.getDomOuterHTML(browserWindow().document),
      url: SiteMetadata.getURL(),
      domainUrl: SiteMetadata.getDomainURL()
    };
    sendMessage(AmazonCouponsMessageType.FETCH_AMAZON_COUPONS, data);
  }, [setCoupons, setLoading]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={SafeDealTheme}>
        <SdDealsCouponsStickyBadgeRoot theme={SafeDealTheme} deals={coupons} loadingDeals={loading} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
