import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@store/AuthState";
import { DONE_PRODUCT_CONTAINER_CSS_CLASS, DONE_PRODUCT_CSS_CLASS } from "../../../../constants/display";
import { isRtl, t } from "../../../../constants/messages";
import { getProductBg } from "../../../engine/logic/site/paint/product-paint";
import { SiteUtil } from "../../../engine/logic/utils/site-utils";
import { AmazonSiteUtils } from "../../../engine/stores/amazon/utils/amazon-site-utils";
import { ProductEvaluation } from "../pro/ProductEvaluation";
import { Lists } from "./components/Lists/Lists";
import { Opinions } from "./components/Opinions/Opinions";
import { ProductTitle } from "./components/ProductTitle";
import { Reviews } from "./components/Reviews/Reviews";
import { Rules } from "./components/Rules/Rules";
import { DEFAULT_PRODUCT } from "./utils/constants";

export enum TabValue {
  Analyze = "analyze",
  Reviews = "reviews",
  Opinions = "opinions",
  Lists = "lists"
}

interface IProductFullProps {
  product: any;
  isSupplier?: boolean;
}

export function ProductFull({ product = DEFAULT_PRODUCT, isSupplier = false }: IProductFullProps) {
  if (!product) {
    product = DEFAULT_PRODUCT;
  }

  const [tabValue, setTabValue] = useState<TabValue>(TabValue.Analyze);
  const { rules } = product || {};
  const productId = product?.product?.id || "";
  const [listsAction, setListsAction] = useState<string | null>(null);
  const storeFeedbackUrl = product?.product?.storeFeedbackUrl || "";
  const isPrime = AmazonSiteUtils.isAmazonVideoItemDetail();
  const isPremiumUser = useAuthStore((state) => state.isPremium);
  const bg = getProductBg(product);
  const store = SiteUtil.getStore();

  useEffect(() => {
    setListsAction(null);
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };

  const productAnalyzingView = isSupplier ? <ProductEvaluation product={product} /> : <Rules bg={bg} rules={rules} />;

  const reviewsAnalyzingView = !isSupplier ? (
    <Reviews productId={productId} store={store} />
  ) : (
    <Reviews productId={productId} store={store} isSupplier={isSupplier} storeFeedbackUrl={storeFeedbackUrl} />
  );

  return (
    <div
      className={`sd-product-full ${DONE_PRODUCT_CONTAINER_CSS_CLASS} ${DONE_PRODUCT_CSS_CLASS}`}
      data-sd-item={productId}
      style={{ direction: isRtl() ? "rtl" : "ltr" }}
    >
      <ProductTitle favoriteAction={setListsAction} tab={setTabValue} rules={rules} product={product} store={store} />
      <div className="sd-product-full__body">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          className="sd-product-full__body__tabs"
          aria-label={tabValue === TabValue.Analyze ? t("tab_header_analyze") : t("tab_header_reviews")}
        >
          {!isPrime && <Tab label={t("tab_header_analyze")} value={TabValue.Analyze} />}
          <Tab label={t("tab_header_reviews")} value={TabValue.Reviews} />
          <Tab label={t("tab_header_opinions")} value={TabValue.Opinions} />
          {isPremiumUser && <Tab label={t("tab_header_lists")} value={TabValue.Lists} />}
        </Tabs>
        <div className="sd-product-full__body__content">
          {!isPrime && tabValue === TabValue.Analyze && productAnalyzingView}
          {tabValue === (isPrime ? TabValue.Analyze : TabValue.Reviews) && reviewsAnalyzingView}
          {tabValue === TabValue.Opinions && <Opinions productId={productId} store={store} />}
          {isPremiumUser && tabValue === TabValue.Lists && <Lists product={product} action={listsAction} />}
        </div>
      </div>
    </div>
  );
}
