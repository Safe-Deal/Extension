import React, { useCallback } from "react";
import { DONE_PRODUCT_CONTAINER_CSS_CLASS, DONE_PRODUCT_CSS_CLASS } from "../../../../constants/display";
import { getSymbolClassByText } from "../../../../constants/icons";
import { getReliabilityProductsSummaryTooltip } from "../../../../constants/rule-reliability-messages";
import {
  getProductBg,
  getProductChartBg,
  getProductConclusionText,
  getProductIconImage,
  getProductIconImageOLD,
  getProductOutline
} from "../../../engine/logic/site/paint/product-paint";
import { PRICING_ITEM_DETAILS } from "../../../engine/logic/utils/const";
import { DEFAULT_PRODUCT } from "./utils/constants";
import { SiteUtil } from "../../../engine/logic/utils/site-utils";
import { ProductStore } from "../../../engine/logic/conclusion/conclusion-product-entity.interface";

export function ProductMinimal({ product = DEFAULT_PRODUCT }: { product: any }) {
  if (!product) {
    product = DEFAULT_PRODUCT;
  }

  const { rules } = product;
  const productId = product?.product?.id || "";
  const store = SiteUtil.getStore();
  const isItemDetail = SiteUtil.isItemDetails();
  const isMinimalList = store === ProductStore.ALI_EXPRESS && isItemDetail;

  const reasons = rules?.filter((r) => r && r.name !== PRICING_ITEM_DETAILS);
  const explanationEntities = getReliabilityProductsSummaryTooltip(reasons);
  const reliabilityMessage = getProductConclusionText(product);
  const bg = getProductBg(product);
  const border = getProductOutline(product);
  const listItems = [];

  explanationEntities.map((explanation) => {
    const { ruleExplanation = "", reliabilityMessage = "" } = explanation || {};
    const reliabilityClass = getSymbolClassByText(reliabilityMessage);
    listItems.push({
      title: reliabilityMessage,
      explanation: ruleExplanation,
      className: reliabilityClass
    });
  });

  const MainIcon = useCallback(() => {
    const [reliabilityProductSummary] = getReliabilityProductsSummaryTooltip(rules);
    const productIconImage = getProductIconImage(product);

    return (
      <img
        className="sd-product-minimal__icon"
        title={reliabilityMessage}
        src={productIconImage}
        alt={reliabilityProductSummary?.ruleExplanation}
      />
    );
  }, [product]);

  return (
    <div
      style={{ backgroundColor: bg, border }}
      className={`${DONE_PRODUCT_CONTAINER_CSS_CLASS} ${DONE_PRODUCT_CSS_CLASS} sd-product-minimal ${isMinimalList ? "sd-product-minimal--list" : ""}`}
      data-sd-item={productId}
    >
      <MainIcon />
    </div>
  );
}
