import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useState } from "react";
import { DONE_PRODUCT_CONTAINER_CSS_CLASS, DONE_PRODUCT_CSS_CLASS } from "../../../../constants/display";
import { isRtl, t } from "../../../../constants/messages";
import { getProductBg } from "../../../engine/logic/site/paint/product-paint";
import { SiteUtil } from "../../../engine/logic/utils/site-utils";
import { ProductTitle } from "./components/ProductTitle";
import { DEFAULT_PRODUCT } from "./utils/constants";
import { AmazonSiteUtils } from "../../../engine/stores/amazon/utils/amazon-site-utils";
import { Opinions } from "./components/Opinions/Opinions";
import { Reviews } from "./components/Reviews/Reviews";
import { ProductEvaluation } from "./wholesales-warehouse/ProductEvaluation";
import { Rules } from "./components/Rules/Rules";

interface IProductFullProps {
  product: any;
  isWholesaleWarehouse?: boolean;
}

export function ProductFull({ product = DEFAULT_PRODUCT, isWholesaleWarehouse = false }: IProductFullProps) {
  if (!product) {
    product = DEFAULT_PRODUCT;
  }
  const [tabValue, setTabValue] = useState(0);
  const { rules } = product || {};
  const productId = product?.product?.id || "";
  const isPrime = AmazonSiteUtils.isAmazonVideoItemDetail();
  const bg = getProductBg(product);
  const store = SiteUtil.getStore();

  const handleChange = (event, newValue) => {
    event.preventDefault();
    event.stopPropagation();
    setTabValue(newValue);
  };

  const productAnalyzingView = isWholesaleWarehouse ? (
    <ProductEvaluation product={product} />
  ) : (
    <Rules bg={bg} rules={rules} />
  );

  const reviewsAnalyzingView = !isWholesaleWarehouse ? <Reviews productId={productId} store={store} /> : null;

  return (
    <div
      className={`sd-product-full ${DONE_PRODUCT_CONTAINER_CSS_CLASS} ${DONE_PRODUCT_CSS_CLASS}`}
      data-sd-item={productId}
      style={{ direction: isRtl() ? "rtl" : "ltr" }}
    >
      <ProductTitle rules={rules} product={product} store={store} />
      <div className="sd-product-full__body">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          className="sd-product-full__body__tabs"
          aria-label={tabValue === 0 ? t("tab_header_analyze") : t("tab_header_reviews")}
        >
          {!isPrime && <Tab label={t("tab_header_analyze")} />}
          {!isWholesaleWarehouse ? <Tab label={t("tab_header_reviews")} /> : null}
          <Tab label={t("tab_header_opinions")} />
        </Tabs>
        <div className="sd-product-full__body__content">
          {!isPrime && tabValue === 0 && productAnalyzingView}
          {tabValue === (isPrime ? 0 : 1) && reviewsAnalyzingView}
          {tabValue === (!isWholesaleWarehouse ? 2 : 1) && <Opinions productId={productId} store={store} />}
        </div>
      </div>
    </div>
  );
}
