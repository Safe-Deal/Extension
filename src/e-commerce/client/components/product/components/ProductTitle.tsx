import React from "react";
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import classNames from "classnames";
import { isRtl } from "@constants/messages";
import { getReliabilityProductsSummaryTooltip } from "../../../../../constants/rule-reliability-messages";
import {
  getProductIconImage,
  getProductConclusionText,
  getProductClass
} from "../../../../engine/logic/site/paint/product-paint";
import ProductResearch from "./Research/ProductResearch";

interface IProductTitle {
  rules: any;
  product: any;
  store: ProductStore;
}

export function ProductTitle({ rules, product, store }: IProductTitle) {
  const [reliabilityProductSummary] = getReliabilityProductsSummaryTooltip(rules);
  const productIconImage = getProductIconImage(product);

  return (
    <div className={`${getProductClass(product)} sd-product-full__header`}>
      <div className="sd-product-full__header__shied">
        <img
          className="sd-product-full__header__icon"
          title={reliabilityProductSummary?.reliabilityMessage}
          src={productIconImage}
          alt={reliabilityProductSummary?.reliabilityMessage}
        />
      </div>
      <div className="sd-product-full__header__title">{getProductConclusionText(product)}</div>
      <div
        className={classNames("sd-product-full__header__research", {
          "sd-product-full__header__research--rtl": isRtl(),
          "sd-product-full__header__research--ltr": !isRtl()
        })}
      >
        <ProductResearch productId={product?.product?.id} store={store} />
      </div>
    </div>
  );
}