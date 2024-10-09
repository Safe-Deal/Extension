import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { debug, logError } from "@utils/analytics/logger";
import React, { useEffect } from "react";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { useAmazonCouponsStore } from "@store/AmazonCouponsState";
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
    const fetchCoupons = async () => {
      setLoading(true);
      const data = {
        document: SiteMetadata.getDomOuterHTML(browserWindow().document),
        url: SiteMetadata.getURL(),
        domainUrl: SiteMetadata.getDomainURL()
      };
      try {
        const response = await sendMessage(AmazonCouponsMessageType.FETCH_AMAZON_COUPONS, data);
        setCoupons(response.deals);
      } catch (error) {
        logError(error, "::Error fetching Amazon coupons!");
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [setCoupons, setLoading]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={SafeDealTheme}>
        <SdDealsCouponsStickyBadgeRoot theme={SafeDealTheme} deals={coupons} loadingDeals={loading} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
