import { isRtl } from "@constants/messages";
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { useAuthStore } from "@store/AuthState";
import classNames from "classnames";
import React from "react";
import { getReliabilityProductsSummaryTooltip } from "../../../../../constants/rule-reliability-messages";
import {
  getProductClass,
  getProductConclusionText,
  getProductIconImage
} from "../../../../engine/logic/site/paint/product-paint";
import { SiteUtil } from "../../../../engine/logic/utils/site-utils";
import AccountMenu from "../../shared/AccountMenu/AccountMenu";
import { TabValue } from "../ProductFull";
import FavoriteProduct from "./FavoriteProduct/FavoriteProduct";
import ProductResearch from "./Research/ProductResearch";

interface IProductTitle {
  rules: any;
  product: any;
  store: ProductStore;
  tab: (value: TabValue) => void;
}

export function ProductTitle({ rules, product, store, tab }: IProductTitle) {
  const [reliabilityProductSummary] = getReliabilityProductsSummaryTooltip(rules);
  const productIconImage = getProductIconImage(product);
  const { isPremium } = useAuthStore();
  const isAlibabaSite = SiteUtil.getStore() === ProductStore.ALIBABA;

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
        {isPremium && isAlibabaSite && <FavoriteProduct tab={tab} productId={product?.product?.id} />}
        <ProductResearch productId={product?.product?.id} store={store} />
        <AccountMenu />
      </div>
    </div>
  );
}
