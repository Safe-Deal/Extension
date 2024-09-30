import React from "react";
import { DONE_PRODUCT_CONTAINER_CSS_CLASS, DONE_PRODUCT_CSS_CLASS } from "../../../../constants/display";
import { IMAGE_SAFE_DEAL } from "../../../../constants/visual";

export function ProductsListMinimal() {
  return (
    <div className={`${DONE_PRODUCT_CONTAINER_CSS_CLASS} ${DONE_PRODUCT_CSS_CLASS} sd-product-minimal--list`}>
      <img src={IMAGE_SAFE_DEAL} alt="Safe Deal Logo" className="sd-product-minimal--list__icon" />
    </div>
  );
}
